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
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="relative h-[520px] w-full overflow-hidden rounded-3xl bg-white"
        >
          <Image
            src={selectedImage}
            alt={bikeName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain transition duration-300 hover:scale-105"
            priority
          />
        </button>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative h-24 min-w-24 overflow-hidden rounded-2xl border bg-white ${
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6">
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute right-6 top-6 rounded-full border border-white/20 px-5 py-3 text-sm uppercase text-white"
          >
            Close
          </button>

          <div className="relative h-[85vh] w-full max-w-6xl">
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