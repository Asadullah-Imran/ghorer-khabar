"use client";

import { AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TimerBadgeProps {
  createdAt: Date;
  prepTime: number; // in minutes
}

export default function TimerBadge({
  createdAt,
  prepTime,
}: TimerBadgeProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const orderTime = new Date(createdAt);
      const elapsedSeconds = Math.floor((now.getTime() - orderTime.getTime()) / 1000);
      const prepTimeSeconds = prepTime * 60;
      const remainingSeconds = Math.max(0, prepTimeSeconds - elapsedSeconds);
      
      setElapsedTime(elapsedSeconds);
      setRemainingTime(remainingSeconds);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval);
  }, [createdAt, prepTime]);

  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);
  const isOverdue = remainingTime === 0 && prepTime > 0;

  // Show countdown if time remaining, otherwise show elapsed time
  const displayMinutes = remainingTime > 0 ? remainingMinutes : Math.floor(elapsedTime / 60);
  const displaySeconds = remainingTime > 0 ? remainingSeconds : Math.floor(elapsedTime % 60);

  const formattedTime = `${displayMinutes}:${displaySeconds.toString().padStart(2, "0")}`;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
        isOverdue
          ? "bg-red-100 text-red-700 animate-pulse"
          : remainingTime > 0
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {isOverdue ? (
        <AlertCircle size={16} />
      ) : (
        <Clock size={16} />
      )}
      <span>
        {remainingTime > 0 ? `${formattedTime} left` : `${formattedTime} elapsed`}
      </span>
    </div>
  );
}
