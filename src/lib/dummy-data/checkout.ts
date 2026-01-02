export const CHECKOUT_USER_DATA = {
  fullName: "Sadia Rahman",
  phone: "+8801712345678",
  savedAddress: "House 42, Road 7, Sector 4, Uttara, Dhaka",
  // Simulate the cart items being carried over
  cartSummary: {
    items: [
      {
        id: 1,
        name: "Beef Bhuna",
        price: 250,
        qty: 1,
        image:
          "https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=200&auto=format",
      },
      {
        id: 2,
        name: "Plain Rice",
        price: 60,
        qty: 2,
        image:
          "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=200&auto=format",
      },
    ],
    subtotal: 370,
    delivery: 60,
    total: 430,
  },
};
