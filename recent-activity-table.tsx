import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

export function RecentActivityTable() {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/recent-activity"],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>User interactions with your application</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Loading recent activity...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-sm text-destructive">Failed to load recent activity data</p>
          </div>
        ) : activities && activities.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Time Spent</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium mr-3">
                        {activity.user.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{activity.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {activity.user.isPremium ? "Premium User" : "Free User"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{activity.timeSpent}</TableCell>
                  <TableCell>{activity.page}</TableCell>
                  <TableCell className="text-muted-foreground">{activity.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No recent activity data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
