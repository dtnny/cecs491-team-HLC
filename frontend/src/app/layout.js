import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { AuthProvider } from "@/components/AuthProvider";

export const metadata = {
  title: "GambLogic",
  description: "Track and manage your gambling activities responsibly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="flex flex-col min-h-screen">
        <AuthProvider>  {/* GLOBAL AUTH WRAPPER */}
          <Header />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
