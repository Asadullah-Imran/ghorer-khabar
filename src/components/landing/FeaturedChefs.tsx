"use client";

import { useState } from "react";

const chefs = [
  {
    id: 1,
    name: "Fatima's Kitchen",
    rating: 4.8,
    specialty: "Hilsa Curry",
    tags: ["Bengali", "Halal", "Healthy Choice"],
    price: "$12.50",
    cuisine: "Traditional Bengali",
    deliveryTime: "30-40 min",
  },
  {
    id: 2,
    name: "Chef Rahul's Oven",
    rating: 4.9,
    specialty: "Lasagna",
    tags: ["Italian", "Vegetarian"],
    price: "$14.99",
    cuisine: "Italian Fusion",
    deliveryTime: "25-35 min",
  },
  {
    id: 3,
    name: "Green Bowl by Sarah",
    rating: 4.7,
    specialty: "Buddha Bowl",
    tags: ["Vegan", "Gluten-Free"],
    price: "$10.99",
    cuisine: "Healthy & Vegan",
    deliveryTime: "20-30 min",
  },
];

const FeaturedChefs = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section id="chefs" className="py-20 px-4 md:px-10 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-brand-dark mb-2">
              Trending Home Kitchens
            </h2>
            <p className="text-gray-500">
              Explore the highest-rated chefs in your neighborhood.
            </p>
          </div>
          <button className="text-brand-teal font-bold hover:text-primary transition-colors flex items-center gap-1">
            View All Chefs
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {chefs.map((chef) => (
            <div
              key={chef.id}
              className={`group flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 ${
                hoveredCard === chef.id ? "transform scale-[1.02]" : ""
              }`}
              onMouseEnter={() => setHoveredCard(chef.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-teal/20 to-primary/20">
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-bold text-brand-dark flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-sm fill-current">
                    star
                  </span>
                  {chef.rating}
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-brand-teal/20 to-primary/20 overflow-hidden flex items-center justify-center">
                    <span className="material-symbols-outlined text-brand-teal">
                      person
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-dark">
                      {chef.name}
                    </h3>
                    <p className="text-xs text-brand-teal font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        verified
                      </span>
                      Verified Chef
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 my-1">
                  {chef.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        tag === "Healthy Choice"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    <p>
                      Cuisine:{" "}
                      <span className="text-brand-dark font-medium">
                        {chef.cuisine}
                      </span>
                    </p>
                    <p className="text-xs mt-1">🚚 {chef.deliveryTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-brand-dark">
                      {chef.price}
                    </p>
                    <button className="text-primary font-bold text-sm hover:underline mt-1">
                      View Menu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedChefs;
