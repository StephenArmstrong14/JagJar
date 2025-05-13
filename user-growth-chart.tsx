import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { RefreshCw } from "lucide-react";

export function UserGrowthChart() {
  const { data: growthData, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/user-growth"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>New vs returning users over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading user growth data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-destructive">Failed to load user growth data</p>
            </div>
          ) : growthData && growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="new" 
                  name="New Users"
                  stackId="1"
                  stroke="#4c5fd5" 
                  fill="#4c5fd5" 
                />
                <Area 
                  type="monotone" 
                  dataKey="returning" 
                  name="Returning Users"
                  stackId="1"
                  stroke="#ff6b35" 
                  fill="#ff6b35" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No user growth data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
