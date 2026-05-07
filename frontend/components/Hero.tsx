import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0">
        <Image
          src="/images/mono1.jpeg"
          alt="Wheely Good bikes in Byron Bay"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-neutral-300">
          Byron Bay
        </p>

        <h1 className="text-5xl font-extrabold uppercase leading-tight md:text-7xl">
          Wheely Good
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.3em] text-white/60">
  Since 2024
</p>


        <p className="mt-6 text-base text-neutral-200 md:text-lg">
          E-bike rentals and bikes for sale. Simple booking, clean design, and
          everything you need to ride Byron.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/rentals"
            className="rounded-full border border-white px-6 py-3 text-sm font-semibold uppercase transition hover:bg-white hover:text-black"
          >
            Rent a Bike
          </Link>

          <Link
            href="/shop"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase text-black transition hover:opacity-90"
          >
            Shop Bikes
          </Link>
        </div>
      </div>
    </section>
  );
}