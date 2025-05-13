import { MainLayout } from "@/layouts/main-layout";
import FeaturesSection from "@/components/features-section";
import CtaSection from "@/components/cta-section";
import { Helmet } from "react-helmet";

export default function FeaturesPage() {
  return (
    <MainLayout>
      <Helmet>
        <title>JagJar Features - Monetization Platform</title>
        <meta name="description" content="Explore JagJar's features for web application monetization through time-based tracking. Simple integration, accurate analytics, and fair revenue sharing." />
        <meta property="og:title" content="JagJar Features - Monetization Platform" />
        <meta property="og:description" content="Explore all the features JagJar offers for developers and users. Time tracking, analytics, and revenue sharing made simple." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-neutral-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              JagJar Features
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-neutral-500">
              Everything you need to monetize your web applications based on actual user engagement time.
            </p>
          </div>
        </div>
      </div>
      
      <FeaturesSection />
      <CtaSection />
    </MainLayout>
  );
}