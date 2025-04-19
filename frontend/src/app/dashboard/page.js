"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
      } else {
        setUser(user);
        const { data, error } = await supabase
          .from("user_profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile in Dashboard:", error);
          setDisplayName(user.email.split("@")[0]);
        } else {
          setDisplayName(data?.display_name || user.email.split("@")[0]);
          console.log("Fetched display_name for user:", user.id, "Display Name:", data?.display_name || "None");
        }

        // Set up real-time subscription
        console.log("Setting up profile subscription for user:", user.id);
        subscriptionRef.current = supabase
          .channel(`user_profiles_${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "user_profiles",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("Real-time profile update received in Dashboard:", payload);
              setDisplayName(payload.new.display_name || user.email.split("@")[0]);
            }
          )
          .subscribe((status) => {
            console.log("Profile subscription status in Dashboard:", status);
          });
      }
    };

    fetchUserAndProfile();

    return () => {
      if (subscriptionRef.current) {
        console.log("Cleaning up profile subscription in Dashboard");
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <section className="py-12 sm:py-16 container mx-auto max-w-5xl bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 sm:mb-12 text-center">
          Welcome, {displayName}! What’s next?
        </h1>
        <div className="space-y-12 px-4 sm:px-6">
          {/* Top Row: 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Link
              href="/diary"
              className="group flex flex-col items-center text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <i className="fas fa-book text-3xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Track Your Diary</h2>
              <p className="text-gray-600 text-sm sm:text-base">Log gambling sessions effortlessly.</p>
            </Link>
            <Link
              href="/tax-report"
              className="group flex flex-col items-center text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <i className="fas fa-file-alt text-3xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Generate Tax Report</h2>
              <p className="text-gray-600 text-sm sm:text-base">Prepare tax documents with ease.</p>
            </Link>
            <Link
              href="/rewards"
              className="group flex flex-col items-center text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <i className="fas fa-trophy text-3xl text-yellow-400 mb-4 group-hover:scale-110 transition-transform"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Check Rewards</h2>
              <p className="text-gray-600 text-sm sm:text-base">Explore responsible gambling rewards.</p>
            </Link>
          </div>
          {/* Bottom Row: 2 Cards, Centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            <Link
              href="/account"
              className="group flex flex-col items-center text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <i className="fas fa-user-edit text-3xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Edit Your Account</h2>
              <p className="text-gray-600 text-sm sm:text-base">Update your profile details.</p>
            </Link>
            <Link
              href="/support"
              className="group flex flex-col items-center text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <i className="fas fa-headset text-3xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Contact Support</h2>
              <p className="text-gray-600 text-sm sm:text-base">Get help from our team.</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}