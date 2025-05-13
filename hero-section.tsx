import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary-500 opacity-5 -skew-y-6 transform origin-top-left"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
            Monetize Your Web Applications with <span className="text-primary-500">JagJar</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-6 max-w-3xl mx-auto">
            The simple way to earn revenue based on actual user engagement. Integrated time tracking, browser extension, and developer API all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Link href="/developers">
              <Button size="lg" className="shadow-lg hover:shadow-xl">
                For Developers
              </Button>
            </Link>
            <Link href="/extension">
              <Button size="lg" variant="outline" className="shadow-lg hover:shadow-xl">
                Get Browser Extension
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
