import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2, DollarSign, CalendarDays, Users, BuildingIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Revenue {
  month: string;
  amount: number;
  calculatedAt: string;
}

interface EarningsDetail {
  websiteId: number;
  websiteName: string;
  websiteUrl: string;
  totalTime: number;
  premiumTime: number;
  earnings: number;
}

interface Payout {
  id: number;
  developerId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100); // Convert cents to dollars
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${hours}h ${minutes}m`;
}

export default function RevenuePage() {
  // Get earnings overview
  const { data: earnings, isLoading: earningsLoading } = useQuery<Revenue[]>({
    queryKey: ["/api/revenue/earnings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Get latest month for details
  const latestMonth = earnings && earnings.length > 0 ? earnings[0].month : null;
  
  // Get earnings details for the latest month
  const { data: earningsDetails, isLoading: detailsLoading } = useQuery<EarningsDetail[]>({
    queryKey: ["/api/revenue/earnings", latestMonth],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!latestMonth,
  });

  // Get payout history
  const { data: payouts, isLoading: payoutsLoading } = useQuery<Payout[]>({
    queryKey: ["/api/revenue/payouts"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const isLoading = earningsLoading || detailsLoading || payoutsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate total earnings
  const totalEarnings = earnings?.reduce((sum, item) => sum + item.amount, 0) || 0;
  
  // Calculate total payouts
  const totalPayouts = payouts?.reduce((sum, item) => sum + item.amount, 0) || 0;
  
  // Calculate pending amount
  const pendingPayouts = payouts
    ?.filter(payout => payout.status === 'pending')
    .reduce((sum, item) => sum + item.amount, 0) || 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Revenue Management</h2>
        <p className="text-muted-foreground">
          View and manage your earnings from the JagJar monetization platform.
        </p>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Earnings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {earnings && earnings.length > 0 
                  ? formatCurrency(earnings[0].amount) 
                  : "$0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                {earnings && earnings.length > 0 
                  ? `For ${earnings[0].month}` 
                  : "No earnings yet"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPayouts)}</div>
              <p className="text-xs text-muted-foreground">Total completed payouts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingPayouts)}</div>
              <p className="text-xs text-muted-foreground">In processing</p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Tabs */}
        <Tabs defaultValue="earnings" className="w-full">
          <TabsList>
            <TabsTrigger value="earnings">Earnings History</TabsTrigger>
            <TabsTrigger value="details">Earnings Breakdown</TabsTrigger>
            <TabsTrigger value="payouts">Payout History</TabsTrigger>
          </TabsList>
          
          {/* Earnings History Tab */}
          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
                <CardDescription>
                  Your earnings history by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Calculated At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings && earnings.length > 0 ? (
                      earnings.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.month}</TableCell>
                          <TableCell>{formatCurrency(item.amount)}</TableCell>
                          <TableCell>{new Date(item.calculatedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">No earnings data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Earnings Breakdown Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>
                  {latestMonth 
                    ? `Earnings Breakdown for ${latestMonth}` 
                    : "Earnings Breakdown"}
                </CardTitle>
                <CardDescription>
                  Detailed breakdown by website for your latest earnings period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Website</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Total Time</TableHead>
                      <TableHead>Premium Time</TableHead>
                      <TableHead>Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earningsDetails && earningsDetails.length > 0 ? (
                      earningsDetails.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.websiteName}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {item.websiteUrl}
                            </a>
                          </TableCell>
                          <TableCell>{formatTime(item.totalTime)}</TableCell>
                          <TableCell>{formatTime(item.premiumTime)}</TableCell>
                          <TableCell>{formatCurrency(item.earnings)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No detailed earnings data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  Your payout history and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts && payouts.length > 0 ? (
                      payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>{payout.id}</TableCell>
                          <TableCell>{formatCurrency(payout.amount)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              payout.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              payout.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payout.status}
                            </span>
                          </TableCell>
                          <TableCell>{payout.paymentMethod}</TableCell>
                          <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No payout history available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}