"use client";

import Image from "next/image";
import { useState } from "react";

type BikeGalleryProps = {
  mainImage: string;
  galleryImages?: string[];
  bikeName: string;
};

export default function BikeGallery({
  mainImage,
  galleryImages = [],
  bikeName,
}: BikeGalleryProps) {
  const images = [mainImage, ...galleryImages];
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [zoomOpen, setZoomOpen] = useState(false);

 return (
  <>
    <div className="w-full space-y-4 overflow-hidden">
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        className="relative h-[300px] w-full overflow-hidden rounded-3xl bg-black sm:h-[420px] lg:h-[520px]"
      >
        <Image
          src={selectedImage}
          alt={bikeName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-300 hover:scale-105"
          priority
        />
      </button>

      <div className="flex w-full gap-3 overflow-x-auto pb-2">
        {images.map((img, index) => (
          <button
            key={`${img}-${index}`}
            type="button"
            onClick={() => setSelectedImage(img)}
            className={`relative h-20 min-w-20 overflow-hidden rounded-2xl border bg-black sm:h-24 sm:min-w-24 ${
              selectedImage === img ? "border-white" : "border-white/10"
            }`}
          >
            <Image
              src={img}
              alt={`${bikeName} ${index + 1}`}
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>

    {zoomOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => setZoomOpen(false)}
          className="absolute right-4 top-4 rounded-full border border-white/20 px-4 py-2 text-xs uppercase text-white sm:right-6 sm:top-6 sm:px-5 sm:py-3 sm:text-sm"
        >
          Close
        </button>

        <div className="relative h-[75vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-black sm:h-[85vh]">
          <Image
            src={selectedImage}
            alt={bikeName}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </div>
    )}
  </>
);
}