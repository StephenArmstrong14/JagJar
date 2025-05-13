import { useState, useEffect } from "react";
import { Redirect, Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import RevenueSettings from "@/components/admin/revenue-settings";
import PlatformStats from "@/components/admin/platform-stats";
import TopDevelopers from "@/components/admin/top-developers";
import RevenueTrigger from "@/components/admin/revenue-trigger";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("revenue-settings");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, navigate] = useLocation();

  // Fetch user data for admin check
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Admin page - User data:', userData);
          setUser(userData);
          
          // Check if user is admin
          if (!userData.isAdmin) {
            console.log('User is not admin, redirecting to dashboard');
            navigate('/dashboard');
          }
        } else {
          console.log('Not authenticated, redirecting to auth page');
          navigate('/auth');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
        navigate('/auth');
      }
    };
    
    fetchUser();
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect non-admin users (this is a fallback, the useEffect should handle this)
  if (!user?.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/dashboard">
          <a className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Dashboard
          </a>
        </Link>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="revenue-settings">Revenue Settings</TabsTrigger>
          <TabsTrigger value="platform-stats">Platform Stats</TabsTrigger>
          <TabsTrigger value="top-developers">Top Developers</TabsTrigger>
          <TabsTrigger value="revenue-trigger">Calculate Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue-settings" className="bg-card p-6 rounded-lg border">
          <RevenueSettings />
        </TabsContent>

        <TabsContent value="platform-stats" className="bg-card p-6 rounded-lg border">
          <PlatformStats />
        </TabsContent>

        <TabsContent value="top-developers" className="bg-card p-6 rounded-lg border">
          <TopDevelopers />
        </TabsContent>

        <TabsContent value="revenue-trigger" className="bg-card p-6 rounded-lg border">
          <RevenueTrigger />
        </TabsContent>
      </Tabs>
    </div>
  );
}