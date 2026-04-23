import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { RevenueOverTimeChart, PartnerContributionChart, MembershipGrowthChart } from "@/components/RevenueChart";
import { PartnerPerformanceTable } from "@/components/PartnerPerformanceTable";
import { ActivityFeed } from "@/components/ActivityFeed";
import { IndianRupee, TrendingUp, Crown, Users, UserCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Elite Club — Superadmin Dashboard" },
      { name: "description", content: "Manage your club empire with the Elite Club superadmin dashboard" },
    ],
  }),
});

function Index() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, Superadmin. Here's your club overview.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPICard title="Total Revenue" value="₹32,50,000" change="+12.5% from last month" changeType="positive" icon={IndianRupee} delay={0} />
          <KPICard title="Total Profit" value="₹9,75,000" change="+8.2% from last month" changeType="positive" icon={TrendingUp} delay={0.1} />
          <KPICard title="Club Share" value="₹4,87,500" change="+10.1% from last month" changeType="positive" icon={Crown} delay={0.2} />
          <KPICard title="Active Members" value="280" change="+32 this month" changeType="positive" icon={Users} delay={0.3} />
          <KPICard title="Active Partners" value="5" change="1 new this quarter" changeType="neutral" icon={UserCheck} delay={0.4} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueOverTimeChart />
          <PartnerContributionChart />
        </div>

        <MembershipGrowthChart />

        {/* Table + Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PartnerPerformanceTable />
          </div>
          <ActivityFeed />
        </div>
      </div>
    </DashboardLayout>
  );
}
