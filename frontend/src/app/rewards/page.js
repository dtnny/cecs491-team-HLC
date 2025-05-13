// Spin the wheel game
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Rewards() {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
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

  const wheelOutcomes = [
    { label: "0 gold", value: 0, probability: 0.15, targetDegree: 0 },
    { label: "+50 gold", value: 20, probability: 0.30, targetDegree: 51.4 * 1 },
    { label: "+80 gold", value: 50, probability: 0.25, targetDegree: 51.4 * 2 },
    { label: "-50 gold", value: -100, probability: 0.10, targetDegree: 51.4 * 3 },
    { label: "+150 gold", value: 100, probability: 0.14, targetDegree: 51.4 * 4 },
    { label: "Small Jackpot!", value: 300, probability: 0.05, targetDegree: 51.4 * 5 },
    { label: "BIG JACKPOT!", value: 1000, probability: 0.01, targetDegree: 51.4 * 6 },
  ];

  // ... (selectWeightedOutcome, shopRewards, useEffect, generateSpinMessage, spinWheel, claimShopReward functions remain the same) ...
  const selectWeightedOutcome = (outcomes) => {
    const totalProb = outcomes.reduce((sum, o) => sum + o.probability, 0);
    let random = Math.random() * totalProb; 

    for (let i = 0; i < outcomes.length; i++) {
      const outcome = outcomes[i];
      if (random < outcome.probability) {
        return outcome;
      }
      random -= outcome.probability;
    }
    console.error("Weighted outcome selection fell through. Probabilities sum:", totalProb, "Random:", random);
    return outcomes[outcomes.length - 1]; 
  };

  const shopRewards = [
    { id: 1, name: "Profile Badge", cost: 150 },
    { id: 2, name: "Bonus Spin", cost: 300 },
    { id: 3, name: "Tax Report", cost: 100 },
    { id: 4, name: "2 Tax Reports", cost: 250 },
    { id: 5, name: "Exclusive Avatar", cost: 350 },
    { id: 6, name: "Mystery Box", cost: 500 },
  ];

  useEffect(() => {
    const fetchUserAndPoints = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
        return;
      }
      setUser(user);

      const { data: pointsData, error: pointsError } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", user.id)
        .single();

      if (pointsError && pointsError.code !== "PGRST116") {
        console.error("Error fetching points in Rewards:", pointsError);
        setPoints(0);
      } else if (!pointsData) {
        console.warn("No user_points row found for user:", user.id, ". It should be created on signup.");
        setPoints(0);
      } else {
        setPoints(pointsData.points);
      }
      setLoading(false);
    };
    fetchUserAndPoints();
  }, [router]); 

  const generateSpinMessage = (outcome1, outcome2, outcome3) => {
    const outcomes = [outcome1, outcome2, outcome3];
    const labels = outcomes.map(o => o.label);

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

    const outcome1 = selectWeightedOutcome(wheelOutcomes);
    const outcome2 = selectWeightedOutcome(wheelOutcomes);
    const outcome3 = selectWeightedOutcome(wheelOutcomes);

    const totalPointsWon = outcome1.value + outcome2.value + outcome3.value;
    const spinMessage = generateSpinMessage(outcome1, outcome2, outcome3);
    const finalResultMessage = `${spinMessage} | Won: ${totalPointsWon} gold!`;

    const animationDurationMs = 4000; 
    const baseSpins = 8; 

    const calculateTargetRotation = (currentRotation, outcomeTargetDegree, wheelId) => {
      const randomExtraSpins = Math.floor(Math.random() * 4); 
      const currentFullRotations = Math.floor(currentRotation / 360);
      
      let targetRot = (currentFullRotations + baseSpins + randomExtraSpins) * 360 + outcomeTargetDegree;
      
      const minSpinsFromCurrentVisual = 3 * 360;
      if (targetRot < currentRotation + minSpinsFromCurrentVisual) {
          const virtualStartRotation = Math.ceil((currentRotation + minSpinsFromCurrentVisual) / 360) * 360;
          targetRot = virtualStartRotation + (baseSpins + randomExtraSpins -1) * 360 + outcomeTargetDegree;
      }
      return targetRot;
    };

    setWheel1Rotation(prev => calculateTargetRotation(prev, outcome1.targetDegree, 1));
    setWheel2Rotation(prev => calculateTargetRotation(prev, outcome2.targetDegree, 2));
    setWheel3Rotation(prev => calculateTargetRotation(prev, outcome3.targetDegree, 3));

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
      }
      
      setResult(finalResultMessage); 
      setIsSpinning(false);
    }, animationDurationMs);
  };

  const claimShopReward = async (reward) => {
    if (!user) { router.push("/signin"); return; }
    if (points < reward.cost) {
      setShopMessage(`Not enough points! ${reward.name} costs ${reward.cost} points.`);
      setTimeout(() => setShopMessage(null), 3000);
      return;
    }
    if (claimingStatus[reward.id] === 'claiming' || claimingStatus[reward.id] === 'claimed') return;

    setClaimingStatus(prev => ({ ...prev, [reward.id]: 'claiming' }));
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
    setClaimingStatus(prev => ({ ...prev, [reward.id]: 'claimed' }));
    setTimeout(() => {
        setClaimingStatus(prev => ({ ...prev, [reward.id]: null })); 
        if (shopMessage && shopMessage.includes(reward.name)) {
          setShopMessage(null); 
        }
    }, 3000); 
  };

  // Tailwind default: 1 unit = 0.25rem. Assuming 1rem = 16px. So 1 unit = 4px.
  // Wheel 1 & 3: Base w-72 (288px), sm:w-80 (320px)
  // Wheel 2: Base w-80 (320px), sm:w-96 (384px)
  const WHEEL_DIAMETERS = {
    wheel1: 320, // px, from sm:w-80 (was 288)
    wheel2: 384, // px, from sm:w-96 (was 320)
    wheel3: 320, // px, from sm:w-80 (was 288)
  };

  const calculatePosition = (degree, wheelDiameter) => {
    const radiusMultiplier = 0.75; // Kept at 0.75; adjust if items are too close to edge or center
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
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl">Loading Rewards...</p></div>;
  }


  return (
    
    <div className="min-h-screen bg-gray-100 p-4 sm:p-4 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 mt-8"></h1>
      
      <div className="mb-8 bg-yellow-400 text-gray-500 text-3xl sm:text-4xl font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg border-2 border-yellow-600"
          style={{
              backgroundImage: 'url("/pixel_art_gold_coin.png")',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left 10px center', 
              paddingLeft: '80px', 
              minWidth: '250px', 
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
          }}
      >
          <span>Gold: {points}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 mt-8">Spin the Slot Reels 🎰</h1>
      <p className="text-gray-600 mb-6 text-base sm:text-lg">Cost per spin: {spinCost} gold</p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8 p-4 bg-gray-900 rounded-lg shadow-inner relative">
        {/* Wheel 1 - Further Increased Size */}
        <div className={`w-72 h-72 sm:w-80 sm:h-80 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-blue-100 shadow-inner text-center font-bold text-lg sm:text-xl overflow-hidden relative`}> {/* Was w-64 h-64 sm:w-72 sm:h-72 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-4xl leading-none z-30 pointer-events-none">▼</div>
            <div
                className="w-full h-full absolute top-0 left-0"
                style={{
                    transform: `rotate(${wheel1Rotation}deg)`,
                    transition: 'transform 4000ms cubic-bezier(0.33, 1, 0.68, 1)', 
                }}
            >
                {wheelOutcomes.map((outcome, idx) => {
                    const position = calculatePosition(outcome.targetDegree, WHEEL_DIAMETERS.wheel1);
                    return (
                        <div
                            key={`w1-o-${idx}`}
                            className="absolute flex flex-row items-center justify-center" // Removed justify-center to allow natural text alignment start
                            style={{
                                top: position.top,
                                left: position.left,
                                transform: `translate(-50%, -50%) rotate(-${wheel1Rotation}deg)`,
                                width: '85px', 
                                height: '50px', 
                                textAlign: 'center', // Text align center for wrapped lines
                                pointerEvents: 'none', 
                                userSelect: 'none',
                                border: '2px solid #4A5568', 
                                borderRadius: '6px',        
                                backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                                padding: '2px', 
                                boxSizing: 'border-box', 
                            }}
                        >
                            <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-8 h-8 sm:w-10 sm:h-10 object-contain mr-1 flex-shrink-0" /> {/* Added flex-shrink-0 to image */}
                            {/* Removed whitespace-nowrap from text span */}
                            <span className="text-gray-800 text-xs sm:text-sm font-bold leading-tight">{outcome.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Wheel 2 - Further Increased Size */}
        <div className={`w-80 h-80 sm:w-96 sm:h-96 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-green-100 shadow-inner text-center font-bold text-xl sm:text-2xl overflow-hidden relative`}> {/* Was w-72 h-72 sm:w-80 sm:h-80 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-4xl leading-none z-30 pointer-events-none">▼</div>
            <div
                className="w-full h-full absolute top-0 left-0"
                style={{
                    transform: `rotate(${wheel2Rotation}deg)`,
                    transition: 'transform 4000ms cubic-bezier(0.33, 1, 0.68, 1)', 
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
                                width: '85px', 
                                height: '50px', 
                                textAlign: 'center',
                                pointerEvents: 'none', 
                                userSelect: 'none',
                                border: '2px solid #4A5568', 
                                borderRadius: '6px',        
                                backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                                padding: '2px',
                                boxSizing: 'border-box',
                            }}
                        >
                            <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-8 h-8 sm:w-10 sm:h-10 object-contain mr-1 flex-shrink-0" />
                            <span className="text-gray-800 text-xs sm:text-sm font-bold leading-tight">{outcome.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Wheel 3 - Further Increased Size */}
        <div className={`w-72 h-72 sm:w-80 sm:h-80 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-purple-100 shadow-inner text-center font-bold text-lg sm:text-xl overflow-hidden relative`}> {/* Was w-64 h-64 sm:w-72 sm:h-72 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-4xl leading-none z-30 pointer-events-none">▼</div>
            <div
                className="w-full h-full absolute top-0 left-0"
                style={{
                    transform: `rotate(${wheel3Rotation}deg)`,
                    transition: 'transform 4000ms cubic-bezier(0.33, 1, 0.68, 1)', 
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
                                width: '85px', 
                                height: '50px', 
                                textAlign: 'center',
                                pointerEvents: 'none', 
                                userSelect: 'none',
                                border: '2px solid #4A5568', 
                                borderRadius: '6px',        
                                backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                                padding: '2px',
                                boxSizing: 'border-box',
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

      {/* ... (Rest of the JSX: Spin button, Result display, Rewards Shop, etc. remain the same) ... */}
      <button
          onClick={spinWheel}
          disabled={isSpinning || loading || points < spinCost}
          className={`py-3 px-6 rounded-full font-semibold transition transform hover:scale-105 shadow-md text-base sm:text-lg
            ${isSpinning || loading || points < spinCost ?
               "bg-gray-400 text-gray-700 cursor-not-allowed opacity-50" :
               "bg-blue-600 text-white hover:bg-blue-700"
            }`}
      >
           {isSpinning ? "Spinning..." : `Spin (${spinCost} gold)`}
      </button>

      {result && (
          <div className={`mt-6 text-xl sm:text-3xl font-bold p-3 sm:p-4 rounded-lg shadow-md text-center transition-all duration-300 ${result.includes("JACKPOT") || result.includes("WIN") || (result.includes("Won:") && !result.includes("-") && !result.includes("0 gold")) ? 'bg-yellow-200 text-yellow-800 border-4 border-yellow-500' : result.includes("Try Again") || result.includes("No Match") || result.includes("0 gold") ? 'bg-gray-300 text-gray-700' : result.includes("Failed") || result.includes("enough gold") || result.includes("-") ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-800'}`}>
              ✨ {result}
          </div>
      )}

      <h2 className="mt-12 sm:mt-16 mb-6 text-2xl sm:text-3xl font-extrabold text-gray-900 text-center border-b-2 border-purple-500 pb-2">
          Rewards Shop 🛍️
      </h2>
      <p className="text-gray-600 mb-8 text-base sm:text-lg text-center">Use your gold to claim awards here! (Claimable multiple times)</p>

      {shopMessage && (
          <div className={`mb-6 p-3 rounded-md text-center font-semibold text-base sm:text-lg transition-all duration-300 ${shopMessage.includes("Successfully") ? 'bg-green-200 text-green-800' : shopMessage.includes("enough gold") ? 'bg-red-200 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
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
                      disabled={loading || points < reward.cost || claimingStatus[reward.id] === 'claiming' || claimingStatus[reward.id] === 'claimed'}
                      className={`py-2 sm:py-3 px-4 sm:px-6 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-md text-sm sm:text-base
                         ${
                            claimingStatus[reward.id] === 'claimed' ? 'bg-green-500 text-white cursor-not-allowed' :
                            claimingStatus[reward.id] === 'claiming' ? "bg-yellow-500 text-white cursor-wait" :
                            points < reward.cost ? "bg-gray-400 text-gray-700 cursor-not-allowed" :
                            "bg-purple-600 text-white hover:bg-purple-700"
                         }
                      `}
                  >
                      {claimingStatus[reward.id] === 'claiming' ? 'Claiming...' :
                       claimingStatus[reward.id] === 'claimed' ? 'Claimed!' :
                       'Claim'}
                  </button>
              </div>
          ))}
      </div>
      <div className="mt-12 text-gray-600 text-sm text-center">
          {user ? `User ID: ${user.id}` : "Not logged in"}
      </div>
  </div>
);
}