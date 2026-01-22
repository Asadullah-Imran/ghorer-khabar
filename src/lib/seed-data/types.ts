// Seed data types for Ghorer Khabar project

export interface Kitchen {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  specialty: string;
  area: string;
  kri?: number; // Kitchen Reliability Index
  badge?: string;
}

export interface Dish {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  kitchen: string;
  deliveryTime: string;
  category: "Beef" | "Chicken" | "Fish" | "Rice" | "Vegetarian";
  spiciness: "High" | "Medium" | "Mild";
  reviewsCount?: number;
  prepTime?: string;
  calories?: string;
  description?: string;
  ingredients?: Ingredient[];
  images?: string[];
}

export interface Ingredient {
  name: string;
  icon: string;
  detail: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  kitchen: string;
  price: number;
  type: "Lunch" | "Dinner";
  mealsPerMonth: number;
  rating: number;
  image: string;
  description: string;
  kitchenId: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  joinDate: string;
  totalOrders: number;
  subscriptionId?: string;
}

export interface Order {
  id: string;
  customerId: string;
  kitchenId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "completed" | "pending" | "cancelled";
  orderDate: string;
  deliveryTime: string;
}

export interface OrderItem {
  dishId: string;
  dishName: string;
  price: number;
  quantity: number;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: "active" | "paused" | "cancelled";
  startDate: string;
  endDate: string;
  mealsDelivered: number;
  totalMeals: number;
}

export interface Review {
  id: string;
  dishId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface SeedData {
  kitchens: Kitchen[];
  dishes: Dish[];
  plans: SubscriptionPlan[];
  customers: Customer[];
  orders: Order[];
  subscriptions: Subscription[];
  reviews: Review[];
  metadata: {
    generatedAt: string;
    totalKitchens: number;
    totalDishes: number;
    totalPlans: number;
    totalCustomers: number;
    totalOrders: number;
    totalSubscriptions: number;
    totalReviews: number;
  };
}