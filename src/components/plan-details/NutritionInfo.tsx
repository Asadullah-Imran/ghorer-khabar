import { Apple } from "lucide-react";

export default function NutritionInfo({ nutrition }: { nutrition: any }) {
  if (!nutrition) return null;
  
  return (
    <section className="bg-teal-50 rounded-2xl p-8 border border-teal-100">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-teal-900">
        <Apple size={20} className="text-teal-700" />
        Average Daily Nutrition
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div>
          <p className="text-2xl font-black text-teal-900">{nutrition.calories}</p>
          <p className="text-xs font-medium text-teal-600 uppercase tracking-tighter">Calories</p>
        </div>
        <div>
          <p className="text-2xl font-black text-teal-900">{nutrition.protein}</p>
          <p className="text-xs font-medium text-teal-600 uppercase tracking-tighter">Protein</p>
        </div>
        <div>
          <p className="text-2xl font-black text-teal-900">{nutrition.carbs}</p>
          <p className="text-xs font-medium text-teal-600 uppercase tracking-tighter">Carbs</p>
        </div>
        <div>
          <p className="text-2xl font-black text-teal-900">{nutrition.fats}</p>
          <p className="text-xs font-medium text-teal-600 uppercase tracking-tighter">Healthy Fats</p>
        </div>
      </div>
    </section>
  );
}