"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLogin() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ username, password }),
});

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      // 💾 guardar token (FIX CLAVE)
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("token", data.token); // backup

      toast.success("Welcome admin 🚴‍♂️");

      // 🚀 ir al admin
      router.push("/admin");

    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <form
        onSubmit={handleLogin}
        className="w-[320px] space-y-4 rounded-2xl bg-white/10 p-8"
      >
        <h2 className="text-center text-2xl font-bold">Admin Login</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full rounded border border-white/20 bg-black p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded border border-white/20 bg-black p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-white py-2 text-black transition hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}