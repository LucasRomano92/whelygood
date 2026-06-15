"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Bike = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
  category?: "rent" | "shop";
  isActive?: boolean;
};

function BookingContent() {
  const searchParams = useSearchParams();
  const bikeIdFromURL = searchParams.get("bikeId");

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bikeId: "",
    startDate: "",
    endDate: "",
    quantity: 1,
    notes: "",
  });

  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bikes`);
        const data = await res.json();

        const rentalBikes = data.filter(
          (b: Bike) =>
            b.category === "rent" && b.isActive !== false && Number(b.stock) > 0
        );

        setBikes(rentalBikes);

        if (bikeIdFromURL) {
          const found = rentalBikes.find((b: Bike) => b._id === bikeIdFromURL);

          if (found) {
            setSelectedBike(found);
            setForm((prev) => ({ ...prev, bikeId: found._id }));
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Error loading bikes");
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
        setTotalPrice(days * selectedBike.price * Number(form.quantity));
      } else {
        setTotalDays(0);
        setTotalPrice(0);
      }
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  }, [form.startDate, form.endDate, selectedBike, form.quantity]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const value =
      e.target.name === "quantity" ? Number(e.target.value) : e.target.value;

    setForm({
      ...form,
      [e.target.name]: value,
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

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

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

    if (Number(form.quantity) < 1) {
      toast.error("Invalid quantity");
      return;
    }

    if (Number(form.quantity) > Number(selectedBike.stock)) {
      toast.error("Not enough bikes available");
      return;
    }

    try {
      setLoadingPayment(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/create-booking-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bikeId: selectedBike._id,
            name: form.name,
            email: form.email,
            phone: form.phone,
            startDate: form.startDate,
            endDate: form.endDate,
            quantity: Number(form.quantity),
            notes: form.notes,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error creating payment");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Payment error");
    } finally {
      setLoadingPayment(false);
    }
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
            Choose your bike, select your dates and pay securely online.
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
                  <p className="mt-1 text-sm text-[#5B6470]">
                    Available: {selectedBike.stock}
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
                      {bike.name} - ${bike.price}/day - {bike.stock} available
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

              <input
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                type="number"
                min={1}
                max={selectedBike?.stock || 1}
                placeholder="Quantity"
                className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] placeholder:text-[#7A7468]"
                required
              />

              {totalDays > 0 && selectedBike && (
                <div className="rounded-xl border border-[#C8BEAA] bg-white p-4">
                  <p className="text-[#5B6470]">
                    Days:{" "}
                    <span className="font-semibold text-[#1F2933]">
                      {totalDays}
                    </span>
                  </p>

                  <p className="mt-1 text-[#5B6470]">
                    Price per day:{" "}
                    <span className="font-semibold text-[#1F2933]">
                      ${selectedBike.price}
                    </span>
                  </p>

                  <p className="mt-1 text-[#5B6470]">
                    Quantity:{" "}
                    <span className="font-semibold text-[#1F2933]">
                      {form.quantity}
                    </span>
                  </p>

                  <p className="mt-3 text-lg font-bold text-[#1F2933]">
                    Total: ${totalPrice}
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
                Your booking will be confirmed after payment.
              </p>

              <button
                type="submit"
                disabled={loadingPayment}
                className="w-full rounded-full bg-[#1F2933] px-6 py-4 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPayment ? "Redirecting to payment..." : "Pay & Book Now"}
              </button>
            </form>
          </div>

          <div className="sticky top-24 rounded-3xl border border-[#C8BEAA] bg-[#DDD5C4] p-4 shadow-sm">
            {selectedBike?.image ? (
              <img
                src={selectedBike.image}
                alt={selectedBike.name}
                className="max-h-[800px] w-full rounded-2xl object-cover"
              />
            ) : (
              <img
                src="/images/booking-info2.jpeg"
                alt="Wheely Good booking information"
                className="max-h-[800px] w-full rounded-2xl object-cover"
              />
            )}

            {selectedBike && (
              <div className="p-4">
                <h2 className="text-2xl font-bold text-[#1F2933]">
                  {selectedBike.name}
                </h2>

                <p className="mt-2 text-[#5B6470]">
                  ${selectedBike.price} per day
                </p>

                {selectedBike.description && (
                  <p className="mt-3 text-sm text-[#5B6470]">
                    {selectedBike.description}
                  </p>
                )}
              </div>
            )}
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