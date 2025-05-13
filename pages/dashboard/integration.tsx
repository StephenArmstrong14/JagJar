import { DashboardLayout } from "@/layouts/dashboard-layout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Integration() {
  const { toast } = useToast();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code snippet has been copied to your clipboard.",
    });
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Integration - JagJar</title>
        <meta name="description" content="Learn how to integrate JagJar with your web application using our easy-to-follow code snippets." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integration</h1>
          <p className="text-muted-foreground">Add JagJar to your web application with a few lines of code</p>
        </div>

        <Tabs defaultValue="javascript">
          <TabsList>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="vue">Vue.js</TabsTrigger>
            <TabsTrigger value="angular">Angular</TabsTrigger>
          </TabsList>
          
          <TabsContent value="javascript" className="space-y-6 mt-6">
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
            
            <Card>
              <CardHeader>
                <CardTitle>Usage Example</CardTitle>
                <CardDescription>How to track custom events (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    <code>{`// Track when user performs a specific action
window.jagjar.trackEvent('feature_used', {
  featureId: 'dashboard',
  action: 'click'
});

// Track when user accesses a specific section
window.jagjar.trackSection('analytics');`}</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-3 right-3"
                    onClick={() => copyToClipboard(`// Track when user performs a specific action
window.jagjar.trackEvent('feature_used', {
  featureId: 'dashboard',
  action: 'click'
});

// Track when user accesses a specific section
window.jagjar.trackSection('analytics');`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="react" className="space-y-6 mt-6">
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
            
            <Card>
              <CardHeader>
                <CardTitle>Usage with Hooks</CardTitle>
                <CardDescription>Track custom events in your components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    <code>{`import { useJagJar } from '@jagjar/react';

function MyComponent() {
  const { trackEvent, trackSection } = useJagJar();
  
  const handleClick = () => {
    // Your logic here
    trackEvent('button_clicked', { buttonId: 'submit' });
  };
  
  useEffect(() => {
    trackSection('my_component');
  }, [trackSection]);
  
  return (
    <button onClick={handleClick}>Click Me</button>
  );
}`}</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-3 right-3"
                    onClick={() => copyToClipboard(`import { useJagJar } from '@jagjar/react';

function MyComponent() {
  const { trackEvent, trackSection } = useJagJar();
  
  const handleClick = () => {
    // Your logic here
    trackEvent('button_clicked', { buttonId: 'submit' });
  };
  
  useEffect(() => {
    trackSection('my_component');
  }, [trackSection]);
  
  return (
    <button onClick={handleClick}>Click Me</button>
  );
}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vue" className="space-y-6 mt-6">
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
            
            <Card>
              <CardHeader>
                <CardTitle>Usage in Components</CardTitle>
                <CardDescription>Track custom events in your Vue components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    <code>{`<template>
  <button @click="handleClick">Click Me</button>
</template>

<script>
export default {
  name: 'MyComponent',
  mounted() {
    this.$jagjar.trackSection('my_component');
  },
  methods: {
    handleClick() {
      // Your logic here
      this.$jagjar.trackEvent('button_clicked', { buttonId: 'submit' });
    }
  }
}
</script>`}</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-3 right-3"
                    onClick={() => copyToClipboard(`<template>
  <button @click="handleClick">Click Me</button>
</template>

<script>
export default {
  name: 'MyComponent',
  mounted() {
    this.$jagjar.trackSection('my_component');
  },
  methods: {
    handleClick() {
      // Your logic here
      this.$jagjar.trackEvent('button_clicked', { buttonId: 'submit' });
    }
  }
}
</script>`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="angular" className="space-y-6 mt-6">
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
            
            <Card>
              <CardHeader>
                <CardTitle>Usage in Components</CardTitle>
                <CardDescription>Track custom events in your Angular components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    <code>{`import { Component, OnInit } from '@angular/core';
import { JagJarService } from '@jagjar/angular';

@Component({
  selector: 'app-my-component',
  template: \`<button (click)="handleClick()">Click Me</button>\`
})
export class MyComponent implements OnInit {
  constructor(private jagjar: JagJarService) {}
  
  ngOnInit() {
    this.jagjar.trackSection('my_component');
  }
  
  handleClick() {
    // Your logic here
    this.jagjar.trackEvent('button_clicked', { buttonId: 'submit' });
  }
}`}</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-3 right-3"
                    onClick={() => copyToClipboard(`import { Component, OnInit } from '@angular/core';
import { JagJarService } from '@jagjar/angular';

@Component({
  selector: 'app-my-component',
  template: \`<button (click)="handleClick()">Click Me</button>\`
})
export class MyComponent implements OnInit {
  constructor(private jagjar: JagJarService) {}
  
  ngOnInit() {
    this.jagjar.trackSection('my_component');
  }
  
  handleClick() {
    // Your logic here
    this.jagjar.trackEvent('button_clicked', { buttonId: 'submit' });
  }
}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
