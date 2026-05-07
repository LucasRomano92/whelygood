"use client";

import { useEffect, useState } from "react";

type Order = {
  _id: string;
  stripeSessionId: string;
  bikeName: string;
  customerName: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  status: string;
  createdAt: string;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string) => {
    try {
      setUpdatingId(orderId);

      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "shipped" }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await res.json();

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <p className="text-center text-gray-400">Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-yellow-400">
            Admin
          </p>
          <h1 className="text-4xl font-bold">Orders</h1>
          <p className="mt-3 text-gray-400">
            View and manage paid shop orders from Stripe.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-gray-400">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="border-b border-white/10 bg-white/10 text-sm uppercase tracking-wider text-gray-300">
                  <tr>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Bike</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Shipping</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const isUpdating = updatingId === order._id;

                    return (
                      <tr
                        key={order._id}
                        className="border-b border-white/10 text-sm transition hover:bg-white/10"
                      >
                        <td className="px-5 py-4 text-gray-300">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-AU"
                          )}
                        </td>

                        <td className="px-5 py-4 font-medium">
                          {order.bikeName}
                        </td>

                        <td className="px-5 py-4 text-gray-300">
                          {order.customerName}
                        </td>

                        <td className="px-5 py-4 text-gray-300">
                          {order.customerEmail}
                        </td>

                        <td className="px-5 py-4 font-semibold text-yellow-400">
                          ${order.amountTotal}{" "}
                          {order.currency?.toUpperCase() || "AUD"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              order.status === "paid"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : order.status === "shipped"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-gray-500/20 text-gray-300"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-300">
                          <div>
                            <p>{order.shippingAddress?.line1}</p>
                            <p>
                              {order.shippingAddress?.city}{" "}
                              {order.shippingAddress?.state}{" "}
                              {order.shippingAddress?.postalCode}
                            </p>
                            <p>{order.shippingAddress?.country}</p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {order.status !== "shipped" && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order._id)
                              }
                              disabled={isUpdating}
                              className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdating
                                ? "Updating..."
                                : "Mark as shipped"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}