import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PricingPage from "@/pages/pricing-page";
import FeaturesPage from "@/pages/features-page";
import ExtensionPage from "@/pages/extension-page";
import DevelopersPage from "@/pages/developers-page";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "@/pages/dashboard";
import ApiKeys from "@/pages/dashboard/api-keys";
import Analytics from "@/pages/dashboard/analytics";
import Integration from "@/pages/dashboard/integration";
import Earnings from "@/pages/dashboard/earnings";
import RevenuePage from "@/pages/dashboard/revenue-page";
import Settings from "@/pages/dashboard/settings";
import AdminDashboard from "@/pages/dashboard/admin"; // Import the admin dashboard

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/extension" component={ExtensionPage} />
      <Route path="/developers" component={DevelopersPage} />
      
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/dashboard/api-keys" component={ApiKeys} />
      <ProtectedRoute path="/dashboard/analytics" component={Analytics} />
      <ProtectedRoute path="/dashboard/integration" component={Integration} />
      <ProtectedRoute path="/dashboard/earnings" component={Earnings} />
      <ProtectedRoute path="/dashboard/revenue" component={RevenuePage} />
      <ProtectedRoute path="/dashboard/settings" component={Settings} />
      <ProtectedRoute path="/dashboard/admin" component={AdminDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
    </TooltipProvider>
  );
}

export default App;
