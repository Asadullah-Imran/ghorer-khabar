import BuyerSection from "@/components/Home/BuyerSection";
import CTASection from "@/components/Home/CTASection";
import FeaturedChefs from "@/components/Home/FeaturedChefs";
import Hero from "@/components/Home/Hero";
import HowItWorks from "@/components/Home/HowItWorks";
import PatternDivider from "@/components/Home/PatternDivider";
import SellerSection from "@/components/Home/SellerSection";
import TrustBanner from "@/components/Home/TrustBanner";

export default function Home() {
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
