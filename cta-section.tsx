import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Code, Smartphone } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-12 bg-primary-500 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started with JagJar?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join the community of developers and users building a sustainable future for web applications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
              <Code className="h-10 w-10 mx-auto mb-4 text-white" />
              <h3 className="text-xl font-bold mb-3">For Developers</h3>
              <p className="mb-4 opacity-90">
                Monetize your web application based on actual user engagement with our simple integration.
              </p>
              <Link href="/developers">
                <Button className="bg-white text-primary-600 hover:bg-neutral-100">
                  Get Your API Key
                </Button>
              </Link>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
              <Smartphone className="h-10 w-10 mx-auto mb-4 text-white" />
              <h3 className="text-xl font-bold mb-3">For Users</h3>
              <p className="mb-4 opacity-90">
                Access great web applications with our browser extensions for Chrome, Firefox, Safari, and Edge to support the developers you love.
              </p>
              <Link href="/extension">
                <Button className="bg-white text-primary-600 hover:bg-neutral-100">
                  Get Extensions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
