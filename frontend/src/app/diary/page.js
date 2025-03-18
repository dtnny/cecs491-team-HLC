"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Diary() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin"); // Redirect to sign-in if not authenticated
      } else {
        setUser(user);
      }
    };
    fetchUser();
  }, [router]);

  if (!user) return null; // Show nothing while checking auth

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-8 bg-white rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-black mb-6">
          Gambling Diary
        </h1>
        <p className="text-black">Welcome, {user.email}! Log your sessions here.</p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}