"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const router = useRouter();

  const [shippingPrice, setShippingPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchShipping = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/shipping`);

        if (!res.ok) {
          throw new Error("Failed to fetch shipping price");
        }

        const data = await res.json();
        setShippingPrice(String(data.value));
      } catch (error) {
        console.error("Error fetching shipping price:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipping();
  }, [API_URL, router]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const value = Number(shippingPrice);

      if (Number.isNaN(value) || value < 0) {
        alert("Please enter a valid shipping price");
        return;
      }

      const res = await fetch(`${API_URL}/settings/shipping`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });

      if (!res.ok) {
        throw new Error("Failed to update shipping price");
      }

      const data = await res.json();
      setShippingPrice(String(data.value));

      alert("Shipping price updated successfully");
    } catch (error) {
      console.error("Error updating shipping price:", error);
      alert("Error updating shipping price");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <p className="text-center text-white/60">Loading settings...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-black px-6 py-24 text-white">
      <button
        onClick={handleLogout}
        className="absolute right-6 top-6 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
      >
        Logout
      </button>

      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-yellow-400">
          Admin Settings
        </p>

        <h1 className="text-4xl font-bold">Shipping Settings</h1>

        <p className="mt-3 text-white/60">
          Change the standard shipping price used in Stripe Checkout.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">
          <label className="block text-sm font-semibold text-white/80">
            Shipping price AUD
          </label>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                $
              </span>

              <input
                type="number"
                value={shippingPrice}
                onChange={(e) => setShippingPrice(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-8 py-4 text-white outline-none focus:border-yellow-400"
                placeholder="150"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-yellow-400 px-8 py-4 font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <p className="mt-4 text-sm text-white/50">
            Current shipping price: ${shippingPrice} AUD
          </p>
        </div>
      </div>
    </main>
  );
}