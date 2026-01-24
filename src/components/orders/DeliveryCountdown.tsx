"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface DeliveryCountdownProps {
  deliveryDate: string | Date;
  deliveryTimeSlot?: string | null;
  status?: string;
  compact?: boolean;
}

export default function DeliveryCountdown({
  deliveryDate,
  deliveryTimeSlot,
  status,
  compact = false,
}: DeliveryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const delivery = new Date(deliveryDate);
      const now = new Date();
      const difference = delivery.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Delivery time has passed");
        return;
      }

      setIsExpired(false);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference / (1000 * 60 * 60)) % 24
      );
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (days > 0) {
        setTimeLeft(
          `${days}d ${hours}h ${minutes}m`
        );
      } else if (hours > 0) {
        setTimeLeft(
          `${hours}h ${minutes}m ${seconds}s`
        );
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deliveryDate]);

  if (!mounted) {
    return null;
  }

  if (status === "COMPLETED" || status === "CANCELLED") {
    return null;
  }

  const deliveryDateObj = new Date(deliveryDate);
  const dateString = deliveryDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const timeString = deliveryDateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
          isExpired
            ? "bg-red-100 text-red-700"
            : "bg-teal-100 text-teal-700"
        }`}
      >
        <Clock size={14} />
        <span>{timeLeft}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        {isExpired ? (
          <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
        ) : (
          <Clock className="text-teal-700 flex-shrink-0 mt-1" size={24} />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">Delivery Countdown</h3>
          <p className="text-sm text-gray-600 mb-3">
            Expected delivery on {dateString} at {timeString}
            {deliveryTimeSlot && ` (${deliveryTimeSlot})`}
          </p>

          <div
            className={`text-3xl font-black font-mono ${
              isExpired ? "text-red-600" : "text-teal-700"
            }`}
          >
            {timeLeft}
          </div>

          {isExpired && (
            <p className="text-sm text-red-600 mt-2 font-semibold">
              The delivery time has passed. Please contact the chef for updates.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
