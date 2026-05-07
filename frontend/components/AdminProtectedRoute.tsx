"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    }

    // 👇 esto evita el warning
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [router, pathname]);

  if (!isReady && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}