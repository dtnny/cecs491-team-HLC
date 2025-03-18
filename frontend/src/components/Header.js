"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
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
    <header className="fixed top-0 left-0 w-full bg-white p-4 flex justify-between items-center shadow-md z-10">
      <Link href="/" className="text-2xl font-bold text-black">
        Project_name
      </Link>
      <div className="relative flex items-center" ref={dropdownRef}>
        {user ? (
          <div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center text-black font-semibold hover:bg-gray-100 hover:underline rounded px-2 py-1 transition focus:outline-none"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Account
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                <Link
                  href="/account"
                  className="block px-4 py-2 text-black hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Account Info
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-black hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/file-loss"
                  className="block px-4 py-2 text-black hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  File a Gambling Loss
                </Link>
                <Link
                  href="/diary"
                  className="block px-4 py-2 text-black hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Diary
                </Link>
                <Link
                  href="/rewards"
                  className="block px-4 py-2 text-black hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Rewards
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : !hideSignIn ? (
          <Link
            href="/signin"
            className="bg-blue-800 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-900 transition flex items-center"
          >
            <i className="fas fa-lock mr-2"></i>
            Sign In
          </Link>
        ) : null}
      </div>
    </header>
  );
}