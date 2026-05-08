"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Bike = {
  _id: string;
  name: string;
  price: number;
  category?: "rent" | "shop";
};

export default function BookingPage() {
  const searchParams = useSearchParams();
  const bikeIdFromURL = searchParams.get("bikeId");

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bikeId: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchBikes = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bikes`);
      const data = await res.json();

      const rentalBikes = data.filter((b: Bike) => b.category === "rent");
      setBikes(rentalBikes);

      if (bikeIdFromURL) {
        const found = rentalBikes.find((b: Bike) => b._id === bikeIdFromURL);
        if (found) {
          setSelectedBike(found);
          setForm((prev) => ({ ...prev, bikeId: found._id }));
        }
      }
    };

    fetchBikes();
  }, [bikeIdFromURL]);

  useEffect(() => {
    if (form.startDate && form.endDate && selectedBike) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);

      const diffTime = end.getTime() - start.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (days > 0) {
        setTotalDays(days);
        setTotalPrice(days * selectedBike.price);
      } else {
        setTotalDays(0);
        setTotalPrice(0);
      }
    }
  }, [form.startDate, form.endDate, selectedBike]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "bikeId") {
      const bike = bikes.find((b) => b._id === e.target.value);
      setSelectedBike(bike || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      toast.error("Invalid email");
      return;
    }

    if (form.phone.replace(/\D/g, "").length < 8) {
      toast.error("Invalid phone number");
      return;
    }

    if (!selectedBike) {
      toast.info("Select a bike");
      return;
    }

    if (!form.startDate || !form.endDate) {
      toast.info("Select dates");
      return;
    }

    if (start < today) {
      toast.error("Start date cannot be in the past");
      return;
    }

    if (end < start) {
      toast.error("End date must be after start date");
      return;
    }

    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (days <= 0) {
      toast.error("Invalid date range");
      return;
    }

    if (days > 30) {
      toast.error("Max rental is 30 days");
      return;
    }

    const payload = {
      ...form,
      bike: selectedBike.name,
      totalDays: days,
      totalPrice: days * selectedBike.price,
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bikes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
    toast.error(data.message || "Error");
      return;
    }

    toast.success("Request sent successfully ✅");

    setForm({
      name: "",
      email: "",
      phone: "",
      bikeId: "",
      startDate: "",
      endDate: "",
      notes: "",
    });

    setSelectedBike(null);
    setTotalDays(0);
    setTotalPrice(0);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-center text-3xl font-bold md:text-4xl">
          Book Your Ride 🚴‍♂️
        </h1>

        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="rounded-2xl bg-white/5 p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Your Name"
                className="w-full rounded-xl bg-white/10 px-4 py-3"
                required
              />

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Email"
                className="w-full rounded-xl bg-white/10 px-4 py-3"
                required
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="text"
                placeholder="Phone"
                className="w-full rounded-xl bg-white/10 px-4 py-3"
                required
              />

              {selectedBike ? (
  <div className="rounded-xl bg-white/10 p-4">
    <p className="text-sm text-gray-400">Selected bike</p>
    <p className="font-semibold">
      {selectedBike.name} - ${selectedBike.price}/day
    </p>
  </div>
) : (
  <select
    name="bikeId"
    value={form.bikeId}
    onChange={handleChange}
    className="w-full rounded-xl bg-white/10 px-4 py-3"
    required
  >
    <option value="" className="text-black">
      Select a bike
    </option>

    {bikes.map((bike) => (
      <option key={bike._id} value={bike._id} className="text-black">
        {bike.name} - ${bike.price}/day
      </option>
    ))}
  </select>
)}

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  type="date"
                  className="w-full rounded-xl bg-white/10 px-4 py-3"
                  required
                />

                <input
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  type="date"
                  className="w-full rounded-xl bg-white/10 px-4 py-3"
                  required
                />
              </div>

              {totalDays > 0 && (
                <div className="rounded-xl bg-white/10 p-4">
                  <p>Days: {totalDays}</p>
                  <p>Total: ${totalPrice}</p>
                </div>
              )}

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Notes"
                className="w-full rounded-xl bg-white/10 px-4 py-3"
              />
<p className="text-sm text-gray-400">
  We’ll confirm availability via email or SMS before sending your payment link.
</p>
              <button
                type="submit"
                className="w-full rounded-full bg-white px-6 py-4 font-bold text-black transition hover:bg-gray-200"
              >
                Send Request
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 shadow-xl sticky top-20">
            <img
              src="/images/booking-info.jpeg"
              alt="Wheely Good booking information"
              className="w-full rounded-xl object-cover max-h-[800px]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}