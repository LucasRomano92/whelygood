import Image from "next/image";
import BikeCard from "@/components/BikeCard";

type Bike = {
  _id: string;
  name: string;
  model: string;
  description: string;
  price: number;
  image: string;
  category: "rent" | "shop";
  isActive: boolean;
  stock: number;
};

async function getRentalBikes() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${API_URL}/bikes`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  const bikes: Bike[] = await res.json();

  return bikes.filter(
    (bike) => bike.category === "rent" && bike.isActive === true
  );
}

export default async function RentalsPage() {
  const bikes = await getRentalBikes();

  return (
    <main className="min-h-screen px-6 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.25em] text-[#7A7468]">
            Rentals
          </p>

          <h1 className="mt-3 text-4xl font-extrabold uppercase text-[#1F2933] md:text-6xl">
            Rent a bike
          </h1>

          <p className="mt-4 max-w-2xl text-[#5B6470]">
            Choose the bike that fits your ride and book it with a simple form.
          </p>
        </div>

        {bikes.length === 0 ? (
          <div className="rounded-3xl border border-[#C8BEAA] bg-[#DDD5C4]/60 p-8 text-[#5B6470]">
            No rental bikes available yet.
          </div>
        ) : (
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="grid gap-8">
              {bikes.map((bike) => (
                <BikeCard key={bike._id} bike={bike} />
              ))}
            </div>

            <div className="overflow-hidden rounded-[28px]">
              <Image
                src="/images/rental-pricing.jpeg"
                alt="Wheely Good rental pricing"
                width={1080}
                height={1620}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}