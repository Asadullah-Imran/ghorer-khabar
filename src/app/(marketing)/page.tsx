import BuyerSection from "@/components/landing/BuyerSection";
import CTASection from "@/components/landing/CTASection";
import FeaturedChefs from "@/components/landing/FeaturedChefs";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import PatternDivider from "@/components/landing/PatternDivider";
import SellerSection from "@/components/landing/SellerSection";
import TrustBanner from "@/components/landing/TrustBanner";

export default function Landing() {
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
