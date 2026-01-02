export const DISH_DETAILS = {
  id: "d1",
  name: "Authentic Shorshe Ilish (Mustard Hilsa)",
  price: 450,
  rating: 4.8,
  reviewsCount: 124,
  prepTime: "45 min",
  calories: "420 kcal",
  description:
    "A traditional Bengali delicacy prepared with passion. My family recipe uses a blend of black and yellow mustard seeds for that perfect pungency without the bitterness.",
  chef: {
    name: "Chef Anwara",
    id: "c1",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format",
    location: "Dhanmondi",
    badge: "Verified Kitchen",
    kri: 98, // Kitchen Reliability Index
  },
  images: [
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format", // Main
    "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format",
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format",
    "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=400&auto=format", // Kitchen shot
  ],
  ingredients: [
    {
      name: "Mustard Oil",
      icon: "droplets",
      detail:
        "Wood-pressed (Ghani) pure Mustard Oil sourced from Pabna. No refined oils mixed.",
    },
    {
      name: "Ilish Fish",
      icon: "fish",
      detail:
        "Fresh Padma River Ilish (1kg+ size). Sourced this morning from Karwan Bazar.",
    },
    {
      name: "Spices",
      icon: "wheat",
      detail:
        "Homemade ground mustard paste (Black & Yellow mix). Green chilies from rooftop garden.",
    },
  ],
  reviews: [
    {
      id: 1,
      user: "Rahim K.",
      date: "2 days ago",
      text: "Tastes exactly like my mom's cooking. The mustard oil flavor is authentic, not the cheap bottle kind. Highly recommend for lunch!",
      avatar: "https://i.pravatar.cc/150?u=1",
    },
    {
      id: 2,
      user: "Sadia M.",
      date: "1 week ago",
      text: "Love that they don't use tasting salt. Feels very light on the stomach.",
      avatar: "https://i.pravatar.cc/150?u=2",
    },
  ],
};

// Simulation of fetching data
export async function getDishById(id: string) {
  // In a real app, you would fetch based on ID.
  // Returning static data for now.
  return DISH_DETAILS;
}
