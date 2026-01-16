type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

interface OrderProgressStepperProps {
  currentStatus: OrderStatus;
  estimatedDelivery?: Date;
  size?: 'sm' | 'md' | 'lg';
}

const statusSteps = [
  { key: ['PENDING', 'CONFIRMED'], label: 'Accepted', icon: 'check' },
  { key: ['PREPARING'], label: 'Cooking', icon: 'skillet' },
  { key: ['DELIVERING'], label: 'Ready', icon: 'inventory_2' },
  { key: ['COMPLETED'], label: 'Delivered', icon: 'local_shipping' },
];

function getStatusIndex(status: OrderStatus): number {
  return statusSteps.findIndex(step => 
    Array.isArray(step.key) ? step.key.includes(status) : step.key === status
  );
}

export default function OrderProgressStepper({
  currentStatus,
  estimatedDelivery,
  size = 'md'
}: OrderProgressStepperProps) {
  const currentIndex = getStatusIndex(currentStatus);
  const progressPercentage = currentStatus === 'CANCELLED' 
    ? 0 
    : ((currentIndex + 1) / statusSteps.length) * 100;

  const sizeClasses = {
    sm: { icon: 'size-6', iconText: 'text-[14px]', label: 'text-[10px]', activeIcon: 'size-7' },
    md: { icon: 'size-8', iconText: 'text-[16px]', label: 'text-xs', activeIcon: 'size-10' },
    lg: { icon: 'size-10', iconText: 'text-[20px]', label: 'text-sm', activeIcon: 'size-12' },
  };

  const classes = sizeClasses[size];

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border-l-4 border-red-500">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-red-600 dark:text-red-400">cancel</span>
          <div>
            <p className="font-bold text-red-700 dark:text-red-300 text-sm">Order Cancelled</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Progress Bar Background */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full z-0" />
      
      {/* Progress Bar Fill */}
      <div 
        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-1000 ease-out"
        style={{ width: `${progressPercentage}%` }}
      />

      {/* Steps */}
      <div className="relative z-10 flex justify-between w-full">
        {statusSteps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.label} className="flex flex-col items-center gap-2 group">
              {/* Icon */}
              <div
                className={`
                  rounded-full flex items-center justify-center ring-4 ring-white dark:ring-background-dark
                  transition-all duration-300
                  ${isCurrent ? `${classes.activeIcon} bg-primary text-text-main shadow-md ${size === 'md' ? 'animate-pulse' : ''}` : ''}
                  ${isCompleted ? `${classes.icon} bg-brand-teal text-white` : ''}
                  ${isPending ? `${classes.icon} bg-gray-200 dark:bg-gray-700 text-gray-400 opacity-40` : ''}
                `}
              >
                <span className={`material-symbols-outlined ${isCurrent ? classes.iconText : 'text-[14px]'}`}>
                  {step.icon}
                </span>
              </div>

              {/* Label */}
              <span
                className={`
                  font-semibold uppercase tracking-wide
                  ${classes.label}
                  ${isCurrent ? 'text-primary font-bold' : ''}
                  ${isCompleted ? 'text-brand-teal dark:text-gray-300' : ''}
                  ${isPending ? 'text-text-secondary font-medium opacity-40' : ''}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Estimated Delivery */}
      {estimatedDelivery && currentStatus !== 'COMPLETED' && (
        <div className="mt-6 bg-brand-teal/5 dark:bg-primary/5 rounded-lg p-3 text-center border border-brand-teal/10 dark:border-primary/10">
          <p className="text-brand-teal dark:text-primary font-medium text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            Estimated delivery: {estimatedDelivery.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
      )}
    </div>
  );
}
