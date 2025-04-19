"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const pointsSubscriptionRef = useRef(null);
  const profileSubscriptionRef = useRef(null);

  const fetchPoints = async (userId) => {
    const { data, error } = await supabase
      .from("user_points")
      .select("points")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching points in Header:", error);
      setPoints(0);
    } else if (!data) {
      console.log("No user_points row, initializing with 50 points for user:", userId);
      await supabase
        .from("user_points")
        .insert({ user_id: userId, points: 50, updated_at: new Date().toISOString() });
      setPoints(50);
    } else {
      console.log("Fetched points for user:", userId, "Points:", data.points);
      setPoints(data.points);
    }
  };

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("display_name")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile in Header:", error);
      setDisplayName("");
    } else {
      setDisplayName(data?.display_name || "");
      console.log("Fetched display_name for user:", userId, "Display Name:", data?.display_name || "None");
    }
  };

  useEffect(() => {
    const initializeUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchPoints(user.id);
        await fetchProfile(user.id);

        // Points subscription
        console.log("Setting up points subscription for user:", user.id);
        pointsSubscriptionRef.current = supabase
          .channel(`user_points_${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "user_points",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("Real-time points update received:", payload);
              setPoints(payload.new.points);
            }
          )
          .subscribe((status) => {
            console.log("Points subscription status:", status);
          });

        // Profile subscription
        console.log("Setting up profile subscription for user:", user.id);
        profileSubscriptionRef.current = supabase
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
              console.log("Real-time profile update received:", payload);
              setDisplayName(payload.new.display_name || "");
            }
          )
          .subscribe((status) => {
            console.log("Profile subscription status:", status);
          });
      }
      setLoading(false);
    };

    initializeUserAndData();

    // Handle auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user || null;
      setUser(newUser);
      if (newUser) {
        await fetchPoints(newUser.id);
        await fetchProfile(newUser.id);

        // Update subscriptions
        if (pointsSubscriptionRef.current) {
          console.log("Removing existing points subscription");
          supabase.removeChannel(pointsSubscriptionRef.current);
        }
        if (profileSubscriptionRef.current) {
          console.log("Removing existing profile subscription");
          supabase.removeChannel(profileSubscriptionRef.current);
        }

        console.log("Setting up points subscription for new user:", newUser.id);
        pointsSubscriptionRef.current = supabase
          .channel(`user_points_${newUser.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "user_points",
              filter: `user_id=eq.${newUser.id}`,
            },
            (payload) => {
              console.log("Real-time points update received:", payload);
              setPoints(payload.new.points);
            }
          )
          .subscribe((status) => {
            console.log("Points subscription status:", status);
          });

        console.log("Setting up profile subscription for new user:", newUser.id);
        profileSubscriptionRef.current = supabase
          .channel(`user_profiles_${newUser.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "user_profiles",
              filter: `user_id=eq.${newUser.id}`,
            },
            (payload) => {
              console.log("Real-time profile update received:", payload);
              setDisplayName(payload.new.display_name || "");
            }
          )
          .subscribe((status) => {
            console.log("Profile subscription status:", status);
          });
      } else {
        setPoints(0);
        setDisplayName("");
        if (pointsSubscriptionRef.current) {
          console.log("Removing points subscription on sign-out");
          supabase.removeChannel(pointsSubscriptionRef.current);
          pointsSubscriptionRef.current = null;
        }
        if (profileSubscriptionRef.current) {
          console.log("Removing profile subscription on sign-out");
          supabase.removeChannel(profileSubscriptionRef.current);
          profileSubscriptionRef.current = null;
        }
      }
      setLoading(false);
    });

    return () => {
      if (pointsSubscriptionRef.current) {
        console.log("Cleaning up points subscription on unmount");
        supabase.removeChannel(pointsSubscriptionRef.current);
      }
      if (profileSubscriptionRef.current) {
        console.log("Cleaning up profile subscription on unmount");
        supabase.removeChannel(profileSubscriptionRef.current);
      }
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
  };

  const hideSignIn = pathname === "/signin" || pathname === "/signup";

  return (
    <header className="fixed top-0 left-0 w-full bg-white p-4 sm:p-6 flex justify-between items-center shadow-lg z-20">
      <Link href="/" className="text-2xl sm:text-3xl font-extrabold text-gray-900">
        project_name
      </Link>
      <div className="relative flex items-center space-x-4" ref={dropdownRef}>
        {user && (
          <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-100">
            <i className="fas fa-star text-yellow-400 text-2xl mr-2"></i>
            <span className="text-blue-800 font-medium hidden sm:inline">Points: </span>
            {loading ? (
              <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-gray-900 font-semibold">{points}</span>
            )}
          </div>
        )}
        {user ? (
          <div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 text-gray-900 font-semibold hover:bg-gray-100 rounded px-3 py-2 transition-all duration-200 focus:outline-none"
            >
              <i className="fas fa-user-circle text-4xl text-blue-600"></i>
              <span className="hidden sm:inline text-base hover:underline">
                {displayName || user.email.split("@")[0]}
              </span>
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-30 transform transition-all duration-300 ease-out scale-95 origin-top-right opacity-0 animate-[dropdown_0.2s_ease-out_forwards]">
                <Link
                  href="/account"
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-t-xl"
                  onClick={() => setIsOpen(false)}
                >
                  Account Info
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/tax-report"
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Generate Tax Report
                </Link>
                <Link
                  href="/diary"
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Diary
                </Link>
                <Link
                  href="/rewards"
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Rewards
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-b-xl"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : !hideSignIn ? (
          <Link
            href="/signin"
            className="flex items-center bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200"
          >
            <i className="fas fa-lock mr-2"></i>
            Sign In
          </Link>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes dropdown {
          to {
            scale: 1;
            opacity: 1;
          }
        }
      `}</style>
    </header>
  );
}