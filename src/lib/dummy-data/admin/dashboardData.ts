export const ADMIN_STATS = [
  { id: 1, label: "Total Users", value: "12,450", change: "+5% this month", trend: "up", icon: "group" },
  { id: 2, label: "Active Sellers", value: "342", change: "+2% new active", trend: "up", icon: "storefront" },
  { id: 3, label: "Orders (Sept)", value: "1,205", change: "-2% vs last month", trend: "down", icon: "shopping_bag" },
  { id: 4, label: "Revenue", value: "৳ 4.5L", change: "+8% growth", trend: "up", icon: "payments" },
  { id: 5, label: "Pending Reviews", value: "8", change: "Requires attention", trend: "warning", icon: "gpp_maybe" },
];

export const RECENT_ACTIVITY = [
  { id: 1, title: 'New Seller "Mom\'s Kitchen" signed up', time: "10m ago", status: "Pending", icon: "person_add", type: "primary" },
  { id: 2, title: "Order #ORD-9921 Flagged", time: "32m ago", status: "Delay", icon: "report_problem", type: "danger" },
  { id: 3, title: "System Update Completed", time: "2h ago", status: "Success", icon: "notifications_active", type: "secondary" },
];

export const RECENT_ORDERS = [
  { id: "#ORD-001", customer: "Rahim S.", dish: "Chicken Biryani", amount: "৳ 250", status: "Completed" },
  { id: "#ORD-002", customer: "Anjali D.", dish: "Paneer Tikka", amount: "৳ 180", status: "Preparing" },
  { id: "#ORD-003", customer: "Vikram R.", dish: "Fish Curry", amount: "৳ 320", status: "Out for Delivery" },
  { id: "#ORD-004", customer: "Sneha P.", dish: "Veg Thali", amount: "৳ 150", status: "Cancelled" },
];

export const CATEGORY_DATA = [
  { name: "Meals & Thalis", percentage: 45, value: 542, color: "#11d4b4" },
  { name: "Snacks", percentage: 25, value: 301, color: "#fbb03b" },
  { name: "Desserts & Others", percentage: 30, value: 362, color: "#2a403d" },
];

export const MONTHLY_ORDER_DATA = [
  { month: "Jan", orders: 890, revenue: 3.2 },
  { month: "Feb", orders: 920, revenue: 3.5 },
  { month: "Mar", orders: 1050, revenue: 3.8 },
  { month: "Apr", orders: 980, revenue: 3.6 },
  { month: "May", orders: 1100, revenue: 4.0 },
  { month: "Jun", orders: 1150, revenue: 4.2 },
  { month: "Jul", orders: 1080, revenue: 3.9 },
  { month: "Aug", orders: 1230, revenue: 4.4 },
  { month: "Sep", orders: 1205, revenue: 4.5 },
];