import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="px-6 pb-20 md:px-10">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-white/10 bg-white p-8 text-black md:p-12">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
          Start now
        </p>

        <h2 className="mt-3 max-w-3xl text-3xl font-extrabold uppercase md:text-5xl">
          Ready to ride Byron Bay or find your next bike?
        </h2>

        <p className="mt-4 max-w-2xl text-neutral-700">
          Browse rentals, explore bikes for sale, and book in just a few steps.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/booking"
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold uppercase text-white transition hover:opacity-90"
          >
            Book a bike
          </Link>

          <Link
            href="/shop"
            className="rounded-full border border-black px-6 py-3 text-sm font-semibold uppercase transition hover:bg-black hover:text-white"
          >
            Explore shop
          </Link>
        </div>
      </div>
    </section>
  );
}