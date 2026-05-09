"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Order = {
  _id: string;
  customerName: string;
  customerEmail: string;
  bikeName: string;
  amountTotal: number;
  shippingPrice?: number;
  shippingAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  paymentStatus: string;
  orderStatus?: string;
  createdAt: string;
};

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

  const fetchOrders = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to fetch orders");
        return;
      }

      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleMarkShipped = async (id: string) => {
    try {
      setUpdatingId(id);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken");

      const res = await fetch(`${API_URL}/api/orders/${id}/ship`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update order");
        return;
      }

      toast.success("Order marked as shipped");

      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Error updating order");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6">
      <div className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => router.push("/admin")}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
        >
          Admin
        </button>

        <button
          onClick={() => router.back()}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
        >
          Back
        </button>

        <button
          onClick={() => router.push("/")}
          className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
        >
          Website
        </button>
      </div>

      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">Orders</h1>

        <p className="mt-3 text-white/60">
          Manage paid shop orders and shipping status.
        </p>

        {loading ? (
          <div className="mt-10 text-white/50">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
            No orders found.
          </div>
        ) : (
          <>
            {/* MOBILE CARDS */}
            <div className="mt-10 flex flex-col gap-5 md:hidden">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">
                        {order.bikeName}
                      </h2>

                      <p className="mt-1 text-sm text-white/50">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        order.orderStatus === "shipped"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {order.orderStatus || "paid"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div>
                      <p className="text-white/40">Customer</p>
                      <p>{order.customerName}</p>
                    </div>

                    <div>
                      <p className="text-white/40">Email</p>
                      <p className="break-all">{order.customerEmail}</p>
                    </div>

                    <div>
                      <p className="text-white/40">Total</p>
                      <p>${order.amountTotal}</p>
                    </div>

                    {order.shippingAddress && (
                      <div>
                        <p className="text-white/40">Shipping address</p>

                        <p>
                          {order.shippingAddress.line1}
                          <br />
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}
                          <br />
                          {order.shippingAddress.postal_code}
                          <br />
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    )}
                  </div>

                  {order.orderStatus !== "shipped" && (
                    <button
                      onClick={() => handleMarkShipped(order._id)}
                      disabled={updatingId === order._id}
                      className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/80 disabled:opacity-50"
                    >
                      {updatingId === order._id
                        ? "Updating..."
                        : "Mark as shipped"}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="mt-10 hidden overflow-x-auto rounded-3xl border border-white/10 bg-white/5 md:block">
              <table className="min-w-full">
                <thead className="border-b border-white/10 text-left text-sm text-white/50">
                  <tr>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Bike</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Email</th>
                    <th className="px-6 py-5">Total</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-white/5"
                    >
                      <td className="px-6 py-5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-5">{order.bikeName}</td>

                      <td className="px-6 py-5">
                        {order.customerName}
                      </td>

                      <td className="px-6 py-5">
                        {order.customerEmail}
                      </td>

                      <td className="px-6 py-5">
                        ${order.amountTotal}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            order.orderStatus === "shipped"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {order.orderStatus || "paid"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {order.orderStatus !== "shipped" && (
                          <button
                            onClick={() =>
                              handleMarkShipped(order._id)
                            }
                            disabled={updatingId === order._id}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/80 disabled:opacity-50"
                          >
                            {updatingId === order._id
                              ? "Updating..."
                              : "Mark shipped"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}