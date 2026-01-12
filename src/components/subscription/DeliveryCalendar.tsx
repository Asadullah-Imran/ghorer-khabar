import { Lightbulb } from "lucide-react";

export default function DeliveryCalendar({ deliveries }: { deliveries: any[] }) {
  return (
    <div className="sticky top-24 space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Upcoming Deliveries</h3>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md">
            This Week
          </span>
        </div>
        
        <div className="flex flex-col gap-4">
          {deliveries.map((item, i) => (
            <div 
                key={i} 
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                    item.isToday 
                        ? "bg-yellow-50 border border-yellow-200" 
                        : "hover:bg-gray-50 border border-transparent"
                }`}
            >
              <div className={`flex flex-col items-center justify-center min-w-[50px] h-[60px] rounded-lg font-black ${
                  item.isToday ? "bg-yellow-400 text-white shadow-sm" : "bg-gray-100 text-gray-900"
              }`}>
                <span className="text-xs leading-none opacity-80 uppercase">{item.day}</span>
                <span className="text-xl leading-none">{item.date}</span>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {item.isToday && (
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase text-yellow-600 tracking-widest">Today</span>
                        <div className="h-px flex-1 bg-yellow-200"></div>
                    </div>
                )}
                <p className="text-sm font-bold truncate text-gray-900">{item.dish}</p>
                <p className="text-[11px] text-gray-500">
                    {item.isToday ? `Arriving at ${item.time}` : item.chef}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 border-2 border-teal-100 hover:border-teal-600 text-teal-700 text-sm font-bold py-3 rounded-xl transition-all">
           View Full Calendar
        </button>
      </div>

      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3 text-teal-700">
          <Lightbulb size={18} />
          <h4 className="text-sm font-bold">Pro Tip</h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
           Going on vacation? You can pause your subscription up to 24 hours before delivery.
        </p>
      </div>
    </div>
  );
}