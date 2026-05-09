"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatAppButton";
import { Toaster } from "sonner";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}

      {children}

      {!isAdmin && <WhatsAppButton />}

      {!isAdmin && <Footer />}

      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            zIndex: 999999,
          },
        }}
      />
    </>
  );
}