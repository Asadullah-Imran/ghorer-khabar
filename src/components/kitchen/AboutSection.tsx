import { Clock, Info, MapPin, ShieldCheck } from "lucide-react";

interface AboutSectionProps {
  data: {
    description: string;
    location: string;
    area: string;
    type: string;
    isOpen: boolean;
    isActive: boolean;
    rating: number;
    reviewCount: number;
    kriScore: number;
    stats: {
      orders: string;
      satisfaction: string;
    };
  };
}

export default function AboutSection({ data }: AboutSectionProps) {
  return (
    <div className="space-y-8">
      {/* Description Card */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="text-teal-600" size={20} />
          About the Kitchen
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {data.description}
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-700">
            <MapPin size={16} className="text-teal-600" />
            <span>{data.location}, {data.area}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-700">
            <Clock size={16} className="text-teal-600" />
            <span>{data.isOpen ? "Open Now" : "Closed"}</span>
          </div>
        </div>
      </section>

      {/* Quality & Safety */}
      <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="text-blue-600" size={20} />
          Quality & Safety
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Hygiene Rating</h4>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black text-blue-600">{data.kriScore}</div>
              <div className="text-sm text-gray-600">
                KRI Score<br/>(Key Reliability Index)
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              This score is calculated based on customer reviews, order completion rates, and hygiene reports.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Customer Satisfaction</h4>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black text-green-600">{data.stats.satisfaction}</div>
              <div className="text-sm text-gray-600">
                Satisfaction Rate
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Based on {data.stats.orders} orders delivered.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
