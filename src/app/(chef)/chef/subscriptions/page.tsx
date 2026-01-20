"use client";

import SubscriptionModal from "@/components/chef/Subscription/SubscriptionModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { AlertCircle, ChefHat, DollarSign, Edit, Plus, Power, Trash2, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  prepTime?: number;
  calories?: number;
  isVegetarian: boolean;
  isAvailable: boolean;
}

interface MealSlot {
  time: string;
  dishIds: string[];
}

interface DaySchedule {
  breakfast?: MealSlot;
  lunch?: MealSlot;
  snacks?: MealSlot;
  dinner?: MealSlot;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  mealsPerDay: number;
  servingsPerMeal: number;
  price: number;
  isActive: boolean;
  subscriberCount: number;
  monthlyRevenue: number;
  coverImage?: string;
  schedule?: Record<string, DaySchedule>;
  createdAt: Date;
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionPlan | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Fetch subscriptions and menu items
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.kitchen?.id) {
        setError("Kitchen information not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch menu items
        const menuResponse = await fetch("/api/chef/menu");
        if (!menuResponse.ok) {
          throw new Error("Failed to fetch menu items");
        }
        const menuData = await menuResponse.json();
        setMenuItems(menuData.data || []);

        // Fetch subscriptions
        const subsResponse = await fetch("/api/chef/subscriptions");
        if (!subsResponse.ok) {
          throw new Error("Failed to fetch subscriptions");
        }
        const subsData = await subsResponse.json();

        // Transform API response to component format
        const dayMap: Record<string, string> = {
          SATURDAY: "Saturday",
          SUNDAY: "Sunday",
          MONDAY: "Monday",
          TUESDAY: "Tuesday",
          WEDNESDAY: "Wednesday",
          THURSDAY: "Thursday",
          FRIDAY: "Friday",
        };

        const transformedPlans = subsData.data.map((plan: any) => {
          // Transform schedule keys from UPPERCASE to day names
          let schedule = plan.schedule;
          if (schedule) {
            const transformedSchedule: Record<string, any> = {};
            for (const [day, daySchedule] of Object.entries(schedule)) {
              const dayName = dayMap[day as string] || day;
              transformedSchedule[dayName] = daySchedule;
            }
            schedule = transformedSchedule;
          }

          return {
            ...plan,
            schedule,
            createdAt: new Date(plan.createdAt),
          };
        });

        setSubscriptions(transformedPlans);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load data";
        setError(message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.kitchen?.id]);

  const handleSave = async (data: Partial<SubscriptionPlan>) => {
    try {
      // Transform schedule keys from day names to UPPERCASE enums
      const transformedData = { ...data };
      if (data.schedule) {
        const transformedSchedule: Record<string, any> = {};
        for (const [day, daySchedule] of Object.entries(data.schedule)) {
          const uppercaseDay = day.toUpperCase();
          transformedSchedule[uppercaseDay] = daySchedule;
        }
        transformedData.schedule = transformedSchedule;
      }

      if (editingSubscription) {
        // Update existing
        const response = await fetch(`/api/chef/subscriptions/${editingSubscription.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transformedData),
        });
        if (!response.ok) throw new Error("Failed to update subscription");

        setSubscriptions(
          subscriptions.map((sub) =>
            sub.id === editingSubscription.id ? { ...sub, ...data } as SubscriptionPlan : sub
          )
        );
      } else {
        // Add new
        const response = await fetch("/api/chef/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transformedData),
        });
        if (!response.ok) throw new Error("Failed to create subscription");

        const result = await response.json();
        
        // Transform schedule keys from UPPERCASE to day names (same as GET endpoint)
        const dayMap: Record<string, string> = {
          SATURDAY: "Saturday",
          SUNDAY: "Sunday",
          MONDAY: "Monday",
          TUESDAY: "Tuesday",
          WEDNESDAY: "Wednesday",
          THURSDAY: "Thursday",
          FRIDAY: "Friday",
        };
        
        let schedule = result.data.schedule;
        if (schedule) {
          const transformedSchedule: Record<string, any> = {};
          for (const [day, daySchedule] of Object.entries(schedule)) {
            const dayName = dayMap[day as string] || day;
            transformedSchedule[dayName] = daySchedule;
          }
          schedule = transformedSchedule;
        }
        
        setSubscriptions([...subscriptions, { ...result.data, schedule, createdAt: new Date(), subscriberCount: 0, monthlyRevenue: 0, coverImage: data.coverImage } as SubscriptionPlan]);
      }
      setIsModalOpen(false);
      setEditingSubscription(undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast.error("Operation Failed", message);
    }
  };

  const handleEdit = (subscription: SubscriptionPlan) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscription plan?")) {
      try {
        const response = await fetch(`/api/chef/subscriptions/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete subscription");

        setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete";
        toast.error("Delete Failed", message);
      }
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const subscription = subscriptions.find((s) => s.id === id);
      if (!subscription) return;

      const response = await fetch(`/api/chef/subscriptions/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !subscription.isActive }),
      });
      if (!response.ok) throw new Error("Failed to update status");

      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      toast.error("Status Update Failed", message);
    }
  };

  // Calculate metrics
  const totalSubscribers = subscriptions.reduce((sum, sub) => sum + sub.subscriberCount, 0);
  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.monthlyRevenue, 0);
  const activePlans = subscriptions.filter((sub) => sub.isActive).length;
  const avgSubscribersPerPlan = subscriptions.length > 0 ? Math.round(totalSubscribers / subscriptions.length) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Data</h3>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500 mt-2">Configure and manage your recurring meal packages.</p>
        </div>
        <button
          onClick={() => {
            setEditingSubscription(undefined);
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition shadow-md flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Plan
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Total Subscribers</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalSubscribers}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Monthly Revenue</span>
          </div>
          <p className="text-3xl font-bold text-green-600">৳{(totalRevenue / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-yellow-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Active Plans</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{activePlans}/{subscriptions.length}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Avg Subscribers</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{avgSubscribersPerPlan}</p>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">All Subscription Plans</h2>

        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Subscription Plans Yet</h3>
            <p className="text-gray-600 mb-4">Create your first subscription plan to start earning recurring revenue.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                menuItems={menuItems}
                onEdit={() => handleEdit(subscription)}
                onDelete={() => handleDelete(subscription.id)}
                onToggleActive={() => toggleActive(subscription.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SubscriptionModal
          subscription={editingSubscription}
          menuItems={menuItems}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSubscription(undefined);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

interface SubscriptionCardProps {
  subscription: SubscriptionPlan;
  menuItems: MenuItem[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onToggleActive,
}: SubscriptionCardProps) {
  // Handle cases where schedule might be undefined
  const schedule = subscription.schedule || {};
  
  const totalDishes = Object.entries(schedule).reduce((sum, [, daySchedule]) => {
    if (!daySchedule || typeof daySchedule !== "object") return sum;
    return sum +
      (daySchedule.breakfast?.dishIds?.length || 0) +
      (daySchedule.lunch?.dishIds?.length || 0) +
      (daySchedule.snacks?.dishIds?.length || 0) +
      (daySchedule.dinner?.dishIds?.length || 0);
  }, 0);

  return (
    <div className={`bg-white rounded-xl border-2 shadow-sm p-6 ${
      subscription.isActive ? "border-green-200" : "border-gray-200"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{subscription.name}</h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded ${
              subscription.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {subscription.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          {subscription.description && (
            <p className="text-sm text-gray-600">{subscription.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Edit"
          >
            <Edit size={20} className="text-gray-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <Trash2 size={20} className="text-red-600" />
          </button>
        </div>
      </div>

      {/* Price and Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase">Price</p>
          <p className="text-xl font-bold text-gray-900">৳{subscription.price.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase">Meals Per Day</p>
          <p className="text-xl font-bold text-gray-900">{subscription.mealsPerDay}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Subscribers</p>
          <p className="text-lg font-bold text-blue-600">{subscription.subscriberCount}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Revenue</p>
          <p className="text-lg font-bold text-green-600">৳{(subscription.monthlyRevenue / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Dishes</p>
          <p className="text-lg font-bold text-purple-600">{totalDishes}</p>
        </div>
      </div>

      {/* Weekly Schedule Preview */}
      {Object.keys(schedule).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 mb-2">Weekly Schedule:</p>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
              const daySchedule = schedule[day];
              const meals = [];
              if (daySchedule?.breakfast?.dishIds?.length) meals.push("B");
              if (daySchedule?.lunch?.dishIds?.length) meals.push("L");
              if (daySchedule?.snacks?.dishIds?.length) meals.push("S");
              if (daySchedule?.dinner?.dishIds?.length) meals.push("D");
              return (
                <div
                  key={day}
                  className={`p-2 rounded text-center font-semibold ${
                    meals.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <p className="text-xs uppercase font-bold">{day.slice(0, 3)}</p>
                  <p className="text-xs mt-1">{meals.join("/")}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle Active */}
      <button
        onClick={onToggleActive}
        className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
          subscription.isActive
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-green-50 text-green-600 hover:bg-green-100"
        }`}
      >
        <Power size={16} />
        {subscription.isActive ? "Deactivate Plan" : "Activate Plan"}
      </button>
    </div>
  );
}
