// Spin the wheel game
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Rewards() {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0); // Variable name is now 'points'
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [shopMessage, setShopMessage] = useState(null);
  const [claimingStatus, setClaimingStatus] = useState({}); // Use reward ID or index as key

  // State for the rotation angle of EACH wheel
  const [wheel1Rotation, setWheel1Rotation] = useState(0);
  const [wheel2Rotation, setWheel2Rotation] = useState(0);
  const [wheel3Rotation, setWheel3Rotation] = useState(0);

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // --- Spin Wheel Configuration ---
  const spinCost = 300; // Variable name is now 'spinCost'

  // Define possible outcomes with point value, probability, AND target stop degree
  // Degrees assume 0 is pointing upwards, increasing clockwise.
  // The targetDegree is where the CENTER of the segment should stop under the pointer.
  // These values correspond to the segments on your visual wheel.
  const wheelOutcomes = [
    { label: "0 gold", value: 0, probability: 0.15, targetDegree: 0 },
    { label: "+50 gold", value: 20, probability: 0.30, targetDegree: 51.4 * 1 }, // approx 51.4
    { label: "+80 gold", value: 50, probability: 0.25, targetDegree: 51.4 * 2 }, // approx 102.8
    { label: "-50 gold", value: -100, probability: 0.10, targetDegree: 51.4 * 3 }, // approx 154.2
    { label: "+150 gold", value: 100, probability: 0.14, targetDegree: 51.4 * 4 }, // approx 205.6
    { label: "Small Jackpot!", value: 300, probability: 0.05, targetDegree: 51.4 * 5 }, // approx 257.0
    { label: "BIG JACKPOT!", value: 1000, probability: 0.01, targetDegree: 51.4 * 6 }, // approx 308.4
  ];
  // Note: Probabilities sum to 1.0.

  const expectedValueNet = wheelOutcomes.reduce((sum, outcome) => {
       return sum + (outcome.value * outcome.probability);
   }, 0);

  // Function to select an outcome based on probabilities (used for each wheel)
  const selectWeightedOutcome = (outcomes) => {
    const totalWeight = outcomes.reduce((sum, outcome) => sum + outcome.probability, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < outcomes.length; i++) {
      const outcome = outcomes[i];
      if (random < outcome.probability) {
        return outcome;
      }
      random -= outcome.probability;
    }
     console.error("Weighted outcome selection fell through, probabilities might not sum to 1.");
    return outcomes[outcomes.length - 1]; // Fallback
  };

  // --- Rewards Shop Configuration ---
  const shopRewards = [
    { id: 1, name: "Virtual Trophy", cost: 200 },
    { id: 2, name: "Profile Badge", cost: 150 },
    { id: 3, name: "Bonus Spin", cost: 300 },
    { id: 4, name: "Tax Report Skin", cost: 100 },
    { id: 5, name: "Gambling Diary Theme", cost: 250 },
    { id: 6, name: "Exclusive Avatar", cost: 350 },
    { id: 7, name: "Small Point Pack (100 pts)", cost: 50 },
    { id: 8, name: "Mystery Box", cost: 500 },
  ];


  // --- Supabase Data Fetching ---
  useEffect(() => {
    // Kept function name as is from user's snippet
    const fetchUserAndPoints = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
        return;
      }
      setUser(user);

      // NOTE: Supabase column is still named 'points'
      // Kept variable names as is from user's snippet
      const { data: pointsData, error: pointsError } = await supabase
        .from("user_points") // Table name remains the same
        .select("points") // Column name remains the same
        .eq("user_id", user.id)
        .single();

      if (pointsError && pointsError.code !== "PGRST116") {
        console.error("Error fetching points in Rewards:", pointsError);
        setPoints(0);
      } else if (!pointsData) {
         console.warn("No user_points row found for user:", user.id, ". It should be created on signup.");
         setPoints(0);
      } else {
        console.log("Fetched points in Rewards for user:", user.id, "Points:", pointsData.points);
        setPoints(pointsData.points); // Using setPoints
      }

      setLoading(false);
    };
    // Kept function call name as is from user's snippet
    fetchUserAndPoints();

    console.log(`Spin Cost: ${spinCost}`); // Using spinCost
    console.log("Wheel Outcomes (with Degrees):", wheelOutcomes);
    console.log(`Expected Net Value Per Spin: ${expectedValueNet.toFixed(2)} gold`); // Displaying "gold"
     if (expectedValueNet < 0) {
        console.log("Odds favor the house (slightly). Good!");
    } else if (expectedValueNet === 0) {
        console.log("Odds are balanced.");
    } else {
        console.log("Odds favor the player. Adjust probabilities!");
    }


  }, [router]);


  // --- Slot Machine Message Generation (Refactored for Message Only) ---
  // This function generates a message based on the three outcomes for animation/display
  const generateSpinMessage = (outcome1, outcome2, outcome3) => {
      const outcomes = [outcome1, outcome2, outcome3];
      const labels = outcomes.map(o => o.label); // Get just the labels

      // Check for 3 matching labels for special messages
      if (labels[0] === labels[1] && labels[1] === labels[2]) {
          switch(labels[0]) {
              case "BIG JACKPOT!":
                  return "SUPER JACKPOT!!!";
              case "Small Jackpot!":
                  return "TRIPLE Small Jackpot!";
              case "0 gold":
                  return "TRIPLE 0s!";
              case "-50 gold":
                  return "TRIPLE -50s! Ouch!";
              default:
                  return `TRIPLE ${labels[0]}!`; // Generic message for other triples
          }
      }

      // You could add messages for pairs here if you want, or specific combinations
      // e.g. if (labels.includes("BIG JACKPOT!") && labels.includes("Small Jackpot!")) return "Near Miss!"

      // Default message if no specific match condition is met
      // Could also list the outcomes: `You got ${labels.join(" | ")}`
      return "Spin Result:";
  };


  // --- Spin Wheel Logic ---
  const spinWheel = async () => {
    // Basic checks (existing)
    if (isSpinning) return;
    if (!user) { router.push("/signin"); return; }
    // Use 'points' variable for cost check
    if (points < spinCost) {
       // Display "gold" in the message but use 'spinCost' variable
       setResult(`Not enough gold! Spinning costs ${spinCost} gold.`);
       setTimeout(() => setResult(null), 3000);
       console.log("Cannot spin: Insufficient points:", points); // Log uses 'points' variable
      return;
    }

    // Reset states for new spin
    setIsSpinning(true);
    setResult(null);


    // --- Deduct spin cost (Server-side via Supabase) ---
    // Use 'points' variable for deduction
    const pointsAfterDeduction = points - spinCost;
    console.log("User:", user.id, "Deducting", spinCost, "points. Points before:", points, "Points after:", pointsAfterDeduction);

    const { error: deductionError } = await supabase
      .from("user_points") // Table name remains the same
      // Update 'points' column using 'pointsAfterDeduction' variable
      .update({ points: pointsAfterDeduction, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (deductionError) {
      console.error("Error deducting points in spinWheel:", deductionError);
      setResult("Failed to spin: " + deductionError.message);
      setTimeout(() => setResult(null), 3000);
      setIsSpinning(false);
      return; // Stop execution if deduction fails
    }
    // Update 'points' state with the new value
    setPoints(pointsAfterDeduction);
     console.log(`Points updated client-side after deduction: ${pointsAfterDeduction}`);


    // --- Determine Outcomes for EACH Wheel (Client-side for now) ---
    // TODO: Move this outcome selection server-side for security!
    const outcome1 = selectWeightedOutcome(wheelOutcomes);
    const outcome2 = selectWeightedOutcome(wheelOutcomes);
    const outcome3 = selectWeightedOutcome(wheelOutcomes);

    console.log("User:", user.id, "Outcomes:", outcome1.label, "|", outcome2.label, "|", outcome3.label);

    // --- Calculate Total Points Won based on the value of EACH outcome ---
    // This sums the 'value' property of each selected outcome
    const totalPointsWon = outcome1.value + outcome2.value + outcome3.value;
    console.log("Total Points Won this spin:", totalPointsWon);


    // --- Generate Spin Message ---
    const spinMessage = generateSpinMessage(outcome1, outcome2, outcome3);
    // Combine message and amount for the final display result
    const finalResultMessage = `${spinMessage} | Won: ${totalPointsWon} gold!`;


    // --- Animation Start ---
    const minInitialSpins = 10; // Ensure at least this many full spins
    const animationDurationMs = 4000; // Match CSS transition duration

    // Calculate initial high rotation for EACH wheel for fast spin
    // Use current rotation plus many full spins and a random start offset
    const initialSpinDegrees1 = wheel1Rotation + (minInitialSpins * 360) + Math.random() * 360;
    const initialSpinDegrees2 = wheel2Rotation + (minInitialSpins * 360) + Math.random() * 360;
    const initialSpinDegrees3 = wheel3Rotation + (minInitialSpins * 360) + Math.random() * 360;

    // Trigger fast spin animation for all wheels by updating state
    setWheel1Rotation(initialSpinDegrees1);
    setWheel2Rotation(initialSpinDegrees2);
    setWheel3Rotation(initialSpinDegrees3);


    // --- Schedule Animation Stop and Point/Result Updates ---
    // Use a timeout that matches the animation duration
    setTimeout(async () => {

      // --- Animation Stop: Calculate final rotations based on selected outcomes ---
      // The final rotation is the initial rotation + more spins + the degree needed to land on target.
      // We calculate this for each wheel based on its determined outcome.
      const minAdditionalSpinsStop = 5; // Ensure at least 5 more spins before stopping

      // Calculate final rotation for Wheel 1
      const normalizedInitialRotation1 = initialSpinDegrees1 % 360;
      let degreesToAdd1 = outcome1.targetDegree - normalizedInitialRotation1;
       if (degreesToAdd1 < 0) { degreesToAdd1 += 360; } // Spin clockwise
      const finalRotationDegrees1 = initialSpinDegrees1 + (minAdditionalSpinsStop * 360) + degreesToAdd1;

      // Calculate final rotation for Wheel 2
      const normalizedInitialRotation2 = initialSpinDegrees2 % 360;
      let degreesToAdd2 = outcome2.targetDegree - normalizedInitialRotation2;
       if (degreesToAdd2 < 0) { degreesToAdd2 += 360; }
      const finalRotationDegrees2 = initialSpinDegrees2 + (minAdditionalSpinsStop * 360) + degreesToAdd2;

      // Calculate final rotation for Wheel 3
      const normalizedInitialRotation3 = initialSpinDegrees3 % 360;
      let degreesToAdd3 = outcome3.targetDegree - normalizedInitialRotation3;
       if (degreesToAdd3 < 0) { degreesToAdd3 += 360; }
      const finalRotationDegrees3 = initialSpinDegrees3 + (minAdditionalSpinsStop * 360) + degreesToAdd3;


      // Update rotation states - CSS transition handles the smooth stop animation for each wheel
      setWheel1Rotation(finalRotationDegrees1);
      setWheel2Rotation(finalRotationDegrees2);
      setWheel3Rotation(finalRotationDegrees3);


      // --- Award Points (Server-side via Supabase) ---
      // Calculate the final points after adding the total won
      const finalPoints = pointsAfterDeduction + totalPointsWon;

      // NOTE: Supabase column is still named 'points'
      const { error: awardError } = await supabase
        .from("user_points") // Table name remains the same
        // Update 'points' column using 'finalPoints' variable
        .update({ points: finalPoints, updated_at: new Date().toISOString() })
        .eq("user_id", user.id); // Corrected user.id syntax from previous mistake


      if (awardError) {
        console.error("Error awarding points after spin:", awardError);
        // Handle potential client/server sync issues if award fails
      } else {
         console.log(`Points updated client-side after spin: ${finalPoints}`);
      }

     // Always update client-side points state to reflect the final amount (deduction + total won)
     setPoints(finalPoints);


      // --- Final State Updates ---
      setResult(finalResultMessage); // Display the combined message and amount
      setIsSpinning(false); // Allow spinning again

      // TODO: Later, log the spin result (outcome1, outcome2, outcome3, totalPointsWon, finalResultMessage)
      // to a 'spin_history' table in Supabase

    }, animationDurationMs); // Wait for the CSS animation duration before updating state

  }; // End of spinWheel function

  // --- Rewards Shop Logic (remains the same) ---
  const claimShopReward = async (reward, index) => {
      // ... (claimShopReward code remains the same) ...
      if (!user) {
           console.warn("Claim attempted with no user.");
           router.push("/signin");
           return;
       }
      if (points < reward.cost) {
         setShopMessage(`Not enough points! ${reward.name} costs ${reward.cost} points.`);
         setTimeout(() => setShopMessage(null), 3000);
         console.log("Cannot claim reward:", reward.name, "Insufficient points:", points);
        return;
      }

      if (claimingStatus[reward.id] === 'claiming' || claimingStatus[reward.id] === 'claimed') {
          console.log("Already claiming or claimed this item temporarily:", reward.name);
          return;
      }

      setClaimingStatus(prev => ({ ...prev, [reward.id]: 'claiming' }));
      console.log("User:", user.id, "Attempting to claim:", reward.name, "Cost:", reward.cost);

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
        .insert({ user_id: user.id, reward_name: reward.name, cost: reward.cost });


      if (rewardError) {
         console.error("Error inserting claimed reward record:", rewardError);
          setShopMessage("Points deducted, but failed to record reward: " + rewardError.message);
           setPoints(pointsAfterClaim);
      } else {
          console.log("Successfully claimed and recorded:", reward.name);
          setPoints(pointsAfterClaim);
          setShopMessage(`Successfully claimed: ${reward.name}!`);
      }

      setClaimingStatus(prev => ({ ...prev, [reward.id]: 'claimed' }));

      setTimeout(() => {
           setClaimingStatus(prev => ({ ...prev, [reward.id]: null }));
           if (shopMessage && shopMessage.includes(reward.name)) {
              setShopMessage(null);
           }
      }, 500);

       setTimeout(() => {
            if(claimingStatus[reward.id] === 'claiming') {
                setClaimingStatus(prev => ({ ...prev, [reward.id]: null }));
            }
       }, 200);
    };

  // Helper function (needs to be defined outside of return)
const calculatePosition = (degree) => {
  // Size of the main wheel container (used for radius)
  // You might need to adjust mainWheelSize if your container sizes changed.
  // The user's provided snippet implies different wheel sizes (w-56/64/72)
  // This calculation assumes the *middle* wheel size (w-72/sm:w-72).
  // If using different sized wheels, you might need different radius values
  // for each wheel's outcome positioning, or calculate relative to the parent size.
  // For simplicity and consistency with previous steps, keeping it based on w-72 for now.
  const mainWheelSize = 72 * 4; // This likely needs adjustment based on the specific wheel it's applied to
  const radius = (mainWheelSize / 2) * 0.6; // <-- VISUAL TUNING: Adjust this multiplier (e.g., 0.5 to 0.7)

  // Angle relative to the top (0 degrees is up)
  const angleFromTop = degree;

  // Convert CSS degree (0=up, clockwise) to radians for trig (0=right, counter-clockwise)
  const angleInRadians = (90 - angleFromTop) * Math.PI / 180;

  const x = radius * Math.cos(angleInRadians);
  const y = radius * Math.sin(angleInRadians);

  // Position from the center of the container (50% 50%)
  return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% - ${y}px)`, // Subtract Y because positive Y in CSS is down
  };
};

// Assuming wheelOutcomes and other states like points, isSpinning, spinCost are defined based on user's snippet


return (
  <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
      {/* Points Display (kept as is from user's snippet, using {points}) */}
      <div className="mb-8 bg-yellow-400 text-gray-500 text-3xl sm:text-4xl font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg border-2 border-yellow-600"
          style={{
              backgroundImage: 'url("/pixel_art_gold_coin.png")', // Set your image as background
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              // Adding background position and padding to match previous goal
              backgroundPosition: 'left center',
              paddingLeft: '50px',
              minWidth: '200px',
              minHeight: '60px',
              display: 'flex', // Added flex
              alignItems: 'center', // Added items-center
              justifyContent: 'center' // Added justify-center
          }}
      >
          {/* Kept text as is from user's snippet, using {points} */}
          <span>Gold: {points}</span>
      </div>

      {/* Spin the Wheel Section (kept as is from user's snippet, using {spinCost} and 'gold') */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 mt-4">Spin the Slot Reels 🎰</h1>
      <p className="text-gray-600 mb-6 text-base sm:text-lg">Cost per spin: {spinCost} gold</p>

      {/* Three Wheels Slot Machine Area (kept as is from user's snippet, using bg-gray-900) */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8 p-4 bg-gray-900 rounded-lg shadow-inner relative">

          {/* Removed the old pointer div */}
          {/* Removed the div with className="absolute w-full max-w-md flex justify-around ..." */}

          {/* --- Wheel 1 (Left Reel) - Animated --- */}
          {/* Added pointer inside this wheel's div */}
          {/* Kept background color as bg-blue-100 from previous step */}
          <div className={`w-56 h-56 sm:w-64 sm:h-64 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-blue-100 shadow-inner text-center font-bold text-lg sm:text-xl overflow-hidden relative`}>
               {/* Pointer for Wheel 1 */}
               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-4xl leading-none z-30 pointer-events-none">
                   ▼
               </div>
              <div
                  className="w-full h-full absolute top-0 left-0" // Covers the parent
                  style={{
                      transform: `rotate(${wheel1Rotation}deg)`, // Use Wheel 1 state
                      transition: 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1.0)', // Match animation duration
                  }}
              >
                  {/* Map over outcomes to create content elements positioned around this wheel */}
                  {/* Adjusted style for inner content alignment - Reverted translate */}
                  {wheelOutcomes.map((outcome, idx) => {
                      const position = calculatePosition(outcome.targetDegree); // Pass target degree only

                      return (
                          <div
                              key={`w1-o-${idx}`}
                              // Changed flex-col to flex-row to put image and text side-by-side
                              className="absolute flex flex-row items-center justify-center" // <-- Changed flex-col to flex-row
                              style={{
                                  top: position.top,
                                  left: position.left,
                                  // Reverted translate back to -50%, -50% for centering the div on the position
                                  transform: `translate(-50%, -50%) rotate(-${wheel1Rotation}deg)`, // <-- Reverted translate
                                  width: '80px', // <-- VISUAL TUNING: Adjust this
                                  height: '50px', // <-- VISUAL TUNING: Adjust this
                                  textAlign: 'center',
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                              }}
                          >
                              {/* Image - Added right margin */}
                              <img
                                  src="/pixel_art_gold_coin.png" // Use your coin image path
                                  alt="Coin"
                                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain mr-1" // <-- Added right margin (mr-1)
                              />
                              {/* Text/Label */}
                              <span className="text-gray-800 text-xs sm:text-sm font-bold leading-tight whitespace-nowrap">
                                  {outcome.label}
                              </span>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* --- Wheel 2 (Middle Reel) - Animated --- */}
          {/* Added pointer inside this wheel's div */}
          {/* Kept background color as bg-green-100 from previous step */}
          <div className={`w-64 h-64 sm:w-72 sm:h-72 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-green-100 shadow-inner text-center font-bold text-xl sm:text-2xl overflow-hidden relative`}>
               {/* Pointer for Wheel 2 */}
               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-4xl leading-none z-30 pointer-events-none">
                   ▼
               </div>
              <div
                  className="w-full h-full absolute top-0 left-0"
                  style={{
                      transform: `rotate(${wheel2Rotation}deg)`, // Use Wheel 2 state
                      transition: 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1.0)', // Match animation duration
                  }}
              >
                  {/* Map over outcomes for Wheel 2 - Adjusted style */}
                  {wheelOutcomes.map((outcome, idx) => {
                      const position = calculatePosition(outcome.targetDegree); // Pass target degree

                      return (
                          <div
                              key={`w2-o-${idx}`}
                              className="absolute flex flex-row items-center justify-center" // <-- Changed flex-col to flex-row
                              style={{
                                  top: position.top,
                                  left: position.left,
                                  transform: `translate(-50%, -50%) rotate(-${wheel2Rotation}deg)`, // <-- Reverted translate
                                  width: '80px', // <-- VISUAL TUNING: Adjust this
                                  height: '50px', // <-- VISUAL TUNING: Adjust this
                                  textAlign: 'center',
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                              }}
                          >
                              <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-8 h-8 sm:w-10 sm:h-10 object-contain mr-1" /> {/* <-- Added right margin (mr-1) */}
                              <span className="text-gray-800 text-xs sm:text-sm font-bold leading-tight whitespace-nowrap">{outcome.label}</span>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* --- Wheel 3 (Right Reel) - Animated --- */}
          {/* Added pointer inside this wheel's div */}
          {/* Kept background color as bg-purple-100 from previous step */}
          <div className={`w-56 h-56 sm:w-64 sm:h-64 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-purple-100 shadow-inner text-center font-bold text-lg sm:text-xl overflow-hidden relative`}>
               {/* Pointer for Wheel 3 */}
               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-600 text-4xl leading-none z-30 pointer-events-none">
                   ▼
               </div>
              <div
                  className="w-full h-full absolute top-0 left-0"
                  style={{
                      transform: `rotate(${wheel3Rotation}deg)`, // Use Wheel 3 state
                      transition: 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1.0)', // Match animation duration
                  }}
              >
                  {/* Map over outcomes for Wheel 3 - Adjusted style */}
                  {wheelOutcomes.map((outcome, idx) => {
                      const position = calculatePosition(outcome.targetDegree); // Pass target degree

                      return (
                          <div
                              key={`w3-o-${idx}`}
                              className="absolute flex flex-row items-center justify-center" // <-- Changed flex-col to flex-row
                              style={{
                                  top: position.top,
                                  left: position.left,
                                  transform: `translate(-50%, -50%) rotate(-${wheel3Rotation}deg)`, // <-- Reverted translate
                                  width: '80px', // <-- VISUAL TUNING: Adjust this
                                  height: '50px', // <-- VISUAL TUNING: Adjust this
                                  textAlign: 'center',
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                              }}
                          >
                              <img src="/pixel_art_gold_coin.png" alt="Coin" className="w-8 h-8 sm:w-10 sm:h-10 object-contain mb-0.5" /> {/* <-- Added right margin (mr-1) */}
                              <span className="text-gray-800 text-xs sm:text-sm font-bold leading-tight whitespace-nowrap">{outcome.label}</span>
                          </div>
                      );
                  })}
              </div>
          </div>

      </div> {/* End of Three Wheels Slot Machine Area wrapper */}

      {/* Spin button (kept as is from user's snippet, using {points} and 'gold') */}
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

      {/* Result display (kept as is from user's snippet, using checks for 'gold' and '-') */}
      {result && (
          <div className={`mt-6 text-xl sm:text-3xl font-bold p-3 sm:p-4 rounded-lg shadow-md text-center ${result.includes("JACKPOT") || result.includes("WIN") ? 'bg-yellow-200 text-yellow-800 border-4 border-yellow-500' : result.includes("Try Again") || result.includes("No Match") ? 'bg-gray-300 text-gray-700' : result.includes("Failed") || result.includes("enough gold") || result.includes("-") ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-800'}`}>
              ✨ {result}!
          </div>
      )}

      {/* Notes (updated based on changes) */}
      <p className="mt-6 text-sm text-gray-500 italic text-center">
          (Visuals are placeholders - replace "/pixel_art_gold_coin.png" with your actual image path.)
          <br/>
          (Adjust the <code>radius</code> multiplier in <code>calculatePosition</code> and the <code>width</code>/<code>height</code> in the outcome element's style for visual alignment of content.)
          <br/>
          (Adjust the <code>top</code> value on the pointer divs (e.g., <code>top: 5px</code>) to fine-tune their position on the wheel edge.)
          <br/>
          (To enable payouts for two matching symbols, uncomment the Rule 2 block in evaluateWin and adjust its payout.)
          <br/>
          (Change the wheel background color classes (<code>bg-blue-100</code>, etc.) or use inline <code>background-image</code> style.)
      </p>


      {/* Rewards Shop (kept as is from user's snippet, using {points} and 'gold') */}
      <h2 className="mt-12 sm:mt-16 mb-6 text-2xl sm:text-3xl font-extrabold text-gray-900 text-center border-b-2 border-purple-500 pb-2">
          Rewards Shop 🛍️
      </h2>
      <p className="text-gray-600 mb-8 text-base sm:text-lg text-center">Use your gold to claim awards here! (Claimable multiple times)</p>

      {/* Shop Message Area (kept as is from user's snippet, using checks for 'gold') */}
      {shopMessage && (
          <div className={`mb-6 p-3 rounded-md text-center font-semibold text-base sm:text-lg ${shopMessage.includes("Successfully") ? 'bg-green-200 text-green-800' : shopMessage.includes("gold") ? 'bg-red-200 text-red-800' : 'bg-red-200 text-red-800'}`}>
              {shopMessage}
          </div>
      )}

      {/* Shop Rewards Grid (kept as is from user's snippet, using {points} and 'gold') */}
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
                      disabled={loading || points < reward.cost || claimingStatus[reward.id] === 'claiming'}
                      className={`py-2 sm:py-3 px-4 sm:px-6 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-md text-sm sm:text-base
                         ${
                            claimingStatus[reward.id] === 'claimed' ?
                            'bg-green-600 text-white'
                            :
                            points < reward.cost || claimingStatus[reward.id] === 'claiming' ?
                            "bg-gray-400 text-gray-700 cursor-not-allowed" :
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
      {/* User ID display (kept as is from user's snippet) */}
      <div className="mt-12 text-gray-600 text-sm text-center">
          User ID: {user?.id}
      </div>
  </div>
);
}