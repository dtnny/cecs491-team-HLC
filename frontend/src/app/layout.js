import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Add this line

export const metadata = {
  title: "Gambling Awareness App",
  description: "Track and manage your gambling activities responsibly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}