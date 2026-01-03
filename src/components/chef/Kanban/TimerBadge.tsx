"use client";

import { AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TimerBadgeProps {
  startTime: Date;
  warningThreshold?: number; // minutes
}

export default function TimerBadge({
  startTime,
  warningThreshold = 20,
}: TimerBadgeProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000); // seconds
      setElapsedTime(diff);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const isWarning = minutes > warningThreshold;

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
        isWarning
          ? "bg-red-100 text-red-700 animate-pulse"
          : "bg-green-100 text-green-700"
      }`}
    >
      {isWarning ? (
        <AlertCircle size={16} />
      ) : (
        <Clock size={16} />
      )}
      <span>{formattedTime}</span>
    </div>
  );
}
