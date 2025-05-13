import { DashboardLayout } from "@/layouts/dashboard-layout";
import { AnalyticsOverview } from "@/components/analytics-overview";
import { TimeDistributionChart } from "@/components/time-distribution-chart";
import { UserGrowthChart } from "@/components/user-growth-chart";
import { RecentActivityTable } from "@/components/recent-activity-table";
import { Helmet } from "react-helmet";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Dashboard - JagJar</title>
        <meta name="description" content="Monitor your JagJar analytics, track user engagement, and view your earnings on the developer dashboard." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your applications performance and user engagement</p>
        </div>

        <AnalyticsOverview />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimeDistributionChart />
          <UserGrowthChart />
        </div>

        <RecentActivityTable />
      </div>
    </DashboardLayout>
  );
}
