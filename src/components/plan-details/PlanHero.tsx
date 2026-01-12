import { Star } from "lucide-react";

export default function PlanHero({ plan }: { plan: any }) {
  return (
    <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="grid md:grid-cols-2">
        <div
          className="h-64 md:h-auto bg-cover bg-center min-h-[300px]"
          style={{ backgroundImage: `url(${plan.image})` }}
        ></div>
        <div className="p-8 flex flex-col justify-center">
          <span className="bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-2 py-1 rounded mb-4 w-fit">
            Corporate Favorite
          </span>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4 text-gray-900">
            {plan.name}
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            {plan.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Star size={20} className="text-yellow-400 fill-current" />
            <span className="font-bold text-gray-900">{plan.rating}/5</span>
            <span>({plan.subscriberCount}+ subscribers)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
