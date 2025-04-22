// Spin the wheel game
"use client";

import { useState, useEffect } from "react";

export default function Rewards() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [points, setPoints] = useState(5000);
  const [shopMessage, setShopMessage] = useState(null);
  const [claimingStatus, setClaimingStatus] = useState({});
  // State for the main wheel's rotation angle
  const [mainWheelRotation, setMainWheelRotation] = useState(0);

  // --- Spin Wheel Configuration ---
  const spinCost = 100; // Cost per spin

  // Define possible outcomes with point value, probability, AND target stop degree
  // Degrees assume 0 is pointing upwards, increasing clockwise.
  // Values are NET points after 100 cost. Probabilities sum to 1.0.
  // Degrees should be spread around 360 / number of outcomes (360 / 7 ≈ 51.4 degrees per segment).
  const wheelOutcomes = [
    { label: "Try Again!", value: 0, probability: 0.30, targetDegree: 0 }, // Start at 0
    { label: "+50 Points", value: 50, probability: 0.28, targetDegree: 51.4 * 1 },
    { label: "+80 Points", value: 80, probability: 0.20, targetDegree: 51.4 * 2 },
    { label: "-50 Points", value: -50, probability: 0.10, targetDegree: 51.4 * 3 },
    { label: "+150 Points", value: 150, probability: 0.07, targetDegree: 51.4 * 4 },
    { label: "Small Jackpot! (+500 pts)", value: 500, probability: 0.04, targetDegree: 51.4 * 5 },
    { label: "BIG JACKPOT! (+2000 pts)", value: 2000, probability: 0.01, targetDegree: 51.4 * 6 },
  ];

  // Calculate Expected Net Value per spin (for balance check)
   const expectedValueNet = wheelOutcomes.reduce((sum, outcome) => {
       return sum + (outcome.value * outcome.probability);
   }, 0);

   // Console Logging for Balance Check
   useEffect(() => {
     console.log(`Spin Cost: ${spinCost}`);
     console.log("Wheel Outcomes (with Degrees):", wheelOutcomes);
     console.log(`Expected Net Value Per Spin: ${expectedValueNet.toFixed(2)} points`);
     if (expectedValueNet < 0) {
         console.log("Odds favor the house (slightly). Good!");
     } else if (expectedValueNet === 0) {
         console.log("Odds are balanced.");
     } else {
         console.log("Odds favor the player. Adjust probabilities!");
     }
   }, []);

  // Function to select an outcome based on probabilities
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
    // Fallback (should not happen if probabilities sum to 1.0)
     console.error("Weighted outcome selection fell through, probabilities might not sum to 1.");
    return outcomes[outcomes.length - 1];
  };

  // --- Rewards Shop Configuration ---
  const shopRewards = [
    { id: 1, name: "Small Health Potion", cost: 200 },
    { id: 2, name: "Mana Boost", cost: 150 },
    { id: 3, name: "Experience Scroll", cost: 300 },
    { id: 4, name: "Minor Cosmetic Item", cost: 100 },
    { id: 5, name: "Resource Pack", cost: 250 },
    { id: 6, name: "Accessory Crate Key", cost: 350 },
    { id: 7, name: "Bonus Points (100 pts)", cost: 50 },
    { id: 8, name: "Mystery Box", cost: 500 },
  ];

  const spinWheel = () => {
    if (isSpinning) return;
    if (points < spinCost) {
      setResult(`Not enough points! Spinning costs ${spinCost} points.`);
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // Deduct the spin cost immediately
    setPoints((prev) => prev - spinCost);
     console.log(`Points after deducting spin cost: ${points - spinCost}`);

    // --- Animation Start ---
    // Set a temporary high rotation value to make it spin fast initially
    // This uses the CSS transition property to animate from the current rotation.
    // We add many full rotations (e.g., 10 * 360) plus a random offset
    // to make the start of the spin feel less predictable.
    const initialSpinDegrees = mainWheelRotation + (10 * 360) + Math.random() * 360; // Spin at least 10 times plus random
    setMainWheelRotation(initialSpinDegrees);


    // Simulate spin duration and determine outcome
    setTimeout(() => {
      const chosenOutcome = selectWeightedOutcome(wheelOutcomes);

      // --- Animation Stop ---
      // Calculate the final rotation.
      // We need to make sure it spins *forward* from its current fast spin position.
      // Take the current rotation, add several *more* full spins (e.g., 5 * 360)
      // and then add the specific targetDegree for the winning outcome.
      const currentRotation = mainWheelRotation;
      // Normalize current rotation to be within 0-360 to calculate difference correctly
      const normalizedCurrentRotation = currentRotation % 360;
      // Calculate degrees needed from current normalized position to target degree
      let degreesToAdd = chosenOutcome.targetDegree - normalizedCurrentRotation;

      // Ensure it spins clockwise the shortest way if difference is negative,
      // or add a full circle if spinning backwards the long way
       if (degreesToAdd < 0) {
           degreesToAdd += 360; // Spin clockwise instead of counter-clockwise
       }

       // To ensure it spins *at least* a few more times before stopping,
       // add additional full rotations to the target.
       const minAdditionalSpins = 5; // Ensure at least 5 more full spins
       const finalRotationDegrees = currentRotation + (minAdditionalSpins * 360) + degreesToAdd;


      // Update the rotation state - CSS transition handles the smooth stop
      setMainWheelRotation(finalRotationDegrees);

      // Apply the point change from the outcome
      setPoints((prev) => prev + chosenOutcome.value);
      setResult(chosenOutcome.label); // Display the outcome label

      setIsSpinning(false); // Stop spinning state (useful for button/UI)

      // TODO: Later, save the new point total to Supabase here
      // TODO: Later, log the spin result to Supabase for history/analytics

    }, 4000); // Increased timeout duration to allow animation time (e.g., 4 seconds)

    // Note: The total animation time will be determined by the CSS transition duration
    // plus this setTimeout duration if you coordinate them. A simpler way might be
    // to have the setTimeout match the transition duration and use a library like GSAP
    // for better control. For this CSS example, the stop animation starts *after* 4s.
    // You might want the timeout to be slightly *less* than the animation duration.
    // Let's set timeout to 3500ms and let CSS transition take 4000ms.
  };


  const claimShopReward = (reward, index) => {
    if (points < reward.cost) {
       setShopMessage(`Not enough points! ${reward.name} costs ${reward.cost} points.`);
       setTimeout(() => setShopMessage(null), 3000);
      return;
    }

    if (claimingStatus[index] === 'claiming' || claimingStatus[index] === 'claimed') {
        return;
    }

    setClaimingStatus(prev => ({ ...prev, [index]: 'claiming' }));

    setTimeout(() => {
        setPoints(prev => prev - reward.cost);
        setShopMessage(`Successfully claimed: ${reward.name}!`);

        setClaimingStatus(prev => ({ ...prev, [index]: 'claimed' }));

        setTimeout(() => {
             setClaimingStatus(prev => ({ ...prev, [index]: null }));
             setShopMessage(null);
        }, 3000);

    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      {/* Points Display */}
      <div className="mb-8 bg-yellow-400 text-gray-800 text-4xl font-bold px-8 py-4 rounded-full shadow-lg border-2 border-yellow-600">
        🪙 Points: {points}
      </div>

      {/* Spin the Wheel Section */}
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 mt-4">Spin the Wheels 🎰</h1>
      <p className="text-gray-600 mb-6 text-lg">Cost per spin: {spinCost} points</p>

      {/* Three Wheels Placeholder/Animation Area */}
      <div className="flex justify-center items-center gap-4 mb-8">
        {/* Wheel 1 (Left) - Placeholder */}
        <div className={`w-64 h-64 border-4 border-dashed border-gray-400 rounded-full flex items-center justify-center bg-white shadow-inner`}>
           <span className={`text-gray-700 text-xl font-semibold`}>
             Wheel 1 🎡
           </span>
        </div>

        {/* Wheel 2 (Middle/Main) - Animated */}
         {/* The actual animated wheel content goes INSIDE this div */}
         <div className={`w-72 h-72 border-4 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-white shadow-inner text-center font-bold text-2xl overflow-hidden relative`}> {/* Added relative and overflow-hidden */}
             {/* Inner div that will be animated. Needs background/segments */}
              <div
                 className="w-full h-full absolute top-0 left-0"
                 style={{
                   // Set the initial rotation.
                   // The CSS transition property on this element will make it animate
                   transform: `rotate(${mainWheelRotation}deg)`,
                   // Define how long and how it animates when 'transform' changes
                   transition: 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1.0)', // Example easing function (ease-in-out)
                   // Add your wheel visual (background image, segments, etc.) here
                   // For testing, let's add a pointer indicator on the border div and show rotation text inside
                 }}
              >
                {/* Content showing rotation for debugging, or eventual segments */}
                 <span className="text-gray-800 absolute inset-0 flex items-center justify-center">
                     {isSpinning ? "Spinning..." : "Spin Me! ⚙️"}
                     <br/>
                     {/* Debug: Show current rotation state */}
                     {/* Debug: {mainWheelRotation.toFixed(1)}° */}
                 </span>
                 {/* Example: Adding a pointer mark (replace with actual pointer element) */}
                 {/* <div className="absolute top-0 left-1/2 w-4 h-4 bg-red-600 rounded-full" style={{ transform: 'translate(-50%, -50%)' }}></div> */}
              </div>

              {/* Pointer/Indicator (placed outside the rotating element) */}
               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-6 h-6 text-red-600 text-4xl leading-none pointer-events-none">▼</div> {/* Example simple pointer */}

         </div>

        {/* Wheel 3 (Right) - Placeholder */}
         <div className={`w-64 h-64 border-4 border-dashed border-gray-400 rounded-full flex items-center justify-center bg-white shadow-inner`}>
           <span className={`text-gray-700 text-xl font-semibold`}>
             Wheel 3 🎡
           </span>
        </div>
      </div>


      <button
        onClick={spinWheel}
        disabled={isSpinning || points < spinCost}
        className={`bg-blue-600 text-white text-2xl px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition transform hover:scale-105 shadow-lg
          ${isSpinning || points < spinCost ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {isSpinning ? "Spinning..." : `Spin for ${spinCost} points!`}
      </button>

      {result && (
        <div className={`mt-8 text-3xl font-bold p-4 rounded-lg shadow-md text-center ${result.includes("JACKPOT") ? 'bg-yellow-200 text-yellow-800 border-4 border-yellow-500' : result.includes("Try Again") ? 'bg-gray-300 text-gray-700' : result.includes("-") ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-800'}`}>
          ✨ Result: {result}!
        </div>
      )}

       <p className="mt-6 text-sm text-gray-500 italic">
         (Implement actual wheel visuals and multi-reel slot logic later.)
       </p>

      {/* Rewards Shop */}
      <h2 className="mt-16 mb-6 text-3xl font-bold text-gray-900 text-center border-b-2 border-purple-500 pb-2">
        Rewards Shop 🛍️
      </h2>
      <p className="text-gray-600 mb-8 text-lg">Use your points to claim awards here!</p>

      {/* Shop Message Area */}
      {shopMessage && (
          <div className={`mb-4 p-3 rounded-md text-center font-semibold ${shopMessage.includes("Successfully") ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
              {shopMessage}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {shopRewards.map((reward, index) => (
          <div
            key={reward.id}
            className="border border-gray-300 rounded-lg p-6 shadow-xl bg-white text-center flex flex-col justify-between hover:shadow-2xl transition"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">{reward.name}</h3>
            <p className="text-purple-700 mb-4 text-xl font-bold">Cost: {reward.cost} pts</p>
            <button
              onClick={() => claimShopReward(reward, index)}
              disabled={points < reward.cost || claimingStatus[index] === 'claiming'}
              className={`py-3 px-6 rounded-full font-semibold transition transform hover:scale-105 shadow-md
                ${points < reward.cost || claimingStatus[index] === 'claiming' ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"}
              `}
            >
                {claimingStatus[index] === 'claiming' ? 'Claiming...' :
                 claimingStatus[index] === 'claimed' ? 'Claimed!' :
                 'Claim'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}