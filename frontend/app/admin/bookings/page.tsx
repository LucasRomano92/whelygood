"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bike: string;
  date: string;
  time: string;
  duration: string;
  notes?: string;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Protección de ruta
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  // 📦 Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:4000/booking", {
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

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  return (
    <main className="relative min-h-screen bg-black px-6 py-24 text-white">
      
      {/* 🔥 Logout */}
    

      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">Bookings Admin</h1>
        <p className="mt-2 text-white/60">
          View all bike rental bookings received from the website.
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
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{booking.name}</h2>
                    <p className="text-sm text-white/50">{booking.email}</p>
                  </div>

                  <span className="rounded-full bg-white px-4 py-1 text-sm font-medium text-black">
                    {booking.bike}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-white/70 md:grid-cols-4">
                  <p><span className="text-white">Phone:</span> {booking.phone}</p>
                  <p><span className="text-white">Date:</span> {booking.date}</p>
                  <p><span className="text-white">Time:</span> {booking.time}</p>
                  <p><span className="text-white">Duration:</span> {booking.duration}</p>
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