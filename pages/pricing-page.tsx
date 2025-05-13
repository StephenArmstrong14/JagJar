import { MainLayout } from "@/layouts/main-layout";
import { PricingSection } from "@/components/pricing-section";
import { Helmet } from "react-helmet";

export default function PricingPage() {
  return (
    <MainLayout>
      <Helmet>
        <title>Pricing - JagJar</title>
        <meta name="description" content="Choose a JagJar plan that works for you. Freemium with limited hours or Premium with unlimited access to JagJar-enabled sites." />
        <meta property="og:title" content="JagJar Pricing - Free and Premium Plans" />
        <meta property="og:description" content="Choose between JagJar's free plan with limited hours or premium subscription with unlimited access." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-neutral-800 mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Choose the plan that works for you. Fair pricing for users, fair revenue for developers.
            </p>
          </div>
          
          <PricingSection />
        </div>
      </div>
    </MainLayout>
  );
}
