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

type CartItem = Bike & {
  quantity: number;
};

function BookingContent() {
  const searchParams = useSearchParams();
  const bikeIdFromURL = searchParams.get("bikeId");

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [modalBike, setModalBike] = useState<Bike | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState(1);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const TOTAL_STEPS = 3;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bikeId: "",
    startDate: "",
    pickupTime: "",
    duration: "1",
    quantity: 1,
    notes: "",
  });

  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.price * Number(form.duration) * Number(item.quantity),
    0
  );

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

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
  };

  const validateRentalAndCart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(form.startDate);

    if (!form.startDate) {
      toast.info("Select date");
      return false;
    }

    if (!form.pickupTime) {
      toast.info("Select pickup time");
      return false;
    }

    if (!form.duration) {
      toast.info("Select duration");
      return false;
    }

    if (start < today) {
      toast.error("Start date cannot be in the past");
      return false;
    }

    if (Number(form.duration) < 1 || Number(form.duration) > 30) {
      toast.error("Max rental is 30 days");
      return false;
    }

    if (cart.length === 0) {
      toast.info("Add at least one bike to the cart");
      return false;
    }

    return true;
  };

  const validateCustomerDetails = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!emailRegex.test(form.email)) {
      toast.error("Invalid email");
      return false;
    }

    if (form.phone.replace(/\D/g, "").length < 8) {
      toast.error("Invalid phone number");
      return false;
    }

    return true;
  };

  const addToCart = (bike: Bike) => {
    const quantity = Number(form.quantity);

    if (quantity < 1) {
      toast.error("Invalid quantity");
      return;
    }

    if (quantity > Number(bike.stock)) {
      toast.error("Not enough bikes available");
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => item._id === bike._id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > Number(bike.stock)) {
          toast.error("Not enough bikes available");
          return prev;
        }

        return prev.map((item) =>
          item._id === bike._id ? { ...item, quantity: newQuantity } : item
        );
      }

      return [...prev, { ...bike, quantity }];
    });

    setSelectedBike(bike);
    setForm((prev) => ({
      ...prev,
      bikeId: bike._id,
      quantity: 1,
    }));

    setModalBike(null);
  };

  const removeFromCart = (bikeId: string) => {
    setCart((prev) => prev.filter((item) => item._id !== bikeId));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateRentalAndCart()) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!validateCustomerDetails()) return;
      setStep(3);
      return;
    }
  };

  const handleBackStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateRentalAndCart()) return;
  if (!validateCustomerDetails()) return;

  try {
    setLoadingPayment(true);

    const start = new Date(form.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + Number(form.duration) - 1);

    const endDate = end.toISOString().split("T")[0];

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/create-booking-checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            bikeId: item._id,
            quantity: item.quantity,
          })),
          name: form.name,
          email: form.email,
          phone: form.phone,
          startDate: form.startDate,
          endDate,
          pickupTime: form.pickupTime,
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
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold uppercase text-[#1F2933]">
            WHEELY GOOD
          </h1>

          <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[#7A7468]">
            RENTALS
          </p>
        </div>

        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#1F2933] text-white">
          🛒
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {cartCount}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="rounded-3xl border border-[#C8BEAA] bg-[#DDD5C4] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-8 flex items-center px-2">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex flex-1 items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${
                      step >= num
                        ? "bg-[#1F2933] text-white"
                        : "bg-[#E5E5E5] text-[#999]"
                    }`}
                  >
                    {num}
                  </div>

                  {num < 3 && (
                    <div
                      className={`h-[2px] flex-1 ${
                        step > num ? "bg-[#1F2933]" : "bg-[#E5E5E5]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {step === 1 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#1F2933]">
                    1 Choose Your Rental Period
                  </h2>

                  <div className="mt-4 rounded-2xl border-2 border-[#1F2933] bg-white p-5">
                    <p className="text-sm font-extrabold uppercase tracking-wide text-[#7A7468]">
                      📍 Pick Up & Return Location
                    </p>

                    <h3 className="mt-2 text-xl font-extrabold text-[#1F2933]">
                      Unit 1/122 Bangalow Rd, Byron Bay NSW
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-[#5B6470]">
                      Pick up and drop off your bikes from this address.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#5B6470]">
                      Select Date
                    </label>

                    <input
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      type="date"
                      className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#5B6470]">
                      Select Time
                    </label>

                    <select
                      name="pickupTime"
                      value={form.pickupTime}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
                      required
                    >
                      <option value="">Select Time</option>
                      <option value="07:00">7:00 AM</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#5B6470]">
                    Duration
                  </label>

                  <select
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
                    required
                  >
                    <option value="">Select duration</option>

                    {Array.from({ length: 30 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Day Hire
                      </option>
                    ))}
                  </select>
                </div>

                {form.startDate && form.pickupTime && form.duration && (
                  <div className="pt-6">
                    <h3 className="mb-4 text-xl font-bold text-[#1F2933]">
                      2 Available Rentals
                    </h3>

                    <div className="rounded-2xl border border-[#C8BEAA] bg-white p-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        {bikes.map((bike) => {
                          const cartItem = cart.find(
                            (item) => item._id === bike._id
                          );

                          return (
                            <button
                              type="button"
                              key={bike._id}
                              onClick={() => setModalBike(bike)}
                              className={`relative rounded-2xl border bg-white p-4 text-left transition hover:shadow-md ${
                                cartItem
                                  ? "border-red-500"
                                  : "border-[#C8BEAA]"
                              }`}
                            >
                              {cartItem && (
                                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                  {cartItem.quantity}
                                </span>
                              )}

                              {bike.image && (
                                <img
                                  src={bike.image}
                                  alt={bike.name}
                                  className="h-32 w-full rounded-xl object-contain"
                                />
                              )}

                              <h4 className="mt-3 font-bold text-[#1F2933]">
                                {bike.name}
                              </h4>

                              <p className="mt-1 text-sm text-[#5B6470]">
                                ${bike.price} / day
                              </p>

                              <p className="mt-1 text-sm font-semibold text-[#1F2933]">
                                Total: ${bike.price * Number(form.duration)}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {cart.length > 0 && (
                  <p className="pt-2 text-center text-sm font-semibold text-[#1F2933]">
                    You can review your order before payment.
                  </p>
                )}

                <div className="flex justify-end border-t border-[#C8BEAA] pt-4">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={cart.length === 0}
                    className="rounded-xl bg-red-500 px-8 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next Step
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#1F2933]">
                    2 Customer Details
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#5B6470]">
                      Full Name
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      type="text"
                      className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#5B6470]">
                      Email
                    </label>

                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#5B6470]">
                    Phone Number
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    type="tel"
                    className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#5B6470]">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
                    placeholder="Anything we should know?"
                  />
                </div>

                <div className="flex gap-3 border-t border-[#C8BEAA] pt-4">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="w-full rounded-full border border-[#1F2933] px-6 py-4 font-semibold text-[#1F2933]"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full rounded-full bg-red-500 px-6 py-4 font-semibold text-white transition hover:opacity-90"
                  >
                    Review Order
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#1F2933]">
                    3 Review Order
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#C8BEAA] bg-white p-5">
                    <p className="text-sm font-bold uppercase text-[#7A7468]">
                      Rental Information
                    </p>

                    <p className="mt-3 text-[#1F2933]">
                      <strong>Date:</strong> {form.startDate}
                    </p>

                    <p className="mt-2 text-[#1F2933]">
                      <strong>Pickup Time:</strong> {form.pickupTime}
                    </p>

                    <p className="mt-2 text-[#1F2933]">
                      <strong>Duration:</strong> {form.duration} day hire
                    </p>

                    <p className="mt-2 text-[#1F2933]">
                      <strong>Location:</strong> Unit 1/122 Bangalow Rd, Byron
                      Bay NSW
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#C8BEAA] bg-white p-5">
                    <p className="text-sm font-bold uppercase text-[#7A7468]">
                      Customer Details
                    </p>

                    <p className="mt-3 text-[#1F2933]">
                      <strong>Name:</strong> {form.name}
                    </p>

                    <p className="mt-2 text-[#1F2933]">
                      <strong>Email:</strong> {form.email}
                    </p>

                    <p className="mt-2 text-[#1F2933]">
                      <strong>Phone:</strong> {form.phone}
                    </p>

                    {form.notes && (
                      <p className="mt-2 text-[#1F2933]">
                        <strong>Notes:</strong> {form.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#C8BEAA] bg-white p-5">
                  <p className="text-sm font-bold uppercase text-[#7A7468]">
                    Order Summary
                  </p>

                  <div className="mt-4 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between gap-4 border-b border-[#C8BEAA] pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center gap-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-20 w-20 rounded-xl bg-white object-contain p-1"
                            />
                          )}

                          <div>
                            <p className="font-bold text-[#1F2933]">
                              {item.name}
                            </p>

                            <p className="text-sm text-[#5B6470]">
                              ${item.price} / day × {form.duration} days ×{" "}
                              {item.quantity}
                            </p>
                          </div>
                        </div>

                        <p className="font-bold text-[#1F2933]">
                          $
                          {item.price *
                            Number(form.duration) *
                            Number(item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-[#C8BEAA] pt-4 text-right">
                    <p className="text-xl font-extrabold text-[#1F2933]">
                      Total: ${cartTotal}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[#5B6470]">
                  Your booking will be confirmed after payment.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="w-full rounded-full border border-[#1F2933] px-6 py-4 font-semibold text-[#1F2933]"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loadingPayment || cart.length === 0}
                    className="w-full rounded-full bg-[#1F2933] px-6 py-4 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingPayment
                      ? "Redirecting to payment..."
                      : "Pay & Book Now"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>

    {modalBike && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[#1F2933]">
              {modalBike.name}
            </h3>

            <button
              type="button"
              onClick={() => setModalBike(null)}
              className="text-2xl text-[#5B6470]"
            >
              ×
            </button>
          </div>

          {modalBike.image && (
            <img
              src={modalBike.image}
              alt={modalBike.name}
              className="mx-auto h-56 w-full object-contain"
            />
          )}

          <div className="mt-6 border-t border-[#C8BEAA] pt-4">
            <h4 className="font-bold text-[#1F2933]">Price Summary</h4>

            <p className="mt-2 text-[#5B6470]">
              ${modalBike.price} per day
            </p>

            <p className="mt-2 font-semibold text-[#1F2933]">
              Total: $
              {modalBike.price *
                Number(form.duration) *
                Number(form.quantity)}
            </p>
          </div>

          <div className="mt-6 border-t border-[#C8BEAA] pt-4">
            <p className="font-semibold text-[#1F2933]">
              Available: {modalBike.stock}
            </p>

            <label className="mt-3 block text-sm font-semibold text-[#5B6470]">
              Quantity
            </label>

            <select
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933]"
            >
              {Array.from({ length: modalBike.stock }, (_, i) => i + 1).map(
                (num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={() => addToCart(modalBike)}
            className="mt-6 w-full rounded-xl bg-[#1F2933] px-6 py-4 font-bold text-white"
          >
            Add to Cart
          </button>
        </div>
      </div>
    )}
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