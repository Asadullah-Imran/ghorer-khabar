export const INITIAL_CART_DATA = {
  kitchen: {
    id: "k9",
    name: "Chef Rahima's Kitchen",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format",
    location: "Uttara, Sector 4",
    rating: 4.8,
    reviews: 124,
  },
  fees: {
    delivery: 60,
    platform: 10,
  },
  items: [
    {
      id: "c1",
      name: "Beef Bhuna with Chinigura Rice",
      price: 350,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=200&auto=format",
      tags: ["Spicy", "Halal"],
      tagColors: ["orange", "green"], // Helper for UI mapping
    },
    {
      id: "c2",
      name: "Mixed Vegetable Dal",
      price: 80,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=200&auto=format",
      tags: ["Low Oil", "Vegan"],
      tagColors: ["green", "green"],
    },
    {
      id: "c3",
      name: "Steamed White Rice",
      price: 40,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=200&auto=format",
      tags: ["Gluten Free"],
      tagColors: ["blue"],
    },
  ],
};
