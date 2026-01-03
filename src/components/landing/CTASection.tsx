"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setEmail("");
    router.push("/register");
  };

  return (
    <section className="py-20 px-4 md:px-10 bg-brand-teal text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary opacity-10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to taste the difference?
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join thousands of foodies and home chefs in the Ghorer Khabar
          community today.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <div className="relative w-full max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-14 pl-5 pr-4 rounded-xl text-brand-dark focus:ring-4 focus:ring-primary/50 focus:outline-none border-none"
              required
            />
          </div>
          <button
            type="submit"
            className="h-14 px-8 rounded-xl bg-primary text-brand-dark font-bold hover:bg-white hover:text-brand-teal transition-all shadow-lg"
          >
            Get Started
          </button>
        </form>

        <p className="text-sm text-white/80 mt-6">
          Already with us? <Link href="/login" className="font-bold text-white hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
};

export default CTASection;
