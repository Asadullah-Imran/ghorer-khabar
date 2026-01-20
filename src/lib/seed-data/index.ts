import { SeedData, Kitchen, Dish, SubscriptionPlan, Customer, Order, Subscription, Review } from './types';

// Import seed data (in a real app, this would come from a database)
import kitchensData from './kitchens.json';
import dishesData from './dishes.json';
import plansData from './plans.json';
import customersData from './customers.json';
import ordersData from './orders.json';
import subscriptionsData from './subscriptions.json';
import reviewsData from './reviews.json';

// Type assertion for imported JSON data
const kitchens = kitchensData as Kitchen[];
const dishes = dishesData as Dish[];
const plans = plansData as SubscriptionPlan[];
const customers = customersData as Customer[];
const orders = ordersData as Order[];
const subscriptions = subscriptionsData as Subscription[];
const reviews = reviewsData as Review[];

// Complete seed data object
export const seedData: SeedData = {
  kitchens,
  dishes,
  plans,
  customers,
  orders,
  subscriptions,
  reviews,
  metadata: {
    generatedAt: new Date().toISOString(),
    totalKitchens: kitchens.length,
    totalDishes: dishes.length,
    totalPlans: plans.length,
    totalCustomers: customers.length,
    totalOrders: orders.length,
    totalSubscriptions: subscriptions.length,
    totalReviews: reviews.length
  }
};

// Helper functions to access data
export const getKitchens = () => kitchens;
export const getDishes = () => dishes;
export const getPlans = () => plans;
export const getCustomers = () => customers;
export const getOrders = () => orders;
export const getSubscriptions = () => subscriptions;
export const getReviews = () => reviews;

// Find functions
export const getKitchenById = (id: string): Kitchen | undefined => 
  kitchens.find(k => k.id === id);

export const getDishById = (id: string): Dish | undefined => 
  dishes.find(d => d.id === id);

export const getPlanById = (id: string): SubscriptionPlan | undefined => 
  plans.find(p => p.id === id);

export const getCustomerById = (id: string): Customer | undefined => 
  customers.find(c => c.id === id);

export const getOrderById = (id: string): Order | undefined => 
  orders.find(o => o.id === id);

export const getSubscriptionById = (id: string): Subscription | undefined => 
  subscriptions.find(s => s.id === id);

export const getReviewById = (id: string): Review | undefined => 
  reviews.find(r => r.id === id);

// Filter functions
export const getDishesByKitchen = (kitchenId: string): Dish[] => 
  dishes.filter(d => d.kitchen === getKitchenById(kitchenId)?.name);

export const getDishesByCategory = (category: string): Dish[] => 
  dishes.filter(d => d.category === category);

export const getOrdersByCustomer = (customerId: string): Order[] => 
  orders.filter(o => o.customerId === customerId);

export const getReviewsByDish = (dishId: string): Review[] => 
  reviews.filter(r => r.dishId === dishId);

export const getReviewsByCustomer = (customerId: string): Review[] => 
  reviews.filter(r => r.customerId === customerId);

export const getSubscriptionsByCustomer = (customerId: string): Subscription[] => 
  subscriptions.filter(s => s.customerId === customerId);

export const getPlansByKitchen = (kitchenId: string): SubscriptionPlan[] => 
  plans.filter(p => p.kitchenId === kitchenId);

// Search functions
export const searchDishes = (query: string): Dish[] => {
  const searchTerm = query.toLowerCase();
  return dishes.filter(d => 
    d.name.toLowerCase().includes(searchTerm) ||
    d.kitchen.toLowerCase().includes(searchTerm) ||
    d.category.toLowerCase().includes(searchTerm)
  );
};

export const searchKitchens = (query: string): Kitchen[] => {
  const searchTerm = query.toLowerCase();
  return kitchens.filter(k => 
    k.name.toLowerCase().includes(searchTerm) ||
    k.specialty.toLowerCase().includes(searchTerm) ||
    k.area.toLowerCase().includes(searchTerm)
  );
};

// Statistics functions
export const getKitchenStats = (kitchenId: string) => {
  const kitchen = getKitchenById(kitchenId);
  if (!kitchen) return null;
  
  const kitchenDishes = getDishesByKitchen(kitchenId);
  const kitchenOrders = orders.filter(o => o.kitchenId === kitchenId);
  const kitchenReviews = reviews.filter(r => 
    kitchenDishes.some(d => d.id === r.dishId)
  );
  
  return {
    kitchen,
    dishCount: kitchenDishes.length,
    orderCount: kitchenOrders.length,
    reviewCount: kitchenReviews.length,
    averageRating: kitchenReviews.length > 0 
      ? kitchenReviews.reduce((sum, r) => sum + r.rating, 0) / kitchenReviews.length 
      : 0,
    totalRevenue: kitchenOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  };
};

export const getCustomerStats = (customerId: string) => {
  const customer = getCustomerById(customerId);
  if (!customer) return null;
  
  const customerOrders = getOrdersByCustomer(customerId);
  const customerReviews = getReviewsByCustomer(customerId);
  const customerSubscriptions = getSubscriptionsByCustomer(customerId);
  
  return {
    customer,
    orderCount: customerOrders.length,
    reviewCount: customerReviews.length,
    subscriptionCount: customerSubscriptions.length,
    totalSpent: customerOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    averageRating: customerReviews.length > 0 
      ? customerReviews.reduce((sum, r) => sum + r.rating, 0) / customerReviews.length 
      : 0
  };
};

export default seedData;