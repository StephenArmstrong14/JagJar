import { MainLayout } from "@/layouts/main-layout";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import { PricingSection } from "@/components/pricing-section";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <MainLayout>
      <Helmet>
        <title>JagJar - Monetize Your Web Applications</title>
        <meta name="description" content="JagJar helps developers monetize web applications through user engagement tracking. Install our browser extension and earn revenue based on actual usage." />
        <meta property="og:title" content="JagJar - Monetize Your Web Applications" />
        <meta property="og:description" content="Earn revenue based on actual user engagement with JagJar's simple integration and browser extension." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </MainLayout>
  );
}
