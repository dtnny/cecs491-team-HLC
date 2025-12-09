"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SplitText from "@/components/SplitText";

export default function Dashboard() {
  const { user, loading: authLoading, setReconnecting } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();
  const loadedUserIdRef = useRef(null);

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) {
      // Reset loading state if we don't have a user yet
      if (!user && !authLoading) {
        setLoadingProfile(false);
        loadedUserIdRef.current = null;
      }
      return;
    }

    if (loadedUserIdRef.current === user.id && displayName) {
      setLoadingProfile(false);
      return;
    }

    // Reset loading state when user changes
    if (loadedUserIdRef.current !== user.id) {
      setLoadingProfile(true);
      loadedUserIdRef.current = user.id;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        // Add timeout to prevent hanging (reduced from 10s to 5s)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Profile load timeout")), 5000)
        );

        const profilePromise = supabase
          .from("user_profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        const { data, error } = await Promise.race([
          profilePromise,
          timeoutPromise,
        ]);

        if (cancelled) return;

        if (error && error.code !== "PGRST116") {
          console.error("Profile load error:", error);
          handleErrorAndRefresh(error);
          setDisplayName(user.email.split("@")[0]);
        } else {
          setDisplayName(data?.display_name || user.email.split("@")[0]);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Profile load error:", err);
        handleErrorAndRefresh(err);
        // Fallback to email username if profile load fails
        setDisplayName(user.email.split("@")[0]);
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    // Updates to profile
    const channel = supabase
      .channel(`profile_updates_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!cancelled) {
            setDisplayName(
              payload.new.display_name || user.email.split("@")[0]
            );
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [authLoading, user, displayName]);

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <section className="py-12 sm:py-16 container mx-auto max-w-5xl bg-white rounded-2xl shadow-xl">

        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            <SplitText
              text={`Welcome, ${displayName}! What's next?`}
              tag="span"
              className="inline-block"
              splitType="chars"
              delay={30}
              duration={0.4}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
            />
          </h1>
        </div>

        <div className="space-y-12 px-4 sm:px-6">
          
          {/* ------------------- TOP ROW: 3 CARDS ------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

            <Link
              href="/diary"
              className="group flex flex-col items-center text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <i className="fas fa-book text-3xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Track Your Diary
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Log gambling sessions effortlessly.
              </p>
            </Link>

            <Link
              href="/tax-report"
              className="group flex flex-col items-center text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <i className="fas fa-file-alt text-3xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Generate Tax Report
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Prepare tax documents with ease.
              </p>
            </Link>

            <Link
              href="/rewards"
              className="group flex flex-col items-center text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <i className="fas fa-trophy text-3xl text-yellow-400 mb-4 group-hover:scale-110 transition-transform"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Check Rewards
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Explore responsible gambling rewards.
              </p>
            </Link>
          </div>

          {/* ------------------- BOTTOM ROW: 2 CARDS ------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">

            <Link
              href="/account"
              className="group flex flex-col items-center text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <i className="fas fa-user-edit text-3xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Edit Your Account
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Update your profile details.
              </p>
            </Link>

            <Link
              href="/support"
              className="group flex flex-col items-center text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <i className="fas fa-headset text-3xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Contact Support
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Get help from our team.
              </p>
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
}