"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TaxReport() {
  const [user, setUser] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
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
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Placeholder for report generation logic
    // Would fetch gambling sessions from a table (e.g., gambling_logs)
    setTimeout(() => {
      setLoading(false);
      setMessage("Tax report generated successfully for " + year + " (stubbed feature).");
    }, 1000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <section className="py-12 sm:py-16 container mx-auto max-w-2xl bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center">
          Generate Tax Report
        </h1>
        <form onSubmit={handleGenerate} className="px-6 sm:px-8 space-y-6">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              Tax Year
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {[2025, 2024, 2023, 2022].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-400"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
          {message && (
            <p className={`text-center text-sm ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}