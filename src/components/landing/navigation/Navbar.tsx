"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Our Story", href: "#story" },
    { name: "Safety & Trust", href: "#safety" },
    { name: "Browse Menu", href: "#chefs" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#f5f3f0]">
      <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-brand-teal">
              <span className="material-symbols-outlined">soup_kitchen</span>
            </div>
            <h2 className="text-brand-dark text-xl font-bold tracking-tight">
              Ghorer Khabar
            </h2>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-brand-dark hover:text-brand-teal transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="flex items-center justify-center rounded-xl h-10 px-5 bg-white border border-brand-teal text-brand-teal text-sm font-bold transition-colors hover:bg-brand-teal/5"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary text-brand-dark text-sm font-bold shadow-sm transition-colors hover:bg-primary/90"
            >
              Sign Up
            </Link>
            <Link
              href="/register?role=seller"
              className="hidden lg:flex items-center justify-center rounded-xl h-10 px-5 bg-brand-teal text-white text-sm font-bold shadow-sm transition-colors hover:bg-brand-teal/90"
            >
              Become a Chef
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-brand-dark"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined text-3xl">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#f5f3f0] px-4 py-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-base font-medium text-brand-dark hover:text-brand-teal transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t">
              <Link
                href="/login"
                className="flex items-center justify-center rounded-xl h-12 bg-white border border-brand-teal text-brand-teal text-sm font-bold transition-colors hover:bg-brand-teal/5"
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center rounded-xl h-12 bg-primary text-brand-dark text-sm font-bold shadow-sm transition-colors hover:bg-primary/90"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
              <Link
                href="/register?role=seller"
                className="flex items-center justify-center rounded-xl h-12 bg-brand-teal text-white text-sm font-bold shadow-sm transition-colors hover:bg-brand-teal/90"
                onClick={() => setIsMenuOpen(false)}
              >
                Become a Chef
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
