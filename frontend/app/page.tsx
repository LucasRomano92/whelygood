import Categories from "@/components/Categories";
import FinalCTA from "@/components/FinalCTA";
import Hero from "@/components/Hero";
import WhyRide from "@/components/WhyRide";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <Categories />
      <WhyRide />
      <FinalCTA />
    </main>
  );
}