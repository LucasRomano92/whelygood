"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    toast.success("Logged out successfully");

    setTimeout(() => {
      router.push("/admin/login");
    }, 500);
  };

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6">
      <div className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => router.push("/admin")}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
        >
          Admin
        </button>

        <button
          onClick={() => router.push("/")}
          className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
        >
          Website
        </button>

        <button
          onClick={handleLogout}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          Logout
        </button>
      </div>

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
  href="/admin/hero"
  className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:bg-white/10"
>
  <p className="mb-4 text-4xl">🖼️</p>

  <h2 className="text-2xl font-semibold">Manage Hero</h2>

  <p className="mt-2 text-sm text-white/60">
    Create and manage homepage hero carousel slides.
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