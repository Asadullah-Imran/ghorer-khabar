"use client";

import { useState } from "react";

interface ContactChefButtonProps {
  kitchenId: string;
  chefName: string;
}

export default function ContactChefButton({ kitchenId, chefName }: ContactChefButtonProps) {
  const [isContacting, setIsContacting] = useState(false);

  const handleContact = async () => {
    setIsContacting(true);
    
    // TODO: Implement chat/contact functionality
    // For now, just show an alert
    alert(`Contact feature coming soon! Kitchen ID: ${kitchenId}`);
    
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
