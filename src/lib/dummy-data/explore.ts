export const ALL_DISHES = [
  {
    id: "d1",
    name: "Shatkora Beef Bhuna",
    price: 350,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=600&auto=format",
    kitchen: "Sylheti Rannaghor",
    deliveryTime: "45 min",
    category: "Beef",
    spiciness: "High",
  },
  {
    id: "d2",
    name: "Kachchi Biryani",
    price: 420,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=600&auto=format",
    kitchen: "Old Dhaka Spices",
    deliveryTime: "60 min",
    category: "Rice",
    spiciness: "Medium",
  },
  {
    id: "d3",
    name: "Macher Jhol (Rui)",
    price: 220,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600&auto=format",
    kitchen: "Nodia Kitchen",
    deliveryTime: "35 min",
    category: "Fish",
    spiciness: "Medium",
  },
  {
    id: "d4",
    name: "Chicken Roast",
    price: 290,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format",
    kitchen: "Biye Bari Style",
    deliveryTime: "40 min",
    category: "Chicken",
    spiciness: "Mild",
  },
  {
    id: "d5",
    name: "Begun Bhorta",
    price: 60,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=600&auto=format",
    kitchen: "Bhorta House",
    deliveryTime: "25 min",
    category: "Vegetarian",
    spiciness: "High",
  },
  {
    id: "d6",
    name: "Daal Butter Fry",
    price: 100,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format",
    kitchen: "Daily Budget",
    deliveryTime: "20 min",
    category: "Vegetarian",
    spiciness: "Mild",
  },
];

export const ALL_KITCHENS = [
  {
    id: "k1",
    name: "Mayer Hater Ranna",
    rating: 4.9,
    reviews: 120,
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=600&auto=format",
    specialty: "Authentic Bengali",
    area: "Mirpur",
  },
  {
    id: "k2",
    name: "Curry & Crust",
    rating: 4.7,
    reviews: 85,
    image:
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=600&auto=format",
    specialty: "Fusion Desi",
    area: "Gulshan",
  },
  {
    id: "k3",
    name: "Sylheti Rannaghor",
    rating: 4.8,
    reviews: 45,
    image:
      "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=600&auto=format",
    specialty: "Spicy Beef",
    area: "Dhanmondi",
  },
];

// Helper options for our filter UI
export const CATEGORIES = [
  "All",
  "Beef",
  "Chicken",
  "Fish",
  "Rice",
  "Vegetarian",
];
export const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];
