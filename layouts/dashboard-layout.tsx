import React, { useEffect, useState } from "react";
import { Sidebar, SidebarHeader, SidebarNav, SidebarNavItem, SidebarFooter } from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { BarChart3, KeyRound, Code, DollarSign, Settings, LogOut, LineChart, Wallet, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as SelectUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [currentUser, setCurrentUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Fetch user data directly in the dashboard
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const user = await response.json();
          console.log('Fetched user data for dashboard:', user);
          setCurrentUser(user);
        } else {
          console.error('Failed to fetch user data, status:', response.status);
          // If we get a 401, we're not authenticated, redirect to login
          if (response.status === 401) {
            console.log('User not authenticated, redirecting to auth page...');
            navigate('/auth');
          }
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setCurrentUser(null);
      }
    };
    
    fetchUserData();
    
    // Set up an interval to periodically check auth status
    const interval = setInterval(fetchUserData, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      console.log('Logging out from dashboard...');
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Logout successful
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
        
        console.log('Logout successful from dashboard');
        // Redirect to home page after logout
        setCurrentUser(null);
        navigate('/');
      } else {
        console.error('Logout failed:', response.status);
        toast({
          title: "Logout failed",
          description: "An error occurred while logging out.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="w-64 hidden md:flex">
        <SidebarHeader>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-md gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="font-bold text-xl">JagJar</span>
          </div>
        </SidebarHeader>
        <SidebarNav>
          <SidebarNavItem href="/dashboard" icon={BarChart3}>
            Dashboard
          </SidebarNavItem>
          <SidebarNavItem href="/dashboard/api-keys" icon={KeyRound}>
            API Keys
          </SidebarNavItem>
          <SidebarNavItem href="/dashboard/integration" icon={Code}>
            Integration
          </SidebarNavItem>
          <SidebarNavItem href="/dashboard/earnings" icon={LineChart}>
            Earnings
          </SidebarNavItem>
          <SidebarNavItem href="/dashboard/revenue" icon={Wallet}>
            Revenue
          </SidebarNavItem>
          <SidebarNavItem href="/dashboard/settings" icon={Settings}>
            Settings
          </SidebarNavItem>
          {currentUser?.isAdmin && (
            <SidebarNavItem href="/dashboard/admin" icon={ShieldCheck}>
              Admin
            </SidebarNavItem>
          )}
        </SidebarNav>
        <SidebarFooter>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-sm font-medium truncate">
                {currentUser?.username || 'User'}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
