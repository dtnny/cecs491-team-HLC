import "@/app/globals.css";
import Link from "next/link"; // Import the Link component

export const metadata = {
  title: "Gambling Awareness App",
  description: "Track and manage your gambling activities responsibly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <header className="bg-white text-blue-800 p-4 sticky top-0 z-10">
          {/* Wrap the header in a Link component */}
          <Link href="/" passHref>
            <h1 className="text-2xl font-bold cursor-pointer">project_name</h1>
          </Link>
          
          {/* Sign In button with lock icon */}
          <Link
            href="/signin"
            className="absolute top-1/2 transform -translate-y-1/2 right-4 bg-blue-800 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-800 transition flex items-center"
          >
            <i className="fas fa-lock mr-2"></i> {/* Lock icon */}
            Sign In
          </Link>
        </header>
        
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}