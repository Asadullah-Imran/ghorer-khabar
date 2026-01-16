import BuyerSection from "@/components/landing/BuyerSection";
import CTASection from "@/components/landing/CTASection";
import FeaturedChefs from "@/components/landing/FeaturedChefs";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import PatternDivider from "@/components/landing/PatternDivider";
import SellerSection from "@/components/landing/SellerSection";
import TrustBanner from "@/components/landing/TrustBanner";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { redirect } from "next/navigation";

export default async function Landing() {
  const userId = await getAuthUserId();

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user) {
      if (user.role === "SELLER") {
        redirect("/chef/dashboard");
      } else {
        redirect("/feed");
      }
    }
  }
  return (
    <>
      <Hero />
      <TrustBanner />
      <BuyerSection />
      <PatternDivider />
      <SellerSection />
      <FeaturedChefs />
      <HowItWorks />
      <CTASection />
    </>
  );
}
