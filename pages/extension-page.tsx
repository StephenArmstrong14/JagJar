import { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtensionPreview } from "@/components/extension-preview";
import { BrowserExtensionDownload } from "@/components/browser-extension-download";
import { Clock, Shield, ChartBar, CreditCard, Globe, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExtensionPage() {
  const [activeTab, setActiveTab] = useState("chrome");

  const browserLogos = {
    chrome: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="4"></circle>
        <line x1="21.17" y1="8" x2="12" y2="8"></line>
        <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
        <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
      </svg>
    ),
    firefox: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    safari: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="2" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="20" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="6.34" y1="17.66" x2="4.93" y2="19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="19.07" y1="4.93" x2="17.66" y2="6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    edge: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20.24 12.24C20.1685 14.6403 18.9179 16.8611 16.8569 18.2136C14.796 19.5662 12.1773 19.863 9.90206 19.0147C7.62681 18.1663 5.88552 16.2623 5.22228 13.9117C4.55903 11.5611 5.05886 9.04016 6.57 7.12C5.04126 9.0795 4.60986 11.6338 5.40242 13.9057C6.19498 16.1775 8.10481 17.8773 10.4644 18.528C12.824 19.1788 15.3551 18.7052 17.3225 17.2471C19.2899 15.789 20.4109 13.5226 20.36 11.13L20.24 12.24Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.34009 7C5.33015 4.5912 8.42099 3.2551 11.6278 3.39767C14.8347 3.54024 17.7982 5.15213 19.6 7.72001L20.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Browser Extensions - JagJar</title>
        <meta name="description" content="Install the JagJar browser extension for Chrome, Firefox, Safari, and Edge to track your time on web applications and manage your subscription." />
        <meta property="og:title" content="JagJar Browser Extensions" />
        <meta property="og:description" content="Track time on JagJar-enabled websites with our easy-to-use browser extensions for all major browsers." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-neutral-800 mb-4">JagJar Browser Extensions</h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Track your time on JagJar-enabled websites and manage your subscription with our easy-to-use browser extensions.
            </p>
            <div className="flex justify-center mt-6">
              <div className="flex flex-wrap items-center gap-2 justify-center text-sm text-neutral-600">
                <span className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  Available for all major browsers
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-1" />
                  Cross-device syncing
                </span>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="chrome" value={activeTab} onValueChange={setActiveTab} className="mb-12">
            <TabsList className="grid w-full grid-cols-4 max-w-xl mx-auto">
              <TabsTrigger value="chrome" className="flex items-center justify-center gap-2">
                {browserLogos.chrome} Chrome
              </TabsTrigger>
              <TabsTrigger value="firefox" className="flex items-center justify-center gap-2">
                {browserLogos.firefox} Firefox
              </TabsTrigger>
              <TabsTrigger value="safari" className="flex items-center justify-center gap-2">
                {browserLogos.safari} Safari
              </TabsTrigger>
              <TabsTrigger value="edge" className="flex items-center justify-center gap-2">
                {browserLogos.edge} Edge
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ExtensionPreview browser={activeTab} />
            
            <div>
              <h2 className="text-2xl font-bold mb-6">Why Use Our Extension?</h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-secondary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Accurate Time Tracking</h3>
                    <p className="text-neutral-600">Our extension tracks only the active time you spend on JagJar-enabled websites, not background tabs.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mr-4">
                    <Shield className="h-6 w-6 text-secondary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Privacy-Focused</h3>
                    <p className="text-neutral-600">We only track the time you spend on JagJar sites, not your browsing history or personal data.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mr-4">
                    <CreditCard className="h-6 w-6 text-secondary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Manage Your Subscription</h3>
                    <p className="text-neutral-600">Easily switch between free and premium plans directly from the extension.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mr-4">
                    <ChartBar className="h-6 w-6 text-secondary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Usage Analytics</h3>
                    <p className="text-neutral-600">View your usage patterns and see which JagJar sites you spend the most time on.</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center lg:text-left">
                <BrowserExtensionDownload 
                  browser={activeTab}
                  className="bg-neutral-800 hover:bg-neutral-900"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">How It Works</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Understanding how JagJar tracks your time and helps support developers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-primary-500 font-bold">1</span>
                </div>
                <CardTitle>Install Extension</CardTitle>
                <CardDescription>Download and install the JagJar extension for your browser</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Visit your browser's extension store and add the JagJar extension. Available for Chrome, Firefox, Safari, and Edge. It takes just a few seconds to install.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-primary-500 font-bold">2</span>
                </div>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Sign up for a free JagJar account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Create your free account to track your time across devices and manage your subscription preferences. Use the same account across all your browsers.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-primary-500 font-bold">3</span>
                </div>
                <CardTitle>Browse Normally</CardTitle>
                <CardDescription>Use the web as you always do</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  The extension works in the background, tracking only time spent on JagJar-enabled websites. No changes to your browsing habits needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg mb-8">Download the JagJar extension today and start supporting the developers you love.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <BrowserExtensionDownload
                browser="chrome"
                size="lg"
                className="bg-neutral-800 hover:bg-neutral-900"
              />
              <BrowserExtensionDownload
                browser="firefox"
                size="lg"
                className="bg-neutral-800 hover:bg-neutral-900"
              />
              <BrowserExtensionDownload
                browser="safari"
                size="lg"
                className="bg-neutral-800 hover:bg-neutral-900"
              />
              <BrowserExtensionDownload
                browser="edge"
                size="lg"
                className="bg-neutral-800 hover:bg-neutral-900"
              />
            </div>
            
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
