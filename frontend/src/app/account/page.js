"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Account() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
      } else {
        setUser(user);
        const { data, error } = await supabase
          .from("user_profiles")
          .select("display_name, email_notifications")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
        } else {
          setDisplayName(data?.display_name || "");
          setEmailNotifications(data?.email_notifications ?? true);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: user.id,
          display_name: displayName || null,
          email_notifications: emailNotifications,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    setLoading(false);
    if (error) {
      setMessage("Error updating profile: " + error.message);
    } else {
      setMessage("Profile updated successfully!");
    }
  };

  const handlePasswordReset = async () => {
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setMessage("Error sending reset email: " + error.message);
    } else {
      setMessage("Password reset email sent! Check your inbox and follow the link to reset your password.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    setMessage("");
    setLoading(true);

    try {
      // Call API to delete auth.users
      const response = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();

      if (response.status !== 200) {
        throw new Error(result.error || "Failed to delete account");
      }

      // Delete user_profiles (will cascade to user_points)
      const { error: profileError } = await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", user.id);

      if (profileError) {
        throw new Error("Error deleting profile: " + profileError.message);
      }

      await supabase.auth.signOut();
      setMessage("Account deleted successfully. You are now signed out.");
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setMessage("Error deleting account: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <section className="py-12 sm:py-16 container mx-auto max-w-2xl bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center">
          Edit Your Profile
        </h1>
        <form onSubmit={handleSave} className="px-6 sm:px-8 space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
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
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Receive email notifications
              </span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-400"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
        <div className="px-6 sm:px-8 mt-8 space-y-4">
          <button
            onClick={handlePasswordReset}
            disabled={loading}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 disabled:bg-red-400"
          >
            {loading ? "Processing..." : "Delete Account"}
          </button>
        </div>
        {message && (
          <p className={`text-center text-sm mt-4 ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </section>
    </div>
  );
}