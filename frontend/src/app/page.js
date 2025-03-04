import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-teal-100 to-white">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {/*Take Control of Your Gambling */}
          Gambl
        </h1>
        <p className="text-xl text-gray-700 mb-10 max-w-3xl">
          Monitor your spending, track your habits, and stay responsible with tools built for awareness and financial health.
        </p>
        <div className="flex space-x-6">
          <Link
            href="/diary"
            className="bg-teal-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-teal-700 transition text-lg"
          >
            Start Tracking
          </Link>
          <Link
            href="/stats"
            className="border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-full font-semibold hover:bg-teal-50 transition text-lg"
          >
            See Insights
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 container">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Gambling Diary
            </h3>
            <p className="text-gray-600">
              Log every session—date, time, wins, and losses—to stay aware.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Data Visualization
            </h3>
            <p className="text-gray-600">
              See your trends with clear, interactive charts.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Gamification
            </h3>
            <p className="text-gray-600">
              Earn points and rewards for responsible habits.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Tax Reporting
            </h3>
            <p className="text-gray-600">
              Export data for easy tax filing and planning.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}