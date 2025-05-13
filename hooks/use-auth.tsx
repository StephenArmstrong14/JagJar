import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { InsertUser, User as SelectUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Add the refreshAuthState to the Window interface
declare global {
  interface Window {
    refreshAuthState?: () => Promise<SelectUser | null>;
  }
}

// Define the shape of our auth context
type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Check if user is already logged in
  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      setIsLoading(true);
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      
      console.log('Auth status response:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User is authenticated:', userData);
        setUser(userData);
        return userData;
      } else {
        console.log('User is not authenticated');
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial auth check on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Expose the checkAuthStatus function for manual refreshes
  useEffect(() => {
    // Define a global function to refresh auth state
    window.refreshAuthState = checkAuthStatus;
    
    // Add a navigation interceptor to ensure we refresh auth state on navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      console.log('Navigation detected (pushState), refreshing auth state...');
      checkAuthStatus();
      return result;
    };
    
    window.history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      console.log('Navigation detected (replaceState), refreshing auth state...');
      checkAuthStatus();
      return result;
    };
    
    // Also refresh on popstate (browser back/forward)
    const handlePopState = () => {
      console.log('Navigation detected (popstate), refreshing auth state...');
      checkAuthStatus();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      // Clean up when component unmounts
      delete window.refreshAuthState;
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', { username, password });
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error response:', errorText);
        throw new Error(errorText || 'Login failed');
      }
      
      const userData = await response.json();
      console.log('Login successful, user data:', userData);
      
      setUser(userData);
      
      toast({
        title: "Login successful",
        description: "Welcome back to JagJar!",
      });
      
      // Use window.location for more reliable redirect with a full page reload
      console.log('Redirecting to dashboard...');
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: InsertUser) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting registration with data:', userData);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      
      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Registration error response:', errorText);
        throw new Error(errorText || 'Registration failed');
      }
      
      const newUser = await response.json();
      console.log('Registration successful, user data:', newUser);
      
      setUser(newUser);
      
      toast({
        title: "Registration successful",
        description: "Welcome to JagJar!",
      });
      
      // Use window.location for more reliable redirect with a full page reload
      console.log('Redirecting to dashboard after registration...');
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      console.log('Attempting logout');
      
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      console.log('Logout response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Logout error response:', errorText);
        throw new Error(errorText || 'Logout failed');
      }
      
      // Clear user from state
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Use window.location for more reliable redirect with a full page reload
      console.log('Redirecting to home after logout...');
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      toast({
        title: "Logout failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}
