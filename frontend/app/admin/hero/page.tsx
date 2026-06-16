"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type HeroSlide = {
  _id: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
};

export default function AdminHeroPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [uploadingOrder, setUploadingOrder] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState<number | null>(null);

  const getToken = () =>
    localStorage.getItem("token") || localStorage.getItem("adminToken");

  const fetchSlides = async () => {
    const token = getToken();

    if (!token) {
      router.push("/admin/login");
      return;
    }

    const res = await fetch(`${API_URL}/api/hero/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Error loading slides");
      return;
    }

    setSlides(data);
  };

  useEffect(() => {
    fetchSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSlideByOrder = (order: number) => {
    return slides.find((slide) => slide.order === order);
  };

  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    order: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = getToken();

    if (!token) {
      router.push("/admin/login");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingOrder(order);

      const uploadRes = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        toast.error(uploadData.message || "Upload failed");
        return;
      }

      const existingSlide = getSlideByOrder(order);

      const payload = {
        imageUrl: uploadData.url,
        order,
        isActive: true,
      };

      setSavingOrder(order);

      const saveRes = await fetch(
        existingSlide
          ? `${API_URL}/api/hero/${existingSlide._id}`
          : `${API_URL}/api/hero`,
        {
          method: existingSlide ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        toast.error(saveData.message || "Error saving slide");
        return;
      }

      toast.success(`Slide ${order} saved`);
      await fetchSlides();
    } catch (error) {
      console.error(error);
      toast.error("Error uploading slide");
    } finally {
      setUploadingOrder(null);
      setSavingOrder(null);
    }
  };

  const deleteSlide = async (order: number) => {
    const slide = getSlideByOrder(order);
    if (!slide) return;

    const confirmDelete = confirm(`Delete slide ${order}?`);
    if (!confirmDelete) return;

    const token = getToken();

    if (!token) {
      router.push("/admin/login");
      return;
    }

    const res = await fetch(`${API_URL}/api/hero/${slide._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      toast.error("Error deleting slide");
      return;
    }

    toast.success(`Slide ${order} deleted`);
    await fetchSlides();
  };

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6">
      <div className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => router.push("/admin")}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
        >
          Home
        </button>

        <button
          onClick={() => router.back()}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
        >
          Back
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("adminToken");
            toast.success("Logged out successfully");
            router.push("/admin/login");
          }}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          Logout
        </button>
      </div>

      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Hero Carousel</h1>

        <p className="mt-2 text-white/60">
          Upload up to 3 images for the homepage carousel.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((order) => {
            const slide = getSlideByOrder(order);
            const isLoading =
              uploadingOrder === order || savingOrder === order;

            return (
              <div
                key={order}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Slide {order}</h2>

                  {slide ? (
                    <span className="rounded-full bg-green-400 px-3 py-1 text-xs font-bold text-black">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                      Empty
                    </span>
                  )}
                </div>

                {slide?.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={`Hero slide ${order}`}
                    className="h-52 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-52 w-full items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black text-white/40">
                    No image uploaded
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadImage(e, order)}
                    disabled={isLoading}
                    className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black disabled:opacity-50"
                  />

                  {isLoading && (
                    <p className="text-sm text-yellow-300">Saving image...</p>
                  )}

                  {slide && (
                    <button
                      onClick={() => deleteSlide(order)}
                      disabled={isLoading}
                      className="w-full rounded-full border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-300 disabled:opacity-50"
                    >
                      Delete Slide {order}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}