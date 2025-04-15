"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignin = async (e) => {
    e.preventDefault();
    // Attempt to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Signed in successfully! Redirecting...");
      router.push("/dashboard"); // Redirect to dashboard
    }
  };

return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-black mb-6 text-center">
          Sign In
        </h1>
        <form onSubmit={handleSignin} className="space-y-6">
          <div>
            <label className="block text-black mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-black mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>
        {message && <p className="mt-4 text-center text-black">{message}</p>}
        <p className="mt-4 text-center text-black">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

