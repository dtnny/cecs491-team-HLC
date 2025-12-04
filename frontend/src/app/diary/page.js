"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { generateTaxReportPDF } from "@/utils/generateTaxReportPDF";

export default function TaxReport() {
  const [user, setUser] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [entries, setEntries] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [generateMessage, setGenerateMessage] = useState("");
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
    };
    fetchUser();
  }, [router]);

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    setSubmitMessage("");
    setSubmitting(true);

    const date = formData.date
      ? new Date(formData.date).toISOString()
      : new Date().toISOString();

    // Ensure amount sign matches result: wins are positive, losses are negative
    let amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      setSubmitMessage("❌ Error: Invalid amount");
      setSubmitting(false);
      return;
    }

    // Make amount negative for losses, positive for wins
    if (formData.result === "loss") {
      amount = Math.abs(amount) * -1;
    } else {
      amount = Math.abs(amount);
    }

    const { error } = await supabase.from("gambling_logs").insert([
      {
        user_id: user.id,
        ...formData,
        date,
        amount: amount,
      },
    ]);

    if (error) {
      setSubmitMessage("❌ Error: " + error.message);
    } else {
      setSubmitMessage("✅ Entry submitted successfully!");
      setFormData({
        date: "",
        type: "",
        locationCategory: "",
        specificLocation: "",
        amount: "",
        result: "win",
      });

      // Add 50 points to user_points
      let pointsMessage = "";
      try {
        const { data: pointsData, error: fetchError } = await supabase
          .from("user_points")
          .select("points")
          .eq("user_id", user.id)
          .single();

        if (fetchError) throw new Error("Failed to fetch points: " + fetchError.message);

        const currentPoints = pointsData?.points || 0;
        const newPoints = currentPoints + 50;

        const { error: updateError } = await supabase
          .from("user_points")
          .upsert([
            {
              user_id: user.id,
              points: newPoints,
              updated_at: new Date().toISOString(),
            },
          ]);

        if (updateError) throw new Error("Failed to update points: " + updateError.message);

        pointsMessage = " You earned 50 points! 🎉";
      } catch (error) {
        pointsMessage = " Points update failed: " + error.message;
      }

      setSubmitMessage("✅ Entry submitted successfully!" + pointsMessage);
    }
    setSubmitting(false);
  };

  const convertBlobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerateMessage("");
    setGenerating(true);

    const from = `${year}-01-01T00:00:00`;
    const to = `${year}-12-31T23:59:59`;

    const { data, error } = await supabase
      .from("gambling_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true });

    if (error) {
      setGenerateMessage("❌ Error fetching entries: " + error.message);
      setGenerating(false);
      return;
    }

    if (!data || data.length === 0) {
      setGenerateMessage("No entries found for this year.");
      setGenerating(false);
      return;
    }

    setEntries(data);

    const res = await fetch("/company_logo.png");
    const blob = await res.blob();
    const base64Logo = await convertBlobToBase64(blob);

    generateTaxReportPDF(data, year, base64Logo);
    setGenerating(false);
  };

  if (!user) return null;

  const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);
  const paginated = entries.slice((page - 1) * ENTRIES_PER_PAGE, page * ENTRIES_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20 px-3 sm:px-4 lg:px-8 text-black pb-8">
      <section className="mx-auto max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-xl py-6 sm:py-8 md:py-12 px-4 sm:px-6 text-black">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Submit a Gambling Log</h2>
        <form onSubmit={handleSubmitLog} className="space-y-3 sm:space-y-4">
          {[
            { label: "Date", name: "date", type: "datetime-local" },
            { label: "Type", name: "type" },
            { label: "Specific Location", name: "specificLocation" },
            { label: "Amount", name: "amount", type: "number" }
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <label className="block mb-1 text-sm sm:text-base font-medium">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                className="w-full p-2 sm:p-3 border rounded-lg text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}
          <div>
            <label className="block mb-1 text-sm sm:text-base font-medium">Location Category</label>
            <select 
              name="locationCategory" 
              value={formData.locationCategory} 
              onChange={(e) => setFormData({ ...formData, locationCategory: e.target.value })} 
              className="w-full p-2 sm:p-3 border rounded-lg text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required
            >
              <option value="">Select</option>
              <option value="Casino">Casino</option>
              <option value="Website">Website</option>
              <option value="Slots">Slots</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm sm:text-base font-medium">Result</label>
            <select 
              name="result" 
              value={formData.result} 
              onChange={(e) => setFormData({ ...formData, result: e.target.value })} 
              className="w-full p-2 sm:p-3 border rounded-lg text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required
            >
              <option value="win">Win</option>
              <option value="loss">Loss</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={submitting} 
            className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            {submitting ? "Submitting…" : "Submit Log Entry"}
          </button>
        </form>
        {submitMessage && (
          <p className={`mt-2 text-xs sm:text-sm ${submitMessage.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
            {submitMessage}
          </p>
        )}

        <h2 className="text-xl sm:text-2xl font-bold mt-8 sm:mt-12 mb-3 sm:mb-4">Generate Report</h2>
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1 sm:flex-none">
            <label className="block text-xs sm:text-sm mb-1 sm:mb-2 font-medium">Tax Year</label>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
              className="w-full sm:w-auto p-2 sm:p-3 border rounded-lg text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2025, 2024, 2023, 2022].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={generating} 
            className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            {generating ? "Loading…" : "Generate Report"}
          </button>
        </form>
        {generateMessage && (
          <p className="mt-2 text-xs sm:text-sm text-red-600">{generateMessage}</p>
        )}

        {/* Entries list */}
        <div className="space-y-3 sm:space-y-4">
          {paginated.map((entry, idx) => (
            <div key={idx} className="border border-gray-300 p-3 sm:p-4 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                <p><strong>Date:</strong> {entry.date}</p>
                <p><strong>Type:</strong> {entry.type}</p>
                <p><strong>Location Category:</strong> {entry.locationCategory}</p>
                <p><strong>Specific Location:</strong> {entry.specificLocation}</p>
                <p><strong>Amount:</strong> ${parseFloat(entry.amount).toFixed(2)}</p>
                <p><strong>Result:</strong> <span className={entry.result === 'win' ? 'text-green-600' : 'text-red-600'}>{entry.result}</span></p>
              </div>
            </div>
          ))}
        </div>

        {entries.length > ENTRIES_PER_PAGE && (
          <div className="flex justify-between items-center pt-4 sm:pt-6">
            <button 
              onClick={() => setPage(page - 1)} 
              disabled={page <= 1} 
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 rounded-lg disabled:opacity-50 text-xs sm:text-sm font-medium hover:bg-gray-400 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(page + 1)} 
              disabled={page >= totalPages} 
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 rounded-lg disabled:opacity-50 text-xs sm:text-sm font-medium hover:bg-gray-400 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}