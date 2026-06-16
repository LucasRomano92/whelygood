"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type HeroSlide = {
  _id: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
};

export default function Hero() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${API_URL}/api/hero`);
        const data = await res.json();

        if (!res.ok) return;

        setSlides(data);
      } catch (error) {
        console.error("Error loading hero slides:", error);
      }
    };

    fetchSlides();
  }, [API_URL]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const fallbackImage = "/images/mono1.jpeg";
  const activeImage = slides[currentSlide]?.imageUrl || fallbackImage;

  return (
    <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0">
        {slides.length > 0 ? (
          slides.map((slide, index) => (
            <Image
              key={slide._id}
              src={slide.imageUrl}
              alt={`Wheely Good hero slide ${index + 1}`}
              fill
              priority={index === 0}
              className={`object-cover transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        ) : (
          <Image
            src={activeImage}
            alt="Wheely Good bikes in Byron Bay"
            fill
            priority
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="mt-6 text-base font-medium text-white drop-shadow-md md:text-lg">
          E-bike rentals and bikes for sale. Simple booking, clean design, and
          everything you need to ride Byron.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/rentals"
            className="rounded-full border border-white px-6 py-3 text-sm font-semibold uppercase text-white transition hover:bg-white hover:text-black"
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

        {slides.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide._id}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}