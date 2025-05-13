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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trophy, Award, Medal } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TopDeveloper {
  id: number;
  name: string;
  amount: number;
  websites: number;
  totalMinutes: number;
  premiumMinutes: number;
  percentageOfTotal: number;
}

export default function TopDevelopers() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Generate month options (6 months back)
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return { value: monthStr, label };
  });

  // Fetch top developers
  const { data: topDevelopers, isLoading } = useQuery<TopDeveloper[]>({
    queryKey: ["/api/admin/revenue/top-developers", selectedMonth],
    queryFn: async () => {
      const response = await fetch(`/api/admin/revenue/top-developers/${selectedMonth}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch top developers");
      }
      
      return await response.json();
    },
  });

  // Format dollar amounts
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  // Format time (minutes to hours and minutes)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get rank badge based on index
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-muted-foreground text-sm font-medium">{index + 1}</span>;
    }
  };

  // Calculate totals for all metrics
  const calculateTotals = () => {
    if (!topDevelopers || topDevelopers.length === 0) return null;
    
    return topDevelopers.reduce((sum, dev) => {
      return {
        amount: sum.amount + dev.amount,
        totalMinutes: sum.totalMinutes + dev.totalMinutes,
        premiumMinutes: sum.premiumMinutes + dev.premiumMinutes,
        websites: Math.max(sum.websites, 0), // Don't sum websites as they might overlap
      };
    }, { 
      amount: 0, 
      totalMinutes: 0, 
      premiumMinutes: 0, 
      websites: 0 
    });
  };

  // Format percentage with specified digits
  const formatPercent = (value: number, fractionDigits = 1) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(value / 100);
  };

  // Calculate percentage of total earnings
  const calculatePercentOfTotal = (amount: number) => {
    const totals = calculateTotals();
    if (!totals) return 0;
    return (amount / totals.amount) * 100;
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Top Earning Developers</h2>
          <p className="text-muted-foreground">
            View the highest earning developers by month
          </p>
        </div>
        
        <div className="w-full sm:w-auto">
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Developer Revenue Rankings</CardTitle>
          <CardDescription>
            Top developers by earnings for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !topDevelopers || topDevelopers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No developer earnings data available for this month
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Developer</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead className="hidden md:table-cell">Distribution</TableHead>
                    <TableHead className="hidden md:table-cell">Premium Time</TableHead>
                    <TableHead className="hidden md:table-cell">Total Time</TableHead>
                    <TableHead className="hidden md:table-cell">Websites</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDevelopers.map((dev, index) => (
                    <TableRow key={dev.id}>
                      <TableCell className="font-medium">
                        <div className="flex justify-center">
                          {getRankBadge(index)}
                        </div>
                      </TableCell>
                      <TableCell>{dev.name}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(dev.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatPercent(dev.percentageOfTotal)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="w-full max-w-md">
                          <Progress value={dev.percentageOfTotal} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{formatTime(dev.premiumMinutes)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatTime(dev.totalMinutes)}</TableCell>
                      <TableCell className="hidden md:table-cell">{dev.websites}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totals && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Aggregated statistics for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Total Payouts</h3>
                <div className="text-2xl font-bold">{formatCurrency(totals.amount)}</div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Premium Minutes</h3>
                <div className="text-2xl font-bold">{formatTime(totals.premiumMinutes)}</div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Total Activity</h3>
                <div className="text-2xl font-bold">{formatTime(totals.totalMinutes)}</div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Average Per Developer</h3>
                <div className="text-2xl font-bold">
                  {formatCurrency(totals.amount / (topDevelopers?.length || 1))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}