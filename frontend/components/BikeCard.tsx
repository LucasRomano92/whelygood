"use client";

import Image from "next/image";
import Link from "next/link";

type Bike = {
  _id: string;
  name: string;
  model: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category?: "rent" | "shop";
};

export default function BikeCard({ bike }: { bike: Bike }) {
  const isRent = bike.category === "rent";

  const stockDotColor =
    bike.stock >= 4
      ? "bg-green-500"
      : bike.stock >= 2
      ? "bg-orange-500"
      : "bg-red-500";

  const stockLabel =
    bike.stock > 0 ? `${bike.stock} available` : "Out of stock";

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#C8BEAA] bg-[#DDD5C4]/60 transition hover:-translate-y-1 hover:border-[#B8AC96]">
      {isRent ? (
        <div className="block">
          <div className="relative h-64 w-full overflow-hidden bg-black">
            <Image
              src={bike.image}
              alt={bike.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-6 pb-0">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7A7468]">
              {bike.model}
            </p>

            <div className="mt-3 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold uppercase leading-tight text-[#1F2933]">
                {bike.name}
              </h2>

              <p className="whitespace-nowrap text-base font-semibold text-[#1F2933]">
                ${bike.price} / day
              </p>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#5B6470]">
              {bike.description}
            </p>
          </div>
        </div>
      ) : (
        <Link href={`/shop/${bike._id}`} className="block">
          <div className="relative h-64 w-full overflow-hidden bg-black">
            <Image
              src={bike.image}
              alt={bike.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-6 pb-0">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7A7468]">
              {bike.model}
            </p>

            <div className="mt-3 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold uppercase leading-tight text-[#1F2933]">
                {bike.name}
              </h2>

              <p className="whitespace-nowrap text-base font-semibold text-[#1F2933]">
                ${bike.price}
              </p>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#5B6470]">
              {bike.description}
            </p>
          </div>
        </Link>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C8BEAA] bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1F2933]">
            <span className={`h-2.5 w-2.5 rounded-full ${stockDotColor}`} />
            {stockLabel}
          </div>

          {isRent ? (
            <Link
              href={`/booking?bikeId=${bike._id}`}
              className="inline-block rounded-full border border-[#1F2933] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1F2933] transition hover:bg-[#1F2933] hover:text-white"
            >
              Book now
            </Link>
          ) : (
            <Link
              href={`/shop/${bike._id}`}
              className="rounded-full border border-[#1F2933] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1F2933] transition hover:bg-[#1F2933] hover:text-white"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}