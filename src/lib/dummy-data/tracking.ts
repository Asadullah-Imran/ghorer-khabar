export const ORDER_TRACKING_DATA = {
  id: "GK-8921",
  placedAt: "Oct 24, 12:30 PM",
  estimatedDelivery: "1:45 PM",
  bill: {
    subtotal: 450,
    delivery: 50,
    platform: 20,
    total: 520,
    method: "Cash on Delivery",
  },
  // An order can be split into multiple kitchens
  subOrders: [
    {
      id: "sub-1",
      kitchenName: "Chef Ayesha's Kitchen",
      kitchenImage:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format",
      rating: 4.8,
      status: "cooking", // accepted, cooking, ready, delivered
      statusMessage: "Preparation in progress",
      statusDetail:
        "Chef Ayesha is currently preparing your food. It smells delicious!",
      progressPercent: "33%", // CSS width
      items: [{ name: "Beef Bhuna", qty: 1, detail: "Extra spicy" }],
    },
    {
      id: "sub-2",
      kitchenName: "Ghorer Sides Kitchen",
      kitchenImage:
        "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=200&auto=format",
      rating: 4.9,
      status: "ready",
      statusMessage: "Order Packed",
      statusDetail:
        "Your rice is packed and ready for pickup by the delivery hero.",
      progressPercent: "66%",
      items: [{ name: "Plain Rice", qty: 2, detail: "Steamed Basmati" }],
    },
  ],
};
