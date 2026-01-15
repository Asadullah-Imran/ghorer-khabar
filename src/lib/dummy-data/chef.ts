export const CHEF_STATS = {
  revenueToday: "৳ 2,450",
  activeOrders: 8,
  kriScore: "98/100",
  monthlyRevenue: [
    { month: "Jan", revenue: 4200 },
    { month: "Feb", revenue: 3800 },
    { month: "Mar", revenue: 5200 },
    { month: "Apr", revenue: 4800 },
    { month: "May", revenue: 6100 },
    { month: "Jun", revenue: 5900 },
    { month: "Jul", revenue: 7200 },
    { month: "Aug", revenue: 6800 },
    { month: "Sep", revenue: 7500 },
    { month: "Oct", revenue: 8200 },
    { month: "Nov", revenue: 8900 },
    { month: "Dec", revenue: 9100 },
  ],
  notifications: [
    {
      id: "1",
      type: "success" as const,
      title: "Order Completed",
      message: "Order #1024 has been successfully delivered",
      timestamp: new Date(Date.now() - 10 * 60000),
      read: false,
    },
    {
      id: "2",
      type: "info" as const,
      title: "New Order Received",
      message: "New order from Sadia Rahman for ৳450",
      timestamp: new Date(Date.now() - 25 * 60000),
      read: false,
    },
    {
      id: "3",
      type: "warning" as const,
      title: "Low Inventory",
      message: "Your Beef Bhuna stock is running low",
      timestamp: new Date(Date.now() - 1 * 3600000),
      read: true,
    },
    {
      id: "4",
      type: "success" as const,
      title: "Payment Received",
      message: "৳2,450 credited to your account",
      timestamp: new Date(Date.now() - 2 * 3600000),
      read: true,
    },
    {
      id: "5",
      type: "info" as const,
      title: "Review Added",
      message: "Rahim K. left a 5-star review: 'Tastes exactly like my mom's cooking'",
      timestamp: new Date(Date.now() - 4 * 3600000),
      read: true,
    },
  ],
};

export type OrderStatus = "new" | "cooking" | "ready" | "handover";

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  specialNotes?: string;
  startTime: Date;
  runnerId?: string;
  tiffinId?: string;
}

export const KANBAN_ORDERS: Record<OrderStatus, Order[]> = {
  new: [
    {
      id: "1",
      orderNumber: "#1025",
      status: "new",
      customerName: "Asad Khan",
      customerPhone: "01712345678",
      items: [
        { name: "Shorshe Ilish", quantity: 1, price: 450 },
        { name: "Plain Rice", quantity: 1, price: 40 },
      ],
      totalPrice: 490,
      specialNotes: "Extra spicy, no salt",
      startTime: new Date(Date.now() - 2 * 60000),
    },
    {
      id: "2",
      orderNumber: "#1026",
      status: "new",
      customerName: "Sadia Rahman",
      customerPhone: "01898765432",
      items: [
        { name: "Beef Bhuna", quantity: 1, price: 350 },
        { name: "Dal", quantity: 1, price: 80 },
      ],
      totalPrice: 430,
      startTime: new Date(Date.now() - 1 * 60000),
    },
  ],
  cooking: [
    {
      id: "3",
      orderNumber: "#1023",
      status: "cooking",
      customerName: "Rahim K.",
      customerPhone: "01612345678",
      items: [
        { name: "Kachchi Biryani", quantity: 2, price: 420 },
      ],
      totalPrice: 420,
      specialNotes: "Keep it medium spicy",
      startTime: new Date(Date.now() - 22 * 60000),
    },
    {
      id: "4",
      orderNumber: "#1024",
      status: "cooking",
      customerName: "Fatima A.",
      customerPhone: "01756789012",
      items: [
        { name: "Chicken Roast", quantity: 1, price: 290 },
        { name: "Rice", quantity: 1, price: 50 },
      ],
      totalPrice: 340,
      startTime: new Date(Date.now() - 10 * 60000),
    },
    {
      id: "5",
      orderNumber: "#1022",
      status: "cooking",
      customerName: "Arif M.",
      customerPhone: "01945678901",
      items: [
        { name: "Macher Jhol", quantity: 1, price: 220 },
        { name: "Rice", quantity: 1, price: 50 },
      ],
      totalPrice: 270,
      startTime: new Date(Date.now() - 28 * 60000),
    },
  ],
  ready: [
    {
      id: "6",
      orderNumber: "#1021",
      status: "ready",
      customerName: "Nadia S.",
      customerPhone: "01834567890",
      items: [
        { name: "Chicken Rezala", quantity: 1, price: 330 },
      ],
      totalPrice: 330,
      startTime: new Date(Date.now() - 35 * 60000),
    },
    {
      id: "7",
      orderNumber: "#1020",
      status: "ready",
      customerName: "Jamal H.",
      customerPhone: "01723456789",
      items: [
        { name: "Ilish Pulao", quantity: 1, price: 550 },
      ],
      totalPrice: 550,
      startTime: new Date(Date.now() - 40 * 60000),
    },
  ],
  handover: [
    {
      id: "8",
      orderNumber: "#1019",
      status: "handover",
      customerName: "Rima B.",
      customerPhone: "01812345678",
      items: [
        { name: "Morog Polao", quantity: 1, price: 320 },
      ],
      totalPrice: 320,
      startTime: new Date(Date.now() - 50 * 60000),
      runnerId: "RUNNER-001",
      tiffinId: "TIFFIN-456",
    },
    {
      id: "9",
      orderNumber: "#1018",
      status: "handover",
      customerName: "Karim T.",
      customerPhone: "01901234567",
      items: [
        { name: "Beguni", quantity: 2, price: 60 },
        { name: "Chutneys", quantity: 1, price: 30 },
      ],
      totalPrice: 150,
      startTime: new Date(Date.now() - 65 * 60000),
      runnerId: "RUNNER-002",
      tiffinId: "TIFFIN-789",
    },
  ],
};

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string; // kg, grams, ml, pieces, etc.
  cost?: number; // optional cost for inventory management
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string; // kg, grams, ml, pieces, etc.
  currentStock: number;
  demandFromOrders: number;
  forecastDemand: number;
  reorderLevel: number;
  unitCost: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  mealsPerDay: number;
  servingsPerMeal: number;
  price: number;
  isActive: boolean;
  subscriberCount: number;
  monthlyRevenue: number;
  image?: string;
  schedule: {
    [day: string]: {
      breakfast?: { time: string; dishIds: string[] };
      lunch?: { time: string; dishIds: string[] };
      snacks?: { time: string; dishIds: string[] };
      dinner?: { time: string; dishIds: string[] };
    };
  };
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  currentPrice: number;
  marketPriceRange: {
    min: number;
    max: number;
  };
  isAvailable: boolean;
  prepTime: number; // in minutes
  image?: string;
  spiciness: "Mild" | "Medium" | "High";
  isVegetarian: boolean;
  allergens?: string[];
  ingredients: Ingredient[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Shorshe Ilish",
    description: "Traditional Bengali Hilsa fish cooked in mustard sauce",
    category: "Fish",
    currentPrice: 450,
    marketPriceRange: { min: 400, max: 600 },
    isAvailable: true,
    prepTime: 45,
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format",
    spiciness: "Medium",
    isVegetarian: false,
    allergens: ["Fish", "Mustard"],
    ingredients: [
      { name: "Hilsa Fish", quantity: "500", unit: "grams", cost: 250 },
      { name: "Mustard Oil", quantity: "3", unit: "tbsp", cost: 30 },
      { name: "Black Mustard Seeds", quantity: "2", unit: "tbsp", cost: 20 },
      { name: "Yellow Mustard Seeds", quantity: "1", unit: "tbsp", cost: 15 },
      { name: "Green Chilies", quantity: "4", unit: "pieces", cost: 10 },
      { name: "Turmeric", quantity: "0.5", unit: "tsp", cost: 5 },
      { name: "Salt", quantity: "1", unit: "tsp", cost: 2 },
    ],
  },
  {
    id: "2",
    name: "Beef Bhuna",
    description: "Slow-cooked spiced beef curry with rich gravy",
    category: "Beef",
    currentPrice: 350,
    marketPriceRange: { min: 300, max: 450 },
    isAvailable: true,
    prepTime: 60,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=400&auto=format",
    spiciness: "High",
    isVegetarian: false,
    ingredients: [
      { name: "Beef", quantity: "400", unit: "grams", cost: 200 },
      { name: "Onions", quantity: "250", unit: "grams", cost: 25 },
      { name: "Tomatoes", quantity: "200", unit: "grams", cost: 30 },
      { name: "Ginger-Garlic Paste", quantity: "2", unit: "tbsp", cost: 15 },
      { name: "Cumin", quantity: "0.5", unit: "tsp", cost: 5 },
      { name: "Coriander", quantity: "0.5", unit: "tsp", cost: 5 },
      { name: "Turmeric", quantity: "0.5", unit: "tsp", cost: 5 },
      { name: "Red Chili Powder", quantity: "1", unit: "tsp", cost: 8 },
      { name: "Oil", quantity: "2", unit: "tbsp", cost: 10 },
      { name: "Salt", quantity: "1", unit: "tsp", cost: 2 },
    ],
  },
  {
    id: "3",
    name: "Kachchi Biryani",
    description: "Aromatic layered rice with marinated mutton",
    category: "Rice",
    currentPrice: 420,
    marketPriceRange: { min: 380, max: 550 },
    isAvailable: true,
    prepTime: 90,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=400&auto=format",
    spiciness: "Medium",
    isVegetarian: false,
    ingredients: [
      { name: "Mutton", quantity: "400", unit: "grams", cost: 220 },
      { name: "Basmati Rice", quantity: "300", unit: "grams", cost: 90 },
      { name: "Yogurt", quantity: "100", unit: "ml", cost: 20 },
      { name: "Onions", quantity: "300", unit: "grams", cost: 30 },
      { name: "Ginger-Garlic Paste", quantity: "2", unit: "tbsp", cost: 15 },
      { name: "Saffron", quantity: "0.1", unit: "grams", cost: 50 },
      { name: "Whole Spices", quantity: "1", unit: "tbsp", cost: 20 },
      { name: "Ghee", quantity: "3", unit: "tbsp", cost: 45 },
      { name: "Salt", quantity: "1", unit: "tsp", cost: 2 },
    ],
  },
  {
    id: "4",
    name: "Chicken Roast",
    description: "Perfectly roasted chicken with aromatic spices",
    category: "Chicken",
    currentPrice: 290,
    marketPriceRange: { min: 250, max: 350 },
    isAvailable: true,
    prepTime: 40,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format",
    spiciness: "Mild",
    isVegetarian: false,
    ingredients: [
      { name: "Chicken", quantity: "500", unit: "grams", cost: 150 },
      { name: "Yogurt", quantity: "75", unit: "ml", cost: 15 },
      { name: "Ginger-Garlic Paste", quantity: "1.5", unit: "tbsp", cost: 12 },
      { name: "Cumin Powder", quantity: "0.5", unit: "tsp", cost: 5 },
      { name: "Coriander Powder", quantity: "0.5", unit: "tsp", cost: 5 },
      { name: "Red Chili Powder", quantity: "0.5", unit: "tsp", cost: 4 },
      { name: "Oil", quantity: "2", unit: "tbsp", cost: 10 },
      { name: "Lemon Juice", quantity: "1", unit: "tbsp", cost: 5 },
      { name: "Salt", quantity: "1", unit: "tsp", cost: 2 },
    ],
  },
  {
    id: "5",
    name: "Dal Tadka",
    description: "Lentils tempered with ghee and spices",
    category: "Vegetarian",
    currentPrice: 80,
    marketPriceRange: { min: 60, max: 120 },
    isAvailable: true,
    prepTime: 30,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format",
    spiciness: "Mild",
    isVegetarian: true,
    ingredients: [
      { name: "Masoor Dal", quantity: "150", unit: "grams", cost: 30 },
      { name: "Turmeric", quantity: "0.5", unit: "tsp", cost: 5 },
      { name: "Onions", quantity: "100", unit: "grams", cost: 10 },
      { name: "Cumin Seeds", quantity: "0.5", unit: "tsp", cost: 3 },
      { name: "Dried Red Chilies", quantity: "2", unit: "pieces", cost: 4 },
      { name: "Garlic", quantity: "3", unit: "cloves", cost: 5 },
      { name: "Ghee", quantity: "1", unit: "tbsp", cost: 15 },
      { name: "Salt", quantity: "0.5", unit: "tsp", cost: 1 },
    ],
  },
  {
    id: "6",
    name: "Morog Polao",
    description: "Fragrant chicken pulao with whole spices",
    category: "Rice",
    currentPrice: 320,
    marketPriceRange: { min: 280, max: 400 },
    isAvailable: false,
    prepTime: 50,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format",
    spiciness: "Mild",
    isVegetarian: false,
    ingredients: [
      { name: "Chicken", quantity: "300", unit: "grams", cost: 120 },
      { name: "Basmati Rice", quantity: "250", unit: "grams", cost: 75 },
      { name: "Onions", quantity: "200", unit: "grams", cost: 20 },
      { name: "Bay Leaves", quantity: "2", unit: "pieces", cost: 5 },
      { name: "Cinnamon Stick", quantity: "1", unit: "piece", cost: 10 },
      { name: "Cardamom", quantity: "4", unit: "pieces", cost: 8 },
      { name: "Cloves", quantity: "4", unit: "pieces", cost: 4 },
      { name: "Cumin Seeds", quantity: "0.5", unit: "tsp", cost: 3 },
      { name: "Ghee", quantity: "2", unit: "tbsp", cost: 30 },
      { name: "Salt", quantity: "1", unit: "tsp", cost: 2 },
    ],
  },
];

// Inventory Data for Smart Bazar
export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "inv-1",
    name: "Hilsa Fish",
    unit: "kg",
    currentStock: 2.5,
    demandFromOrders: 1.5,
    forecastDemand: 2.0,
    reorderLevel: 3,
    unitCost: 500,
  },
  {
    id: "inv-2",
    name: "Beef",
    unit: "kg",
    currentStock: 1.0,
    demandFromOrders: 2.0,
    forecastDemand: 1.5,
    reorderLevel: 3,
    unitCost: 280,
  },
  {
    id: "inv-3",
    name: "Mutton",
    unit: "kg",
    currentStock: 0.5,
    demandFromOrders: 1.0,
    forecastDemand: 0.8,
    reorderLevel: 2,
    unitCost: 350,
  },
  {
    id: "inv-4",
    name: "Chicken",
    unit: "kg",
    currentStock: 3.0,
    demandFromOrders: 1.5,
    forecastDemand: 1.2,
    reorderLevel: 2,
    unitCost: 200,
  },
  {
    id: "inv-5",
    name: "Basmati Rice",
    unit: "kg",
    currentStock: 8.0,
    demandFromOrders: 1.0,
    forecastDemand: 0.8,
    reorderLevel: 5,
    unitCost: 80,
  },
  {
    id: "inv-6",
    name: "Lentils (Masoor Dal)",
    unit: "kg",
    currentStock: 2.0,
    demandFromOrders: 0.3,
    forecastDemand: 0.2,
    reorderLevel: 1,
    unitCost: 120,
  },
  {
    id: "inv-7",
    name: "Onions",
    unit: "kg",
    currentStock: 5.0,
    demandFromOrders: 0.8,
    forecastDemand: 1.0,
    reorderLevel: 3,
    unitCost: 30,
  },
  {
    id: "inv-8",
    name: "Garlic",
    unit: "kg",
    currentStock: 0.3,
    demandFromOrders: 0.1,
    forecastDemand: 0.1,
    reorderLevel: 0.5,
    unitCost: 150,
  },
  {
    id: "inv-9",
    name: "Ginger",
    unit: "kg",
    currentStock: 0.5,
    demandFromOrders: 0.15,
    forecastDemand: 0.15,
    reorderLevel: 0.5,
    unitCost: 120,
  },
  {
    id: "inv-10",
    name: "Green Chilies",
    unit: "pieces",
    currentStock: 40,
    demandFromOrders: 30,
    forecastDemand: 25,
    reorderLevel: 50,
    unitCost: 2,
  },
  {
    id: "inv-11",
    name: "Mustard Oil",
    unit: "liters",
    currentStock: 2.0,
    demandFromOrders: 0.5,
    forecastDemand: 0.4,
    reorderLevel: 1,
    unitCost: 250,
  },
  {
    id: "inv-12",
    name: "Ghee",
    unit: "liters",
    currentStock: 1.5,
    demandFromOrders: 0.3,
    forecastDemand: 0.2,
    reorderLevel: 1,
    unitCost: 800,
  },
];

// Subscription Plans Data
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "sub-1",
    name: "Daily Deluxe Pack",
    description: "Premium home-cooked meals delivered daily",
    mealsPerDay: 2,
    servingsPerMeal: 2,
    price: 4500,
    isActive: true,
    subscriberCount: 24,
    monthlyRevenue: 108000,
    schedule: {
      Saturday: {
        breakfast: { time: "08:00", dishIds: [] },
        lunch: { time: "13:00", dishIds: ["1", "5"] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: ["2", "6"] },
      },
      Sunday: {
        breakfast: { time: "08:00", dishIds: [] },
        lunch: { time: "13:00", dishIds: ["3", "5"] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: ["1", "4"] },
      },
      Monday: {
        breakfast: { time: "08:00", dishIds: [] },
        lunch: { time: "13:00", dishIds: ["1", "5"] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: ["2", "6"] },
      },
      Tuesday: {
        breakfast: { time: "08:00", dishIds: [] },
        lunch: { time: "13:00", dishIds: ["3", "5"] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: ["1", "4"] },
      },
      Wednesday: {
        breakfast: { time: "08:00", dishIds: [] },
        lunch: { time: "13:00", dishIds: ["1", "5"] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: ["2", "6"] },
      },
      Thursday: {
        breakfast: { time: "08:00", dishIds: [] },
        lunch: { time: "13:00", dishIds: ["3", "5"] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: ["1", "4"] },
      },
      Friday: {
        breakfast: { time: "08:00", dishIds: [] },
        lunch: { time: "13:00", dishIds: ["1", "5"] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: ["2", "6"] },
      },
    },
    createdAt: new Date("2025-12-15"),
  },
  {
    id: "sub-2",
    name: "Weekly Family Plan",
    description: "Complete meal solution for families",
    mealsPerDay: 3,
    servingsPerMeal: 4,
    price: 12000,
    isActive: true,
    subscriberCount: 15,
    monthlyRevenue: 180000,
    schedule: {
      Saturday: {
        breakfast: { time: "08:30", dishIds: ["5"] },
        lunch: { time: "13:00", dishIds: ["3", "1"] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: ["2", "4"] },
      },
      Sunday: {
        breakfast: { time: "08:30", dishIds: ["5"] },
        lunch: { time: "13:00", dishIds: ["3", "1"] },
        snacks: { time: "17:00", dishIds: [] },
        dinner: { time: "21:00", dishIds: ["2", "4"] },
      },
    },
    createdAt: new Date("2025-11-20"),
  },
  {
    id: "sub-3",
    name: "Executive Lunch Box",
    description: "Single meal delivery for working professionals",
    mealsPerDay: 1,
    servingsPerMeal: 1,
    price: 2500,
    isActive: true,
    subscriberCount: 42,
    monthlyRevenue: 105000,
    schedule: {
      Monday: {
        lunch: { time: "12:30", dishIds: ["3", "5"] },
      },
      Tuesday: {
        lunch: { time: "12:30", dishIds: ["1", "5"] },
      },
      Wednesday: {
        lunch: { time: "12:30", dishIds: ["3", "5"] },
      },
      Thursday: {
        lunch: { time: "12:30", dishIds: ["1", "5"] },
      },
      Friday: {
        lunch: { time: "12:30", dishIds: ["3", "5"] },
      },
    },
    createdAt: new Date("2025-10-10"),
  },
  {
    id: "sub-4",
    name: "Weekend Special",
    description: "Special dishes for weekend meals",
    mealsPerDay: 2,
    servingsPerMeal: 3,
    price: 3500,
    isActive: false,
    subscriberCount: 8,
    monthlyRevenue: 28000,
    schedule: {
      Saturday: {
        lunch: { time: "14:00", dishIds: ["3", "4"] },
        dinner: { time: "20:00", dishIds: ["1", "2"] },
      },
      Sunday: {
        lunch: { time: "14:00", dishIds: ["3", "4"] },
        dinner: { time: "20:00", dishIds: ["1", "2"] },
      },
    },
    createdAt: new Date("2025-09-05"),
  },
];

export const ANALYTICS_DATA = {
  kpis: {
    totalRevenue: 45000,
    revenueGrowth: 12,
    netProfit: 15200,
    profitGrowth: 8,
    totalOrders: 128,
    ordersGrowth: 15,
    avgRating: 4.8,
    maxRating: 5.0,
  },
  revenueChart: {
    weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
    revenue: [30000, 35000, 40000, 45000],
    profit: [10000, 12000, 13500, 15200],
  },
  topDishes: [
    { name: "Beef Bhuna", sales: 85, percentage: 85 },
    { name: "Chicken Korma", sales: 72, percentage: 72 },
    { name: "Plain Rice", sales: 60, percentage: 60 },
    { name: "Vegetable Curry", sales: 45, percentage: 45 },
  ],
  sentiment: {
    positive: ["Tasty", "Generous Portion", "Fresh", "Well Cooked", "Quick Delivery"],
    negative: ["A bit oily", "Late delivery", "Cold food", "Small portion"],
  },
  aiInsights: [
    {
      id: 1,
      title: "Peak Demand Pattern Detected",
      description: "Demand for 'Chicken Korma' spikes on Tuesday nights. Consider creating a 'Tuesday Bundle' to increase order value.",
      impact: "high" as const,
    },
    {
      id: 2,
      title: "Inventory Optimization",
      description: "Your 'Beef Bhuna' sells out frequently. Increase stock by 20% to capture missed revenue.",
      impact: "medium" as const,
    },
  ],
};

export interface MenuItemReview {
  id: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  text: string;
  date: Date;
  isAppealedByChef?: boolean;
  appealReason?: string;
}

export const MENU_ITEM_REVIEWS: Record<string, MenuItemReview[]> = {
  "1": [ // Shorshe Ilish
    {
      id: "r1",
      customerId: "c1",
      customerName: "Asad Khan",
      rating: 5,
      text: "Absolutely delicious! The mustard sauce was perfectly balanced. Best hilsa I've had in years!",
      date: new Date("2025-12-28"),
    },
    {
      id: "r2",
      customerId: "c2",
      customerName: "Farah Ahmed",
      rating: 4,
      text: "Really good, but a bit too oily for my taste. Otherwise great flavor.",
      date: new Date("2025-12-26"),
    },
    {
      id: "r3",
      customerId: "c3",
      customerName: "Karim T.",
      rating: 5,
      text: "Fresh fish, authentic recipe. Highly recommend!",
      date: new Date("2025-12-24"),
    },
  ],
  "2": [ // Beef Bhuna
    {
      id: "r4",
      customerId: "c4",
      customerName: "Rima Bhat",
      rating: 5,
      text: "Incredibly tender beef, great spices. This is my go-to order now.",
      date: new Date("2025-12-27"),
    },
    {
      id: "r5",
      customerId: "c5",
      customerName: "Zainab Khan",
      rating: 3,
      text: "Tasty but very small portion for the price. Expected more meat.",
      date: new Date("2025-12-25"),
      isAppealedByChef: true,
      appealReason: "Customer ordered small portion size",
    },
    {
      id: "r6",
      customerId: "c6",
      customerName: "Hasan Ali",
      rating: 5,
      text: "Perfect! The beef melts in your mouth. Will order again!",
      date: new Date("2025-12-23"),
    },
  ],
  "3": [ // Kachchi Biryani
    {
      id: "r7",
      customerId: "c7",
      customerName: "Salima Begum",
      rating: 5,
      text: "Authentic kachchi biryani! Every grain of rice is perfect. Worth the wait.",
      date: new Date("2025-12-28"),
    },
    {
      id: "r8",
      customerId: "c8",
      customerName: "Iqbal Hussain",
      rating: 4,
      text: "Good flavor, but took longer than expected. Still delicious though.",
      date: new Date("2025-12-26"),
    },
  ],
  "4": [ // Chicken Roast
    {
      id: "r9",
      customerId: "c9",
      customerName: "Nadia Alam",
      rating: 5,
      text: "The chicken is so juicy and well-seasoned. Best roast chicken I've had!",
      date: new Date("2025-12-27"),
    },
    {
      id: "r10",
      customerId: "c10",
      customerName: "Rahman Sheikh",
      rating: 4,
      text: "Very tasty, though a bit dry on one piece. Overall good quality.",
      date: new Date("2025-12-25"),
    },
  ],
};
