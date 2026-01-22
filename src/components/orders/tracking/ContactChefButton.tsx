"use client";

import { useToast } from "@/contexts/ToastContext";
import { useState } from "react";

interface ContactChefButtonProps {
  kitchenId: string;
  chefName: string;
}

export default function ContactChefButton({ kitchenId, chefName }: ContactChefButtonProps) {
  const [isContacting, setIsContacting] = useState(false);
  const toast = useToast();

  const handleContact = async () => {
    setIsContacting(true);
    
    // TODO: Implement chat/contact functionality
    // For now, just show a toast
    toast.info("Coming Soon", "Contact feature will be available soon!");
    
    setTimeout(() => setIsContacting(false), 1000);
  };

  return (
    <button
      onClick={handleContact}
      disabled={isContacting}
      className="w-full py-3 rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="material-symbols-outlined">chat</span>
      {isContacting ? 'Connecting...' : `Contact ${chefName}`}
    </button>
  );
}
