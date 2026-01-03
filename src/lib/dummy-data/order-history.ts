export const MY_ORDERS = [
  {
    id: "GK-8921",
    date: "Oct 24, 12:30 PM",
    total: 520,
    status: "active", // active or completed
    stage: "cooking", // accepted, cooking, ready, delivered, cancelled
    itemsSummary: "Beef Bhuna, Plain Rice (2x)",
    kitchens: ["Chef Ayesha's Kitchen", "Ghorer Sides"],
    images: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format",
      "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=100&auto=format",
    ],
  },
  {
    id: "GK-7742",
    date: "Oct 20, 8:15 PM",
    total: 350,
    status: "completed",
    stage: "delivered",
    itemsSummary: "Kachchi Biryani (Half)",
    kitchens: ["Old Dhaka Spices"],
    images: [
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=100&auto=format",
    ],
  },
  {
    id: "GK-6610",
    date: "Oct 15, 1:00 PM",
    total: 120,
    status: "completed",
    stage: "cancelled",
    itemsSummary: "Chicken Corn Soup",
    kitchens: ["Soup Master"],
    images: [
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=100&auto=format",
    ],
  },
];
