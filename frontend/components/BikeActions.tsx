"use client";

import Link from "next/link";

type Props = {
  bikeId: string;
  category?: "rent" | "shop";
};

export default function BikeActions({ bikeId, category }: Props) {
  const isRent = category === "rent";

  const handleCardPayment = async () => {
    try {
      const res = await fetch(
        "http://localhost:4000/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bikeId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error creating payment");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Stripe error:", error);
      alert("Server error creating payment");
    }
  };

  const handlePayPalPayment = async () => {
    try {
      const res = await fetch(
        "http://localhost:4000/payment/paypal/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bikeId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "PayPal error");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("PayPal error:", error);
      alert("Server error creating PayPal payment");
    }
  };

  // 🚲 RENT FLOW
  if (isRent) {
    return (
      <Link
        href={`/booking?bikeId=${bikeId}`}
        className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-white/80"
      >
        Book this bike
      </Link>
    );
  }

  // 🛒 SHOP FLOW
  return (
    <div className="mt-8 flex gap-3">
      <button
        onClick={handleCardPayment}
        className="rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-white/80"
      >
        Card
      </button>

      <button
        onClick={handlePayPalPayment}
        className="rounded-full border border-yellow-400 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
      >
        PayPal
      </button>
    </div>
  );
}