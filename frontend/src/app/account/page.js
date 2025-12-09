"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import SplitTextAnimated from "@/components/SplitText";

export default function Account() {
  const { user, loading: authLoading, setReconnecting } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

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
    if (authLoading || !user) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const fetchPromise = supabase
          .from("user_profiles")
          .select("display_name, email_notifications")
          .eq("user_id", user.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 5000)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
          handleErrorAndRefresh(error);
        } else {
          setDisplayName(data?.display_name || "");
          setEmailNotifications(data?.email_notifications ?? true);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        handleErrorAndRefresh(error);
        // Set defaults on error
        setDisplayName("");
        setEmailNotifications(true);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [authLoading, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setMessage("Error: User not authenticated. Please sign in again.");
      router.push("/signin");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const updatePromise = supabase
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

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout. Please try again.")), 5000)
      );

      const { error } = await Promise.race([updatePromise, timeoutPromise]);

      if (error) {
        handleErrorAndRefresh(error);
        setMessage("Error updating profile: " + error.message);
      } else {
        setMessage("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Save error:", error);
      handleErrorAndRefresh(error);
      setMessage("Error: " + (error.message || "Failed to update profile. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user) {
      setMessage("Error: User not authenticated. Please sign in again.");
      router.push("/signin");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const resetPromise = supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout. Please try again.")), 5000)
      );

      const { error } = await Promise.race([resetPromise, timeoutPromise]);

      if (error) {
        handleErrorAndRefresh(error);
        setMessage("Error sending reset email: " + error.message);
      } else {
        setMessage("Password reset email sent! Check your inbox and follow the link to reset your password.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      handleErrorAndRefresh(error);
      setMessage("Error: " + (error.message || "Failed to send reset email. Please try again."));
    } finally {
      setLoading(false);
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

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <section className="py-12 sm:py-16 container mx-auto max-w-2xl bg-white rounded-2xl shadow-xl">
        <div className="mb-8 text-center">
          <SplitTextAnimated
            text="Edit Your Profile"
            tag="h1"
            className="text-3xl sm:text-4xl font-extrabold text-gray-900"
            splitType="chars"
            delay={30}
            duration={0.4}
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
          />
        </div>
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