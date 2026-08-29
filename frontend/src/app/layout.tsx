import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "INNOWAVE - AI Marine Intelligence Assistant",
  description: "Collaborative multi-agent marine intelligence for fishermen and coastal safety",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS CDN */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen bg-marine-1000 text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
