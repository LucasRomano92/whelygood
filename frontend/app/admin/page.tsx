"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  return (
    <main className="relative min-h-screen bg-black px-6 py-24 text-white">
     

      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-yellow-400">
          Wheely Good
        </p>

        <h1 className="text-4xl font-bold">Admin Dashboard</h1>

        <p className="mt-3 max-w-2xl text-white/60">
          Manage shop orders, rental requests and bikes from one place.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Link
            href="/admin/orders"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:bg-white/10"
          >
            <p className="mb-4 text-4xl">🧾</p>
            <h2 className="text-2xl font-semibold">View Orders</h2>
            <p className="mt-2 text-sm text-white/60">
              See paid shop orders, shipping details and order status.
            </p>
          </Link>

          <Link
            href="/admin/bookings"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:bg-white/10"
          >
            <p className="mb-4 text-4xl">📅</p>
            <h2 className="text-2xl font-semibold">View Bookings</h2>
            <p className="mt-2 text-sm text-white/60">
              View bike rental requests submitted by customers.
            </p>
          </Link>

          <Link
            href="/admin/bikes"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:bg-white/10"
          >
            <p className="mb-4 text-4xl">🚲</p>
            <h2 className="text-2xl font-semibold">Manage Bikes</h2>
            <p className="mt-2 text-sm text-white/60">
              Add, edit and delete bikes for shop and rentals.
            </p>
          </Link>

          <Link
  href="/admin/settings"
  className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:bg-white/10"
>
  <p className="mb-4 text-4xl">🚚</p>
  <h2 className="text-2xl font-semibold">Shipping Settings</h2>
  <p className="mt-2 text-sm text-white/60">
    Update the standard shipping price used in Stripe Checkout.
  </p>
</Link>
        </div>
      </div>
    </main>
  );
}