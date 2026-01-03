export const ALL_SUBSCRIPTIONS = [
  {
    id: "sub_1",
    planName: "Monthly Standard Lunch Box",
    kitchen: "Chef Rina Begum",
    status: "Active", // Active, Paused, Cancelled, Expired
    type: "Lunch",
    renewalDate: "Nov 01, 2024",
    price: 3500,
    totalMeals: 20,
    mealsDelivered: 12,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format",
  },
  {
    id: "sub_2",
    planName: "Weekly Healthy Salad",
    kitchen: "Green Life Kitchen",
    status: "Expired",
    type: "Dinner",
    renewalDate: "Oct 15, 2024",
    price: 1200,
    totalMeals: 5,
    mealsDelivered: 5,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format",
  },
];

export const SUBSCRIPTION_DETAILS = {
  id: "sub_1",
  planName: "Monthly Standard Lunch Box",
  kitchen: "Chef Rina Begum",
  status: "Active",
  price: 3500,
  startDate: "Oct 01, 2024",
  endDate: "Nov 01, 2024",
  deliveryTime: "1:00 PM - 1:30 PM",
  address: "House 42, Road 7, Sector 4, Uttara",
  // Simulated Calendar of upcoming meals
  upcomingMeals: [
    {
      date: "Tomorrow, Oct 25",
      dish: "Bhuna Khichuri & Egg Curry",
      status: "Scheduled",
    },
    { date: "Oct 26", dish: "Plain Rice & Rui Fish", status: "Scheduled" },
    {
      date: "Oct 27",
      dish: "Chicken Biryani (Friday Special)",
      status: "Scheduled",
    },
    { date: "Oct 28", dish: "Vegetable Thali", status: "Skipped" }, // User skipped this
    { date: "Oct 29", dish: "Beef Tehari", status: "Scheduled" },
  ],
};
