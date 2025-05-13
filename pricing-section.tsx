import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Clock, BarChart, DollarSign } from "lucide-react";

export function PricingSection() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="bg-white shadow-lg transition-all duration-300 card-hover border border-neutral-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-neutral-800 mb-2">Free Plan</h3>
              <p className="text-neutral-600 mb-6">Perfect for casual users</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-800">$0</span>
                <span className="text-neutral-500">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>8 hours/month on JagJar sites</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Access to all JagJar enabled sites</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Basic usage analytics</span>
                </li>
                <li className="flex items-start text-neutral-400">
                  <X className="h-5 w-5 text-neutral-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>No monthly time limit</span>
                </li>
                <li className="flex items-start text-neutral-400">
                  <X className="h-5 w-5 text-neutral-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start text-neutral-400">
                  <X className="h-5 w-5 text-neutral-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Link href="/auth">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Premium Plan */}
          <Card className="bg-white shadow-xl transition-all duration-300 card-hover border-2 border-primary-500 relative">
            <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
              POPULAR
            </div>
            
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-neutral-800 mb-2">Premium Plan</h3>
              <p className="text-neutral-600 mb-6">For frequent web app users</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-800">$25</span>
                <span className="text-neutral-500">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="font-semibold">Unlimited time on JagJar sites</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Access to all JagJar enabled sites</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Detailed usage analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Usage history & reporting</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Support JagJar developers</span>
                </li>
              </ul>
              
              <Link href="/auth">
                <Button className="w-full">Get Premium</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Additional info */}
        <div className="mt-8 bg-white rounded-xl p-5 shadow-md">
          <h4 className="text-lg font-semibold mb-4">How Developer Revenue Sharing Works</h4>
          <p className="text-neutral-600 mb-4">
            JagJar distributes subscription revenue to developers based on the percentage of time premium users spend on each integrated web application.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-neutral-700" />
              </div>
              <h5 className="font-semibold mb-2">Time Tracking</h5>
              <p className="text-sm text-neutral-600">We track active user time spent on your application</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <BarChart className="h-8 w-8 text-neutral-700" />
              </div>
              <h5 className="font-semibold mb-2">Usage Analysis</h5>
              <p className="text-sm text-neutral-600">Calculate percentage of total user engagement</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-neutral-700" />
              </div>
              <h5 className="font-semibold mb-2">Revenue Distribution</h5>
              <p className="text-sm text-neutral-600">Monthly payouts based on your engagement share</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}