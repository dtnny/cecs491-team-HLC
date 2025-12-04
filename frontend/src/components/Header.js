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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const pointsSubscriptionRef = useRef(null);
  const profileSubscriptionRef = useRef(null);

  // --- animation state ---
  const prevPointsRef = useRef(null);
  const [delta, setDelta] = useState(0);           // difference from previous points
  const [anim, setAnim] = useState(null);          // 'up' | 'down' | null

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
              event: "*", // listen to INSERT, UPDATE, DELETE
              schema: "public",
              table: "user_points",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("Real-time points update received:", payload);
              if (payload.new?.points !== undefined) {
                setPoints(payload.new.points);
              } else if (payload.old?.points !== undefined && payload.eventType === "DELETE") {
                setPoints(0);
              }
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
          pointsSubscriptionRef.current = null;
        }
        if (profileSubscriptionRef.current) {
          console.log("Removing existing profile subscription");
          supabase.removeChannel(profileSubscriptionRef.current);
          profileSubscriptionRef.current = null;
        }

        console.log("Setting up points subscription for new user:", newUser.id);
        pointsSubscriptionRef.current = supabase
          .channel(`user_points_${newUser.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "user_points",
              filter: `user_id=eq.${newUser.id}`,
            },
            (payload) => {
              console.log("Real-time points update received:", payload);
              if (payload.new?.points !== undefined) {
                setPoints(payload.new.points);
              } else if (payload.old?.points !== undefined && payload.eventType === "DELETE") {
                setPoints(0);
              }
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
        pointsSubscriptionRef.current = null;
      }
      if (profileSubscriptionRef.current) {
        console.log("Cleaning up profile subscription on unmount");
        supabase.removeChannel(profileSubscriptionRef.current);
        profileSubscriptionRef.current = null;
      }
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- animate when points change ---
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

      const t = setTimeout(() => setAnim(null), 900); // clear animation after ~0.9s
      return () => clearTimeout(t);
    }
  }, [points]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
  };

  const hideSignIn = pathname === "/signin" || pathname === "/signup";

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white p-3 sm:p-4 md:p-6 flex justify-between items-center shadow-lg z-20">
        <Link href="/" className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
          GambLogic
        </Link>
        
        <div className="relative flex items-center space-x-2 sm:space-x-4" ref={dropdownRef}>
          {/* Points display - visible when logged in */}
          {user && (
            <div className="relative">
              <div
                className={[
                  "flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-full transition-all duration-300",
                  anim === "up" && "coin-bump bg-green-50 ring-2 ring-green-300",
                  anim === "down" && "coin-shake bg-red-50 ring-2 ring-red-300",
                  !anim && "bg-blue-50 hover:bg-blue-100",
                ].join(" ")}
              >
                <i className="fas fa-star text-yellow-400 text-lg sm:text-2xl mr-1 sm:mr-2"></i>
                <span className="text-blue-800 font-medium hidden md:inline">Points: </span>
                {loading ? (
                  <div className="w-8 sm:w-12 h-4 sm:h-5 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <span
                    className={[
                      "text-gray-900 font-semibold text-sm sm:text-base",
                      anim === "up" && "text-green-700",
                      anim === "down" && "text-red-700",
                    ].join(" ")}
                  >
                    {points}
                  </span>
                )}
              </div>

              {/* floating +N / -N */}
              {anim && delta !== 0 && (
                <span
                  className={[
                    "absolute -top-3 right-1 text-xs sm:text-sm font-bold pointer-events-none",
                    anim === "up" ? "text-green-600 float-up" : "text-red-600 float-down",
                  ].join(" ")}
                >
                  {delta > 0 ? `+${delta}` : `${delta}`}
                </span>
              )}
            </div>
          )}

          {/* Desktop user menu - hidden on mobile */}
          {user ? (
            <div className="hidden md:block">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-gray-900 font-semibold hover:bg-gray-100 rounded px-3 py-2 transition-all duration-200 focus:outline-none"
              >
                <i className="fas fa-user-circle text-3xl lg:text-4xl text-blue-600"></i>
                <span className="hidden lg:inline text-base hover:underline">
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
              className="hidden md:flex items-center bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200"
            >
              <i className="fas fa-lock mr-2"></i>
              Sign In
            </Link>
          ) : null}

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <i className="fas fa-times text-2xl text-gray-700"></i>
            ) : (
              <i className="fas fa-bars text-2xl text-gray-700"></i>
            )}
          </button>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-xl font-bold text-gray-900">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-times text-xl text-gray-600"></i>
            </button>
          </div>

          {/* User info section (if logged in) */}
          {user && (
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center space-x-3">
                <i className="fas fa-user-circle text-4xl text-blue-600"></i>
                <div>
                  <p className="font-semibold text-gray-900">
                    {displayName || user.email.split("@")[0]}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-[180px]">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto py-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-home w-6 mr-3 text-blue-500"></i>
                  Dashboard
                </Link>
                <Link
                  href="/diary"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-book w-6 mr-3 text-blue-500"></i>
                  Diary
                </Link>
                <Link
                  href="/tax-report"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-file-alt w-6 mr-3 text-blue-500"></i>
                  Tax Report
                </Link>
                <Link
                  href="/rewards"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-trophy w-6 mr-3 text-yellow-500"></i>
                  Rewards
                </Link>
                <Link
                  href="/account"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-user-edit w-6 mr-3 text-blue-500"></i>
                  Account
                </Link>
                <Link
                  href="/support"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-headset w-6 mr-3 text-blue-500"></i>
                  Support
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-home w-6 mr-3 text-blue-500"></i>
                  Home
                </Link>
                <Link
                  href="/support"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-info-circle w-6 mr-3 text-blue-500"></i>
                  About Us
                </Link>
              </>
            )}
          </nav>

          {/* Bottom section - Sign In/Out */}
          <div className="p-4 border-t border-gray-200">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Sign Out
              </button>
            ) : !hideSignIn ? (
              <Link
                href="/signin"
                className="w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="fas fa-lock mr-2"></i>
                Sign In
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <style jsx>{`
        @keyframes dropdown {
          to {
            scale: 1;
            opacity: 1;
          }
        }

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
    </>
  );
}
