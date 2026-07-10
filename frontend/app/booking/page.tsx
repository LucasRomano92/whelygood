"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

type RentalPrices = {
  day1: number;
  day2: number;
  day3: number;
  day4: number;
  day5: number;
  day6: number;
  day7: number;
  month: number;
};

type Bike = {
  _id: string;
  name: string;
  price: number;
  rentalPrices?: RentalPrices;
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

  const RACK_PRICES: Record<number, number> = {
    1: 15,
    2: 30,
    3: 45,
    4: 45,
    5: 45,
    6: 45,
    7: 45,
    30: 45,
  };

 const [form, setForm] = useState({
  name: "",
  email: "",
  phone: "",
  bikeId: "",

  pickupLocation: "Unit 1/122 Bangalow Rd, Byron Bay NSW",

  startDate: "",
  pickupTime: "",
  duration: "1",

  surfboardRack: false,
  childSeat: false,
  rearBasket: false,

  notes: "",
});

  const durationNumber = Number(form.duration);

  const getBikeRentalPrice = (bike: Bike, duration: number) => {
    if (duration === 1) return bike.rentalPrices?.day1 ?? bike.price ?? 0;
    if (duration === 2) return bike.rentalPrices?.day2 ?? bike.price ?? 0;
    if (duration === 3) return bike.rentalPrices?.day3 ?? bike.price ?? 0;
    if (duration === 4) return bike.rentalPrices?.day4 ?? bike.price ?? 0;
    if (duration === 5) return bike.rentalPrices?.day5 ?? bike.price ?? 0;
    if (duration === 6) return bike.rentalPrices?.day6 ?? bike.price ?? 0;
    if (duration === 7) return bike.rentalPrices?.day7 ?? bike.price ?? 0;
    if (duration === 30) return bike.rentalPrices?.month ?? bike.price ?? 0;

    return 0;
  };

  const selectedBikeRentalPrice = selectedBike
    ? getBikeRentalPrice(selectedBike, durationNumber)
    : 0;

const accessoryPrice = RACK_PRICES[durationNumber] || 0;

const rackPrice = form.surfboardRack ? accessoryPrice : 0;
const childSeatPrice = form.childSeat ? accessoryPrice : 0;
const rearBasketPrice = form.rearBasket ? accessoryPrice : 0;

  const bikesTotal = cart.reduce((total, item) => {
    const itemPrice = getBikeRentalPrice(item, durationNumber);
    return total + itemPrice * item.quantity;
  }, 0);

  const cartTotal = bikesTotal + rackPrice + childSeatPrice + rearBasketPrice;

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

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
  const availableTimes = (() => {
  if (!form.startDate) return [];

  const date = new Date(`${form.startDate}T00:00:00`);
  const day = date.getDay();

  const isWeekend = day === 0 || day === 6;

  const startHour = isWeekend ? 10 : 9;
  const endHour = isWeekend ? 15 : 17;

  const times: string[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    times.push(`${String(hour).padStart(2, "0")}:00`);
  }

  return times;
})();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

   if (
  ["surfboardRack", "childSeat", "rearBasket"].includes(name) &&
  e.target instanceof HTMLInputElement
) {
  setForm({
    ...form,
    [name]: e.target.checked,
  });
  return;
}

    setForm({
      ...form,
      [name]: value,
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

    if (![1, 2, 3, 4, 5, 6, 7, 30].includes(Number(form.duration))) {
      toast.error("Invalid rental duration");
      return false;
    }

    if (start < today) {
      toast.error("Start date cannot be in the past");
      return false;
    }

    if (cart.length === 0) {
      toast.info("Select at least one bike");
      return false;
    }

    const invalidItem = cart.find(
      (item) => getBikeRentalPrice(item, durationNumber) <= 0
    );

    if (invalidItem) {
      toast.error(`${invalidItem.name} does not have a valid rental price`);
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
    if (Number(bike.stock) < 1) {
      toast.error("This bike is not available");
      return;
    }

    const bikePrice = getBikeRentalPrice(bike, durationNumber);

    if (bikePrice <= 0) {
      toast.error("This bike does not have a valid price for this duration");
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => item._id === bike._id);

      if (existingItem) {
        if (existingItem.quantity >= Number(bike.stock)) {
          toast.error("No more stock available for this bike");
          return prev;
        }

        return prev.map((item) =>
          item._id === bike._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...bike, quantity: 1 }];
    });

    setSelectedBike(bike);
    setForm((prev) => ({
      ...prev,
      bikeId: bike._id,
    }));

    setModalBike(null);
  };

  const increaseQuantity = (bikeId: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item._id !== bikeId) return item;

        if (item.quantity >= Number(item.stock)) {
          toast.error("No more stock available for this bike");
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  const decreaseQuantity = (bikeId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === bikeId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
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
              rentalPrice: getBikeRentalPrice(item, durationNumber),
            })),
            name: form.name,
            email: form.email,
            phone: form.phone,
            startDate: form.startDate,
            endDate,
            pickupTime: form.pickupTime,
pickupLocation: form.pickupLocation,

duration: Number(form.duration),

surfboardRack: form.surfboardRack,
childSeat: form.childSeat,
rearBasket: form.rearBasket,

rackPrice,
childSeatPrice,
rearBasketPrice,

accessoryPrice,
rentalPrice: bikesTotal,
totalPrice: cartTotal,
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
  <main className="min-h-screen overflow-x-hidden bg-[#F8F7F2] px-3 py-16 sm:px-4">
    <div className="mx-auto w-full max-w-7xl overflow-hidden">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold uppercase text-[#1F2933]">
            WHEELY GOOD
          </h1>

          <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[#7A7468]">
            RENTALS
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 rounded-3xl bg-white p-3 shadow-sm sm:p-6">
          <div className="min-w-0 rounded-3xl border border-[#C8BEAA] bg-[#DDD5C4] p-4 shadow-sm sm:p-6">
            <form onSubmit={handleSubmit} className="min-w-0 space-y-4">
              <div className="relative mb-12 px-2">
                <div className="absolute left-6 right-6 top-6 h-[2px] bg-[#E5E5E5]" />

                <div
                  className={`absolute left-6 top-6 h-[2px] bg-[#1F2933] transition-all ${
                    step === 1
                      ? "w-0"
                      : step === 2
                      ? "w-[50%]"
                      : "right-6"
                  }`}
                />

                <div className="relative z-10 flex w-full items-center justify-between">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${
                        step >= num
                          ? "bg-[#1F2933] text-white"
                          : "bg-[#E5E5E5] text-[#999]"
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {step === 1 && (
                <>
                  <div className="mb-8 min-w-0">
                    <h2 className="text-2xl font-bold text-[#1F2933]">
                      1 Choose Your Rental Period
                    </h2>

                    <div className="mt-4 rounded-2xl border-2 border-[#1F2933] bg-white p-5">
  <p className="text-sm font-extrabold uppercase tracking-wide text-[#7A7468]">
    📍 Pick Up & Return Location
  </p>

  <label className="mt-4 mb-2 block text-sm font-semibold text-[#5B6470]">
    Select Pickup Point
  </label>

  <select
    name="pickupLocation"
    value={form.pickupLocation}
    onChange={handleChange}
    className="block h-[54px] w-full rounded-xl border border-[#C8BEAA] bg-white px-4 text-[#1F2933] outline-none"
  >
    <option value="Unit 1/122 Bangalow Rd, Byron Bay NSW">
      Wheely Good E-Rides — Unit 1/122 Bangalow Rd - BYRON BAY
    </option>

    <option value="Wheely Good E-Rides - 88-94 Centennial Cct, Byron Bay NSW 2481">
      Wheely Good E-Rides — 88-94 Centennial Cct - INDUSTRIAL STATE
    </option>
  </select>

  <p className="mt-3 text-sm font-semibold text-[#5B6470]">
    Pick up and return your bike at the selected location.
  </p>
</div>
                  </div>

                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-semibold text-[#5B6470]">
                        Select Date
                      </label>

                      <input
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        type="date"
                        className="block h-[54px] w-full min-w-0 max-w-full appearance-none rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] outline-none"
                        required
                      />
                    </div>

                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-semibold text-[#5B6470]">
                        Select Time
                      </label>

                      <select
  name="pickupTime"
  value={form.pickupTime}
  onChange={handleChange}
  className="block h-[54px] w-full min-w-0 max-w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] outline-none"
  required
>
  <option value="">Select Time</option>

  {availableTimes.map((time) => (
    <option key={time} value={time}>
      {time}
    </option>
  ))}
</select>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-[#5B6470]">
                      Duration
                    </label>

                    <select
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      className="block h-[54px] w-full min-w-0 max-w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] outline-none"
                      required
                    >
                      <option value="">Select duration</option>
                      <option value="1">1 Day Hire</option>
                      <option value="2">2 Days Hire</option>
                      <option value="3">3 Days Hire</option>
                      <option value="4">4 Days Hire</option>
                      <option value="5">5 Days Hire</option>
                      <option value="6">6 Days Hire</option>
                      <option value="7">7 Days Hire</option>
                      <option value="30">1 Month Hire</option>
                    </select>
                  </div>

                <div className="space-y-3">

  <label className="flex items-center gap-3 rounded-xl border border-[#C8BEAA] bg-white p-4 text-[#1F2933]">
    <input
      type="checkbox"
      name="surfboardRack"
      checked={form.surfboardRack}
      onChange={handleChange}
      className="h-5 w-5"
    />

    <span>
      <strong>Surfboard Rack</strong>
      <br />
      <span className="text-sm text-[#5B6470]">
        +${accessoryPrice}
      </span>
    </span>
  </label>

  <label className="flex items-center gap-3 rounded-xl border border-[#C8BEAA] bg-white p-4 text-[#1F2933]">
    <input
      type="checkbox"
      name="childSeat"
      checked={form.childSeat}
      onChange={handleChange}
      className="h-5 w-5"
    />

    <span>
      <strong>Child Seat</strong>
      <br />
      <span className="text-sm text-[#5B6470]">
        +${accessoryPrice}
      </span>
    </span>
  </label>

  <label className="flex items-center gap-3 rounded-xl border border-[#C8BEAA] bg-white p-4 text-[#1F2933]">
    <input
      type="checkbox"
      name="rearBasket"
      checked={form.rearBasket}
      onChange={handleChange}
      className="h-5 w-5"
    />

    <span>
      <strong>Rear Basket</strong>
      <br />
      <span className="text-sm text-[#5B6470]">
        +${accessoryPrice}
      </span>
    </span>
  </label>

</div>

                  {cart.length > 0 && (
                    <div className="min-w-0 rounded-2xl border border-[#C8BEAA] bg-white p-5">
                      <p className="text-sm font-bold uppercase text-[#7A7468]">
                        Current Cart
                      </p>

                      {cart.map((item) => {
                        const itemPrice = getBikeRentalPrice(
                          item,
                          durationNumber
                        );
                        const itemTotal = itemPrice * item.quantity;

                        return (
                          <div
                            key={item._id}
                            className="mt-4 flex flex-col gap-4 border-b border-[#C8BEAA] pb-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex w-full min-w-0 items-start gap-4">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-16 w-16 shrink-0 rounded-xl object-contain"
                                />
                              )}

                              <div className="min-w-0">
                                <p className="font-bold text-[#1F2933]">
                                  {item.name}
                                </p>

                                <p className="break-words text-sm text-[#5B6470]">
                                  Bike rental: ${itemPrice} × {item.quantity} = $
                                  {itemTotal}
                                </p>

                                <p className="text-xs text-[#5B6470]">
                                  Stock available: {item.stock}
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => decreaseQuantity(item._id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1F2933] font-bold text-[#1F2933]"
                                  >
                                    -
                                  </button>

                                  <span className="min-w-8 text-center font-bold text-[#1F2933]">
                                    {item.quantity}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => increaseQuantity(item._id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1F2933] font-bold text-[#1F2933]"
                                  >
                                    +
                                  </button>
                                </div>

                                {form.surfboardRack && (
  <p className="mt-2 text-sm text-[#5B6470]">
    Surfboard rack: ${rackPrice}
  </p>
)}

{form.childSeat && (
  <p className="mt-2 text-sm text-[#5B6470]">
    Child seat: ${childSeatPrice}
  </p>
)}

{form.rearBasket && (
  <p className="mt-2 text-sm text-[#5B6470]">
    Rear basket: ${rearBasketPrice}
  </p>
)}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item._id)}
                              className="w-full rounded-full border border-red-500 px-4 py-3 text-sm font-bold text-red-500 sm:w-auto sm:py-2"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}

                      <div className="mt-4 border-t border-[#C8BEAA] pt-4 text-right">
                        <p className="text-lg font-extrabold text-[#1F2933]">
                          Total: ${cartTotal}
                        </p>
                      </div>
                    </div>
                  )}

                  {form.startDate && form.pickupTime && form.duration && (
                    <div className="min-w-0 pt-6">
                      <h3 className="mb-4 text-xl font-bold text-[#1F2933]">
                        2 Available Rental Bikes
                      </h3>

                      <div className="min-w-0 rounded-2xl border border-[#C8BEAA] bg-white p-4 sm:p-6">
                        <div className="grid min-w-0 gap-4 md:grid-cols-3">
                          {bikes.map((bike) => {
                            const cartItem = cart.find(
                              (item) => item._id === bike._id
                            );

                            const bikePrice = getBikeRentalPrice(
                              bike,
                              durationNumber
                            );

                            return (
                              <button
                                type="button"
                                key={bike._id}
                                onClick={() => setModalBike(bike)}
                                className={`relative min-w-0 rounded-2xl border bg-white p-4 text-left transition hover:shadow-md ${
                                  cartItem
                                    ? "border-red-500"
                                    : "border-[#C8BEAA]"
                                }`}
                              >
                                {cartItem && (
                                  <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                                    In Cart: {cartItem.quantity}
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
                                  Stock: {bike.stock}
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#1F2933]">
                                  Price: ${bikePrice}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end border-t border-[#C8BEAA] pt-4">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={cart.length === 0}
                      className="w-full rounded-xl bg-red-500 px-8 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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

                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      type="text"
                      placeholder="Full Name"
                      className="block h-[54px] w-full min-w-0 max-w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] outline-none"
                      required
                    />

                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="Email"
                      className="block h-[54px] w-full min-w-0 max-w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] outline-none"
                      required
                    />
                  </div>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    type="tel"
                    placeholder="Phone Number"
                    className="block h-[54px] w-full min-w-0 max-w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] outline-none"
                    required
                  />

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full min-w-0 max-w-full rounded-xl border border-[#C8BEAA] bg-white px-4 py-3 text-[#1F2933] outline-none"
                    placeholder="Anything we should know?"
                  />

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

                  <div className="min-w-0 rounded-2xl border border-[#C8BEAA] bg-white p-5">
                    <p className="text-sm font-bold uppercase text-[#7A7468]">
                      Order Summary
                    </p>

                    <div className="mt-4 space-y-4">
                      <div className="rounded-xl border border-[#C8BEAA] bg-[#F8F7F2] p-4">
  <p className="text-sm font-bold uppercase text-[#7A7468]">
    Pickup & Return Location
  </p>

  <p className="mt-2 font-bold text-[#1F2933]">
    {form.pickupLocation}
  </p>
</div>
                      {cart.map((item) => {
                        const itemPrice = getBikeRentalPrice(
                          item,
                          durationNumber
                        );
                        const itemTotal = itemPrice * item.quantity;

                        return (
                          <div
                            key={item._id}
                            className="flex flex-col gap-4 border-b border-[#C8BEAA] pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-20 w-20 shrink-0 rounded-xl bg-white object-contain p-1"
                                />
                              )}

                              <div className="min-w-0">
                                <p className="font-bold text-[#1F2933]">
                                  {item.name}
                                </p>

                                <p className="break-words text-sm text-[#5B6470]">
                                  {form.duration === "30"
                                    ? "1 month"
                                    : `${form.duration} day(s)`}{" "}
                                  - ${itemPrice} × {item.quantity}
                                </p>

                                <button
                                  type="button"
                                  onClick={() => {
                                    removeFromCart(item._id);
                                    setStep(1);
                                  }}
                                  className="mt-2 rounded-full border border-red-500 px-4 py-2 text-xs font-bold text-red-500"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <p className="font-bold text-[#1F2933]">
                              ${itemTotal}
                            </p>
                          </div>
                        );
                      })}

                      {form.surfboardRack && (
  <div className="flex items-center justify-between gap-4 border-b border-[#C8BEAA] pb-4">
    <p className="font-bold text-[#1F2933]">Surfboard Rack Add-on</p>
    <p className="font-bold text-[#1F2933]">${rackPrice}</p>
  </div>
)}

{form.childSeat && (
  <div className="flex items-center justify-between gap-4 border-b border-[#C8BEAA] pb-4">
    <p className="font-bold text-[#1F2933]">Child Seat Add-on</p>
    <p className="font-bold text-[#1F2933]">${childSeatPrice}</p>
  </div>
)}

{form.rearBasket && (
  <div className="flex items-center justify-between gap-4 border-b border-[#C8BEAA] pb-4">
    <p className="font-bold text-[#1F2933]">Rear Basket Add-on</p>
    <p className="font-bold text-[#1F2933]">${rearBasketPrice}</p>
  </div>
)}
                    </div>

                    <div className="mt-4 border-t border-[#C8BEAA] pt-4 text-right">
                      <p className="text-xl font-extrabold text-[#1F2933]">
                        Total: ${cartTotal}
                      </p>
                    </div>
                  </div>

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

        <aside className="hidden rounded-3xl bg-white p-4 shadow-sm lg:block">
          <div className="sticky top-28">
            <img
              src="/images/pricing-table.jpeg"
              alt="Wheely Good rental prices"
              className="w-full rounded-2xl object-cover"
            />

            <p className="mt-3 text-center text-sm font-semibold text-[#5B6470]">
              Prices include bike rental only. Surfboard rack is optional.
            </p>
          </div>
        </aside>
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

            <p className="mt-2 text-[#5B6470]">Bike rental package</p>

            <p className="mt-2 font-semibold text-[#1F2933]">
              Total: ${getBikeRentalPrice(modalBike, durationNumber)}
            </p>
          </div>

          <div className="mt-6 border-t border-[#C8BEAA] pt-4">
            <p className="font-semibold text-[#1F2933]">
              Available: {modalBike.stock}
            </p>

            <p className="mt-2 text-sm text-[#5B6470]">
              You can add multiple bikes depending on stock.
            </p>
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