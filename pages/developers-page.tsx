import { MainLayout } from "@/layouts/main-layout";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function DevelopersPage() {
  const { toast } = useToast();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code snippet has been copied to your clipboard.",
    });
  };

  return (
    <MainLayout>
      <Helmet>
        <title>For Developers - JagJar</title>
        <meta name="description" content="Monetize your web application based on actual user engagement. No ads, no intrusive tracking - just fair revenue sharing." />
        <meta property="og:title" content="JagJar for Developers" />
        <meta property="og:description" content="Earn revenue based on how long users spend on your web application with JagJar's simple integration." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <section className="py-16 bg-neutral-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">For Developers</h1>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Monetize your web application based on actual user engagement. No ads, no intrusive tracking - just fair revenue sharing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-6">Simple Integration</h2>
              <p className="text-neutral-300 mb-6">
                Integrating JagJar takes just minutes. Generate your API key and add our lightweight script to your web application.
              </p>
              
              <div className="bg-neutral-800 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-neutral-400">Example JavaScript Integration</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-neutral-400 hover:text-white"
                    onClick={() => copyToClipboard(`<script>
  (function(j, a, g) {
    var s = document.createElement('script');
    s.src = 'https://api.jagjar.com/tracker.js';
    s.async = true;
    s.setAttribute('data-api-key', 'YOUR_API_KEY');
    document.head.appendChild(s);
  })(window, document, 'jagjar');
</script>`)}
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
                <pre className="text-sm text-green-400 overflow-x-auto">
                  <code>{`<script>
  (function(j, a, g) {
    var s = document.createElement('script');
    s.src = 'https://api.jagjar.com/tracker.js';
    s.async = true;
    s.setAttribute('data-api-key', 'YOUR_API_KEY');
    document.head.appendChild(s);
  })(window, document, 'jagjar');
</script>`}</code>
                </pre>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Fast Implementation</h3>
                    <p className="text-neutral-400">Simple drop-in script with minimal configuration needed.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Privacy-Focused</h3>
                    <p className="text-neutral-400">We only track time spent, not user behavior or personal data.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Fair Revenue</h3>
                    <p className="text-neutral-400">Earnings proportional to user engagement with your application.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Developer workspace with code screens" 
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                    alt="JagJar analytics dashboard" 
                    className="w-full"
                  />
                </div>
                
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1503437313881-503a91226402?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                    alt="Developer working on JagJar integration" 
                    className="w-full" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Integration Options</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Choose the integration method that works best for your application
            </p>
          </div>
          
          <Tabs defaultValue="javascript" className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="vue">Vue.js</TabsTrigger>
              <TabsTrigger value="angular">Angular</TabsTrigger>
            </TabsList>
            
            <TabsContent value="javascript">
              <Card>
                <CardHeader>
                  <CardTitle>JavaScript Integration</CardTitle>
                  <CardDescription>Add this script to your website's head section</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                      <code>{`<script>
  (function(j, a, g) {
    var s = document.createElement('script');
    s.src = 'https://api.jagjar.com/tracker.js';
    s.async = true;
    s.setAttribute('data-api-key', 'YOUR_API_KEY');
    document.head.appendChild(s);
  })(window, document, 'jagjar');
</script>`}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-3 right-3"
                      onClick={() => copyToClipboard(`<script>
  (function(j, a, g) {
    var s = document.createElement('script');
    s.src = 'https://api.jagjar.com/tracker.js';
    s.async = true;
    s.setAttribute('data-api-key', 'YOUR_API_KEY');
    document.head.appendChild(s);
  })(window, document, 'jagjar');
</script>`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="react">
              <Card>
                <CardHeader>
                  <CardTitle>React Integration</CardTitle>
                  <CardDescription>Install our React package and initialize in your app</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                      <code>{`// Install package
npm install @jagjar/react

// In your App.js or index.js
import { JagJarProvider } from '@jagjar/react';

function App() {
  return (
    <JagJarProvider apiKey="YOUR_API_KEY">
      <YourApp />
    </JagJarProvider>
  );
}`}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-3 right-3"
                      onClick={() => copyToClipboard(`// Install package
npm install @jagjar/react

// In your App.js or index.js
import { JagJarProvider } from '@jagjar/react';

function App() {
  return (
    <JagJarProvider apiKey="YOUR_API_KEY">
      <YourApp />
    </JagJarProvider>
  );
}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vue">
              <Card>
                <CardHeader>
                  <CardTitle>Vue.js Integration</CardTitle>
                  <CardDescription>Install our Vue plugin and initialize in your app</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                      <code>{`// Install package
npm install @jagjar/vue

// In your main.js
import { createApp } from 'vue'
import App from './App.vue'
import JagJar from '@jagjar/vue'

const app = createApp(App)
app.use(JagJar, {
  apiKey: 'YOUR_API_KEY'
})
app.mount('#app')`}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-3 right-3"
                      onClick={() => copyToClipboard(`// Install package
npm install @jagjar/vue

// In your main.js
import { createApp } from 'vue'
import App from './App.vue'
import JagJar from '@jagjar/vue'

const app = createApp(App)
app.use(JagJar, {
  apiKey: 'YOUR_API_KEY'
})
app.mount('#app')`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="angular">
              <Card>
                <CardHeader>
                  <CardTitle>Angular Integration</CardTitle>
                  <CardDescription>Install our Angular package and add to your module</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                      <code>{`// Install package
npm install @jagjar/angular

// In your app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { JagJarModule } from '@jagjar/angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    JagJarModule.forRoot({
      apiKey: 'YOUR_API_KEY'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }`}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-3 right-3"
                      onClick={() => copyToClipboard(`// Install package
npm install @jagjar/angular

// In your app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { JagJarModule } from '@jagjar/angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    JagJarModule.forRoot({
      apiKey: 'YOUR_API_KEY'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">How Revenue Sharing Works</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Understanding how JagJar calculates and distributes revenue
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="card-hover">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <CardTitle>Time Tracking</CardTitle>
                  <CardDescription>We track active user time spent on your application</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm">
                    Our browser extension accurately tracks the time users spend actively engaging with your web application, not just when it's open in a tab.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <CardTitle>Usage Analysis</CardTitle>
                  <CardDescription>Calculate percentage of total user engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm">
                    We calculate your share of the total premium user engagement across all JagJar-enabled applications to determine your revenue share.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Monthly payouts based on your engagement share</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm">
                    At the end of each month, we distribute 70% of premium subscription revenue to developers based on their share of total user engagement.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-4">Revenue Calculation Example</h3>
              <div className="space-y-4">
                <p className="text-sm text-neutral-700">
                  <strong>Total premium subscription revenue for the month:</strong> $10,000
                </p>
                <p className="text-sm text-neutral-700">
                  <strong>Developer revenue pool (60%):</strong> $6,000
                </p>
                <p className="text-sm text-neutral-700">
                  <strong>Total premium user hours across all applications:</strong> 50,000 hours
                </p>
                <p className="text-sm text-neutral-700">
                  <strong>Your application's premium user hours:</strong> 5,000 hours (10% of total)
                </p>
                <p className="text-sm text-neutral-700">
                  <strong>Your revenue share:</strong> $600 (10% of $6,000)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-primary-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">Join the community of developers earning revenue based on actual user engagement.</p>
            <Link href="/auth">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-neutral-100">
                Create a Developer Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
