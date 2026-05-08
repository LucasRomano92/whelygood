"use client";

export default function WhatsAppButton() {
  const phone = "61493786925"; // 👈 poné tu número sin +
  const message = "Hi! I'm interested in renting a bike 🚴";

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-green-500 px-5 py-3 text-white shadow-lg transition hover:scale-105 hover:bg-green-600"
    >
      <span className="text-sm font-medium">Chat on WhatsApp</span>
    </a>
  );
}