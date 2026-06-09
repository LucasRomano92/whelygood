"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setOpen(false);

  const links = ["Home", "Rentals", "Shop", "Booking"];

  const getHref = (item: string) =>
    item === "Home" ? "/" : `/${item.toLowerCase()}`;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled || open
  ? "border-[#D4CCBC] bg-[#E7E0D0]/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
  : "border-transparent bg-[#E7E0D0]/85 backdrop-blur-md"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 md:px-10 ${
          scrolled ? "py-0" : "py-2"
        }`}
      >
        <Link href="/" className="flex-shrink-0" onClick={closeMenu}>
          <Image
            src="/images/logo4.png"
            alt="Wheely Good"
            width={scrolled ? 150 : 180}
            height={scrolled ? 60 : 70}
            className="object-contain transition-all duration-300 hover:scale-105"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 md:flex">
          {links.map((item) => {
            const href = getHref(item);
            const isActive = pathname === href;

            return (
              <Link
                key={item}
                href={href}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:scale-105 ${
                  isActive
                    ? "bg-white text-black"
                    : "text-[#4B5563] hover:bg-white/90 hover:text-black"
                }`}
              >
                {item}
              </Link>
            );
          })}

          
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 md:hidden"        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
  <nav className="border-t border-[#C8BEAA] bg-[#E7E0D0]/95 px-6 py-4 backdrop-blur-xl md:hidden">
    <div className="flex flex-col gap-3">
      {links.map((item) => {
        const href = getHref(item);
        const isActive = pathname === href;

        return (
          <Link
            key={item}
            href={href}
            onClick={closeMenu}
            className={`rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${
              isActive
                ? "bg-[#1F2933] text-white"
                : "bg-[#F8F7F2] text-[#4B5563] hover:scale-[1.02] hover:bg-white hover:text-[#1F2933]"
            }`}
          >
            {item}
          </Link>
        );
      })}

      <Link
        href="/admin/login"
        onClick={closeMenu}
        className="rounded-xl border border-[#C8BEAA] bg-[#F8F7F2] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#1F2933] transition-all duration-300 hover:scale-[1.02] hover:bg-[#1F2933] hover:text-white"
      >
        Admin
      </Link>
    </div>
  </nav>
)}
    </header>
  );
}