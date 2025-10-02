// Spin the wheel game
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Rewards() {
  const [user, setUser] = useState(null);
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

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const spinCost = 300;

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

  // Optional: realtime subscription to user_points for multi-tab consistency
  useEffect(() => {
    let channel = null;

    const fetchUserAndPoints = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
        return;
      }
      setUser(user);

      const { data: row, error } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching points in Rewards:", error);
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
      setLoading(false);
    };

    fetchUserAndPoints();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

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
    const { error: deductionError } = await supabase
      .from("user_points")
      .update({ points: pointsAfterDeduction, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (deductionError) {
      console.error("Error deducting points in spinWheel:", deductionError);
      setResult("Failed to spin: " + deductionError.message);
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
      const finalPoints = pointsAfterDeduction + totalPointsWon;
      const { error: awardError } = await supabase
        .from("user_points")
        .update({ points: finalPoints, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (awardError) {
        console.error("Error awarding points after spin:", awardError);
        setResult(`Spin complete! Error awarding points: ${awardError.message}. Current balance shown may be outdated.`);
      } else {
        setPoints(finalPoints);
        setResult(finalResultMessage);
      }
      setIsSpinning(false);
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

    const { error: pointsError } = await supabase
      .from("user_points")
      .update({ points: pointsAfterClaim, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (pointsError) {
      console.error("Error updating points in claimShopReward:", pointsError);
      setShopMessage("Error claiming reward: " + pointsError.message);
      setTimeout(() => setShopMessage(null), 3000);
      setClaimingStatus(prev => ({ ...prev, [reward.id]: null }));
      return;
    }

    const { error: rewardError } = await supabase
      .from("user_rewards")
      .insert({ user_id: user.id, reward_name: reward.name, cost: reward.cost, claimed_at: new Date().toISOString() });

    if (rewardError) {
      console.error("Error inserting claimed reward record:", rewardError);
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

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading Rewards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-4 flex flex-col items-center">
      {/* Animated gold badge */}
        <div
          className={[
            "mb-8 mt-20 text-gray-800 text-3xl sm:text-4xl font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg border-2",
            anim === "up" ? "bg-green-50 border-green-400 ring-2 ring-green-300 coin-bump" :
            anim === "down" ? "bg-red-50 border-red-400 ring-2 ring-red-300 coin-shake" :
                              "bg-yellow-100 border-yellow-400",
          ].join(" ")}
          style={{
            backgroundImage: 'url("/pixel_art_gold_coin.png")',
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left 10px center",
            paddingLeft: "80px",
            minWidth: "250px",
            minHeight: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>Gold: {points}</span>

        {/* floating +N / -N */}
        {anim && delta !== 0 && (
          <span
            className={[
              "absolute -mt-12 ml-40 text-xl font-bold pointer-events-none",
              anim === "up" ? "text-green-600 float-up" : "text-red-600 float-down",
            ].join(" ")}
          >
            {delta > 0 ? `+${delta}` : `${delta}`}
          </span>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 mt-4">
        Spin the Slot Reels 🎰
      </h1>
      <p className="text-gray-600 mb-6 text-base sm:text-lg">Cost per spin: {spinCost} gold</p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8 p-4 bg-gray-900 rounded-lg shadow-inner relative">
        {/* Wheel 1 */}
        <div className="w-72 h-72 sm:w-80 sm:h-80 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-blue-100 shadow-inner text-center font-bold text-lg sm:text-xl overflow-hidden relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-4xl leading-none z-30 pointer-events-none">▼</div>
          <div
            className="w-full h-full absolute top-0 left-0"
            style={{
              transform: `rotate(${wheel1Rotation}deg)`,
              transition: "transform 4000ms cubic-bezier(0.33, 1, 0.68, 1)",
            }}
          >
            {wheelOutcomes.map((outcome, idx) => {
              const position = calculatePosition(outcome.targetDegree, WHEEL_DIAMETERS.wheel1);
              return (
                <div
                  key={`w1-o-${idx}`}
                  className="absolute flex flex-row items-center justify-center"
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
                  <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-8 h-8 sm:w-10 sm:h-10 object-contain mr-1 flex-shrink-0" />
                  <span className="text-gray-800 text-xs sm:text-sm font-bold leading-tight">{outcome.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wheel 2 */}
        <div className="w-80 h-80 sm:w-96 sm:h-96 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-green-100 shadow-inner text-center font-bold text-xl sm:text-2xl overflow-hidden relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-4xl leading-none z-30 pointer-events-none">▼</div>
          <div
            className="w-full h-full absolute top-0 left-0"
            style={{
              transform: `rotate(${wheel2Rotation}deg)`,
              transition: "transform 4000ms cubic-bezier(0.33, 1, 0.68, 1)",
            }}
          >
            {wheelOutcomes.map((outcome, idx) => {
              const position = calculatePosition(outcome.targetDegree, WHEEL_DIAMETERS.wheel2);
              return (
                <div
                  key={`w2-o-${idx}`}
                  className="absolute flex flex-row items-center justify-center"
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
                  <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-8 h-8 sm:w-10 sm:h-10 object-contain mr-1 flex-shrink-0" />
                  <span className="text-gray-800 text-xs sm:text-sm font-bold leading-tight">{outcome.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wheel 3 */}
        <div className="w-72 h-72 sm:w-80 sm:h-80 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-purple-100 shadow-inner text-center font-bold text-lg sm:text-xl overflow-hidden relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-4xl leading-none z-30 pointer-events-none">▼</div>
          <div
            className="w-full h-full absolute top-0 left-0"
            style={{
              transform: `rotate(${wheel3Rotation}deg)`,
              transition: "transform 4000ms cubic-bezier(0.33, 1, 0.68, 1)",
            }}
          >
            {wheelOutcomes.map((outcome, idx) => {
              const position = calculatePosition(outcome.targetDegree, WHEEL_DIAMETERS.wheel3);
              return (
                <div
                  key={`w3-o-${idx}`}
                  className="absolute flex flex-row items-center justify-center"
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
                  <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-8 h-8 sm:w-10 sm:h-10 object-contain mr-1 flex-shrink-0" />
                  <span className="text-gray-800 text-xs sm:text-sm font-bold leading-tight">{outcome.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={spinWheel}
        disabled={isSpinning || loading || points < spinCost}
        className={`py-3 px-6 rounded-full font-semibold transition transform hover:scale-105 shadow-md text-base sm:text-lg
          ${isSpinning || loading || points < spinCost
            ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-50"
            : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
      >
        {isSpinning ? "Spinning..." : `Spin (${spinCost} gold)`}
      </button>

      {result && (
        <div
          className={`mt-6 text-xl sm:text-3xl font-bold p-3 sm:p-4 rounded-lg shadow-md text-center transition-all duration-300 ${
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

      <h2 className="mt-12 sm:mt-16 mb-6 text-2xl sm:text-3xl font-extrabold text-gray-900 text-center border-b-2 border-purple-500 pb-2">
        Rewards Shop 🛍️
      </h2>
      <p className="text-gray-600 mb-8 text-base sm:text-lg text-center">
        Use your gold to claim awards here! (Claimable multiple times)
      </p>

      {shopMessage && (
        <div
          className={`mb-6 p-3 rounded-md text-center font-semibold text-base sm:text-lg transition-all duration-300 ${
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-5xl">
        {shopRewards.map((reward) => (
          <div
            key={reward.id}
            className="border border-gray-200 rounded-xl p-5 sm:p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{reward.name}</h3>
              <p className="text-purple-700 mb-4 text-base sm:text-xl font-bold">Cost: {reward.cost} gold</p>
            </div>
            <button
              onClick={() => claimShopReward(reward)}
              disabled={
                loading ||
                points < reward.cost ||
                claimingStatus[reward.id] === "claiming" ||
                claimingStatus[reward.id] === "claimed"
              }
              className={`py-2 sm:py-3 px-4 sm:px-6 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-md text-sm sm:text-base
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

      <div className="mt-12 text-gray-600 text-sm text-center">
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
