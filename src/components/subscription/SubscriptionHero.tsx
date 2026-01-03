import { Calendar, Clock, CreditCard, MapPin } from "lucide-react";

export default function SubscriptionHero({ sub }: { sub: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{sub.planName}</h1>
          <p className="text-gray-500">
            Provided by{" "}
            <span className="font-semibold text-teal-700">{sub.kitchen}</span>
          </p>
        </div>
        <span className="self-start px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
          {sub.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-3 text-gray-600">
          <Clock size={18} className="text-gray-400" />
          <span>
            Delivered at <strong>{sub.deliveryTime}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin size={18} className="text-gray-400" />
          <span className="truncate">{sub.address}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Calendar size={18} className="text-gray-400" />
          <span>
            {sub.startDate} - {sub.endDate}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <CreditCard size={18} className="text-gray-400" />
          <span>৳{sub.price} / month</span>
        </div>
      </div>
    </div>
  );
}
