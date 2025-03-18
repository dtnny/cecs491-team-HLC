"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

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

  if (!user) return null;

  const firstName = user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-white pt-20 px-6">
      <section className="py-16 px-4 container bg-gray-00 rounded-lg max-w-4xl mx-auto mb-50">
        <h1 className="text-4xl font-bold text-black mb-12 text-center">
          What can we help you do, {firstName}?
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            href="/file-loss"
            className="text-center border border-gray-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold text-black mb-3">File a Gambling Loss</h2>
            <p className="text-black">Report your losses for tax deductions.</p>
          </Link>
          <Link
            href="/diary"
            className="text-center border border-gray-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold text-black mb-3">Track Your Diary</h2>
            <p className="text-black">Log your gambling sessions.</p>
          </Link>
          <Link
            href="/tax-report"
            className="text-center border border-gray-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold text-black mb-3">Generate Tax Report</h2>
            <p className="text-black">Prepare your gambling tax documents.</p>
          </Link>
          <Link
            href="/rewards"
            className="text-center border border-gray-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold text-black mb-3">Check Rewards</h2>
            <p className="text-black">See your responsible gambling rewards.</p>
          </Link>
          <Link
            href="/account"
            className="text-center border border-gray-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold text-black mb-3">Edit Your Account</h2>
            <p className="text-black">Update your profile details.</p>
          </Link>
          <Link
            href="/support"
            className="text-center border border-gray-300 rounded-lg p-6 shadow-lg hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold text-black mb-3">Contact Support</h2>
            <p className="text-black">Get help from our team.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}