"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Log session state
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log("Session before signup:", currentUser ? currentUser.id : "No session");

      // Sign up user
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) {
        console.error("Auth error during signup:", authError);
        throw new Error(authError.message);
      }

      if (!user) {
        throw new Error("No user returned after signup");
      }

      console.log("User signed up:", user.id);

      // Log session after signup
      const { data: { user: postSignupUser } } = await supabase.auth.getUser();
      console.log("Session after signup:", postSignupUser ? postSignupUser.id : "No session");

      // Create user profile via server-side function
      const { error: profileError } = await supabase
        .rpc("create_user_profile", {
          p_user_id: user.id,
          p_display_name: displayName || user.email.split("@")[0],
        });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        // Check if profile was created despite error
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("user_id")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          throw new Error("Database error creating user profile: " + profileError.message);
        }
        console.log("Profile exists despite error:", profile);
      }

      console.log("User profile created for user:", user.id);

      // user_points is handled by trigger
      setMessage("Signup successful! Please check your email to confirm your account.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Create Your Account
        </h1>
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label htmlFor="displayName" className="block text-base font-medium text-gray-700 mb-2">
              Username (Optional)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Your username"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-400"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 text-center text-sm text-green-600">
            {message}
          </p>
        )}
        <p className="mt-6 text-center text-base text-gray-600">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}