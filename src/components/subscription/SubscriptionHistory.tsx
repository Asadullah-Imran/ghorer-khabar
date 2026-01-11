import { Download, History } from "lucide-react";

export default function SubscriptionHistory({ history }: { history: any[] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="text-teal-700" size={24} />
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Subscription History</h2>
        </div>
        <button className="text-teal-700 text-sm font-bold flex items-center gap-1 hover:underline">
           Export Records <Download size={16} />
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chef</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{item.planName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.period}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.chef}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        item.status === 'Completed' 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-red-50 text-red-500'
                    }`}>
                        {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-teal-700">৳{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}