"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { generateTaxReportPDF } from "@/utils/generateTaxReportPDF";

export default function TaxReport() {
  const [user, setUser] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loadingUser, setLoadingUser] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState("Please select a tax year and click \"Generate Report\" to view entries.");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");

  const ENTRIES_PER_PAGE = 6;

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      setLoadingUser(false);
    };
    fetchUser();
  }, [router]);

  const generateReportForUser = async (selectedYear, activeUser) => {
    if (!activeUser) {
      setMessage("User not available to generate report.");
      setGeneratingReport(false);
      return;
    }
    setGeneratingReport(true);
    setMessage("");
    setPdfMessage("");
    setEntries([]);
    setPage(1);

    const { data, error } = await supabase
      .from("gambling_logs")
      .select("*")
      .eq("user_id", activeUser.id)
      .gte("date", `${selectedYear}-01-01`)
      .lte("date", `${selectedYear}-12-31`)
      .order("date", { ascending: true });

    if (error) {
      setMessage("❌ Error fetching entries: " + error.message);
    } else {
      setEntries(data || []);
      if (!data || data.length === 0) {
        setMessage("ℹ️ No entries found for the selected year.");
      } else {
        setMessage("");
      }
    }
    setGeneratingReport(false);
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      await generateReportForUser(year, user);
    } else {
      setMessage("Error: User session lost. Please sign in again.");
      router.push("/signin");
    }
  };

  const handleDownloadPDF = async () => {
    if (!entries || entries.length === 0) {
      setPdfMessage("ℹ️ No data available to generate PDF. Please generate a report first.");
      return;
    }
    setPdfMessage("");
    setIsGeneratingPdf(true);

    try {
      const logoRes = await fetch("/company_logo.png"); // Ensure this path is correct
      if (!logoRes.ok) {
        throw new Error(`Failed to fetch logo: ${logoRes.status} ${logoRes.statusText}`);
      }
      const blob = await logoRes.blob();
      const base64Logo = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(new Error("Error reading logo data."));
        reader.readAsDataURL(blob);
      });
      generateTaxReportPDF(entries, year, base64Logo);
    } catch (error) {
      console.error("Error during PDF generation process:", error);
      setPdfMessage(`❌ Error generating PDF: ${error.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Loading user data...</p>
      </div>
    );
  }

  if (!user && !loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Redirecting to sign in...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);
  const paginatedEntries = entries.slice((page - 1) * ENTRIES_PER_PAGE, page * ENTRIES_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 text-black">
      <section className="py-10 sm:py-12 container mx-auto max-w-4xl bg-white rounded-2xl shadow-xl text-black">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8">
          Gambling Entry Log
        </h1>

        {/* Form for selecting year and generating report */}
        <form onSubmit={handleGenerateSubmit} className="px-6 sm:px-8 mb-8 sm:mb-10">
          <div className="flex items-end space-x-4"> {/* Use flex, align items to the end (bottom), and add spacing */}
            <div className="flex-grow"> {/* This div will take up available space, pushing the button to the right */}
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Tax Year
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setEntries([]); // Clear previous entries
                  setMessage("Please click \"Generate Report\" for the selected year."); // User feedback
                  setPdfMessage(""); // Clear PDF message
                  setPage(1); // Reset to first page
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                {[...Array(5)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return (<option key={y} value={y}>{y}</option>);
                })}
              </select>
            </div>
            <button
              type="submit"
              disabled={generatingReport || loadingUser}
              // Added whitespace-nowrap to prevent button text from wrapping on smaller screens
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {generatingReport ? "Loading..." : "Generate Report"}
            </button>
          </div>
        </form>

        <div className="px-6 sm:px-8">
          {message && (
            <p className={`mb-4 text-center text-sm ${message.startsWith("❌") ? "text-red-600" : (message.startsWith("ℹ️") || message.includes("Please click") ? "text-blue-600" : "text-green-600")}`}>
              {message}
            </p>
          )}

          {entries.length > 0 && !generatingReport && (
            <>
              <p className="text-center text-sm text-gray-600 mb-4">
                Displaying report for {year} | Total Entries: {entries.length}
              </p>
              <div className="mt-4 mb-6 text-center">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {isGeneratingPdf ? "Generating PDF..." : "Download as PDF"}
                </button>
                {pdfMessage && (
                  <p className={`mt-2 text-sm ${pdfMessage.startsWith("❌") ? "text-red-600" : (pdfMessage.startsWith("ℹ️") ? "text-blue-600" : "text-green-600")}`}>
                    {pdfMessage}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {paginatedEntries.length > 0 && !generatingReport ? (
          <div className="space-y-6 px-6 sm:px-8">
            {paginatedEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
                <p><strong>Type:</strong> {entry.type || "N/A"}</p>
                <p><strong>Location Category:</strong> {entry.locationCategory || "N/A"}</p>
                <p><strong>Specific Location:</strong> {entry.specificLocation || "N/A"}</p>
                <p><strong>Amount:</strong> ${parseFloat(entry.amount).toFixed(2)}</p>
                <p><strong>Result:</strong> <span className={`font-semibold ${entry.result === 'win' ? 'text-green-600' : 'text-red-600'}`}>{entry.result}</span></p>
              </div>
            ))}

            {entries.length > ENTRIES_PER_PAGE && (
              <div className="flex justify-between items-center pt-6 pb-4">
                <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Previous</button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        ) : null
       }
      </section>
    </div>
  );
}