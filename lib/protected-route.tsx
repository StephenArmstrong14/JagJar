import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [_, navigate] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth status...');
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          console.log('Auth status response:', response.status);
          const userData = await response.json();
          console.log('User is authenticated:', userData);
          setIsAuthenticated(true);
        } else {
          console.log('Not authenticated, redirecting to auth page');
          setIsAuthenticated(false);
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <Route path={path}>
      {() => {
        if (isAuthenticated === null) {
          // Show a loading state while we check authentication
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        if (isAuthenticated === false) {
          // We'll handle the redirect in the useEffect
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        // User is authenticated, render the component
        return <Component />;
      }}
    </Route>
  );
}
