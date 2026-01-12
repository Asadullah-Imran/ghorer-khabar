export const KITCHEN_DETAILS = {
  id: "k-123",
  name: "Chef Rumana's Kitchen",
  type: "Home Chef",
  rating: 4.8,
  reviewCount: 245,
  location: "Dhanmondi, Dhaka",
  distance: "2.3 km",
  kriScore: 98, // Key Reliability Index
  description:
    "Authentic homemade Bengali cuisine prepared with love and traditional family recipes. Specializing in Vorta, Bhaji, and Fish Curry.",
  coverImage:
    "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1200&auto=format",
  profileImage:
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=200&auto=format",
  gallery: [
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format", // Clean prep area
    "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=600&auto=format", // Cooking process
    "https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4?q=80&w=600&auto=format", // Packing station
    "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=600&auto=format", // Finished dish
  ],
  stats: {
    orders: "1.2k",
    satisfaction: "98%",
    response: "15m",
    delivered: "100%",
  },
  featuredItems: [
    {
      id: "f1",
      name: "Hyderabadi Chicken Biryani",
      price: 350,
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=400&auto=format",
      desc: "Aromatic basmati rice cooked with tender chicken.",
    },
    {
      id: "f2",
      name: "Beef Bhuna Khichuri",
      price: 420,
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=400&auto=format",
      desc: "Spicy beef curry with roasted lentil rice.",
    },
  ],
  plans: [
    {
      name: "Lunch Box (5 Days)",
      price: 1200,
      originalPrice: 1400,
      desc: "Rice, Daal, Veg, 1 Protein",
    },
    {
      name: "Family Dinner (Weekend)",
      price: 2500,
      originalPrice: 2800,
      desc: "Fri & Sat Special Menu",
    },
  ],
  menu: [
    {
      name: "Vegetable Fried Rice",
      category: "Snacks",
      price: 180,
      time: "20 min",
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=200",
      desc: "Healthy mix of seasonal vegetables.",
    },
    {
      name: "Shorshe Ilish",
      category: "Meals",
      price: 550,
      time: "30 min",
      image:
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=200",
      desc: "National dish. Hilsa fish in mustard sauce.",
    },
    // ... inside KITCHEN_DETAILS object

    {
      name: "Vegetable Fried Rice",
      category: "Meals", // Add this
      price: 180,
      time: "20 min",
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=200",
      desc: "Healthy mix of seasonal vegetables.",
    },
    {
      name: "Shorshe Ilish",
      category: "Meals", // Add this
      price: 550,
      time: "30 min",
      image:
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=200",
      desc: "National dish. Hilsa fish in mustard sauce.",
    },
    {
      name: "Rice Pudding (Payesh)",
      category: "Desserts", // Add this
      price: 120,
      time: "Ready",
      image:
        "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=200",
      desc: "Traditional creamy rice pudding with nuts.",
    },
    // Add more items to test filters...
    {
      name: "Singara",
      category: "Snacks",
      price: 60,
      time: "Ready",
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=200",
      desc: "Spiced potato stuffed pastry.",
    },
  ],
};
