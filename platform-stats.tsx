import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, TrendingUp, TrendingDown, Users, DollarSign, Calendar, HelpCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend, ResponsiveContainer } from "recharts";

interface RevenueData {
  totalRevenue: number;
  platformRevenue: number;
  developerPayouts: number;
  monthlyRevenue: Array<{
    month: string;
    amount: number;
  }>;
}

interface UserData {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  conversionRate: number;
  monthlyActiveUsers: Array<{
    month: string;
    count: number;
  }>;
}

// Format dollar amounts
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount / 100);
};

// Format percentages
const formatPercent = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

export default function PlatformStats() {
  const [statsTimeframe, setStatsTimeframe] = useState("month");

  // Revenue stats query
  const { 
    data: revenueData, 
    isLoading: isLoadingRevenue 
  } = useQuery<RevenueData>({
    queryKey: ["/api/admin/revenue/stats", statsTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/admin/revenue/stats?timeframe=${statsTimeframe}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch revenue stats");
      }
      
      return await response.json();
    },
  });

  // User stats query
  const { 
    data: userData, 
    isLoading: isLoadingUsers 
  } = useQuery<UserData>({
    queryKey: ["/api/admin/user-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/user-stats", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }
      
      return await response.json();
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Platform Statistics</h2>
        <p className="text-muted-foreground">
          Overview of platform performance and user metrics
        </p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          {isLoadingRevenue ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : revenueData ? (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {formatCurrency(revenueData.totalRevenue)}
                      </div>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Platform Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {formatCurrency(revenueData.platformRevenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercent(revenueData.platformRevenue / revenueData.totalRevenue * 100)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Developer Payouts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {formatCurrency(revenueData.developerPayouts)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercent(revenueData.developerPayouts / revenueData.totalRevenue * 100)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>
                    Revenue trends over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={revenueData.monthlyRevenue}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month"
                          tickFormatter={(month) => {
                            const date = new Date(month);
                            return date.toLocaleDateString('en-US', { month: 'short' });
                          }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
                        />
                        <RechartTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(month) => {
                            const date = new Date(month);
                            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          name="Revenue"
                          stroke="#8884d8"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">
                  Failed to load revenue statistics
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {isLoadingUsers ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : userData ? (
            <>
              <div className="grid gap-6 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {userData.totalUsers.toLocaleString()}
                      </div>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {userData.activeUsers.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercent(userData.activeUsers / userData.totalUsers * 100)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Premium Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {userData.premiumUsers.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercent(userData.premiumUsers / userData.totalUsers * 100)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-1">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Conversion Rate
                      </CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              The percentage of active users who have subscribed to a premium plan
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {formatPercent(userData.conversionRate)}
                      </div>
                      {userData.conversionRate > 35 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Active Users</CardTitle>
                  <CardDescription>
                    User activity over the past 4 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userData.monthlyActiveUsers}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month"
                          tickFormatter={(month) => {
                            const [year, monthNum] = month.split('-');
                            const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                            return date.toLocaleDateString('en-US', { month: 'short' });
                          }}
                        />
                        <YAxis />
                        <RechartTooltip 
                          formatter={(value: number) => value.toLocaleString()}
                          labelFormatter={(month) => {
                            const [year, monthNum] = month.split('-');
                            const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          name="Active Users"
                          fill="#8884d8" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">
                  Failed to load user statistics
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}