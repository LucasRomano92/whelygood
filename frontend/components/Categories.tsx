import Link from "next/link";

export default function Categories() {
  return (
    <section className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
            Explore
          </p>
          <h2 className="mt-3 text-3xl font-bold uppercase md:text-4xl">
            Ride or buy
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-[#D4CCBC] bg-[#DDD5C4]/60 p-8">
            <p className="text-sm uppercase tracking-[0.2em]text-[#7A7468]">
              Rentals
            </p>
            <h3 className="mt-4 text-2xl font-bold uppercase">
              Rent an e-bike
            </h3>
            <p className="mt-4 max-w-md text-[#6B7280]">
              Book a bike for a few hours or for the whole day and enjoy Byron
              Bay in a simple way.
            </p>
            <Link
              href="/rentals"
              className="mt-6 inline-block rounded-full border border-white px-5 py-3 text-sm font-semibold uppercase transition hover:bg-white hover:text-black"
            >
              View rentals
            </Link>
          </article>

          <article className="rounded-3xl border border-[#C8BEAA] bg-[#DDD5C4]/60 p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              Shop
            </p>
            <h3 className="mt-4 text-2xl font-bold uppercase">
              Buy your bike
            </h3>
            <p className="mt-4 max-w-md text-[#6B7280]">
              Explore bikes for sale with a clean product view and a simple
              path to contact or purchase.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase text-black transition hover:opacity-90"
            >
              View shop
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}