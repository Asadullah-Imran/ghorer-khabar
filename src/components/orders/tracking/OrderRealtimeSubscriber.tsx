"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

interface OrderRealtimeSubscriberProps {
  orderId: string;
  userId: string;
  initialStatus: OrderStatus;
}

export default function OrderRealtimeSubscriber({ 
  orderId, 
  userId,
  initialStatus 
}: OrderRealtimeSubscriberProps) {
  const router = useRouter();
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Subscribe to changes on the orders table
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order updated:', payload);
          
          // Check if status changed
          const newStatus = payload.new.status;
          if (newStatus !== initialStatus) {
            // Refresh the page to show updated data
            router.refresh();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [orderId, userId, initialStatus, router, supabase]);

  // This component doesn't render anything
  return null;
}
