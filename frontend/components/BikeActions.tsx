"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { toast } from "sonner";

type Props = {
  bikeId: string;
  category?: "rent" | "shop";
};

type DeliveryMethod = "pickup" | "delivery";

const libraries: "places"[] = ["places"];

export default function BikeActions({ bikeId, category }: Props) {
  const isRent = category === "rent";

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("pickup");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [shippingLabel, setShippingLabel] = useState("Local Pickup");
  const [deliveryEstimate, setDeliveryEstimate] =
    useState("Pickup from Wheely Good");
  const [isCalculating, setIsCalculating] = useState(false);

  const handlePlaceChanged = async () => {
    const place = autocompleteRef.current?.getPlace();

    if (!place || !place.formatted_address || !place.geometry?.location) {
      toast.error("Please select a valid address from Google");
      return;
    }

    const selectedLat = place.geometry.location.lat();
    const selectedLng = place.geometry.location.lng();

    setDeliveryAddress(place.formatted_address);
    setLat(selectedLat);
    setLng(selectedLng);

    try {
      setIsCalculating(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/calculate-shop-shipping`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: selectedLat,
            lng: selectedLng,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error calculating shipping");
        return;
      }

      setDistanceKm(data.distanceKm);
      setShippingPrice(data.shippingPrice);
      setShippingLabel(data.shippingLabel);
      setDeliveryEstimate(data.deliveryEstimate);

      toast.success("Shipping calculated");
    } catch (error) {
      console.error("Shipping calculation error:", error);
      toast.error("Server error calculating shipping");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCardPayment = async () => {
    try {
      if (deliveryMethod === "delivery") {
        if (!deliveryAddress.trim() || lat === null || lng === null) {
          toast.error("Please select delivery address from Google");
          return;
        }
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bikeId,
            deliveryMethod,
            deliveryAddress,
            lat,
            lng,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error creating payment");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Stripe error:", error);
      toast.error("Server error creating payment");
    }
  };

  const handlePayPalPayment = async () => {
    try {
      toast.error("PayPal shipping update pending. Please use Card for now.");
    } catch (error) {
      console.error("PayPal error:", error);
      toast.error("Server error creating PayPal payment");
    }
  };

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

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
          Delivery Method
        </h3>

        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-4">
            <input
              type="radio"
              name="deliveryMethod"
              checked={deliveryMethod === "pickup"}
              onChange={() => {
                setDeliveryMethod("pickup");
                setDeliveryAddress("");
                setLat(null);
                setLng(null);
                setDistanceKm(null);
                setShippingPrice(0);
                setShippingLabel("Local Pickup");
                setDeliveryEstimate("Pickup from Wheely Good");
              }}
            />
            <span>📍 Local Pickup — Free</span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-4">
            <input
              type="radio"
              name="deliveryMethod"
              checked={deliveryMethod === "delivery"}
              onChange={() => {
                setDeliveryMethod("delivery");
                setDeliveryAddress("");
                setLat(null);
                setLng(null);
                setDistanceKm(null);
                setShippingPrice(0);
                setShippingLabel("Delivery address required");
                setDeliveryEstimate("Select an address to calculate shipping");
              }}
            />
            <span>🚚 Delivery / Shipping Calculator</span>
          </label>
        </div>

        {deliveryMethod === "delivery" && (
          <div className="mt-5 space-y-3">
            {isLoaded ? (
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={handlePlaceChanged}
                options={{
                  componentRestrictions: { country: "au" },
                  fields: ["formatted_address", "geometry", "name"],
                }}
              >
                <input
                  type="text"
                  placeholder="Start typing your delivery address..."
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                />
              </Autocomplete>
            ) : (
              <div className="rounded-xl border border-white/10 bg-black px-4 py-3 text-neutral-400">
                Loading address search...
              </div>
            )}

            {deliveryAddress && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">
                Selected address:
                <br />
                <span className="font-semibold text-white">
                  {deliveryAddress}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 rounded-xl bg-black/40 p-4 text-sm text-neutral-300">
          <p>Method: {shippingLabel}</p>

          {distanceKm !== null && (
            <p className="mt-1">Distance: {distanceKm} km</p>
          )}

          <p className="mt-1">Estimate: {deliveryEstimate}</p>

          <p className="mt-2 text-lg font-bold text-white">
            {isCalculating ? "Calculating..." : `Shipping: $${shippingPrice}`}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCardPayment}
          disabled={isCalculating}
          className="rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Pay Now
        </button>

       
      </div>
    </div>
  );
}