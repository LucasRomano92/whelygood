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
};

async function getRentalBikes() {
  const res = await fetch("http://localhost:4000/bikes", {
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
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
              Rentals
            </p>

            <h1 className="mt-3 text-4xl font-extrabold uppercase md:text-6xl">
              Rent a bike
            </h1>

            <p className="mt-4 max-w-2xl text-neutral-300">
              Choose the bike that fits your ride and book it with a simple form.
            </p>
          </div>

        
        </div>

        {bikes.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-neutral-300">
            No rental bikes available yet.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {bikes.map((bike) => (
              <BikeCard key={bike._id} bike={bike} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}