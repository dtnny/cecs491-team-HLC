"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

const Section = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">{title}</h2>
    {children}
  </section>
);

export default function AboutUs() {
  const { user } = useAuth();

  const team = [
    { name: "Daniel", role: "Developer" },
    { name: "Cristian", role: "Developer" },
    { name: "Ronald", role: "Developer" },
    { name: "Vincent", role: "Developer" },
    { name: "Sroth", role: "Developer" },
    { name: "Phuc", role: "Developer" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      {/* Hero Intro */}
      <section className="py-12 text-center">
        <img
          src="/company_logo.png"
          alt="Company Logo"
          className="w-full max-w-xs sm:max-w-sm mx-auto mb-6"
        />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          About Us
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Empowering responsible gambling through innovative technology.
        </p>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto max-w-5xl bg-white rounded-2xl shadow-xl p-6 sm:p-10">
          <Section title="Company Overview">
            <p className="text-gray-600 leading-relaxed">
              Gambling Awareness is dedicated to promoting responsible gambling through innovative technology. Our mission is to empower users by providing tools that enhance their awareness of gambling activities, support financial management, and encourage healthier gambling habits.
            </p>
          </Section>

          <Section title="Our Mission">
            <p className="text-gray-600 leading-relaxed">
              We aim to create a safer gambling environment by equipping users with the necessary resources to track their gambling behaviors, understand their financial impact, and make informed decisions. Our commitment to responsible gambling is at the heart of everything we do.
            </p>
          </Section>

          <Section title="Our Vision">
            <p className="text-gray-600 leading-relaxed">
              To be the leading application in promoting responsible gambling practices globally, fostering a community where users can engage with gambling in a safe and controlled manner.
            </p>
          </Section>

          <Section title="Key Features">
            <ul className="space-y-6 text-gray-600">
              <li>
                <strong className="text-gray-900">Gambling Diary & Activity Tracker:</strong> A digital journal for logging gambling sessions, including date, time, location, and type of gambling.
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Comprehensive tracking of wins, losses, net gains/losses, and total money spent.</li>
                  <li>Data visualization tools to help users understand their gambling patterns.</li>
                </ul>
              </li>
              <li>
                <strong className="text-gray-900">Gamification & Point-Based System:</strong> Users earn points for tracking their activity, setting limits, and engaging with educational materials.
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Built-in games that allow users to redeem points for virtual incentives.</li>
                  <li>Milestones to promote responsible gambling, such as “Stay within budget for a week.”</li>
                </ul>
              </li>
              <li>
                <strong className="text-gray-900">Tax Reporting:</strong> An export function that generates reports summarizing gambling activity for tax purposes.
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Support for various data formats (PDF, CSV, Excel) for easy record-keeping.</li>
                  <li>Pre-filled tax forms to assist users in declaring winnings or losses.</li>
                </ul>
              </li>
            </ul>
          </Section>

          <Section title="Our Team">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
                    <img
                      src="/avatar-placeholder.png"
                      alt={`${member.name}'s avatar`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-gray-900 font-semibold">{member.name}</p>
                  <p className="text-gray-600 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 leading-relaxed">
              Our team consists of experts in gambling behavior, financial management, and technology development. We are passionate about creating solutions that make a positive impact on our users&apos; lives.
            </p>
          </Section>

          <Section title="Contact Us">
            <p className="text-gray-600 mb-6">
              For inquiries or more information about our application, please reach out to us:
            </p>
            <div className="space-y-4">
              <p className="flex items-center text-gray-600">
                <i className="fas fa-envelope text-blue-600 mr-2"></i>
                Email: <a href="mailto:info@gambl.com" className="text-blue-600 hover:underline ml-1">info@gambl.com</a>
              </p>
              <p className="flex items-center text-gray-600">
                <i className="fas fa-phone text-blue-600 mr-2"></i>
                Phone: <a href="tel:+1234567890" className="text-blue-600 hover:underline ml-1">+1 (234) 567-890</a>
              </p>
              <p className="text-gray-600">
                Follow us on social media for the latest updates.
              </p>
            </div>
          </Section>
        </div>
      </section>
    </div>
  );
}