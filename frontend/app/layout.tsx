import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatAppButton";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Wheely Good",
  description: "E-bike rentals and bikes for sale in Byron Bay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Navbar />
        {children}
        <Footer />
        <WhatsAppButton />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}