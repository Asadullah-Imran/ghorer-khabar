export const WEEKLY_SCHEDULE_DATA = {
  planName: "Daily Deluxe Pack",
  status: "Active Subscription",
  currentWeek: "Oct 12 - Oct 18, 2024",
  dates: [
    { day: "Sat", date: "12", fullDate: "2024-10-12", active: true },
    { day: "Sun", date: "13", fullDate: "2024-10-13", active: false },
    { day: "Mon", date: "14", fullDate: "2024-10-14", active: false },
    { day: "Tue", date: "15", fullDate: "2024-10-15", active: false },
    { day: "Wed", date: "16", fullDate: "2024-10-16", active: false },
    { day: "Thu", date: "17", fullDate: "2024-10-17", active: false },
    { day: "Fri", date: "18", fullDate: "2024-10-18", active: false },
  ],
  meals: [
    {
      id: "m1",
      type: "Breakfast",
      time: "08:00 AM",
      icon: "wb_twilight",
      dishName: "Whole Wheat Paratha with Mixed Veg",
      description:
        "Two pieces of artisan whole wheat paratha served with a hearty seasonal vegetable curry cooked with minimal oil.",
      image:
        "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=400&auto=format",
      tags: [
        { label: "No Tasting Salt", color: "primary" },
        { label: "High Fiber", color: "green" },
      ],
      isSkippable: true,
    },
    {
      id: "m2",
      type: "Lunch",
      time: "01:30 PM",
      icon: "sunny",
      dishName: "Rohu Fish Curry with Steamed Rice",
      description:
        "Fresh Rohu fish steak simmered in a light cumin-coriander gravy. Served with organic steamed rice and seasonal greens.",
      image:
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format",
      tags: [
        { label: "Low Oil", color: "primary" },
        { label: "Fresh Catch", color: "blue" },
      ],
      isSkippable: true,
    },
    {
      id: "m3",
      type: "Snacks",
      time: "05:30 PM",
      icon: "cookie",
      dishName: null, // Empty state example
      description: "Snacks are not included in your current plan.",
      isSkippable: false,
    },
    {
      id: "m4",
      type: "Dinner",
      time: "08:30 PM",
      icon: "dark_mode",
      dishName: "Deshi Chicken Stew with Papaya",
      description:
        "A light and comforting stew made with local chicken, raw papaya, and whole spices.",
      image:
        "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format",
      tags: [
        { label: "Keto Friendly", color: "primary" },
        { label: "Protein Rich", color: "orange" },
      ],
      isSkippable: true,
    },
  ],
};
