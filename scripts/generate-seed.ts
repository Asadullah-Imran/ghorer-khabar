import { writeFileSync } from 'fs';
import path from 'path';

// Types based on the existing codebase structure
interface Kitchen {
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

interface Dish {
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

interface Ingredient {
  name: string;
  icon: string;
  detail: string;
}

interface SubscriptionPlan {
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

interface Customer {
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

interface Order {
  id: string;
  customerId: string;
  kitchenId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "completed" | "pending" | "cancelled";
  orderDate: string;
  deliveryTime: string;
}

interface OrderItem {
  dishId: string;
  dishName: string;
  price: number;
  quantity: number;
}

interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: "active" | "paused" | "cancelled";
  startDate: string;
  endDate: string;
  mealsDelivered: number;
  totalMeals: number;
}

interface Review {
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

// Bangladeshi names and areas for realistic data
const BANGLADESHI_NAMES = [
  "Fatima Ahmed", "Mohammad Rahman", "Ayesha Siddiqui", "Abdul Karim",
  "Sultana Begum", "Tahmid Hassan", "Nusrat Jahan", "Mahbub Alam",
  "Sabrina Islam", "Rashedul Islam", "Farjana Akter", "Imran Hossain",
  "Shammi Akhter", "Jubayer Ahmed", "Marium Khan", "Saif Uddin",
  "Taslima Begum", "Arif Chowdhury", "Nadia Sultana", "Riyad Hossain",
  "Sumaiya Rahman", "Fahim Khan", "Afsana Begum", "Mizanur Rahman",
  "Shabana Parveen", "Emran Hossain", "Rashida Khan", "Tanvir Ahmed"
];

const DHAKA_AREAS = [
  "Dhanmondi", "Gulshan", "Banani", "Mirpur", "Uttara", "Mohammadpur",
  "Bashundhara", "Baridhara", "Shahbagh", "Ramna", "Tejgaon", "Badda",
  "Khilgaon", "Motijheel", "Paltan", "Sabujbagh", "Lalbagh", "Kamrangirchar"
];

const DISH_NAMES = {
  Beef: ["Beef Bhuna", "Beef Kala Bhuna", "Beef Tehari", "Beef Rezala", "Beef Vuna", "Gosht Korma", "Nihari", "Shatkora Beef"],
  Chicken: ["Chicken Roast", "Chicken Rezala", "Morog Polao", "Chicken Korma", "Grilled Chicken", "Fried Chicken", "Chicken Tikka", "Chicken Biryani"],
  Fish: ["Ilish Macher Jhol", "Rui Macher Kalia", "Chingri Malai Curry", "Pabda Macher Jhol", "Magur Macher Jhol", "Hilsha Bhapa", "Koi Macher Jhol"],
  Rice: ["Kachchi Biryani", "Beef Tehari", "Morog Polao", "Plain Rice", "Fried Rice", "Khichuri", "Pulao", "Bhuna Khichuri"],
  Vegetarian: ["Dal Tadka", "Mixed Vegetable", "Begun Bhorta", "Alu Bhorta", "Shojne Data Bhorta", "Cholar Dal", "Moong Dal", "Masoor Dal"]
};

// Review comment templates for realistic feedback
const REVIEW_COMMENTS = {
  positive: [
    "Excellent taste! Just like homemade food.",
    "Fresh ingredients and perfect cooking time.",
    "Will definitely order again. Highly recommended!",
    "Authentic flavor and great portion size.",
    "Best I've had in Dhaka. Keep it up!",
    "Perfect spice level. Not too oily.",
    "Reminds me of my mother's cooking.",
    "Great value for money. Quality is superb.",
    "Delivery was on time and food was still hot.",
    "Very hygienic and tasty. Love it!"
  ],
  neutral: [
    "Good taste but could be less oily.",
    "Food was okay, delivery took longer than expected.",
    "Taste is good but portion size could be better.",
    "Decent food, but price is a bit high.",
    "Nice flavor but needs more seasoning.",
    "Good quality but packaging could improve.",
    "Taste is authentic but quantity is less."
  ],
  negative: [
    "Food was cold when delivered.",
    "Too salty for my liking.",
    "Portion size is too small for the price.",
    "Overcooked and dry.",
    "Didn't taste fresh. Disappointed."
  ]
};

// Generate 5 kitchens with comprehensive data
const generateKitchens = (): Kitchen[] => {
  const kitchens: Kitchen[] = [
    {
      id: "k1",
      name: "Mayer Hater Ranna",
      rating: 4.9,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=600&auto=format",
      specialty: "Authentic Bengali",
      area: "Dhanmondi",
      kri: 98,
      badge: "Verified Kitchen"
    },
    {
      id: "k2",
      name: "Old Dhaka Spices",
      rating: 4.8,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=600&auto=format",
      specialty: "Mughlai & Biryani",
      area: "Gulshan",
      kri: 96,
      badge: "Top Rated"
    },
    {
      id: "k3",
      name: "Padma Kitchen",
      rating: 4.7,
      reviews: 189,
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&auto=format",
      specialty: "Fish Specialties",
      area: "Mohammadpur",
      kri: 94,
      badge: "Fresh Daily"
    },
    {
      id: "k4",
      name: "Comfort Bowl",
      rating: 4.6,
      reviews: 145,
      image: "https://images.unsplash.com/photo-1543353071-873f17a7a5c6?q=80&w=600&auto=format",
      specialty: "Rice & Comfort Food",
      area: "Banani",
      kri: 92,
      badge: "Hygienic"
    },
    {
      id: "k5",
      name: "Biye Bari Style",
      rating: 4.8,
      reviews: 201,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format",
      specialty: "Traditional Feast",
      area: "Uttara",
      kri: 95,
      badge: "Family Recipe"
    }
  ];
  
  return kitchens;
};

// Generate 10+ dishes for each kitchen
const generateDishes = (kitchens: Kitchen[]): Dish[] => {
  const dishes: Dish[] = [];
  let dishIdCounter = 1;
  
  kitchens.forEach((kitchen, kitchenIndex) => {
    const categories: Array<"Beef" | "Chicken" | "Fish" | "Rice" | "Vegetarian"> = ["Beef", "Chicken", "Fish", "Rice", "Vegetarian"];
    const dishesPerKitchen = 10 + Math.floor(Math.random() * 5); // 10-14 dishes per kitchen
    
    for (let i = 0; i < dishesPerKitchen; i++) {
      const category = categories[i % categories.length];
      const dishNames = DISH_NAMES[category];
      const dishName = dishNames[Math.floor(Math.random() * dishNames.length)] + ` ${kitchenIndex + 1}${i + 1}`;
      
      const dish: Dish = {
        id: `d${dishIdCounter++}`,
        name: dishName,
        price: 80 + Math.floor(Math.random() * 420), // 80-500 BDT
        rating: 4.0 + Math.random() * 1.0, // 4.0-5.0
        image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?q=80&w=600&auto=format`,
        kitchen: kitchen.name,
        deliveryTime: `${20 + Math.floor(Math.random() * 40)} min`, // 20-60 min
        category,
        spiciness: ["High", "Medium", "Mild"][Math.floor(Math.random() * 3)] as "High" | "Medium" | "Mild",
        reviewsCount: 10 + Math.floor(Math.random() * 200),
        prepTime: `${15 + Math.floor(Math.random() * 45)} min`,
        calories: `${200 + Math.floor(Math.random() * 400)} kcal`,
        description: `Authentic ${category.toLowerCase()} dish prepared with traditional recipes and fresh ingredients.`,
        ingredients: generateIngredients(),
        images: generateDishImages()
      };
      
      dishes.push(dish);
    }
  });
  
  return dishes;
};

const generateIngredients = (): Ingredient[] => {
  const ingredientOptions = [
    { name: "Mustard Oil", icon: "droplets", detail: "Pure wood-pressed mustard oil from Pabna" },
    { name: "Turmeric Powder", icon: "wheat", detail: "Freshly ground turmeric from local market" },
    { name: "Green Chilies", icon: "pepper", detail: "Organic green chilies from rooftop garden" },
    { name: "Ginger-Garlic Paste", icon: "root", detail: "Fresh ginger and garlic paste made daily" },
    { name: "Garam Masala", icon: "spice", detail: "Homemade blend of aromatic spices" },
    { name: "Fresh Herbs", icon: "leaf", detail: "Coriander and mint from organic garden" }
  ];
  
  return ingredientOptions.slice(0, 2 + Math.floor(Math.random() * 3));
};

const generateDishImages = (): string[] => {
  const images = [];
  const imageCount = 2 + Math.floor(Math.random() * 3); // 2-4 images
  
  for (let i = 0; i < imageCount; i++) {
    images.push(`https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?q=80&w=${i === 0 ? 800 : 400}&auto=format`);
  }
  
  return images;
};

// Generate subscription plans for each kitchen
const generateSubscriptionPlans = (kitchens: Kitchen[]): SubscriptionPlan[] => {
  const plans: SubscriptionPlan[] = [];
  let planIdCounter = 1;
  
  kitchens.forEach((kitchen) => {
    // Each kitchen has 2-3 subscription plans
    const planCount = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < planCount; i++) {
      const planType = i % 2 === 0 ? "Lunch" : "Dinner";
      const mealsPerMonth = planType === "Lunch" ? 20 + Math.floor(Math.random() * 4) : 15 + Math.floor(Math.random() * 3);
      const pricePerMeal = 120 + Math.floor(Math.random() * 80); // 120-200 BDT per meal
      
      const plan: SubscriptionPlan = {
        id: `p${planIdCounter++}`,
        name: `${kitchen.specialty} ${planType} Plan`,
        kitchen: kitchen.name,
        price: pricePerMeal * mealsPerMonth,
        type: planType,
        mealsPerMonth,
        rating: 4.3 + Math.random() * 0.7,
        image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?q=80&w=400&auto=format`,
        description: `Daily ${planType.toLowerCase()} meals with ${kitchen.specialty.toLowerCase()} specialties. Perfect for regular customers.`,
        kitchenId: kitchen.id
      };
      
      plans.push(plan);
    }
  });
  
  return plans;
};

// Generate 25 customers
const generateCustomers = (): Customer[] => {
  const customers: Customer[] = [];
  
  for (let i = 1; i <= 25; i++) {
    const customer: Customer = {
      id: `c${i}`,
      name: BANGLADESHI_NAMES[i - 1],
      email: `customer${i}@example.com`,
      phone: `+8801${300000000 + Math.floor(Math.random() * 100000000)}`,
      address: `House ${10 + Math.floor(Math.random() * 90)}, Road ${1 + Math.floor(Math.random() * 20)}, ${DHAKA_AREAS[Math.floor(Math.random() * DHAKA_AREAS.length)]}, Dhaka`,
      avatar: `https://i.pravatar.cc/150?u=${i}`,
      joinDate: new Date(2024 - Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      totalOrders: Math.floor(Math.random() * 50) + 1
    };
    
    customers.push(customer);
  }
  
  return customers;
};

// Generate reviews for completed orders
const generateReviews = (orders: Order[], customers: Customer[], dishes: Dish[]): Review[] => {
  const reviews: Review[] = [];
  let reviewIdCounter = 1;
  
  // Filter only completed orders
  const completedOrders = orders.filter(order => order.status === "completed");
  
  completedOrders.forEach((order) => {
    // 70% of completed orders have reviews
    if (Math.random() < 0.7) {
      const customer = customers.find(c => c.id === order.customerId);
      
      order.items.forEach((orderItem) => {
        const dish = dishes.find(d => d.id === orderItem.dishId);
        
        if (customer && dish) {
          // Generate rating based on dish's base rating with some variation
          const baseRating = dish.rating;
          const ratingVariation = (Math.random() - 0.5) * 1.5; // -0.75 to +0.75
          let rating = Math.round(Math.max(1, Math.min(5, baseRating + ratingVariation)));
          
          // Select comment based on rating
          let commentTemplates: string[];
          if (rating >= 4) {
            commentTemplates = REVIEW_COMMENTS.positive;
          } else if (rating >= 3) {
            commentTemplates = REVIEW_COMMENTS.neutral;
          } else {
            commentTemplates = REVIEW_COMMENTS.negative;
          }
          
          const comment = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
          
          // Generate review date (within 30 days of order)
          const orderDate = new Date(order.orderDate);
          const reviewDate = new Date(orderDate);
          reviewDate.setDate(reviewDate.getDate() + Math.floor(Math.random() * 30));
          
          const review: Review = {
            id: `r${reviewIdCounter++}`,
            dishId: orderItem.dishId,
            customerId: customer.id,
            customerName: customer.name,
            customerAvatar: customer.avatar,
            rating,
            comment,
            date: reviewDate.toISOString(),
            helpful: Math.floor(Math.random() * 25) // 0-24 people found this helpful
          };
          
          reviews.push(review);
        }
      });
    }
  });
  
  return reviews;
};

// Generate orders and subscriptions
const generateOrdersAndSubscriptions = (customers: Customer[], dishes: Dish[], plans: SubscriptionPlan[]): { orders: Order[], subscriptions: Subscription[] } => {
  const orders: Order[] = [];
  const subscriptions: Subscription[] = [];
  let orderIdCounter = 1;
  let subscriptionIdCounter = 1;
  
  customers.forEach((customer) => {
    // Each customer has 1-15 orders
    const orderCount = 1 + Math.floor(Math.random() * 15);
    
    for (let i = 0; i < orderCount; i++) {
      const dish = dishes[Math.floor(Math.random() * dishes.length)];
      const quantity = 1 + Math.floor(Math.random() * 3);
      
      const order: Order = {
        id: `o${orderIdCounter++}`,
        customerId: customer.id,
        kitchenId: `k${1 + Math.floor(Math.random() * 5)}`,
        items: [{
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          quantity
        }],
        totalAmount: dish.price * quantity,
        status: ["completed", "completed", "completed", "pending"][Math.floor(Math.random() * 4)] as "completed" | "pending" | "cancelled",
        orderDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        deliveryTime: dish.deliveryTime
      };
      
      orders.push(order);
    }
    
    // 40% of customers have subscriptions
    if (Math.random() < 0.4) {
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const startDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      const subscription: Subscription = {
        id: `s${subscriptionIdCounter++}`,
        customerId: customer.id,
        planId: plan.id,
        status: ["active", "active", "paused"][Math.floor(Math.random() * 3)] as "active" | "paused" | "cancelled",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        mealsDelivered: Math.floor(Math.random() * plan.mealsPerMonth),
        totalMeals: plan.mealsPerMonth
      };
      
      subscriptions.push(subscription);
      customer.subscriptionId = subscription.id;
    }
  });
  
  return { orders, subscriptions };
};

// Main seed function
const generateSeedData = () => {
  console.log('Generating seed data...');
  
  const kitchens = generateKitchens();
  const dishes = generateDishes(kitchens);
  const plans = generateSubscriptionPlans(kitchens);
  const customers = generateCustomers();
  const { orders, subscriptions } = generateOrdersAndSubscriptions(customers, dishes, plans);
  const reviews = generateReviews(orders, customers, dishes);
  
  const seedData = {
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
  
  return seedData;
};

// Export the seed data
const seedData = generateSeedData();

// Write to files
const outputDir = path.join(process.cwd(), 'src', 'lib', 'seed-data');

try {
  writeFileSync(path.join(outputDir, 'kitchens.json'), JSON.stringify(seedData.kitchens, null, 2));
  writeFileSync(path.join(outputDir, 'dishes.json'), JSON.stringify(seedData.dishes, null, 2));
  writeFileSync(path.join(outputDir, 'plans.json'), JSON.stringify(seedData.plans, null, 2));
  writeFileSync(path.join(outputDir, 'customers.json'), JSON.stringify(seedData.customers, null, 2));
  writeFileSync(path.join(outputDir, 'orders.json'), JSON.stringify(seedData.orders, null, 2));
  writeFileSync(path.join(outputDir, 'subscriptions.json'), JSON.stringify(seedData.subscriptions, null, 2));
  writeFileSync(path.join(outputDir, 'reviews.json'), JSON.stringify(seedData.reviews, null, 2));
  writeFileSync(path.join(outputDir, 'complete-seed.json'), JSON.stringify(seedData, null, 2));
  
  console.log('✅ Seed data generated successfully!');
  console.log(`📊 Generated ${seedData.metadata.totalKitchens} kitchens`);
  console.log(`🍽️ Generated ${seedData.metadata.totalDishes} dishes`);
  console.log(`📦 Generated ${seedData.metadata.totalPlans} subscription plans`);
  console.log(`👥 Generated ${seedData.metadata.totalCustomers} customers`);
  console.log(`🛒 Generated ${seedData.metadata.totalOrders} orders`);
  console.log(`🔄 Generated ${seedData.metadata.totalSubscriptions} subscriptions`);
  console.log(`⭐ Generated ${seedData.metadata.totalReviews} reviews`);
  console.log(`📁 Files saved to: ${outputDir}`);
} catch (error) {
  console.error('❌ Error writing seed files:', error);
}

export default seedData;