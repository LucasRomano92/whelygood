import BikeGallery from "@/components/BikeGallery";
import BikeActions from "@/components/BikeActions";

type Bike = {
  _id: string;
  name: string;
  model: string;
  description: string;
  price: number;
  image: string;
  galleryImages?: string[];
  videoUrl?: string;
  features?: string[];
  category?: "rent" | "shop";
};

async function getBike(id: string): Promise<Bike | null> {
const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/bikes/${id}`,
    {
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json();
}

export default async function BikeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bike = await getBike(id);

  if (!bike) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Bike not found
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <BikeGallery
          mainImage={bike.image}
          galleryImages={bike.galleryImages}
          bikeName={bike.name}
        />

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            {bike.model}
          </p>

          <h1 className="mt-3 text-4xl font-bold uppercase">{bike.name}</h1>

          <p className="mt-4 text-2xl font-semibold">
            ${bike.price} {bike.category === "rent" ? "/ day" : ""}
          </p>

          <p className="mt-6 leading-7 text-neutral-300">{bike.description}</p>

          {bike.features && bike.features.length > 0 && (
            <ul className="mt-6 space-y-2">
              {bike.features.map((feature, i) => (
                <li key={i} className="text-sm text-neutral-400">
                  • {feature}
                </li>
              ))}
            </ul>
          )}

          <BikeActions bikeId={bike._id} category={bike.category} />

          {bike.videoUrl && (
            <div className="mt-8">
              <video src={bike.videoUrl} controls className="w-full rounded-xl" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}