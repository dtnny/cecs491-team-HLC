"use client";

import { useState } from "react";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const router = useRouter();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Sign up (username is optional; send it if provided)
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // IMPORTANT: use "username" key so our DB trigger picks it up
          data: displayName ? { username: displayName } : {},
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) throw authError;

      // For email signups, Supabase often returns user = null until confirmation.
      // So don't rely on user here; just inform and exit gracefully.
      setMessage(
        "Signup successful! Please check your email to confirm your account. Once confirmed, your profile & points will be created automatically."
      );
    } catch (err) {
      setError(err.message || "Something went wrong during signup.");
    } finally {
      setLoading(false);
    }
  };

  const showEmailError = emailTouched && !isValidEmail(email);
  const showPasswordMismatch = confirmTouched && password !== confirmPassword;

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
              onBlur={() => setEmailTouched(true)}
              className={`w-full p-3 border ${showEmailError ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black`}
              placeholder="you@example.com"
              required
            />
            {showEmailError && (
              <p className="mt-2 text-sm text-red-600">Please enter a valid email address</p>
            )}
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
            <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmTouched(true)}
              className={`w-full p-3 border ${showPasswordMismatch ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black`}
              placeholder="••••••••"
              required
            />
            {showPasswordMismatch && (
              <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
            )}
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

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}

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
