"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

type Order = {
  _id: string;
  bikeName: string;
  customerName: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  status: "paid" | "shipped";
  createdAt: string;
  shippingAddress?: {
    line1?: string;
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setOrders(data);
    } catch (error) {
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const updateOrderStatus = async (orderId: string) => {
    try {
      setUpdatingId(orderId);

      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "shipped" }),
      });

      const updatedOrder = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );

      toast.success("Order shipped 🚴‍♂️");
    } catch {
      toast.error("Error updating order");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        <h1 className="mb-10 text-4xl font-bold">Orders</h1>

        {orders.length === 0 ? (
          <p className="text-gray-400">No orders yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full text-left">
              <thead className="border-b border-white/10 text-sm text-gray-400">
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
                      className="border-b border-white/10 text-sm"
                    >
                      <td className="px-5 py-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">{order.bikeName}</td>

                      <td className="px-5 py-4">
                        {order.customerName}
                      </td>

                      <td className="px-5 py-4">
                        {order.customerEmail}
                      </td>

                      <td className="px-5 py-4 text-yellow-400 font-bold">
                        ${order.amountTotal} {order.currency?.toUpperCase()}
                      </td>

                      {/* ✅ STATUS LIMPIO */}
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            order.status === "paid"
                              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {order.shippingAddress?.line1}
                        <br />
                        {order.shippingAddress?.city}
                      </td>

                      {/* ✅ BOTÓN SOLO SI PAID */}
                      <td className="px-5 py-4">
                        {order.status === "paid" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order._id)
                            }
                            disabled={isUpdating}
                            className="rounded-full bg-blue-500 px-4 py-2 text-xs text-white disabled:opacity-50"
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
        )}
      </div>
    </main>
  );
}