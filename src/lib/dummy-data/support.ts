// User/Buyer FAQs
export const USER_SUPPORT_FAQS = [
  {
    category: "Orders & Delivery",
    items: [
      {
        q: "Where is my order?",
        a: "You can track your order in real-time by visiting the 'My Orders' section and clicking on 'Track Order'.",
      },
      {
        q: "Can I cancel my order?",
        a: "You can cancel an order within 5 minutes of placing it. After that, the kitchen may have already started preparation.",
      },
      {
        q: "My food arrived cold/spilled.",
        a: "We are sorry! Please take a photo and submit a complaint below. We will refund you or send a replacement.",
      },
      {
        q: "How do I change my delivery address?",
        a: "Go to Profile > Addresses, add a new address, or edit an existing one. You can set a default address for faster checkout.",
      },
      {
        q: "What are the delivery time slots?",
        a: "You can order for today, tomorrow, or the day after tomorrow. Choose from Breakfast, Lunch, Snacks, or Dinner time slots.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    items: [
      {
        q: "Do you accept cards?",
        a: "Currently, we only accept Cash on Delivery due to high demand. Online payments are coming soon.",
      },
      {
        q: "How do refunds work?",
        a: "Refunds for cancelled orders are credited to your Ghorer Khabar Wallet instantly.",
      },
      {
        q: "What is the delivery charge?",
        a: "Delivery charges are calculated based on distance (minimum ৳10-15, maximum ৳60). Orders beyond 7 km are not available.",
      },
    ],
  },
  {
    category: "Account & Plans",
    items: [
      {
        q: "How do I skip a meal in my subscription?",
        a: "Go to Profile > Subscription Plans, select your active plan, and click 'Skip Meal' on the specific date.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Profile > Subscription Plans, select your active plan, and click 'Cancel Subscription'. You can cancel anytime.",
      },
      {
        q: "Can I favorite dishes and kitchens?",
        a: "Yes! Click the heart icon on any dish or kitchen to add it to your favorites. Access them from your Profile page.",
      },
    ],
  },
];

// Chef/Seller FAQs
export const CHEF_SUPPORT_FAQS = [
  {
    category: "Orders & Management",
    items: [
      {
        q: "How do I accept or reject an order?",
        a: "Go to Orders > Kanban Board. Click on a pending order to view details, then click 'Accept' or 'Reject'. Respond quickly to maintain your KRI score.",
      },
      {
        q: "How do I update order status?",
        a: "In the Orders page, drag orders between columns (Pending → Confirmed → Preparing → Delivering → Completed) or click the status button to update.",
      },
      {
        q: "What happens if I cancel an order?",
        a: "Cancelling orders affects your Kitchen Reliability Index (KRI). Only cancel if absolutely necessary. High cancellation rates reduce your fulfillment score.",
      },
      {
        q: "How do I manage my kitchen capacity?",
        a: "Go to Settings > Business Settings. Set your maximum capacity per time slot (default: 6 orders). The system prevents overbooking automatically.",
      },
    ],
  },
  {
    category: "Menu & Inventory",
    items: [
      {
        q: "How do I add a new dish to my menu?",
        a: "Go to Menu > Add New Item. Fill in details, upload images, set price, and mark it as available. Items appear on the explore page once saved.",
      },
      {
        q: "How do I mark items as unavailable?",
        a: "In the Menu page, toggle the availability switch next to any item. Unavailable items won't appear to customers but remain in your menu.",
      },
      {
        q: "How do I manage my inventory?",
        a: "Go to Inventory > Add Item. Select a menu dish from the dropdown, then add ingredients with quantities. This helps track what you need to prepare.",
      },
      {
        q: "Can I edit dish prices?",
        a: "Yes! Go to Menu, click 'Edit' on any dish, update the price, and save. Changes take effect immediately.",
      },
    ],
  },
  {
    category: "Revenue & Payments",
    items: [
      {
        q: "How is my revenue calculated?",
        a: "Your revenue = Order total - Platform fee (৳10 per delivery). Delivery charges are operational costs and don't go to you. View details in Analytics > Revenue.",
      },
      {
        q: "When do I receive payments?",
        a: "Revenue is credited to your account when orders are marked as 'Completed'. Check your dashboard for today's and monthly revenue.",
      },
      {
        q: "What is the platform fee?",
        a: "We charge ৳10 per delivery as a platform fee. This is deducted from the order total before calculating your revenue.",
      },
    ],
  },
  {
    category: "Kitchen Reliability Index (KRI)",
    items: [
      {
        q: "What is KRI and how is it calculated?",
        a: "KRI (Kitchen Reliability Index) is a score (0-100) based on ratings, order completion, on-time delivery, response time, and customer satisfaction. Higher KRI = more trust from customers.",
      },
      {
        q: "How can I improve my KRI score?",
        a: "Accept orders quickly, complete all orders on time, deliver on the scheduled date, encourage positive reviews, and minimize cancellations.",
      },
      {
        q: "What happens if I'm a new chef?",
        a: "New chefs (< 5 orders or < 3 reviews) start with a base KRI of 50. Your score gradually improves as you complete orders and receive reviews.",
      },
    ],
  },
  {
    category: "Settings & Profile",
    items: [
      {
        q: "How do I set my kitchen operating hours?",
        a: "Go to Settings > Opening & Closing Hours. Set hours for each day of the week. Save to update your availability.",
      },
      {
        q: "How do I update my kitchen information?",
        a: "Go to Settings > General Info. Update kitchen name, address, owner name, and phone number. Changes sync to your user profile.",
      },
      {
        q: "How do I open or close my kitchen?",
        a: "Click the 'Kitchen Open' toggle on your Dashboard. When closed, customers won't see your kitchen or be able to place orders.",
      },
    ],
  },
];

// Legacy export for backward compatibility (defaults to user FAQs)
export const SUPPORT_FAQS = USER_SUPPORT_FAQS;

export const CONTACT_INFO = {
  phone: "+880 1712 345678",
  email: "support@ghorerkhabar.com",
  hours: "Daily: 8:00 AM - 10:00 PM",
  address: "Level 4, Gulshan 1, Dhaka",
};
