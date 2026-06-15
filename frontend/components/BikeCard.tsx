"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

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

  const handleBuyNow = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bikeId: bike._id }),
        }
      );

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Error creating payment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment error");
    }
  };

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#C8BEAA] bg-[#DDD5C4]/60 transition hover:-translate-y-1 hover:border-[#B8AC96]">
      <Link href={`/bikes/${bike._id}`} className="block">
        <div className="relative h-64 w-full">
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
              ${bike.price} {isRent ? "/ day" : ""}
            </p>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#5B6470]">
            {bike.description}
          </p>
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-[#7A7468]">
            {isRent
              ? bike.stock > 0
                ? `${bike.stock} available`
                : "Out of stock"
              : "For sale"}
          </span>

          {isRent ? (
            <Link
              href={`/booking?bikeId=${bike._id}`}
              className="inline-block rounded-full border border-[#1F2933] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1F2933] transition hover:bg-[#1F2933] hover:text-white"
            >
              Book now
            </Link>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleBuyNow}
                className="rounded-full border border-[#1F2933] px-4 py-2 text-xs uppercase text-[#1F2933] transition hover:bg-[#1F2933] hover:text-white"
              >
                PAY NOW
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}