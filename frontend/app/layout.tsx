import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import QueryProvider from "@/lib/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Achievo - Goal Achievement Platform",
  description:
    "AI-powered goal achievement platform with personalized tutoring",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${inter.variable} antialiased`}>
        <QueryProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
          <Toaster position="top-right" richColors/>
        </QueryProvider>
      </body>
    </html>
  );
}
