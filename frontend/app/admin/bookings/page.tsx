"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  _id: string;
  stripeSessionId?: string;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  status: "confirmed" | "cancelled" | "completed";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bikeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  quantity: number;
  pricePerDay: number;
  amountTotal: number;
  currency: string;
  notes?: string;
  createdAt: string;
};

export default function AdminBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <main className="relative min-h-screen bg-black px-4 py-24 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push("/admin")}
          className="mb-8 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black"
        >
          ← Back to Admin
        </button>

        <h1 className="text-4xl font-bold">Bookings Admin</h1>

        <p className="mt-2 text-white/60">
          View paid bike rental bookings received from the website.
        </p>

        {loading ? (
          <p className="mt-10 text-white/60">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="mt-10 text-white/60">No bookings yet.</p>
        ) : (
          <div className="mt-10 grid gap-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {booking.customerName}
                    </h2>

                    <p className="text-sm text-white/50">
                      {booking.customerEmail}
                    </p>

                    <p className="mt-1 text-sm text-white/50">
                      {booking.customerPhone}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-4 py-1 text-sm font-medium text-black">
                      {booking.bikeName}
                    </span>

                    <span
                      className={`rounded-full px-4 py-1 text-sm font-semibold ${
                        booking.paymentStatus === "paid"
                          ? "bg-green-400 text-black"
                          : "bg-yellow-400 text-black"
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>

                    <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-white">
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-white/70 md:grid-cols-4">
                  <p>
                    <span className="text-white">Start:</span>{" "}
                    {booking.startDate}
                  </p>

                  <p>
                    <span className="text-white">End:</span> {booking.endDate}
                  </p>

                  <p>
                    <span className="text-white">Days:</span>{" "}
                    {booking.totalDays}
                  </p>

                  <p>
                    <span className="text-white">Quantity:</span>{" "}
                    {booking.quantity}
                  </p>

                  <p>
                    <span className="text-white">Price/day:</span> $
                    {booking.pricePerDay}
                  </p>

                  <p>
                    <span className="text-white">Total paid:</span> $
                    {booking.amountTotal}{" "}
                    {booking.currency?.toUpperCase() || "AUD"}
                  </p>

                  <p className="md:col-span-2">
                    <span className="text-white">Created:</span>{" "}
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>

                {booking.notes && (
                  <p className="mt-4 text-sm text-white/60">
                    <span className="text-white">Notes:</span> {booking.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}