"use client";

import { FiMail } from "react-icons/fi";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function Footer() {
  const address = "88-94 Centennial Cct, Byron Bay NSW 2481";
  const encodedAddress = encodeURIComponent(address);

  return (
    <footer className="border-t border-white/10 bg-black px-6 py-14 text-white md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
        {/* LEFT */}
        <div>
          <p className="text-xl font-extrabold uppercase tracking-[0.25em]">
            Wheely Good
          </p>

          <p className="mt-4 max-w-md text-sm leading-6 text-neutral-400">
            E-bike rentals and bikes for sale in Byron Bay. Simple booking,
            clean design and a smooth customer experience.
          </p>

          <p className="mt-4 text-sm text-neutral-500">{address}</p>

          <div className="mt-7 space-y-4 text-sm text-neutral-400">
            <a
              href="mailto:info@wheelygood.com"
              className="flex w-fit items-center gap-3 transition hover:text-white"
            >
              <FiMail size={18} />
              wheelygoodteam@gmail.com
            </a>

            <a
              href="https://wa.me/61400000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-3 transition hover:text-green-400"
            >
              <FaWhatsapp size={18} />
              +61493786925
            </a>

            <a
              href="https://www.instagram.com/wheelygood_byronbay/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-fit items-center gap-3 transition"
            >
              <span className="rounded-md bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1 text-white transition group-hover:scale-110">
                <FaInstagram size={16} />
              </span>
              <span className="transition group-hover:text-pink-400">
                @wheelygood_byronbay
              </span>
            </a>
          </div>
        </div>

        {/* RIGHT MAP */}
        <div className="flex w-full flex-col items-center justify-center">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full max-w-[520px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10"
          >
            <div className="overflow-hidden rounded-2xl">
              <iframe
                src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
                width="100%"
                height="260"
                style={{ border: 0 }}
                loading="lazy"
                className="pointer-events-none grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
              />
            </div>
          </a>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-full border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300 transition hover:bg-white hover:text-black"
          >
            Get Directions
          </a>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Wheely Good. All rights reserved.</p>
        <p>Byron Bay · E-bike rentals · Bike sales</p>
      </div>
    </footer>
  );
}