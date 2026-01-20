import { MapPin } from 'lucide-react';

interface DistanceBadgeProps {
  distance: string | null;
  className?: string;
  showIcon?: boolean;
}

/**
 * Display distance from user to kitchen/location
 * Shows "X km away" or "X m away"
 */
export default function DistanceBadge({
  distance,
  className = '',
  showIcon = true,
}: DistanceBadgeProps) {
  if (!distance) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-1 text-sm text-gray-600 ${className}`}
    >
      {showIcon && <MapPin className="w-4 h-4" />}
      <span>{distance} away</span>
    </div>
  );
}
