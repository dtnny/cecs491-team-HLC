// Spin the wheel game
"use client";

import { useState } from "react";

export default function Rewards() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [points, setPoints] = useState(1000); // Placeholder points
  const [claimed, setClaimed] = useState(Array(6).fill(false));

  const rewards = [
    "Reward 1",
    "Reward 2",
    "Reward 3",
    "Reward 4",
    "Reward 5",
    "Reward 6",
  ];

  const rewardCosts = [200, 150, 300, 100, 250, 350]; // Placeholder costs

  const spinWheel = () => {
    setIsSpinning(true);
    setResult(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * rewards.length);
      setResult(rewards[randomIndex]);
      setPoints((prev) => prev + 100); // Earn points from spinning (placeholder)
      setIsSpinning(false);
    }, 2000);
  };

  const claimReward = (index) => {
    if (points >= rewardCosts[index]) {
      setPoints(points - rewardCosts[index]);
      const updatedClaims = [...claimed];
      updatedClaims[index] = true;
      setClaimed(updatedClaims);
    } else {
      alert("Not enough points!");
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col items-center">
      {/* Points Display */}
      <div className="mb-8 bg-yellow-300 text-black text-4xl font-bold px-8 py-4 rounded-full shadow-lg">
        🪙 Points: {points}
      </div>

      {/* Spin the Wheel Section */}
      <h1 className="text-3xl font-bold text-black mb-6">Spin the Wheel 🎰</h1>
      <div className="w-64 h-64 border-4 border-dashed border-gray-400 rounded-full flex items-center justify-center mb-6">
        <span className="text-black font-semibold">
          {isSpinning ? "Spinning..." : "Wheel Placeholder 🎡"}
        </span>
      </div>
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className={`bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition ${
          isSpinning ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isSpinning ? "Spinning..." : "Spin the Wheel"}
      </button>
      {result && (
        <div className="mt-8 text-xl text-green-600 font-bold">
          🎁 You won: {result}!
        </div>
      )}
      <p className="mt-6 text-sm text-gray-500 italic">
        (Add wheel animation here later 🎨)
      </p>

      {/* Rewards Shop */}
      <h2 className="mt-16 mb-4 text-2xl font-bold text-black text-center">
        Rewards Shop 🛍️
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {rewards.map((reward, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-6 shadow-lg text-center flex flex-col justify-between"
          >
            <h3 className="text-xl font-semibold text-black mb-2">{reward}</h3>
            <p className="text-gray-600 mb-4">Cost: {rewardCosts[index]} pts</p>
            {claimed[index] ? (
              <div className="bg-green-500 text-white py-2 px-4 rounded-full font-semibold">
                ✅ Claimed
              </div>
            ) : (
              <button
                onClick={() => claimReward(index)}
                className="bg-purple-600 text-white py-2 px-4 rounded-full font-semibold hover:bg-purple-700 transition"
              >
                Claim
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}