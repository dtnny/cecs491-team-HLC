import "@/app/globals.css";

export const metadata = {
  title: "Gambl",
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
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold">Gambling Awareness</h1>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
};