"use client";
import { useEffect } from "react";

const Section = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-2xl font-semibold text-black mb-4">{title}</h2>
    {children}
  </section>
);

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-6">
      {/* Updated Header Color */}
      <header className="bg-blue-700 text-white py-4 mb-10">
        <h1 className="text-3xl font-bold text-center">About Project_Name</h1>
      </header>

      <section className="py-16 px-4 container bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
        <Section title="Company Overview">
          <p className="text-black mb-8">
            “Project_Name” is dedicated to promoting responsible gambling through innovative technology. Our mission is to empower users by providing tools that enhance their awareness of gambling activities, support financial management, and encourage healthier gambling habits.
          </p>
        </Section>

        <Section title="Our Mission">
          <p className="text-black mb-8">
            We aim to create a safer gambling environment by equipping users with the necessary resources to track their gambling behaviors, understand their financial impact, and make informed decisions. Our commitment to responsible gambling is at the heart of everything we do.
          </p>
        </Section>

        <Section title="Our Vision">
          <p className="text-black mb-8">
            To be the leading application in promoting responsible gambling practices globally, fostering a community where users can engage with gambling in a safe and controlled manner.
          </p>
        </Section>

        <Section title="Key Features">
          <ul className="list-disc list-inside mb-8">
            <li>
              <strong>Gambling Diary & Activity Tracker:</strong> A digital journal for logging gambling sessions, including date, time, location, and type of gambling.
              <ul className="list-disc list-inside">
                <li>Comprehensive tracking of wins, losses, net gains/losses, and total money spent.</li>
                <li>Data visualization tools to help users understand their gambling patterns.</li>
              </ul>
            </li>
            <li>
              <strong>Gamification & Point-Based System:</strong> Users earn points for tracking their activity, setting limits, and engaging with educational materials.
              <ul className="list-disc list-inside">
                <li>Built-in games that allow users to redeem points for virtual incentives.</li>
                <li>Milestones to promote responsible gambling, such as “Stay within budget for a week.”</li>
              </ul>
            </li>
            <li>
              <strong>Tax Reporting:</strong> An export function that generates reports summarizing gambling activity for tax purposes.
              <ul className="list-disc list-inside">
                <li>Support for various data formats (PDF, CSV, Excel) for easy record-keeping.</li>
                <li>Pre-filled tax forms to assist users in declaring winnings or losses.</li>
              </ul>
            </li>
          </ul>
        </Section>

        <Section title="Our Team">
  <div className="grid grid-cols-3 gap-4 mb-8">
    {/* Developer 1 */}
    <div className="flex flex-col items-center">
      <div className="w-75 h-75 border-2 border-gray-300 flex items-center justify-center mb-2">
        {/* Placeholder for photo */}
        <span className="text-gray-500">Photo</span>
      </div>
      <div className="text-center">
        <p className="text-black">Danny</p>
        <p className="text-gray-600">Enter Role</p>
      </div>
    </div>

    {/* Developer 2 */}
    <div className="flex flex-col items-center">
      <div className="w-75 h-75 border-2 border-gray-300 flex items-center justify-center mb-2">
        <span className="text-gray-500">Photo</span>
      </div>
      <div className="text-center">
        <p className="text-black">Cristian</p>
        <p className="text-gray-600">Enter Role</p>
      </div>
    </div>

    {/* Developer 3 */}
    <div className="flex flex-col items-center">
      <div className="w-75 h-75 border-2 border-gray-300 flex items-center justify-center mb-2">
        <span className="text-gray-500">Photo</span>
      </div>
      <div className="text-center">
        <p className="text-black">Ronald</p>
        <p className="text-gray-600">Enter Role</p>
      </div>
    </div>

    {/* Developer 4 */}
    <div className="flex flex-col items-center">
      <div className="w-75 h-75 border-2 border-gray-300 flex items-center justify-center mb-2">
        <span className="text-gray-500">Photo</span>
      </div>
      <div className="text-center">
        <p className="text-black">Vincent</p>
        <p className="text-gray-600">Enter Role</p>
      </div>
    </div>

    {/* Developer 5 */}
    <div className="flex flex-col items-center">
      <div className="w-75 h-75 border-2 border-gray-300 flex items-center justify-center mb-2">
        <span className="text-gray-500">Photo</span>
      </div>
      <div className="text-center">
        <p className="text-black">Sroth</p>
        <p className="text-gray-600">Enter Role</p>
      </div>
    </div>

    {/* Developer 6 */}
    <div className="flex flex-col items-center">
      <div className="w-75 h-75 border-2 border-gray-300 flex items-center justify-center mb-2">
        <span className="text-gray-500">Photo</span>
      </div>
      <div className="text-center">
        <p className="text-black">Phuc</p>
        <p className="text-gray-600">Enter Role</p>
      </div>
    </div>
  </div>
  <p className="text-black mb-8">
    Our team consists of experts in gambling behavior, financial management, and technology development. We are passionate about creating solutions that make a positive impact on our users' lives.
  </p>
</Section>


        <Section title="Contact Us">
          <p className="text-black mb-4">
            For inquiries or more information about our application, please reach out to us:
          </p>
          <p className="text-black">Email: <a href="mailto:info@gambl.com" className="text-blue-600 hover:underline">info@gambl.com</a></p>
          <p className="text-black">Phone: <a href="tel:+1234567890" className="text-blue-600 hover:underline">+1 (234) 567-890</a></p>
          <p className="text-black">Follow us on social media for the latest updates.</p>
        </Section>
      </section>
    </div>
  );
};

export default AboutUs;
