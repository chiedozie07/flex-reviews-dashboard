"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Github, Building2 } from "lucide-react";


// dynamic nav items
const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Properties", href: "/properties" },
  { label: "About", href: "/about" },
  {
    label: "GitHub",
    href: "https://github.com/chiedozie07/flex-reviews-dashboard",
    external: true,
    icon: Github,
  },
];

export default function AppHeader() {
  const [open, setOpen] = useState(false);

  // direct Supabase asset URL (decoded from theflex proxy URL)
  const logoSrc = "https://lsmvmmgkpbyqhthzdexc.supabase.co/storage/v1/object/public/website/Uploads/White_V3%20Symbol%20%26%20Wordmark.png";

  return (
    <header className="w-full bg-[#F7F7F7] backdrop-blur sticky top-0 z-50 shadow-md">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* app logo */}
        <Link href="/" className="flex items-center gap-2">
        <Building2 className="w-7 h-7 text-black" />
          {/* <Image
            src={logoSrc}
            alt="Flex Logo"
            width={34}
            height={34}
            className="object-contain"
            priority={true}
          /> */}
          <span className="font-bold text-xl text-gray-800">Flex Reviews</span>
        </Link>

        {/* desktop nav */}
        <ul className="hidden md:flex items-center gap-6 font-medium text-gray-700">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-black transition"
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {item.label}
                </a>
              ) : (
                <Link href={item.href} className="hover:text-black transition">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* mobile menu button */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-100 transition"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* moblie nav dropdown */}
      {open && (
        <div className="md:hidden border-t bg-white shadow-sm">
          <ul className="flex flex-col py-3 px-6 text-gray-700 font-semibold space-y-3">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-2"
                    onClick={() => setOpen(false)}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-2"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};
