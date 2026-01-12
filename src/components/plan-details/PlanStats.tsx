import { Utensils, Users, Wallet } from "lucide-react";

export default function PlanStats({ plan }: { plan: any }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Utensils size={20} className="text-teal-700" />
          <p className="text-gray-500 text-sm font-medium">Meals per day</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">{plan.mealsPerDay} Full Meals</p>
      </div>
      <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Users size={20} className="text-teal-700" />
          <p className="text-gray-500 text-sm font-medium">Servings per meal</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">{plan.servingsPerMeal} Person</p>
      </div>
      <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Wallet size={20} className="text-teal-700" />
          <p className="text-gray-500 text-sm font-medium">Monthly price</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">৳{plan.price}</p>
      </div>
    </section>
  );
}