// src/lib/dummy-data/newSubscriptionData.ts

export const SUBSCRIPTION_PLANS = [
  {
    id: "sub-1",
    name: "Daily Deluxe Pack",
    description:
      "Premium home-cooked meals delivered daily. Experience the soul of Bengal with chef-crafted meals.",
    mealsPerDay: 3,
    servingsPerMeal: 1,
    price: 8500,
    isActive: true,
    subscriberCount: 1200,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format",
    chef: {
      name: "Chef Nazia Sultana",
      experience: "15+ years",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format",
      quote:
        "I believe food is a language of love. This plan is designed to make you feel like you're eating at home.",
    },
    nutrition: {
      calories: 2100,
      protein: "65g",
      carbs: "180g",
      fats: "45g",
    },
    schedule: {
      Saturday: {
        breakfast: {
          time: "08:30",
          dish: "Mughlai Paratha & Alur Dom",
          desc: "Spiced potato curry with fluffy bread",
          image:
            "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=400&auto=format",
        },
        lunch: {
          time: "13:30",
          dish: "Rui Fish Curry & Rice",
          desc: "Freshwater fish in mustard gravy",
          image:
            "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:30",
          dish: "Chicken Bhuna & Roti",
          desc: "Slow-cooked chicken with soft roti",
          image:
            "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format",
        },
      },
      Sunday: {
        breakfast: {
          time: "08:30",
          dish: "Vegetable Khichuri",
          desc: "Rice and lentils with seasonal veggies",
          image:
            "https://images.unsplash.com/photo-1543353071-873f17a7a5c6?q=80&w=400&auto=format",
        },
        lunch: {
          time: "13:30",
          dish: "Beef Tehari",
          desc: "Aromatic rice cooked with beef pieces",
          image:
            "https://images.unsplash.com/photo-1604908538419-01b05f5960d7?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:30",
          dish: "Egg Curry & Rice",
          desc: "Spicy egg curry with steamed rice",
          image:
            "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400&auto=format",
        },
      },
      Monday: {
        breakfast: {
          time: "08:30",
          dish: "Roti & Bhaji",
          desc: "Mixed vegetable stir fry",
          image:
            "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=400&auto=format",
        },
        lunch: {
          time: "13:30",
          dish: "Chicken Curry",
          desc: "Standard chicken curry with potato",
          image:
            "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:30",
          dish: "Dal & Rice",
          desc: "Comforting lentil soup",
          image:
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format",
        },
      },
      Tuesday: {
        breakfast: {
          time: "08:30",
          dish: "Puri & Chholar Dal",
          desc: "Crispy fried bread with chickpea curry",
          image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format",
        },
        lunch: {
          time: "13:30",
          dish: "Mutton Rezala",
          desc: "Creamy white mutton curry",
          image:
            "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:30",
          dish: "Mixed Vegetable Curry",
          desc: "Seasonal vegetables in light gravy",
          image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format",
        },
      },
      Wednesday: {
        breakfast: {
          time: "08:30",
          dish: "Dimer Devil & Toast",
          desc: "Spicy egg fritters with bread",
          image:
            "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=400&auto=format",
        },
        lunch: {
          time: "13:30",
          dish: "Prawn Malai Curry",
          desc: "Prawns in coconut cream sauce",
          image:
            "https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:30",
          dish: "Chicken Roast & Pulao",
          desc: "Bengali-style roasted chicken",
          image:
            "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=400&auto=format",
        },
      },
      Thursday: {
        breakfast: {
          time: "08:30",
          dish: "Aloo Paratha",
          desc: "Potato-stuffed flatbread",
          image:
            "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=400&auto=format",
        },
        lunch: {
          time: "13:30",
          dish: "Ilish Bhapa",
          desc: "Steamed hilsa in mustard",
          image:
            "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:30",
          dish: "Paneer Butter Masala",
          desc: "Cottage cheese in tomato gravy",
          image:
            "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=400&auto=format",
        },
      },
      Friday: {
        breakfast: {
          time: "08:30",
          dish: "Radha Ballabhi",
          desc: "Lentil-stuffed puri with potato curry",
          image:
            "https://images.unsplash.com/photo-1630409346693-4e8f0531e085?q=80&w=400&auto=format",
        },
        lunch: {
          time: "13:30",
          dish: "Kacchi Biryani",
          desc: "Aromatic mutton biryani",
          image:
            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:30",
          dish: "Fish Fry & Rice",
          desc: "Crispy fried fish with steamed rice",
          image:
            "https://images.unsplash.com/photo-1580959375944-0b7b5c8a8a4f?q=80&w=400&auto=format",
        },
      },
    },
    features: [
      "Free Delivery everyday",
      "Eco-friendly packaging",
      "Cancel or Pause anytime",
      "Handpicked organic spices",
    ],
    createdAt: "2025-12-15",
  },
  {
    id: "sub-2",
    name: "Weekly Family Plan",
    description: "Complete meal solution for families of 4.",
    mealsPerDay: 3,
    servingsPerMeal: 4,
    price: 12000,
    isActive: true,
    subscriberCount: 15,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format",
    chef: {
      name: "Chef Rahima",
      experience: "10 years",
      image:
        "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=200&auto=format",
      quote: "Healthy meals for happy families.",
    },
    nutrition: {
      calories: 1800,
      protein: "50g",
      carbs: "200g",
      fats: "40g",
    },
    schedule: {
      Saturday: {
        breakfast: {
          time: "08:30",
          dish: "Vegetable Poha",
          desc: "Flattened rice with vegetables",
          image:
            "https://images.unsplash.com/photo-1645696329626-2f4faef18c6c?q=80&w=400&auto=format",
        },
        lunch: {
          time: "13:30",
          dish: "Chicken Curry & Rice",
          desc: "Traditional chicken curry for the family",
          image:
            "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:30",
          dish: "Dal Makhani & Roti",
          desc: "Creamy black lentils",
          image:
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format",
        },
      },
      Sunday: {
        breakfast: {
          time: "08:30",
          dish: "Puri & Sabzi",
          desc: "Fried bread with potato curry",
          image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format",
        },
        lunch: {
          time: "13:30",
          dish: "Mutton Kasha",
          desc: "Spicy slow-cooked mutton",
          image:
            "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:30",
          dish: "Fried Rice & Manchurian",
          desc: "Indo-Chinese family favorite",
          image:
            "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=400&auto=format",
        },
      },
    },
    features: ["Family Size Portions", "Weekend Specials"],
    createdAt: "2025-11-20",
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
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1562059390-a761a084768e?q=80&w=800&auto=format",
    chef: {
      name: "Chef Kamal",
      experience: "8 years",
      image:
        "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?q=80&w=200&auto=format",
      quote:
        "Quick, nutritious, and delicious - perfect for busy professionals.",
    },
    nutrition: {
      calories: 650,
      protein: "35g",
      carbs: "70g",
      fats: "20g",
    },
    schedule: {
      Monday: {
        lunch: {
          time: "12:30",
          dish: "Chicken Biryani",
          desc: "Fragrant rice with tender chicken",
          image:
            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format",
        },
      },
      Tuesday: {
        lunch: {
          time: "12:30",
          dish: "Fish Curry & Rice",
          desc: "Light fish curry with steamed rice",
          image:
            "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format",
        },
      },
      Wednesday: {
        lunch: {
          time: "12:30",
          dish: "Beef Bhuna & Naan",
          desc: "Rich beef curry with soft naan",
          image:
            "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=400&auto=format",
        },
      },
      Thursday: {
        lunch: {
          time: "12:30",
          dish: "Vegetable Pulao",
          desc: "Mixed vegetable rice",
          image:
            "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=400&auto=format",
        },
      },
      Friday: {
        lunch: {
          time: "12:30",
          dish: "Prawn Curry & Rice",
          desc: "Special Friday seafood treat",
          image:
            "https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=400&auto=format",
        },
      },
    },
    features: [
      "Office Delivery",
      "Eco-friendly Lunch Box",
      "Delivered by 12:30 PM",
    ],
    createdAt: "2025-10-10",
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
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format",
    chef: {
      name: "Chef Hasan",
      experience: "12 years",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format",
      quote: "Weekend meals should be special and memorable.",
    },
    nutrition: {
      calories: 1500,
      protein: "45g",
      carbs: "150g",
      fats: "35g",
    },
    schedule: {
      Saturday: {
        lunch: {
          time: "14:00",
          dish: "Mutton Rezala & Pulao",
          desc: "Creamy mutton curry with fragrant rice",
          image:
            "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:00",
          dish: "Prawn Malai Curry",
          desc: "Prawns in coconut cream",
          image:
            "https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=400&auto=format",
        },
      },
      Sunday: {
        lunch: {
          time: "14:00",
          dish: "Kacchi Biryani",
          desc: "Premium mutton biryani",
          image:
            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format",
        },
        dinner: {
          time: "20:00",
          dish: "Tandoori Chicken",
          desc: "Grilled chicken with mint chutney",
          image:
            "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=400&auto=format",
        },
      },
    },
    features: [
      "Premium Weekend Meals",
      "Special Chef Selection",
      "Larger Portions",
    ],
    createdAt: "2025-09-05",
  },
];

export function getPlanById(id: string) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
}

// Maps the detailed data to the lightweight summary format used in Feed
export const FEATURED_PLANS = SUBSCRIPTION_PLANS.map((plan) => ({
  id: plan.id,
  name: plan.name,
  kitchen: plan.chef.name, // Mapping chef name to kitchen for card compatibility
  price: plan.price,
  type: "Monthly", // Defaulting type
  mealsPerMonth: plan.mealsPerDay * 30, // Calculating monthly total
  rating: plan.rating,
  image: plan.image,
  description: plan.description,
}));
