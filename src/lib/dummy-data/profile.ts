export const USER_PROFILE = {
  name: "Sadia Islam",
  phone: "+880 1712 345678",
  address: "House 42, Road 7, Sector 4, Uttara, Dhaka",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  plan: "Student Tiffin Plan",
  stats: {
    chefsSupported: 12, // Replaces Calories
    ordersThisMonth: 8,
    favorites: 5,
  },
};

export const ACTIVE_SUBSCRIPTION = {
  id: "sub_1",
  title: "Monthly Standard Lunch Box",
  provider: "Chef Rina Begum",
  status: "Active",
  nextDelivery: "Tomorrow, 1:00 PM",
  nextMenu: "Bhuna Khichuri & Egg Curry",
  renewalDate: "Nov 01, 2024",
  image:
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format",
};

export const ORDER_HISTORY = [
  {
    id: "GK-8921",
    date: "Oct 24, 2024",
    kitchen: "Mayer Dowa Catering",
    items: "Beef Tehari (x2)",
    total: 450,
    status: "Delivered",
    payment: "Cash",
  },
  {
    id: "GK-7742",
    date: "Oct 22, 2024",
    kitchen: "Healthy Bites by Salma",
    items: "Vegetable Thali",
    total: 180,
    status: "Cancelled", // Example of different status
    payment: "Cash",
  },
  {
    id: "GK-6610",
    date: "Oct 20, 2024",
    kitchen: "Chef Rina's Kitchen",
    items: "Chicken Curry & Rice",
    total: 220,
    status: "Delivered",
    payment: "Cash",
  },
];
