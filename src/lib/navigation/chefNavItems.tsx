import {
  BarChart3,
  Box,
  Clock,
  Cog,
  Home,
  Phone,
  UtensilsCrossed,
} from "lucide-react";

export interface ChefNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const chefNavItems: ChefNavItem[] = [
  {
    label: "Dashboard",
    href: "/chef/dashboard",
    icon: <Home size={20} />,
  },
  {
    label: "Menu",
    href: "/chef/menu",
    icon: <UtensilsCrossed size={20} />,
  },
  {
    label: "Inventory",
    href: "/chef/inventory",
    icon: <Box size={20} />,
  },
  {
    label: "Orders",
    href: "/chef/orders",
    icon: <Clock size={20} />,
  },
  {
    label: "Analytics",
    href: "/chef/analytics",
    icon: <BarChart3 size={20} />,
  },
  {
    label: "Subscriptions",
    href: "/chef/subscriptions",
    icon: <Clock size={20} />,
  },
  {
    label: "Business Settings",
    href: "/chef/settings",
    icon: <Cog size={20} />,
  },
  {
    label: "Help & Support",
    href: "/chef/support",
    icon: <Phone size={20} />,
  },
];
