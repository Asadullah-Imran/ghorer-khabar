import Image from "next/image";

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

interface MenuItem {
  id: string;
  name: string;
  menu_item_images?: { imageUrl: string }[];
}

interface DishTrackingCardProps {
  dish: MenuItem;
  quantity: number;
  price: number;
  status: OrderStatus;
}

function getStatusMessage(status: OrderStatus): { icon: string; color: string; message: string } {
  switch (status) {
    case 'PENDING':
    case 'CONFIRMED':
      return { icon: 'schedule', color: 'text-yellow-600', message: 'Waiting to start' };
    case 'PREPARING':
      return { icon: 'skillet', color: 'text-orange-600 animate-pulse', message: 'Cooking now' };
    case 'DELIVERING':
      return { icon: 'check_circle', color: 'text-green-600', message: 'Ready' };
    case 'COMPLETED':
      return { icon: 'check_circle', color: 'text-brand-teal', message: 'Delivered' };
    case 'CANCELLED':
      return { icon: 'cancel', color: 'text-red-600', message: 'Cancelled' };
    default:
      return { icon: 'info', color: 'text-gray-600', message: 'Processing' };
  }
}

export default function DishTrackingCard({
  dish,
  quantity,
  price,
  status
}: DishTrackingCardProps) {
  const statusInfo = getStatusMessage(status);
  const imageUrl = dish.menu_item_images?.[0]?.imageUrl;

  return (
    <div className="bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden hover:shadow-md transition-shadow">
      {/* Dish Image */}
      <div className="relative h-32 bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={dish.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400 text-4xl">restaurant</span>
          </div>
        )}
        
        {/* Quantity Badge */}
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-900 text-brand-teal dark:text-primary font-bold px-2.5 py-1 rounded-full text-sm shadow-md border border-gray-200 dark:border-white/10">
          {quantity}x
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium shadow-sm border border-gray-200 dark:border-white/10">
          <span className={`material-symbols-outlined ${statusInfo.color} align-middle`} style={{ fontSize: '14px' }}>
            {statusInfo.icon}
          </span>
        </div>
      </div>

      {/* Dish Info */}
      <div className="p-3">
        <h4 className="font-bold text-sm text-text-main dark:text-white line-clamp-1 mb-1">
          {dish.name}
        </h4>
        
        <div className="flex items-center justify-between">
          <span className={`text-xs ${statusInfo.color} font-medium`}>
            {statusInfo.message}
          </span>
          <span className="font-bold text-brand-teal dark:text-primary text-sm">
            ৳{price * quantity}
          </span>
        </div>
      </div>
    </div>
  );
}
