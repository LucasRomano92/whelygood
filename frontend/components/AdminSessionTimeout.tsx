"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutos

export default function AdminSessionTimeout() {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const logout = () => {
      localStorage.removeItem("adminToken");
      router.push("/admin/login");
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logout, INACTIVITY_LIMIT);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [router]);

  return null;
}