import heroBg from "@/../public/foods.jpg"; // Adjust path based on your folder structure
import Image from "next/image";
import Link from "next/link";
const Hero = () => {
  return (
    <header className="relative w-full min-h-[600px] flex items-center justify-center bg-brand-dark overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroBg} // 2. Pass the imported variable here
          alt="Ghorer Khabar background"
          fill
          priority
          placeholder="blur" // Bonus: You get automatic blur loading with imports!
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-10 flex flex-col items-center text-center max-w-4xl pt-10">
        <span className="inline-block py-1 px-3 rounded-full bg-brand-teal/90 text-white text-xs font-bold tracking-wide uppercase mb-6 border border-white/20">
          #1 Trusted Home Food Marketplace
        </span>

        <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
          Savor the Taste of Home. <br />
          <span className="text-primary">
            Empower the Heart of the Kitchen.
          </span>
        </h1>

        <p className="text-gray-200 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mb-10">
          Connecting health-conscious students and professionals with verified
          home chefs for authentic, transparently prepared meals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-xl h-14 px-8 bg-primary text-brand-dark text-base font-bold transition-transform hover:scale-105 shadow-[0_0_20px_rgba(254,183,40,0.3)]"
          >
            <span className="material-symbols-outlined text-[20px]">
              search
            </span>
            Find a Meal
          </Link>

          <Link
            href="/register?role=seller"
            className="flex items-center justify-center gap-2 rounded-xl h-14 px-8 bg-brand-teal text-white text-base font-bold transition-transform hover:scale-105 shadow-[0_0_20px_rgba(71,126,119,0.4)]"
          >
            <span className="material-symbols-outlined text-[20px]">
              soup_kitchen
            </span>
            Open Your Kitchen
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Hero;
