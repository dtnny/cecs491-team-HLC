"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const validatePassword = (email, password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (password.includes(email)) {
      return "Password cannot be the same as your email address.";
    }
    const emailPrefix = email.split('@')[0]; // Extract the part of the email before the '@'
    if (password.includes(emailPrefix)) {// Check if the email prefix is included in the password
      return "Password cannot contain the part before '@' in your email address.";
    }
    // Check if the password contains at least one number
    const hasNumber = /\d/;  // Regular expression to check for numbers
    if (!hasNumber.test(password)) {
      return "Password must contain at least one number.";
    }
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    // Validate password before making API call
    const passwordError = validatePassword(email, password);
    if (passwordError) {
      setMessage(passwordError);
      return; // Stop if password is invalid
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Check your email for a confirmation link!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-black mb-6 text-center">
          Create an Account
        </h1>
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-black mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-700 text-black"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-700 text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>
        {message && <p className="mt-4 text-center text-black">{message}</p>}
        <p className="mt-4 text-center text-black">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-700 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}