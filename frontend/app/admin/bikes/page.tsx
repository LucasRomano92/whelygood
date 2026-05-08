"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Bike = {
  _id: string;
  name: string;
  model: string;
  description: string;
  price: number;
  image: string;
  galleryImages?: string[];
  features?: string[];
  videoUrl?: string;
  category: "rent" | "shop";
  isActive: boolean;
};

export default function AdminBikesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loadingBikes, setLoadingBikes] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    model: "",
    description: "",
    price: "",
    image: "",
    galleryImages: [] as string[],
    featuresText: "",
    videoUrl: "",
    category: "rent",
    isActive: true,
  });

  const getToken = () => {
    return localStorage.getItem("adminToken") || localStorage.getItem("token");
  };

  const fetchBikes = async () => {
    try {
      setLoadingBikes(true);

      const res = await fetch("http://localhost:4000/bikes");
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error loading bikes");
        return;
      }

      setBikes(data);
    } catch (error) {
      console.error(error);
      toast.error("Error loading bikes");
    } finally {
      setLoadingBikes(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      model: "",
      description: "",
      price: "",
      image: "",
      galleryImages: [],
      featuresText: "",
      videoUrl: "",
      category: "rent",
      isActive: true,
    });

    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;

    if (target.name === "isActive") {
      setForm({
        ...form,
        isActive: (target as HTMLInputElement).checked,
      });
      return;
    }

    setForm({
      ...form,
      [target.name]: target.value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);

      const res = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Upload failed");
        return;
      }

      setForm((prev) => ({
        ...prev,
        image: data.url,
      }));

      toast.success("Main image uploaded ✅");
    } catch (error) {
      console.error(error);
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    try {
      setUploading(true);

      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("image", files[i]);

        const res = await fetch("http://localhost:4000/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      setForm((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...uploadedUrls],
      }));

      toast.success("Gallery images uploaded ✅");
    } catch (error) {
      console.error(error);
      toast.error("Gallery upload error");
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.image) {
      toast.error("Please upload a main image first");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const payload = {
        name: form.name,
        model: form.model,
        description: form.description,
        price: Number(form.price),
        image: form.image,
        galleryImages: form.galleryImages,
        features: form.featuresText
          .split("\n")
          .map((feature) => feature.trim())
          .filter((feature) => feature !== ""),
        videoUrl: form.videoUrl,
        category: form.category,
        isActive: form.isActive,
      };

      const url = editingId
        ? `http://localhost:4000/bikes/${editingId}`
        : "http://localhost:4000/bikes";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      toast.success(editingId ? "Bike updated ✅" : "Bike created ✅");

      resetForm();
      await fetchBikes();
    } catch (error) {
      console.error(error);
      toast.error("Error saving bike");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (bike: Bike) => {
    setEditingId(bike._id);

    setForm({
      name: bike.name,
      model: bike.model || "",
      description: bike.description,
      price: String(bike.price),
      image: bike.image,
      galleryImages: bike.galleryImages || [],
      featuresText: bike.features?.join("\n") || "",
      videoUrl: bike.videoUrl || "",
      category: bike.category,
      isActive: bike.isActive,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this bike?");

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const token = getToken();

    const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/bikes/${id}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      if (!res.ok) {
        toast.error("Error deleting bike");
        return;
      }

      toast.success("Bike deleted 🗑️");
      await fetchBikes();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting bike");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">Admin Bikes</h1>

        <p className="mt-2 text-white/60">
          Create, edit and manage bikes for Rentals and Shop.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="text-2xl font-semibold">
            {editingId ? "Edit bike" : "Create new bike"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Bike name"
              required
              disabled={saving}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none disabled:opacity-50"
            />

            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="Model"
              disabled={saving}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none disabled:opacity-50"
            />

            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              required
              disabled={saving}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none disabled:opacity-50"
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={saving}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none disabled:opacity-50"
            >
              <option value="rent">Rentals</option>
              <option value="shop">Shop</option>
            </select>
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            required
            rows={4}
            disabled={saving}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none disabled:opacity-50"
          />

          <textarea
            name="featuresText"
            value={form.featuresText}
            onChange={handleChange}
            placeholder={`Features / specs (one per line)
Example:
Aluminium frame
Disc brakes
Helmet included`}
            rows={5}
            disabled={saving}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none disabled:opacity-50"
          />

          <input
            name="videoUrl"
            value={form.videoUrl}
            onChange={handleChange}
            placeholder="Video URL optional"
            disabled={saving}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none disabled:opacity-50"
          />

          <div className="space-y-3 rounded-2xl border border-white/10 bg-black p-4">
            <label className="block text-sm font-semibold text-white">
              Main bike image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading || saving}
              className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-5 file:py-2 file:font-semibold file:text-black disabled:opacity-50"
            />

            {uploading && (
              <p className="text-sm text-yellow-300">Uploading...</p>
            )}

            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="h-48 w-full max-w-md rounded-xl object-cover"
              />
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-black p-4">
            <label className="block text-sm font-semibold text-white">
              Gallery images
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              disabled={uploading || saving}
              className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-5 file:py-2 file:font-semibold file:text-black disabled:opacity-50"
            />

            {form.galleryImages.length > 0 && (
              <div className="grid gap-3 md:grid-cols-4">
                {form.galleryImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`gallery-${index}`}
                      className="h-28 w-full rounded-xl object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      disabled={saving}
                      className="absolute right-2 top-2 rounded-full bg-black/80 px-3 py-1 text-xs text-white disabled:opacity-50"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              disabled={saving}
            />
            Show this bike on website
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading || saving}
              className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? editingId
                  ? "Updating..."
                  : "Creating..."
                : editingId
                ? "Update bike"
                : "Create bike"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Current bikes</h2>

          {loadingBikes ? (
            <p className="mt-6 text-white/50">Loading bikes...</p>
          ) : bikes.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
              No bikes yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {bikes.map((bike) => {
                const isDeleting = deletingId === bike._id;

                return (
                  <div
                    key={bike._id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                  >
                    {bike.image?.startsWith("http") ? (
                      <img
                        src={bike.image}
                        alt={bike.name}
                        className="h-52 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-52 w-full items-center justify-center bg-white/10 text-sm text-white/50">
                        No valid image
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {bike.name}
                          </h3>
                          <p className="text-sm text-white/50">{bike.model}</p>
                        </div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                          {bike.category}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-white/60">
                        {bike.description}
                      </p>

                      <p className="mt-4 text-lg font-bold">${bike.price}</p>

                      <p className="mt-2 text-sm">
                        Gallery: {bike.galleryImages?.length || 0} images
                      </p>

                      <p className="mt-2 text-sm">
                        Status:{" "}
                        <span
                          className={
                            bike.isActive ? "text-green-400" : "text-red-400"
                          }
                        >
                          {bike.isActive ? "Active" : "Hidden"}
                        </span>
                      </p>

                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => handleEdit(bike)}
                          disabled={isDeleting || saving}
                          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(bike._id)}
                          disabled={isDeleting || saving}
                          className="rounded-full border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}