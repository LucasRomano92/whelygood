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

async function getShopBikes() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${API_URL}/bikes`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  const bikes: Bike[] = await res.json();

  return bikes.filter(
    (bike) => bike.category === "shop" && bike.isActive === true
  );
}

export default async function ShopPage() {
  const bikes = await getShopBikes();

  return (
  <main className="min-h-screen px-6 py-16 md:px-10">
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[#7A7468]">
            Shop
          </p>

          <h1 className="mt-3 text-4xl font-extrabold uppercase text-[#1F2933] md:text-6xl">
            Bikes for sale
          </h1>

          <p className="mt-4 max-w-2xl text-[#5B6470]">
            Explore our available bikes and enquire directly.
          </p>
        </div>
      </div>

      {bikes.length === 0 ? (
        <div className="rounded-3xl border border-[#C8BEAA] bg-[#DDD5C4]/60 p-8 text-[#5B6470]">
          No bikes for sale available yet.
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