"use client";

import { Power } from "lucide-react";
import { useEffect, useState } from "react";

interface KitchenStatusToggleProps {
  initialStatus?: boolean;
  onStatusChange?: (status: boolean) => void;
}

export default function KitchenStatusToggle({
  initialStatus = true,
  onStatusChange,
}: KitchenStatusToggleProps) {
  const [isOpen, setIsOpen] = useState(initialStatus);

  // Sync internal state whenever upstream status changes (e.g. after reload)
  useEffect(() => {
    setIsOpen(initialStatus);
  }, [initialStatus]);

  const handleToggle = () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    onStatusChange?.(newStatus);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
        isOpen
          ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
          : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
      }`}
    >
      <Power size={18} />
      <span>{isOpen ? "Kitchen Open" : "Kitchen Closed"}</span>
    </button>
  );
}
