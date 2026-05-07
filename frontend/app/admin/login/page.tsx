"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/admin/login", {
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

      // 💾 guardar token
      localStorage.setItem("token", data.token);

      // 🚀 ir al admin
      router.push("/admin");

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleLogin}
        className="bg-white/10 p-8 rounded-2xl w-[320px] space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Admin Login</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 rounded bg-black border border-white/20"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-black border border-white/20"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-white text-black py-2 rounded hover:bg-gray-200"
        >
          Login
        </button>
      </form>
    </div>
  );
}