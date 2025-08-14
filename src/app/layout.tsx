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
    // More comprehensive hydration warning suppression
    const script = `
      (function() {
        if (typeof window !== 'undefined') {
          // Override React's hydration error logging
          const originalConsoleError = console.error;
          console.error = function(...args) {
            const message = args[0];
            if (typeof message === 'string' && (
              message.includes('bis_skin_checked') ||
              message.includes('bis_register') ||
              message.includes('Hydration failed') ||
              message.includes('server rendered HTML didn\\'t match') ||
              message.includes('A tree hydrated but some attributes')
            )) {
              // Silently ignore browser extension hydration warnings
              return;
            }
            originalConsoleError.apply(console, args);
          };

          // Prevent React from detecting extension attributes during hydration
          const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'attributes' && mutation.target) {
                const target = mutation.target;
                // Remove extension attributes immediately when they're added
                ['bis_skin_checked', 'bis_register', '__processed_de166b46-1091-4dfa-abce-c1472b867b71__'].forEach(function(attr) {
                  if (target.hasAttribute && target.hasAttribute(attr)) {
                    target.removeAttribute(attr);
                  }
                });
              }
            });
          });

          // Start observing after a delay to let React hydrate first
          setTimeout(function() {
            if (document.body) {
              observer.observe(document.body, {
                attributes: true,
                subtree: true,
                attributeFilter: ['bis_skin_checked', 'bis_register', '__processed_de166b46-1091-4dfa-abce-c1472b867b71__']
              });
            }
          }, 100);
        }
      })();
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
          <div className="fixed inset-0 -z-10" suppressHydrationWarning>
            {/* Base gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-red-950/10" suppressHydrationWarning></div>
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" suppressHydrationWarning></div>
            {/* Radial gradient overlay for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(220,38,38,0.05)_0%,transparent_50%)]" suppressHydrationWarning></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(234,88,12,0.05)_0%,transparent_50%)]" suppressHydrationWarning></div>
          </div>

          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
          <BrowserExtensionHandler />
        </body>
      </html>
    </ConvexClerkProvider>
  );
}
