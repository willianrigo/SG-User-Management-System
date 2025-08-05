import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/shared/components/Navigation";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "User Management System",
  description: "A full-stack user management application with automatic geolocation data fetching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <ProtectedRoute>
          <Navigation />
          <main className="min-h-[calc(100vh-80px)]">
            {children}
          </main>
        </ProtectedRoute>
      </body>
    </html>
  );
}
