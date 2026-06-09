"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Bike = {
  _id: string;
  name: string;
  price: number;
  category?: "rent" | "shop";
};

function BookingContent() {
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking`, {
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
  <main className="min-h-screen bg-[#F8F7F2] px-4 py-16">
    <div className="mx-auto max-w-6xl">
      <div className="mb-12 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-[#7A7468]">
          Rentals
        </p>

        <h1 className="mt-3 text-4xl font-extrabold text-[#1F2933] md:text-6xl">
          Book Your Ride 🚴‍♂️
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-[#5B6470]">
          Reserve your bike and explore Byron Bay at your own pace.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2 md:items-start">
        <div className="rounded-3xl border border-[#C8BEAA] bg-[#DDD5C4] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Your Name"
              className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] placeholder:text-[#7A7468]"
              required
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] placeholder:text-[#7A7468]"
              required
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              type="text"
              placeholder="Phone"
              className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] placeholder:text-[#7A7468]"
              required
            />

            {selectedBike ? (
              <div className="rounded-xl border border-[#C8BEAA] bg-white p-4">
                <p className="text-sm text-[#7A7468]">Selected bike</p>
                <p className="font-semibold text-[#1F2933]">
                  {selectedBike.name} - ${selectedBike.price}/day
                </p>
              </div>
            ) : (
              <select
                name="bikeId"
                value={form.bikeId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
                required
              >
                <option value="">Select a bike</option>

                {bikes.map((bike) => (
                  <option key={bike._id} value={bike._id}>
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
                className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
                required
              />

              <input
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                type="date"
                className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
                required
              />
            </div>

            {totalDays > 0 && (
              <div className="rounded-xl border border-[#C8BEAA] bg-white p-4">
                <p className="text-[#5B6470]">
                  Days:{" "}
                  <span className="font-semibold text-[#1F2933]">
                    {totalDays}
                  </span>
                </p>

                <p className="mt-1 text-[#5B6470]">
                  Total:{" "}
                  <span className="font-semibold text-[#1F2933]">
                    ${totalPrice}
                  </span>
                </p>
              </div>
            )}

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notes"
              className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] placeholder:text-[#7A7468]"
            />

            <p className="text-sm text-[#5B6470]">
              We’ll confirm availability via email or SMS before sending your
              payment link.
            </p>

            <button
              type="submit"
              className="w-full rounded-full bg-[#1F2933] px-6 py-4 font-semibold text-white transition hover:opacity-90"
            >
              Send Request
            </button>
          </form>
        </div>

        <div className="sticky top-24 rounded-3xl border border-[#C8BEAA] bg-[#DDD5C4] p-4 shadow-sm">
          <img
            src="/images/booking-info2.jpeg"
            alt="Wheely Good booking information"
            className="max-h-[800px] w-full rounded-2xl object-cover"
          />
        </div>
      </div>
    </div>
  </main>
);
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F2] p-10 text-[#1F2933]">
          Loading...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}