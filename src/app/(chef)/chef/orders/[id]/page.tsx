import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Package,
  DollarSign,
  Calendar,
  ArrowLeft,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getAuthenticatedChefId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  let userId = user?.id;

  if (!userId && error) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && typeof decoded === "object" && "userId" in decoded) {
        userId = (decoded as any).userId as string;
      }
    }
  }

  if (!userId) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser || dbUser.role !== "SELLER") {
    return null;
  }

  return userId;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
          <Clock size={16} />
          Pending
        </span>
      );
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
          <CheckCircle size={16} />
          Confirmed
        </span>
      );
    case "PREPARING":
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-bold">
          <UtensilsCrossed size={16} />
          Preparing
        </span>
      );
    case "DELIVERING":
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-bold">
          <Package size={16} />
          Delivering
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">
          <CheckCircle size={16} />
          Completed
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-bold">
          <Clock size={16} />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-bold">
          {status}
        </span>
      );
  }
}

export default async function ChefOrderDetailsPage({ params }: PageProps) {
  const chefId = await getAuthenticatedChefId();
  if (!chefId) {
    redirect("/chef/dashboard");
  }

  const { id } = await params;

  // Get chef's kitchen
  const kitchen = await prisma.kitchen.findFirst({
    where: { sellerId: chefId },
    select: { id: true },
  });

  if (!kitchen) {
    redirect("/chef/dashboard");
  }

  // Fetch order - must belong to this chef's kitchen
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: id }, { id: { endsWith: id } }],
      kitchenId: kitchen.id, // Ensure order belongs to this chef's kitchen
    },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              menu_item_images: {
                take: 1,
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      kitchen: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const friendlyOrderId = `#${order.id.slice(-6).toUpperCase()}`;

  // Calculate chef revenue (excluding delivery fees and platform fees)
  const chefRevenue = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Format delivery time
  let deliveryTimeDisplay = "Not set";
  if (order.delivery_date && order.delivery_time_slot) {
    const deliveryDate = new Date(order.delivery_date);
    const dateStr = deliveryDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const timeSlotNames: Record<string, string> = {
      BREAKFAST: "Breakfast",
      LUNCH: "Lunch",
      SNACKS: "Snacks",
      DINNER: "Dinner",
    };
    const slotName = timeSlotNames[order.delivery_time_slot] || order.delivery_time_slot;
    deliveryTimeDisplay = `${dateStr}, ${slotName}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/chef/orders"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Orders</span>
          </Link>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-gray-900">Order {friendlyOrderId}</h1>
                {getStatusBadge(order.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {order.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {order.createdAt.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Total Order Value</p>
              <p className="text-2xl font-black text-teal-700">৳{order.total}</p>
              <p className="text-xs text-gray-500 mt-1">Your Revenue: ৳{chefRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-teal-700" />
            Customer Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="text-gray-400 mt-1 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                <p className="font-semibold text-gray-900">{order.user.name || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-gray-400 mt-1 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                <p className="font-semibold text-gray-900">{order.user.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                <p className="font-semibold text-gray-900">
                  {order.user.name}'s Saved Address
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Address from customer profile
                </p>
              </div>
            </div>
            {deliveryTimeDisplay && deliveryTimeDisplay !== "Not set" && (
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivery Time</p>
                  <p className="font-semibold text-gray-900">{deliveryTimeDisplay}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UtensilsCrossed size={20} className="text-teal-700" />
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => {
              const itemImage =
                item.menuItem.menu_item_images[0]?.imageUrl || "/placeholder-dish.jpg";
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={itemImage}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{item.menuItem.name}</h3>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}x</p>
                        <p className="text-sm text-gray-500">Unit Price: ৳{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-teal-700 text-lg">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-4 border-t-2 border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal (Your Revenue)</span>
                <span className="font-semibold">৳{chefRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-semibold">
                  ৳{(order.total - chefRevenue).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Paid by Customer</span>
                <span className="text-teal-700 text-xl">৳{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Notes */}
        {order.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Package size={18} />
              Special Instructions
            </h3>
            <p className="text-blue-800">{order.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/chef/orders"
              className="flex-1 bg-gray-100 text-gray-900 font-bold py-3 rounded-lg text-center hover:bg-gray-200 transition"
            >
              Back to Orders
            </Link>
            {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
              <Link
                href={`/chef/orders?highlight=${order.id}`}
                className="flex-1 bg-teal-700 text-white font-bold py-3 rounded-lg text-center hover:bg-teal-800 transition"
              >
                Manage Order Status
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
