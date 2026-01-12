import SubscriptionHero from "@/components/subscription/SubscriptionHero";
import SubscriptionSettings from "@/components/subscription/SubscriptionSettings";
import UpcomingMenu from "@/components/subscription/UpcomingMenu";
import { SUBSCRIPTION_DETAILS } from "@/lib/dummy-data/subscriptions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SingleSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sub = SUBSCRIPTION_DETAILS; // Fetch based on ID in real app

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Back Nav */}
      <Link
        href="/profile/subscription"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-700 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Plans
      </Link>

      {/* Server Component: Static Info */}
      <SubscriptionHero sub={sub} />

      {/* Client Component: Interactive Menu (Skip) */}
      <UpcomingMenu initialMeals={sub.upcomingMeals} />

      {/* Client Component: Settings (Pause/Cancel) */}
      <SubscriptionSettings />
    </div>
  );
}
