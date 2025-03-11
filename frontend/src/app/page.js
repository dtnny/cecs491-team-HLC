"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  // State to track which FAQ is open (null means all closed)
  const [openFAQ, setOpenFAQ] = useState(null);

  // FAQ data
  const faqs = [
    {
      question: "What types of sports gambling qualify?",
      answer:
        "Winnings from sportsbooks, online betting platforms, and casino sports bets are all eligible.",
    },
    {
      question: "How do I submit my betting history?",
      answer:
        "Simply upload your records or manually enter them into our diary tool.",
    },
    {
      question: "Where do I start?",
      answer:
        "Click “Claim Your Tax Cut Now” to sign up and begin tracking.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Empty Space before Hero Section*/}
      <div className="mb-120"></div>
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-8 mb-50">
        <h1 className="text-4xl font-bold text-black mb-6">
          "Your Money Back Made Easy"
        </h1>
        <p className="text-xl text-black mb-10 max-w-2xl">
          Simplify your tax filings and maximize your deductions with our easy-to-use gambling tracker.
        </p>
        <div className="flex space-x-6">
          <Link
            href="/signup"
            className="bg-blue-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition text-lg"
          >
            Claim Your Tax Cut Now
          </Link>
          <Link
            href="/learn-more"
            className="border-2 border-blue-700 text-blue-700 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition text-lg"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Functionality Section */}
      <section className="py-16 px-4 container bg-gray-00 rounded-lg max-w-4xl mx-auto mb-50">
        <h2 className="text-4xl font-bold text-black mb-12 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center border border-gray-300 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-black mb-3">1. Enter Your Data</h3>
            <p className="text-black">
              Log your gambling winnings and losses into our secure database.
            </p>
          </div>
          {/* Step 2 */}
          <div className="text-center border border-gray-300 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-black mb-3">2. Upload Documents</h3>
            <p className="text-black">
              Submit your betting records or receipts effortlessly.
            </p>
          </div>
          {/* Step 3 */}
          <div className="text-center border border-gray-300 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-black mb-3">3. Get Your Tax Cut</h3>
            <p className="text-black">
              Generate tax reports and claim your deductions with ease.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 container mb-50">
        <h2 className="text-4xl font-bold text-black mb-12 text-center">
          Benefits of Using Our Service
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold text-black mb-3">Save Time</h3>
            <p className="text-black">
              Skip the hassle of manual tax form preparation.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold text-black mb-3">Maximize Deductions</h3>
            <p className="text-black">
              Ensure you claim every deduction you’re eligible for.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold text-black mb-3">Simplify Filing</h3>
            <p className="text-black">
              Streamline the process with pre-filled tax reports.
            </p>
          </div>
        </div>
      </section>

      {/* Sports Betting & Taxes 101 Section */}
      <section className="py-16 px-6 container bg-gray-00 mb-50">
        <h2 className="text-4xl font-bold text-black mb-12 text-center">
          Sports Betting & Taxes 101
        </h2>
        <p className="text-black max-w-3xl mx-auto text-center mb-6">
          Sports betting winnings are taxable income in most jurisdictions. Losses can often be deducted, but only if properly documented. Our tool helps you track every bet, ensuring you qualify for deductions and comply with tax laws.
        </p>
        <Link href="/learn-more" className="text-black font-semibold hover:underline">
          Read More About Tax Rules
        </Link>
      </section>

{/* FAQ Section with Dropdown */}
<section className="py-16 px-6 container bg-white mb-20">
        <h2 className="text-4xl font-bold text-black mb-12 text-center">
          Frequently Asked Questions
        </h2>
        <div className="max-w5xl mx-auto space-y-5">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full text-left py-4 flex justify-between items-center focus:outline-none"
              >
                <h3 className="text-xl font-semibold text-black">
                  {faq.question}
                </h3>
                <span className="text-blue-800 text-2xl">
                  {openFAQ === index ? "−" : "+"}
                </span>
              </button>
              {openFAQ === index && (
                <p className="text-black pb-4">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-24 px-6 container flex items-center">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-black mb-12">
            Trust & Security
          </h2>
          <p className="text-black">
            Your data is safe with us. We use industry-standard encryption and comply with IRS regulations. We never share your information with third parties—your privacy is our priority.
          </p>
        </div>
        <div className="ml-12">
          <img src="2302952.png" alt="Security image" className="w-96 h-auto rounded-lg" />
        </div>
      </section>
    </div>
  );
}