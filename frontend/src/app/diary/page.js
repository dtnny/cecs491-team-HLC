"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TaxReport() {
  const [user, setUser] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const [formData, setFormData] = useState({
    date: "",
    type: "",
    locationCategory: "",
    specificLocation: "",
    amount: "",
    result: "win",
  });

  const ENTRIES_PER_PAGE = 6;

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

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.from("gambling_logs").insert([
      {
        user_id: user.id,
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date,
      },
    ]);

    if (error) {
      setMessage("Error submitting entry: " + error.message);
    } else {
      setMessage("Entry submitted successfully.");
      setFormData({
        date: "",
        type: "",
        locationCategory: "",
        specificLocation: "",
        amount: "",
        result: "win",
      });
    }
    setLoading(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase
      .from("gambling_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`)
      .order("date", { ascending: true });

    if (error) {
      setMessage("Error fetching entries: " + error.message);
    } else {
      setEntries(data);
      setMessage("");
    }
    setLoading(false);
  };

  if (!user) return null;

  const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);
  const paginatedEntries = entries.slice((page - 1) * ENTRIES_PER_PAGE, page * ENTRIES_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8 text-black">
      <section className="py-12 sm:py-16 container mx-auto max-w-4xl bg-white rounded-2xl shadow-xl text-black">
        <h1 className="text-4xl font-extrabold text-center mb-2">
          {year} Gambling Entry Log
        </h1>

        <form onSubmit={handleSubmitLog} className="space-y-4 px-6 text-black">
          <div>
            <label className="block mb-1">Date</label>
            <input type="date" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border rounded text-black" required />
          </div>
          <div>
            <label className="block mb-1">Type</label>
            <input type="text" name="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full p-2 border rounded text-black" required />
          </div>
          <div>
            <label className="block mb-1">Location Category</label>
            <select name="locationCategory" value={formData.locationCategory} onChange={(e) => setFormData({ ...formData, locationCategory: e.target.value })} className="w-full p-2 border rounded text-black" required>
              <option value="">Select</option>
              <option value="Casino">Casino</option>
              <option value="Website">Website</option>
              <option value="Slots">Slots</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Specific Location</label>
            <input type="text" name="specificLocation" value={formData.specificLocation} onChange={(e) => setFormData({ ...formData, specificLocation: e.target.value })} className="w-full p-2 border rounded text-black" required />
          </div>
          <div>
            <label className="block mb-1">Amount</label>
            <input type="number" name="amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full p-2 border rounded text-black" required />
          </div>
          <div>
            <label className="block mb-1">Result</label>
            <select name="result" value={formData.result} onChange={(e) => setFormData({ ...formData, result: e.target.value })} className="w-full p-2 border rounded text-black" required>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
            </select>
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Submit Log Entry</button>
        </form>

        <form onSubmit={handleGenerate} className="px-6 sm:px-8 mt-12 mb-10 text-black">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label htmlFor="year" className="block text-sm font-medium mb-2">
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
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-400"
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>
          </div>
        </form>

        {entries.length > 0 && (
          <div className="space-y-6 px-6 text-black">
            {paginatedEntries.map((entry, idx) => (
              <div key={idx} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                <p><strong>Date:</strong> {entry.date}</p>
                <p><strong>Type:</strong> {entry.type}</p>
                <p><strong>Location Category:</strong> {entry.locationCategory}</p>
                <p><strong>Specific Location:</strong> {entry.specificLocation}</p>
                <p><strong>Amount:</strong> ${parseFloat(entry.amount).toFixed(2)}</p>
                <p><strong>Result:</strong> {entry.result}</p>
              </div>
            ))}

            <div className="flex justify-between items-center pt-6">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {message && (
          <p className={`mt-6 text-center text-sm ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
