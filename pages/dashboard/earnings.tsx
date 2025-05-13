import { DashboardLayout } from "@/layouts/dashboard-layout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { BarChart, LineChart, PieChart } from "recharts";
import { Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { DollarSign, ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Earnings() {
  const { data: earnings, isLoading } = useQuery({
    queryKey: ["/api/earnings"],
  });

  // Sample earnings data for visualization
  const monthlyEarnings = [
    { month: 'Jan', amount: 850 },
    { month: 'Feb', amount: 940 },
    { month: 'Mar', amount: 1020 },
    { month: 'Apr', amount: 980 },
    { month: 'May', amount: 1150 },
    { month: 'Jun', amount: 1250 },
    { month: 'Jul', amount: 1380 },
    { month: 'Aug', amount: 1245 },
    { month: 'Sep', amount: 1310 },
    { month: 'Oct', amount: 1480 },
    { month: 'Nov', amount: 1620 },
    { month: 'Dec', amount: 1245 }
  ];

  const appDistribution = [
    { name: 'WebApp 1', value: 45 },
    { name: 'WebApp 2', value: 30 },
    { name: 'WebApp 3', value: 15 },
    { name: 'Other Apps', value: 10 }
  ];

  const userTypeRevenue = [
    { name: 'Free Users', premium: 0, time: 2450 },
    { name: 'Premium Users', premium: 1245, time: 0 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <DashboardLayout>
      <Helmet>
        <title>Earnings - JagJar</title>
        <meta name="description" content="Track your earnings from JagJar and view payment history." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">Track revenue from your JagJar-enabled applications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$14,345.62</div>
              <div className="flex items-center pt-1 text-xs text-green-500">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                <span>+22.5% from last year</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Month
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,245.32</div>
              <div className="flex items-center pt-1 text-xs text-green-500">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                <span>+15.7% from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Projected Next Month
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,320.00</div>
              <div className="flex items-center pt-1 text-xs text-green-500">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                <span>+6.0% from this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="apps">Per App</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="year">Year</Label>
                <Select defaultValue="2023">
                  <SelectTrigger id="year" className="w-[100px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Annual Earnings</CardTitle>
                <CardDescription>Your earnings over the past 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyEarnings}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#4c5fd5" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Application</CardTitle>
                  <CardDescription>How earnings are distributed across your apps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {appDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by User Type</CardTitle>
                  <CardDescription>Premium vs Free user contribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userTypeRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                        <Legend />
                        <Bar dataKey="premium" name="Premium Subscription" fill="#4c5fd5" />
                        <Bar dataKey="time" name="Time-based" fill="#ff6b35" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-6 mt-6">
            {/* Monthly breakdown content here */}
          </TabsContent>
          
          <TabsContent value="apps" className="space-y-6 mt-6">
            {/* Per app breakdown content here */}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6 mt-6">
            {/* Payment history content here */}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
