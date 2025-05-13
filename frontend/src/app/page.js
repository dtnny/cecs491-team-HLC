"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const faqs = [
    {
      question: "What types of sports gambling qualify?",
      answer: "Winnings from sportsbooks, online betting platforms, and casino sports bets are all eligible.",
    },
    {
      question: "How do I submit my betting history?",
      answer: "Simply upload your records or manually enter them into our diary tool.",
    },
    {
      question: "Where do I start?",
      answer: "Click 'Claim Your Tax Cut Now' to sign up and begin tracking.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Logo Section */}
      <section className="pt-16 pb-8 px-4 sm:px-6 lg:px-8 flex justify-center">
        <img
          src="/company_logo.png"
          alt="Company Logo"
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto"
        />
      </section>

      {/* Hero Section */}
      <section className="py-16 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
          Your Money Back Made Easy
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl">
          Simplify your tax filings and maximize your deductions with our easy-to-use gambling tracker.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200 text-lg"
          >
            {user ? "Go to Dashboard" : "Claim Your Tax Cut Now"}
          </Link>
          <Link
            href="/support"
            className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all duration-200 text-lg"
          >
            Learn More About Our Company
          </Link>
        </div>
      </section>

      {/* Functionality Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">1. Enter Your Data</h3>
              <img
                src="enter_data.png"
                alt="Enter Your Data Illustration"
                className="mt-4 mx-auto w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg"
              />
              <p className="text-gray-600">Log your gambling winnings and losses into our secure database.</p>
            </div>
            <div className="text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">2. Upload Documents</h3>
              <img
                src="upload_documents.png"
                alt="Upload Documents Illustration"
                className="mt-4 mx-auto w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg"
              />
              <p className="text-gray-600">Submit your betting records or receipts effortlessly.</p>
            </div>
            <div className="text-center border border-gray-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">3. Get Your Tax Cut</h3>
              <img
                src="get_tax_cut.png"
                alt="Get Your Tax Cut Illustration"
                className="mt-4 mx-auto w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg"
              />
              <p className="text-gray-600">Generate tax reports and claim your deductions with ease.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-12 text-center">
            Benefits of Using Our Service
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Save Time</h3>
              <p className="text-gray-600">Skip the hassle of manual tax form preparation.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Maximize Deductions</h3>
              <p className="text-gray-600">Ensure you claim every deduction you’re eligible for.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Simplify Filing</h3>
              <p className="text-gray-600">Streamline the process with pre-filled tax reports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Betting & Taxes 101 Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        {/* Adjusted container to use flex for side-by-side layout */}
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center"> 
          
          {/* Image Column */}
          <div className="md:w-7/12 lg:w-3/5 p-4 flex justify-center md:justify-start"> 
            <img 
              src="sports_betting.png"  
              alt="Sports Betting Visual" 
              className="max-w-full h-auto rounded-lg" 
            />
          </div>

          {/* Text Content Column */}
          <div className="md:w-1/2 lg:w-3/5 p-4 text-center md:text-left"> 
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8"> 
              Sports Betting & Taxes 101
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto md:mx-0 mb-6"> 
              Sports betting winnings are taxable income in most jurisdictions. Losses can often be deducted, but only if properly documented. Our tool helps you track every bet, ensuring you qualify for deductions and comply with tax laws.
            </p>
            <Link 
              href="https://www.irs.gov/taxtopics/tc419" 
              className="text-blue-600 font-semibold hover:underline inline-block" 
            >
              Read More About Tax Rules
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full text-left py-4 flex justify-between items-center focus:outline-none"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{faq.question}</h3>
                  <span className="text-blue-600 text-2xl">{openFAQ === index ? "−" : "+"}</span>
                </button>
                {openFAQ === index && <p className="text-gray-600 pb-4">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
              Trust & Security
            </h2>
            <p className="text-gray-600">
              Your data is safe with us. We use industry-standard encryption and comply with IRS regulations. We never share your information with third parties—your privacy is our priority.
            </p>
          </div>
          <div className="flex-shrink-0">
            <img
              src="2302952.png"
              alt="Gambling Awareness Security Logo"
              className="w-full max-w-xs sm:max-w-sm rounded-lg "
            />
          </div>
        </div>
      </section>
    </div>
  );
}