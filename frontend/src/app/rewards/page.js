// Spin the wheel game
"use client";

import { useState, useEffect, useRef } from "react";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import SplitTextAnimated from "@/components/SplitText";

export default function Rewards() {
  const { user, loading: authLoading, setReconnecting } = useAuth();
  const [points, setPoints] = useState(0);

  // --- animation state for coin count ---
  const prevPointsRef = useRef(null);
  const [delta, setDelta] = useState(0);
  const [anim, setAnim] = useState(null); // 'up' | 'down' | null

  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [shopMessage, setShopMessage] = useState(null);
  const [claimingStatus, setClaimingStatus] = useState({});

  const [wheel1Rotation, setWheel1Rotation] = useState(0);
  const [wheel2Rotation, setWheel2Rotation] = useState(0);
  const [wheel3Rotation, setWheel3Rotation] = useState(0);

  const [loadingPoints, setLoadingPoints] = useState(true);
  const router = useRouter();

  const spinCost = 300;

  // Helper function to refresh page on network/timeout errors
  const handleErrorAndRefresh = (error) => {
    console.error("Error detected, refreshing page:", error);
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes("timeout") || errorMessage.includes("network") || errorMessage.includes("fetch")) {
      console.log("Refreshing the page!");
      setReconnecting(true);
      // Show message for 1.5 seconds before refresh
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  // 7 equally spaced outcomes around the circle (pointer is at the top)
  // 360 / 7 ≈ 51.428571. We'll use exact math so pointer lines up precisely.
  const SEGMENT_DEG = 360 / 7;

  // Fixed so labels match values (before they didn’t)
  const wheelOutcomes = [
    { label: "0 gold",         value: 0,     probability: 0.15, segIndex: 0 },
    { label: "+50 gold",       value: 50,    probability: 0.30, segIndex: 1 },
    { label: "+80 gold",       value: 80,    probability: 0.25, segIndex: 2 },
    { label: "-50 gold",       value: -50,   probability: 0.10, segIndex: 3 },
    { label: "+150 gold",      value: 150,   probability: 0.14, segIndex: 4 },
    { label: "Small Jackpot!", value: 300,   probability: 0.05, segIndex: 5 },
    { label: "BIG JACKPOT!",   value: 1000,  probability: 0.01, segIndex: 6 },
  ].map(o => ({ ...o, targetDegree: o.segIndex * SEGMENT_DEG }));

  const selectWeightedOutcome = (outcomes) => {
    const total = outcomes.reduce((s, o) => s + o.probability, 0);
    let r = Math.random() * total;
    for (const o of outcomes) {
      if (r < o.probability) return o;
      r -= o.probability;
    }
    return outcomes[outcomes.length - 1];
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [authLoading, user, router]);

  // Optional: realtime subscription to user_points for multi-tab consistency
  useEffect(() => {
    if (authLoading || !user) return;

    let channel = null;

    const fetchPoints = async () => {
      setLoadingPoints(true);
      try {
        const fetchPromise = supabase
          .from("user_points")
          .select("points")
          .eq("user_id", user.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 5000)
        );

        const { data: row, error } = await Promise.race([fetchPromise, timeoutPromise]);

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching points in Rewards:", error);
          handleErrorAndRefresh(error);
          setPoints(0);
        } else {
          setPoints(row?.points ?? 0);
        }

        // realtime subscribe
        channel = supabase
          .channel(`rewards_points_${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "user_points",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (payload.new?.points !== undefined) setPoints(payload.new.points);
              else if (payload.eventType === "DELETE") setPoints(0);
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Points fetch error:", error);
        handleErrorAndRefresh(error);
        setPoints(0);
      } finally {
        setLoadingPoints(false);
      }
    };

    fetchPoints();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [authLoading, user]);

  // --- animate coin count whenever points change ---
  useEffect(() => {
    if (prevPointsRef.current === null) {
      prevPointsRef.current = points;
      return;
    }
    if (points !== prevPointsRef.current) {
      const d = points - prevPointsRef.current;
      setDelta(d);
      setAnim(d > 0 ? "up" : "down");
      prevPointsRef.current = points;
      const t = setTimeout(() => setAnim(null), 900);
      return () => clearTimeout(t);
    }
  }, [points]);

  const generateSpinMessage = (o1, o2, o3) => {
    const labels = [o1.label, o2.label, o3.label];
    if (labels[0] === labels[1] && labels[1] === labels[2]) {
      switch (labels[0]) {
        case "BIG JACKPOT!": return "SUPER JACKPOT!!!";
        case "Small Jackpot!": return "TRIPLE Small Jackpot!";
        case "0 gold": return "TRIPLE 0s!";
        case "-50 gold": return "TRIPLE -50s! Ouch!";
        default: return `TRIPLE ${labels[0]}!`;
      }
    }
    return "Spin Result:";
  };

  // Helper to compute the absolute rotation that lands the pointer on a segment
  const computeTargetRotation = (currentRotation, targetDegree) => {
    // Normalize current to [0,360)
    const currentNorm = ((currentRotation % 360) + 360) % 360;
    // We want to rotate forward multiple whole turns PLUS the targetDegree,
    // but ensure it's always at least a few turns from where we are for a nice spin.
    const baseTurns = 6 + Math.floor(Math.random() * 4); // 6–9 full spins
    const targetAbsolute = baseTurns * 360 + targetDegree;

    // Make sure we always move forward (if current already > targetAbsolute % 360, no problem; we're doing many turns)
    // We also ensure we don't do less than ~3 turns visually from current
    const minForward = currentRotation + 3 * 360;
    return Math.max(targetAbsolute, minForward);
  };

  const spinWheel = async () => {
    if (isSpinning) return;
    if (!user) { router.push("/signin"); return; }
    if (points < spinCost) {
      setResult(`Not enough gold! Spinning costs ${spinCost} gold.`);
      setTimeout(() => setResult(null), 3000);
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // Deduct cost immediately
    const pointsAfterDeduction = points - spinCost;
    try {
      const updatePromise = supabase
        .from("user_points")
        .update({ points: pointsAfterDeduction, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 5000)
      );

      const { error: deductionError } = await Promise.race([updatePromise, timeoutPromise]);

      if (deductionError) {
        console.error("Error deducting points in spinWheel:", deductionError);
        handleErrorAndRefresh(deductionError);
        setResult("Failed to spin: " + deductionError.message);
        setTimeout(() => setResult(null), 3000);
        setIsSpinning(false);
        return;
      }
    } catch (error) {
      console.error("Spin deduction error:", error);
      handleErrorAndRefresh(error);
      setResult("Failed to spin: " + (error.message || "Network error. Please try again."));
      setTimeout(() => setResult(null), 3000);
      setIsSpinning(false);
      return;
    }
    setPoints(pointsAfterDeduction);

    // Choose outcomes
    const outcome1 = selectWeightedOutcome(wheelOutcomes);
    const outcome2 = selectWeightedOutcome(wheelOutcomes);
    const outcome3 = selectWeightedOutcome(wheelOutcomes);

    const totalPointsWon = outcome1.value + outcome2.value + outcome3.value;
    const spinMessage = generateSpinMessage(outcome1, outcome2, outcome3);
    const finalResultMessage = `${spinMessage} | Won: ${totalPointsWon} gold!`;

    // Animate wheels to land on the chosen segments
    const animationDurationMs = 4000;
    setWheel1Rotation(prev => computeTargetRotation(prev, outcome1.targetDegree));
    setWheel2Rotation(prev => computeTargetRotation(prev, outcome2.targetDegree));
    setWheel3Rotation(prev => computeTargetRotation(prev, outcome3.targetDegree));

    // Apply winnings after the wheels stop
    setTimeout(async () => {
      try {
        const finalPoints = pointsAfterDeduction + totalPointsWon;
        const updatePromise = supabase
          .from("user_points")
          .update({ points: finalPoints, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 5000)
        );

        const { error: awardError } = await Promise.race([updatePromise, timeoutPromise]);

        if (awardError) {
          console.error("Error awarding points after spin:", awardError);
          handleErrorAndRefresh(awardError);
          setResult(`Spin complete! Error awarding points: ${awardError.message}. Current balance shown may be outdated.`);
        } else {
          setPoints(finalPoints);
          setResult(finalResultMessage);
        }
      } catch (error) {
        console.error("Award points error:", error);
        handleErrorAndRefresh(error);
        setResult(`Spin complete! Error awarding points: ${error.message || "Network error"}. Current balance shown may be outdated.`);
      } finally {
        setIsSpinning(false);
      }
    }, animationDurationMs);
  };

  const shopRewards = [
    { id: 1, name: "Profile Badge",     cost: 150 },
    { id: 2, name: "Bonus Spin",        cost: 300 },
    { id: 3, name: "Tax Report",        cost: 100 },
    { id: 4, name: "2 Tax Reports",     cost: 250 },
    { id: 5, name: "Exclusive Avatar",  cost: 350 },
    { id: 6, name: "Mystery Box",       cost: 500 },
  ];

  const claimShopReward = async (reward) => {
    if (!user) { router.push("/signin"); return; }
    if (points < reward.cost) {
      setShopMessage(`Not enough points! ${reward.name} costs ${reward.cost} points.`);
      setTimeout(() => setShopMessage(null), 3000);
      return;
    }
    if (claimingStatus[reward.id] === "claiming" || claimingStatus[reward.id] === "claimed") return;

    setClaimingStatus(prev => ({ ...prev, [reward.id]: "claiming" }));
    const pointsAfterClaim = points - reward.cost;

    try {
      const updatePromise = supabase
        .from("user_points")
        .update({ points: pointsAfterClaim, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 5000)
      );

      const { error: pointsError } = await Promise.race([updatePromise, timeoutPromise]);

      if (pointsError) {
        console.error("Error updating points in claimShopReward:", pointsError);
        handleErrorAndRefresh(pointsError);
        setShopMessage("Error claiming reward: " + pointsError.message);
        setTimeout(() => setShopMessage(null), 3000);
        setClaimingStatus(prev => ({ ...prev, [reward.id]: null }));
        return;
      }

      const insertPromise = supabase
        .from("user_rewards")
        .insert({ user_id: user.id, reward_name: reward.name, cost: reward.cost, claimed_at: new Date().toISOString() });

      const insertTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 5000)
      );

      const { error: rewardError } = await Promise.race([insertPromise, insertTimeoutPromise]);

      if (rewardError) {
        console.error("Error inserting claimed reward record:", rewardError);
        handleErrorAndRefresh(rewardError);
        setShopMessage("Points deducted, but failed to record reward: " + rewardError.message);
        setPoints(pointsAfterClaim);
      } else {
        setPoints(pointsAfterClaim);
        setShopMessage(`Successfully claimed: ${reward.name}!`);
      }
      setClaimingStatus(prev => ({ ...prev, [reward.id]: "claimed" }));
      setTimeout(() => {
        setClaimingStatus(prev => ({ ...prev, [reward.id]: null }));
        setShopMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Claim reward error:", error);
      handleErrorAndRefresh(error);
      setShopMessage("Error claiming reward: " + (error.message || "Network error. Please try again."));
      setTimeout(() => setShopMessage(null), 3000);
      setClaimingStatus(prev => ({ ...prev, [reward.id]: null }));
    }
  };

  // Wheel label positions (kept from your original with precise math)
  const WHEEL_DIAMETERS = {
    wheel1: 320,
    wheel2: 384,
    wheel3: 320,
  };

  const calculatePosition = (degree, wheelDiameter) => {
    const radiusMultiplier = 0.75;
    const radius = (wheelDiameter / 2) * radiusMultiplier;
    const angleFromTop = degree;
    const angleInRadians = (90 - angleFromTop) * Math.PI / 180;
    const x = radius * Math.cos(angleInRadians);
    const y = radius * Math.sin(angleInRadians);
    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% - ${y}px)`,
    };
  };

  if (authLoading || loadingPoints) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading Rewards...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4 flex flex-col items-center">
      {/* Animated gold badge */}
      <div className="relative">
        <div
          className={[
            "mb-4 sm:mb-8 mt-16 sm:mt-20 text-gray-800 text-xl sm:text-3xl md:text-4xl font-bold px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full shadow-lg border-2",
            anim === "up" ? "bg-green-50 border-green-400 ring-2 ring-green-300 coin-bump" :
            anim === "down" ? "bg-red-50 border-red-400 ring-2 ring-red-300 coin-shake" :
                              "bg-yellow-100 border-yellow-400",
          ].join(" ")}
          style={{
            backgroundImage: 'url("/pixel_art_gold_coin.png")',
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left 8px center",
            paddingLeft: "80px",
            minWidth: "180px",
            minHeight: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>Gold: {points}</span>
        </div>

        {/* floating +N / -N */}
        {anim && delta !== 0 && (
          <span
            className={[
              "absolute -top-2 right-0 text-base sm:text-xl font-bold pointer-events-none",
              anim === "up" ? "text-green-600 float-up" : "text-red-600 float-down",
            ].join(" ")}
          >
            {delta > 0 ? `+${delta}` : `${delta}`}
          </span>
        )}
      </div>

      <div className="mb-3 sm:mb-6 md:mb-8 mt-2 sm:mt-4 text-center px-2">
        <SplitTextAnimated
          text="Rewards Shop"
          tag="h2"
          className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 border-b-2 border-purple-500 pb-2"
          splitType="chars"
          delay={30}
          duration={0.4}
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
        />
      </div>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-center px-2">
        Use your gold to claim awards here! (Claimable multiple times)
      </p>

      {shopMessage && (
        <div
          className={`mb-4 sm:mb-6 p-2 sm:p-3 rounded-md text-center font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 mx-2 ${
            shopMessage.includes("Successfully")
              ? "bg-green-200 text-green-800"
              : shopMessage.includes("enough")
              ? "bg-red-200 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {shopMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full max-w-5xl px-2 mb-8 sm:mb-12 md:mb-16">
        {shopRewards.map((reward) => (
          <div
            key={reward.id}
            className="border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">{reward.name}</h3>
              <p className="text-purple-700 mb-3 sm:mb-4 text-sm sm:text-base md:text-xl font-bold">Cost: {reward.cost} gold</p>
            </div>
            <button
              onClick={() => claimShopReward(reward)}
              disabled={
                loadingPoints ||
                points < reward.cost ||
                claimingStatus[reward.id] === "claiming" ||
                claimingStatus[reward.id] === "claimed"
              }
              className={`py-2 sm:py-3 px-3 sm:px-4 md:px-6 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-md text-xs sm:text-sm md:text-base
                ${
                  claimingStatus[reward.id] === "claimed"
                    ? "bg-green-500 text-white cursor-not-allowed"
                    : claimingStatus[reward.id] === "claiming"
                    ? "bg-yellow-500 text-white cursor-wait"
                    : points < reward.cost
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
            >
              {claimingStatus[reward.id] === "claiming"
                ? "Claiming..."
                : claimingStatus[reward.id] === "claimed"
                ? "Claimed!"
                : "Claim"}
            </button>
          </div>
        ))}
      </div>

      <div className="mb-3 sm:mb-6 md:mb-8 mt-2 sm:mt-60 text-center px-2">
        <SplitTextAnimated
          text="Spin the Slot Reels"
          tag="h1"
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900"
          splitType="chars"
          delay={30}
          duration={0.4}
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
        />
      </div>
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">Cost per spin: {spinCost} gold</p>

      {/* Wheels container - horizontal scroll on mobile, flex on larger screens */}
      <div className="w-full max-w-full overflow-x-auto pb-4 lg:overflow-x-visible scrollbar-hide">
        <div className="flex flex-row justify-start lg:justify-center items-center gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-8 p-3 sm:p-4 bg-gray-900/0 rounded-lg shadow-inner min-w-max lg:min-w-0 mx-auto">
          {/* Wheel 1 */}
          <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-blue-100 shadow-inner text-center font-bold text-sm sm:text-lg md:text-xl overflow-hidden relative flex-shrink-0">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-2xl sm:text-3xl md:text-4xl leading-none z-30 pointer-events-none">▼</div>
            <div
              className="w-full h-full absolute top-0 left-0"
              style={{
                transform: `rotate(${wheel1Rotation}deg)`,
                transition: "transform 4000ms cubic-bezier(0.33, 1, 0.68, 1)",
              }}
            >
              {wheelOutcomes.map((outcome, idx) => {
                const position = calculatePosition(outcome.targetDegree, 192); // Mobile size
                return (
                  <div
                    key={`w1-o-${idx}`}
                    className="absolute flex flex-row items-center justify-center sm:hidden"
                    style={{
                      top: position.top,
                      left: position.left,
                      transform: `translate(-50%, -50%) rotate(-${wheel1Rotation}deg)`,
                      width: "60px",
                      height: "36px",
                      textAlign: "center",
                      pointerEvents: "none",
                      userSelect: "none",
                      border: "2px solid #4A5568",
                      borderRadius: "4px",
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      padding: "1px",
                      boxSizing: "border-box",
                    }}
                  >
                    <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-5 h-5 object-contain mr-0.5 flex-shrink-0" />
                    <span className="text-gray-800 text-[9px] font-bold leading-tight">{outcome.label}</span>
                  </div>
                );
              })}
              {wheelOutcomes.map((outcome, idx) => {
                const position = calculatePosition(outcome.targetDegree, WHEEL_DIAMETERS.wheel1);
                return (
                  <div
                    key={`w1-o-lg-${idx}`}
                    className="absolute flex-row items-center justify-center hidden sm:flex"
                    style={{
                      top: position.top,
                      left: position.left,
                      transform: `translate(-50%, -50%) rotate(-${wheel1Rotation}deg)`,
                      width: "85px",
                      height: "50px",
                      textAlign: "center",
                      pointerEvents: "none",
                      userSelect: "none",
                      border: "2px solid #4A5568",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      padding: "2px",
                      boxSizing: "border-box",
                    }}
                  >
                    <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-8 h-8 md:w-10 md:h-10 object-contain mr-1 flex-shrink-0" />
                    <span className="text-gray-800 text-xs md:text-sm font-bold leading-tight">{outcome.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wheel 2 */}
          <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-green-100 shadow-inner text-center font-bold text-base sm:text-xl md:text-2xl overflow-hidden relative flex-shrink-0">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-2xl sm:text-3xl md:text-4xl leading-none z-30 pointer-events-none">▼</div>
            <div
              className="w-full h-full absolute top-0 left-0"
              style={{
                transform: `rotate(${wheel2Rotation}deg)`,
                transition: "transform 4000ms cubic-bezier(0.33, 1, 0.68, 1)",
              }}
            >
              {wheelOutcomes.map((outcome, idx) => {
                const position = calculatePosition(outcome.targetDegree, 224); // Mobile size
                return (
                  <div
                    key={`w2-o-${idx}`}
                    className="absolute flex flex-row items-center justify-center sm:hidden"
                    style={{
                      top: position.top,
                      left: position.left,
                      transform: `translate(-50%, -50%) rotate(-${wheel2Rotation}deg)`,
                      width: "65px",
                      height: "40px",
                      textAlign: "center",
                      pointerEvents: "none",
                      userSelect: "none",
                      border: "2px solid #4A5568",
                      borderRadius: "4px",
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      padding: "1px",
                      boxSizing: "border-box",
                    }}
                  >
                    <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-6 h-6 object-contain mr-0.5 flex-shrink-0" />
                    <span className="text-gray-800 text-[10px] font-bold leading-tight">{outcome.label}</span>
                  </div>
                );
              })}
              {wheelOutcomes.map((outcome, idx) => {
                const position = calculatePosition(outcome.targetDegree, WHEEL_DIAMETERS.wheel2);
                return (
                  <div
                    key={`w2-o-lg-${idx}`}
                    className="absolute flex-row items-center justify-center hidden sm:flex"
                    style={{
                      top: position.top,
                      left: position.left,
                      transform: `translate(-50%, -50%) rotate(-${wheel2Rotation}deg)`,
                      width: "85px",
                      height: "50px",
                      textAlign: "center",
                      pointerEvents: "none",
                      userSelect: "none",
                      border: "2px solid #4A5568",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      padding: "2px",
                      boxSizing: "border-box",
                    }}
                  >
                    <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-8 h-8 md:w-10 md:h-10 object-contain mr-1 flex-shrink-0" />
                    <span className="text-gray-800 text-xs md:text-sm font-bold leading-tight">{outcome.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wheel 3 */}
          <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-purple-100 shadow-inner text-center font-bold text-sm sm:text-lg md:text-xl overflow-hidden relative flex-shrink-0">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-2xl sm:text-3xl md:text-4xl leading-none z-30 pointer-events-none">▼</div>
            <div
              className="w-full h-full absolute top-0 left-0"
              style={{
                transform: `rotate(${wheel3Rotation}deg)`,
                transition: "transform 4000ms cubic-bezier(0.33, 1, 0.68, 1)",
              }}
            >
              {wheelOutcomes.map((outcome, idx) => {
                const position = calculatePosition(outcome.targetDegree, 192); // Mobile size
                return (
                  <div
                    key={`w3-o-${idx}`}
                    className="absolute flex flex-row items-center justify-center sm:hidden"
                    style={{
                      top: position.top,
                      left: position.left,
                      transform: `translate(-50%, -50%) rotate(-${wheel3Rotation}deg)`,
                      width: "60px",
                      height: "36px",
                      textAlign: "center",
                      pointerEvents: "none",
                      userSelect: "none",
                      border: "2px solid #4A5568",
                      borderRadius: "4px",
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      padding: "1px",
                      boxSizing: "border-box",
                    }}
                  >
                    <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-5 h-5 object-contain mr-0.5 flex-shrink-0" />
                    <span className="text-gray-800 text-[9px] font-bold leading-tight">{outcome.label}</span>
                  </div>
                );
              })}
              {wheelOutcomes.map((outcome, idx) => {
                const position = calculatePosition(outcome.targetDegree, WHEEL_DIAMETERS.wheel3);
                return (
                  <div
                    key={`w3-o-lg-${idx}`}
                    className="absolute flex-row items-center justify-center hidden sm:flex"
                    style={{
                      top: position.top,
                      left: position.left,
                      transform: `translate(-50%, -50%) rotate(-${wheel3Rotation}deg)`,
                      width: "85px",
                      height: "50px",
                      textAlign: "center",
                      pointerEvents: "none",
                      userSelect: "none",
                      border: "2px solid #4A5568",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      padding: "2px",
                      boxSizing: "border-box",
                    }}
                  >
                    <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-8 h-8 md:w-10 md:h-10 object-contain mr-1 flex-shrink-0" />
                    <span className="text-gray-800 text-xs md:text-sm font-bold leading-tight">{outcome.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll hint for mobile */}
      <p className="text-gray-500 text-xs mb-4 lg:hidden">← Swipe to see all wheels →</p>

      <button
        onClick={spinWheel}
        disabled={isSpinning || loadingPoints || points < spinCost}
        className={`py-2 sm:py-3 px-4 sm:px-6 rounded-full font-semibold transition transform hover:scale-105 shadow-md text-sm sm:text-base md:text-lg
          ${isSpinning || loadingPoints || points < spinCost
            ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-50"
            : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
      >
        {isSpinning ? "Spinning..." : `Spin (${spinCost} gold)`}
      </button>

      {result && (
        <div
          className={`mt-4 sm:mt-6 text-base sm:text-xl md:text-3xl font-bold p-2 sm:p-3 md:p-4 rounded-lg shadow-md text-center transition-all duration-300 mx-2 ${
            result.includes("JACKPOT") || (result.includes("Won:") && !result.includes("-") && !result.includes("0 gold"))
              ? "bg-yellow-200 text-yellow-800 border-4 border-yellow-500"
              : result.includes("enough gold") || result.includes("-")
              ? "bg-red-200 text-red-700"
              : "bg-green-200 text-green-800"
          }`}
        >
          ✨ {result}
        </div>
      )}


      <div className="mt-8 sm:mt-12 text-gray-600 text-xs sm:text-sm text-center pb-4">
        {user ? `User ID: ${user.id}` : "Not logged in"}
      </div>

      {/* Animations */}
      <style jsx>{`
        /* bump for increases */
        @keyframes coin-bump-kf {
          0% { transform: scale(1); }
          30% { transform: scale(1.12); }
          60% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        .coin-bump { animation: coin-bump-kf 0.6s ease-out both; }

        /* shake for decreases */
        @keyframes coin-shake-kf {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        .coin-shake { animation: coin-shake-kf 0.6s ease; }

        /* floaters */
        @keyframes float-up-kf {
          0% { transform: translateY(6px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-14px); opacity: 0; }
        }
        .float-up { animation: float-up-kf 0.9s ease-out both; }

        @keyframes float-down-kf {
          0% { transform: translateY(-6px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(14px); opacity: 0; }
        }
        .float-down { animation: float-down-kf 0.9s ease-in both; }
      `}</style>
    </div>
  );
}
