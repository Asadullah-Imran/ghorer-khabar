import BuyerSection from "@/components/HomeSections/BuyerSection";
import CTASection from "@/components/HomeSections/CTASection";
import FeaturedChefs from "@/components/HomeSections/FeaturedChefs";
import Hero from "@/components/HomeSections/Hero";
import HowItWorks from "@/components/HomeSections/HowItWorks";
import PatternDivider from "@/components/HomeSections/PatternDivider";
import SellerSection from "@/components/HomeSections/SellerSection";
import TrustBanner from "@/components/HomeSections/TrustBanner";

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
