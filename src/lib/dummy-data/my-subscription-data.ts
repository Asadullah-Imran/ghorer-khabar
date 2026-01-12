// Mocking user-specific subscription data based on the Catalog
export const MY_ACTIVE_SUBSCRIPTIONS = [
  {
    id: "user-sub-1",
    planId: "sub-1", // Links to your catalog ID
    planName: "Daily Deluxe Pack",
    chefName: "Chef Nazia Sultana",
    chefImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format",
    planImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format",
    status: "Active",
    nextDelivery: "Tomorrow, 1:30 PM",
    nextDish: "Rui Fish Curry & Rice",
    renewalDate: "April 15, 2024",
    price: 8500,
  },
  {
    id: "user-sub-2",
    planId: "sub-3", 
    planName: "Executive Lunch Box",
    chefName: "Chef Rahima",
    chefImage: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=200&auto=format",
    planImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format",
    status: "Renewing",
    nextDelivery: "Tomorrow, 12:30 PM",
    nextDish: "Chicken Curry",
    renewalDate: "April 02, 2024",
    price: 2500,
  }
];

export const MY_SUBSCRIPTION_HISTORY = [
  {
    id: "hist-1",
    planName: "Weekly Family Plan",
    period: "Feb 1 - Feb 28, 2024",
    chef: "Chef Rahima",
    status: "Completed",
    total: 12000,
  },
  {
    id: "hist-2",
    planName: "Weekend Special",
    period: "Jan 1 - Jan 15, 2024",
    chef: "Chef Farzana",
    status: "Cancelled",
    total: 3500,
  },
];

export const UPCOMING_DELIVERIES = [
  {
    day: "Tue",
    date: "21",
    label: "Today",
    dish: "Mutton Rezala",
    time: "1:30 PM",
    isToday: true,
  },
  {
    day: "Wed",
    date: "22",
    dish: "Prawn Malai Curry",
    chef: "Chef Nazia",
    isToday: false,
  },
  {
    day: "Thu",
    date: "23",
    dish: "Ilish Bhapa",
    chef: "Chef Nazia",
    isToday: false,
  },
  {
    day: "Fri",
    date: "24",
    dish: "Kacchi Biryani",
    chef: "Chef Nazia",
    isToday: false,
  },
];