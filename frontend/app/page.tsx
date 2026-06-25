import Categories from "@/components/Categories";
import FinalCTA from "@/components/FinalCTA";
import Hero from "@/components/Hero";
import WhyRide from "@/components/WhyRide";

type HeroSlide = {
  _id: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
};

async function getHeroSlides(): Promise<HeroSlide[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${API_URL}/api/hero`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    return await res.json();
  } catch (error) {
    console.error("Error loading hero slides:", error);
    return [];
  }
}

export default async function Home() {
  const slides = await getHeroSlides();

  return (
    <main className="min-h-screen">
      <Hero slides={slides} />
      <Categories />
      <WhyRide />
      <FinalCTA />
    </main>
  );
}