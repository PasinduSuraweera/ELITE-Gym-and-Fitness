import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ConvexClerkProvider from "@/providers/ConvexClerkProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elite Gym",
  description: "A modern fitness AI platform to get jacked for free.",
};

// Client component to handle browser extension detection
const BrowserExtensionHandler = () => {
  if (typeof window !== 'undefined') {
    // Suppress hydration warnings for common browser extension attributes
    const script = `
      if (typeof window !== 'undefined') {
        // Suppress React hydration warnings for browser extensions
        const originalConsoleError = console.error;
        console.error = (...args) => {
          if (args[0] && typeof args[0] === 'string' && 
              (args[0].includes('bis_register') || 
               args[0].includes('bis_skin_checked') ||
               args[0].includes('Hydration failed'))) {
            return; // Suppress browser extension hydration warnings
          }
          originalConsoleError.apply(console, args);
        };
      }
    `;
    
    return (
      <script 
        dangerouslySetInnerHTML={{ __html: script }}
        suppressHydrationWarning
      />
    );
  }
  return null;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en" className="dark">
        <body 
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen flex flex-col`}
          suppressHydrationWarning={true}
        >
          <Navbar />

          {/* DARK BACKGROUND WITH SUBTLE PATTERNS */}
          <div className="fixed inset-0 -z-10">
            {/* Base gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-red-950/10"></div>
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            {/* Radial gradient overlay for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(220,38,38,0.05)_0%,transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(234,88,12,0.05)_0%,transparent_50%)]"></div>
          </div>

          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
          <BrowserExtensionHandler />
        </body>
      </html>
    </ConvexClerkProvider>
  );
}
