import healthpic from "@/../public/cooking.jpg"; // Adjust path based on your folder structure
import Image from "next/image";
import Link from "next/link";

const BuyerSection = () => {
  const features = [
    {
      icon: "menu_book",
      title: "Ingredient Transparency",
      description:
        "Full visibility into ingredients used. No secret additives, just honest food.",
    },
    {
      icon: "donut_large",
      title: "Nutritional Breakdown",
      description:
        "Track your macros easily with calculated nutritional values for every dish.",
    },
    {
      icon: "verified",
      title: "Verified Home Chefs",
      description:
        "Every kitchen is physically inspected and vetted for safety standards.",
    },
  ];

  return (
    <section id="buyer" className="py-20 px-4 md:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left Content */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 text-brand-teal font-bold uppercase tracking-wider text-sm">
              <span className="w-8 h-[2px] bg-brand-teal"></span>
              For Health-Conscious Eaters
            </div>

            <h2 className="text-4xl font-bold text-brand-dark leading-tight">
              Know exactly what goes on your plate.
            </h2>

            <p className="text-lg text-gray-600">
              Say goodbye to hidden oils and preservatives. Experience the
              transparency and warmth of home-cooked meals delivered to your
              door.
            </p>

            <div className="grid gap-6 mt-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-[#fbfbfb] hover:border-brand-teal/30 transition-colors"
                >
                  <div className="size-12 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal shrink-0">
                    <span className="material-symbols-outlined">
                      {feature.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Link
                href="/login"
                className="flex items-center gap-2 font-bold text-brand-teal hover:underline decoration-2 underline-offset-4"
              >
                Browse Healthy Meals
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="flex-1 w-full relative">
            <div className="relative w-full aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-brand-teal/10 to-primary/10">
              {/* --- IMAGE COMPONENT ADDED HERE --- */}
              <Image
                src={healthpic}
                alt="Healthy home-cooked meal preparation"
                fill
                className="object-cover"
                placeholder="blur"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-brand-teal uppercase mb-1">
                      Daily Special
                    </p>
                    <h4 className="font-bold text-brand-dark">
                      Organic Quinoa Salad
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-primary text-sm fill-current">
                        star
                      </span>
                      <span className="text-xs font-bold">4.9</span>
                      <span className="text-xs text-gray-500">
                        (128 reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-black text-brand-dark">
                      $12.50
                    </span>
                    <span className="text-xs text-gray-500">350 kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyerSection;
