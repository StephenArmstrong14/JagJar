import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Code, 
  Clock, 
  LayoutGrid,
  Check 
} from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">How JagJar Works</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            A simple, fair monetization system for web applications based on actual time spent by users.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* For Developers Card */}
          <Card className="bg-neutral-50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-neutral-800 mb-3 flex items-center">
                <Code className="h-5 w-5 text-primary-500 mr-2" />
                For Developers
              </h3>
              <p className="text-neutral-600 mb-4">Generate an API key and integrate JagJar into your web application with a few lines of code.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Easy API integration</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Time tracking analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Revenue share based on usage</span>
                </li>
              </ul>
              <Link href="/developers" className="text-primary-500 font-medium hover:text-primary-600 flex items-center">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </CardContent>
          </Card>
          
          {/* For Users Card */}
          <Card className="bg-neutral-50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-neutral-800 mb-3 flex items-center">
                <Clock className="h-5 w-5 text-secondary-500 mr-2" />
                For Users
              </h3>
              <p className="text-neutral-600 mb-4">Install the JagJar browser extension on your favorite browser to access JagJar-enabled websites.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Chrome, Firefox, Safari & Edge</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Free tier with 8 hour monthly limit</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Premium for unlimited access ($25/mo)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Cross-device synchronization</span>
                </li>
              </ul>
              <Link href="/extension" className="text-secondary-500 font-medium hover:text-secondary-600 flex items-center">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </CardContent>
          </Card>
          
          {/* JagJar Platform Card */}
          <Card className="bg-neutral-50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-neutral-800 mb-3 flex items-center">
                <LayoutGrid className="h-5 w-5 text-neutral-700 mr-2" />
                JagJar Platform
              </h3>
              <p className="text-neutral-600 mb-4">The backbone that connects developers and users through fair, usage-based monetization.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Accurate time tracking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Automated revenue sharing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Detailed analytics dashboard</span>
                </li>
              </ul>
              <Link href="/pricing" className="text-neutral-700 font-medium hover:text-neutral-800 flex items-center">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
