import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h1 className="text-3xl font-bold uppercase">Payment successful ✅</h1>

        <p className="mt-4 text-neutral-300">
          Thank you for your purchase. Wheely Good will contact you shortly.
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold uppercase text-black"
        >
          Back to shop
        </Link>
      </div>
    </main>
  );
}