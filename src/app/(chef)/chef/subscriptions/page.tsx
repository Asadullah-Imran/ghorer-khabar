"use client";

import { useState } from "react";
import { Plus, Trash2, ChefHat, Power, Edit, Users, DollarSign, TrendingUp } from "lucide-react";
import { SubscriptionPlan, SUBSCRIPTION_PLANS, MenuItem, MENU_ITEMS } from "@/lib/dummy-data/chef";
import SubscriptionModal from "@/components/chef/Subscription/SubscriptionModal";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>(SUBSCRIPTION_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionPlan | undefined>();

  const handleSave = (data: Partial<SubscriptionPlan>) => {
    if (editingSubscription) {
      // Update existing
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === editingSubscription.id ? { ...sub, ...data } as SubscriptionPlan : sub
        )
      );
    } else {
      // Add new
      setSubscriptions([...subscriptions, data as SubscriptionPlan]);
    }
    setIsModalOpen(false);
    setEditingSubscription(undefined);
  };

  const handleEdit = (subscription: SubscriptionPlan) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subscription plan?")) {
      setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
      )
    );
  };

  // Calculate metrics
  const totalSubscribers = subscriptions.reduce((sum, sub) => sum + sub.subscriberCount, 0);
  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.monthlyRevenue, 0);
  const activePlans = subscriptions.filter((sub) => sub.isActive).length;
  const avgSubscribersPerPlan = subscriptions.length > 0 ? Math.round(totalSubscribers / subscriptions.length) : 0;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
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
                menuItems={MENU_ITEMS}
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
          menuItems={MENU_ITEMS}
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
  menuItems: MenuItem[]; // For future use to display dish names
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
  const totalDishes = Object.entries(subscription.schedule).reduce((sum, [, daySchedule]) => {
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
          <p className="text-sm text-gray-600">{subscription.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Days Active</p>
          <p className="font-bold text-gray-900">{Object.keys(subscription.schedule).length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Subscribers</p>
          <p className="font-bold text-blue-600">{subscription.subscriberCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Revenue</p>
          <p className="font-bold text-green-600">৳{(subscription.monthlyRevenue / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Meals per day:</span>
          <span className="font-semibold text-gray-900">{subscription.mealsPerDay}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Servings per meal:</span>
          <span className="font-semibold text-gray-900">{subscription.servingsPerMeal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total dishes in schedule:</span>
          <span className="font-semibold text-gray-900">{totalDishes}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Price:</span>
          <span className="font-bold text-teal-600 text-lg">৳{subscription.price}</span>
        </div>
      </div>

      {/* Schedule Preview */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 mb-2">Weekly Schedule:</p>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
            const daySchedule = subscription.schedule[day];
            const mealCount = daySchedule
              ? [daySchedule.breakfast, daySchedule.lunch, daySchedule.snacks, daySchedule.dinner].filter(m => m).length
              : 0;
            return (
              <div
                key={day}
                className={`p-2 rounded text-center font-semibold ${
                  mealCount > 0 ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                }`}
              >
                <p className="text-xs">{day.slice(0, 3)}</p>
                <p className="text-lg">{mealCount}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onToggleActive}
          className={`py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-1 ${
            subscription.isActive
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          <Power size={16} />
          {subscription.isActive ? "Disable" : "Enable"}
        </button>
        <button
          onClick={onEdit}
          className="py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1"
        >
          <Edit size={16} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition flex items-center justify-center gap-1"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}
