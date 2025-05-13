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

    // Step 1: Insert the gambling log
    const { error: logError } = await supabase.from("gambling_logs").insert([
      {
        user_id: user.id,
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date,
      },
    ]);

    if (logError) {
      setSubmitMessage("❌ Error: " + logError.message);
      setSubmitting(false);
      return;
    }

    // Step 2: Update user points (+250)
    let pointsMessage = "";
    try {
      // Fetch current points
      const { data: pointsData, error: fetchError } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw new Error("Failed to fetch points: " + fetchError.message);

      const currentPoints = pointsData?.points || 0;
      const newPoints = currentPoints + 250;

      // Update points
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

      pointsMessage = " You earned 250 points!";
    } catch (error) {
      pointsMessage = " Points update failed: " + error.message;
    }

    // Step 3: Set success message and reset form
    setSubmitMessage("✅ Entry submitted successfully!" + pointsMessage);
    setFormData({
      date: "",
      type: "",
      locationCategory: "",
      specificLocation: "",
      amount: "",
      result: "win",
    });
    setSubmitting(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerateMessage("");
    setGenerating(true);

    const { data, error } = await supabase
      .from("gambling_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`)
      .order("date", { ascending: true });

    if (error) {
      setGenerateMessage("❌ Error fetching entries: " + error.message);
    } else {
      setEntries(data);

      // Fetch logo and convert to base64
      const res = await fetch("/company_logo.png");
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Logo = reader.result;
        generateTaxReportPDF(data, year, base64Logo);
      };
      reader.readAsDataURL(blob);
    }
    setGenerating(false);
  };

  if (!user) return null;

  const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);
  const paginated = entries.slice((page - 1) * ENTRIES_PER_PAGE, page * ENTRIES_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 lg:px-8 text-black">
      <section className="mx-auto max-w-4xl bg-white rounded-2xl shadow-xl py-12 px-6 text-black">
        <h2 className="text-2xl font-bold mb-4">Submit a Gambling Log</h2>
        <form onSubmit={handleSubmitLog} className="space-y-4">
          {[
            { label: "Date", name: "date", type: "date" },
            { label: "Type", name: "type" },
            { label: "Specific Location", name: "specificLocation" },
            { label: "Amount", name: "amount", type: "number" }
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <label className="block mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
          ))}
          <div>
            <label className="block mb-1">Location Category</label>
            <select
              name="locationCategory"
              value={formData.locationCategory}
              onChange={(e) => setFormData({ ...formData, locationCategory: e.target.value })}
              className="w-full p-2 border rounded text-black"
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
            <label className="block mb-1">Result</label>
            <select
              name="result"
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              className="w-full p-2 border rounded text-black"
              required
            >
              <option value="win">Win</option>
              <option value="loss">Loss</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Log Entry"}
          </button>
        </form>
        {submitMessage && (
          <p
            className={`mt-2 text-sm ${
              submitMessage.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {submitMessage}
          </p>
        )}

        <h2 className="text-2xl font-bold mt-12 mb-4">Generate Report</h2>
        <form onSubmit={handleGenerate} className="flex items-end space-x-4 mb-8">
          <div>
            <label className="block text-sm mb-2">Tax Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-3 border rounded-lg text-black"
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
            disabled={generating}
            className="bg-blue-600 text-white px-6 py-3 rounded disabled:opacity-50"
          >
            {generating ? "Loading…" : "Generate Report"}
          </button>
        </form>
        {generateMessage && (
          <p className="mt-2 text-sm text-red-600">{generateMessage}</p>
        )}

        {paginated.map((entry, idx) => (
          <div key={idx} className="border border-gray-300 p-4 rounded-lg shadow-sm mb-4">
            <p>
              <strong>Date:</strong> {entry.date}
            </p>
            <p>
              <strong>Type:</strong> {entry.type}
            </p>
            <p>
              <strong>Location Category:</strong> {entry.locationCategory}
            </p>
            <p>
              <strong>Specific Location:</strong> {entry.specificLocation}
            </p>
            <p>
              <strong>Amount:</strong> ${parseFloat(entry.amount).toFixed(2)}
            </p>
            <p>
              <strong>Result:</strong> {entry.result}
            </p>
          </div>
        ))}

        {entries.length > ENTRIES_PER_PAGE && (
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
        )}
      </section>
    </div>
  );
}