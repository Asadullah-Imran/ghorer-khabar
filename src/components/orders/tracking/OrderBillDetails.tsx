interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
  };
}

interface OrderBillDetailsProps {
  items: OrderItem[];
  deliveryFee?: number;
  platformFee?: number;
  total: number;
  paymentMethod?: string;
}

export default function OrderBillDetails({
  items,
  deliveryFee = 50,
  platformFee = 20,
  total,
  paymentMethod
}: OrderBillDetailsProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
      <h3 className="font-bold text-lg text-text-main dark:text-white mb-4 border-b border-gray-100 dark:border-white/10 pb-3">
        Bill Details
      </h3>

      {/* Item List */}
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex items-start gap-2 flex-1">
              <span className="bg-background-light dark:bg-white/10 text-brand-teal dark:text-primary font-bold px-2 py-0.5 rounded text-xs">
                {item.quantity}x
              </span>
              <span className="text-text-main dark:text-gray-200 line-clamp-1">
                {item.menuItem.name}
              </span>
            </div>
            <span className="font-semibold text-text-main dark:text-gray-200 ml-2">
              ৳{item.price * item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/10">
        <div className="flex justify-between text-sm text-text-secondary dark:text-gray-400">
          <span>Item Total ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          <span>৳{subtotal}</span>
        </div>
        
        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm text-text-secondary dark:text-gray-400">
            <span>Delivery Fee</span>
            <span>৳{deliveryFee}</span>
          </div>
        )}
        
        {platformFee > 0 && (
          <div className="flex justify-between text-sm text-text-secondary dark:text-gray-400">
            <span>Platform Fee</span>
            <span>৳{platformFee}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-3 mt-3 border-t border-dashed border-gray-200 dark:border-white/10">
          <span className="font-bold text-lg text-brand-teal dark:text-white">Total Amount</span>
          <span className="font-black text-xl text-brand-teal dark:text-primary">৳{total}</span>
        </div>

        {/* Payment Method */}
        {paymentMethod && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-gray-500">
              <span className="material-symbols-outlined text-[16px]">credit_card</span>
              Paid via {paymentMethod}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
