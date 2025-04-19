"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Rewards() {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const rewards = [
    "Virtual Trophy",
    "Profile Badge",
    "Bonus Spin",
    "Tax Report Skin",
    "Gambling Diary Theme",
    "Exclusive Avatar",
  ];
  const rewardCosts = [200, 150, 300, 100, 250, 350];

  useEffect(() => {
    const fetchUserAndPoints = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
        return;
      }
      setUser(user);

      // Fetch points
      const { data: pointsData, error: pointsError } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", user.id)
        .single();

      if (pointsError && pointsError.code !== "PGRST116") {
        console.error("Error fetching points in Rewards:", pointsError);
        setPoints(0);
      } else if (!pointsData) {
        console.log("No user_points row in Rewards, relying on signup trigger for user:", user.id);
        setPoints(50); // Assume signup trigger set 50 points
      } else {
        console.log("Fetched points in Rewards for user:", user.id, "Points:", pointsData.points);
        setPoints(pointsData.points);
      }

      // Fetch claimed rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from("user_rewards")
        .select("reward_name")
        .eq("user_id", user.id);

      if (rewardsError) {
        console.error("Error fetching rewards:", rewardsError);
      } else {
        setClaimedRewards(rewardsData.map((r) => r.reward_name));
      }

      setLoading(false);
    };
    fetchUserAndPoints();
  }, [router]);

  const spinWheel = async () => {
    if (points < 50) {
      console.log("Cannot spin: Insufficient points:", points);
      alert("Need 50 points to spin!");
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // Deduct spin cost
    const newPoints = points - 50;
    console.log("Spinning wheel for user:", user.id, "Deducting 50 points. New points:", newPoints);
    const { error: pointsError } = await supabase
      .from("user_points")
      .update({ points: newPoints, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (pointsError) {
      console.error("Error updating points in spinWheel:", pointsError);
      alert("Failed to spin: " + pointsError.message);
      setIsSpinning(false);
      return;
    }

    setPoints(newPoints);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * rewards.length);
      const wonReward = rewards[randomIndex];
      console.log("Spin result for user:", user.id, "Won:", wonReward);
      setResult(wonReward);
      setIsSpinning(false);
    }, 2000);
  };

  const claimReward = async (index) => {
    const cost = rewardCosts[index];
    const reward = rewards[index];

    if (points < cost) {
      console.log("Cannot claim reward:", reward, "Insufficient points:", points);
      alert("Not enough points!");
      return;
    }

    if (claimedRewards.includes(reward)) {
      console.log("Reward already claimed:", reward);
      alert("Reward already claimed!");
      return;
    }

    const newPoints = points - cost;
    console.log("Claiming reward for user:", user.id, "Reward:", reward, "Cost:", cost, "New points:", newPoints);
    const { error: pointsError } = await supabase
      .from("user_points")
      .update({ points: newPoints, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (pointsError) {
      console.error("Error updating points in claimReward:", pointsError);
      alert("Error claiming reward: " + pointsError.message);
      return;
    }

    const { error: rewardError } = await supabase
      .from("user_rewards")
      .insert({ user_id: user.id, reward_name: reward, cost });

    if (rewardError) {
      console.error("Error inserting reward:", rewardError);
      alert("Error claiming reward: " + rewardError.message);
      return;
    }

    setPoints(newPoints);
    setClaimedRewards([...claimedRewards, reward]);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Points Display */}
      <div className="mb-10 bg-yellow-300 text-gray-900 text-2xl sm:text-3xl font-bold px-8 py-4 rounded-full shadow-lg">
        🪙 Points: {points}
      </div>

      {/* Spin the Wheel Section */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">Spin the Wheel 🎰</h1>
      <div
        className={`w-64 h-64 border-4 border-dashed border-blue-600 rounded-full flex items-center justify-center mb-6 transition-transform duration-2000 ${
          isSpinning ? "animate-spin" : ""
        }`}
      >
        <span className="text-gray-900 font-semibold text-center">
          {isSpinning ? "Spinning..." : "Spin for Rewards! 🎡"}
        </span>
      </div>
      <button
        onClick={spinWheel}
        disabled={isSpinning || loading || points < 50}
        className={`bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200 ${
          isSpinning || loading || points < 50 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isSpinning ? "Spinning..." : "Spin (50 pts)"}
      </button>
      {result && (
        <div className="mt-6 text-lg sm:text-xl text-green-600 font-semibold">
          🎁 You won: {result}!
        </div>
      )}

      {/* Rewards Shop */}
      <h2 className="mt-12 sm:mt-16 mb-6 text-2xl sm:text-3xl font-extrabold text-gray-900 text-center">
        Rewards Shop 🛍️
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {rewards.map((reward, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{reward}</h3>
              <p className="text-gray-600 mb-4">Cost: {rewardCosts[index]} pts</p>
            </div>
            {claimedRewards.includes(reward) ? (
              <div className="bg-green-500 text-white py-2 px-4 rounded-full font-semibold text-center">
                ✅ Claimed
              </div>
            ) : (
              <button
                onClick={() => claimReward(index)}
                disabled={loading || points < rewardCosts[index]}
                className={`bg-purple-600 text-white py-2 px-4 rounded-full font-semibold hover:bg-purple-700 transition-all duration-200 ${
                  loading || points < rewardCosts[index] ? "opacity-50 cursor-not-allowed" : ""
                }`}
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