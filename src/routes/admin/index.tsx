import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { RevenueOverTimeChart, PartnerContributionChart, MembershipGrowthChart } from "@/components/RevenueChart";
import { ActivityFeed } from "@/components/ActivityFeed";
import { IndianRupee, TrendingUp, Crown, Users, UserCheck } from "lucide-react";
import { useStore, formatINR, isExpired, daysUntil } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Superadmin Dashboard — Elite Club" }] }),
});

function AdminDashboard() {
  const { transactions, partners, members } = useStore();

  const stats = useMemo(() => {
    const revenue = transactions.reduce((s, t) => s + t.subtotal, 0);
    const profit = transactions.reduce((s, t) => s + t.profit, 0);
    const clubShare = transactions.reduce((s, t) => s + t.clubShare, 0);
    const activeMembers = members.filter((m) => !isExpired(m.expiry)).length;
    const activePartners = partners.filter((p) => p.status === "Active").length;
    return { revenue, profit, clubShare, activeMembers, activePartners };
  }, [transactions, partners, members]);

  // Partner performance built from transactions
  const partnerPerf = useMemo(() => {
    return partners.map((p) => {
      const txns = transactions.filter((t) => t.partnerId === p.id);
      const sales = txns.reduce((s, t) => s + t.subtotal, 0);
      const profit = txns.reduce((s, t) => s + t.profit, 0);
      const clubShare = txns.reduce((s, t) => s + t.clubShare, 0);
      return { ...p, sales, profit, clubShare };
    });
  }, [partners, transactions]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your club overview.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPICard title="Total Revenue" value={formatINR(stats.revenue)} change="+12.5% from last month" icon={IndianRupee} delay={0} />
          <KPICard title="Total Profit" value={formatINR(stats.profit)} change="+8.2% from last month" icon={TrendingUp} delay={0.1} />
          <KPICard title="Club Share" value={formatINR(stats.clubShare)} change="+10.1% from last month" icon={Crown} delay={0.2} />
          <KPICard title="Active Members" value={String(stats.activeMembers)} change={`${members.length} total`} icon={Users} delay={0.3} />
          <KPICard title="Active Partners" value={String(stats.activePartners)} change={`${partners.length} total`} icon={UserCheck} delay={0.4} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueOverTimeChart />
          <PartnerContributionChart />
        </div>

        <MembershipGrowthChart />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 glass-panel p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Partner Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Partner</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Sales</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Profit</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Club Share</th>
                    <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerPerf.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-3 font-medium text-foreground">{p.name}</td>
                      <td className="py-3 text-right text-foreground">{formatINR(p.sales)}</td>
                      <td className="py-3 text-right text-gold">{formatINR(p.profit)}</td>
                      <td className="py-3 text-right text-foreground">{formatINR(p.clubShare)}</td>
                      <td className="py-3 text-center">
                        <span className={p.status === "Active" ? "status-active" : "status-inactive"}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ActivityFeed />
        </div>
      </div>
    </DashboardLayout>
  );
}

// Suppress unused-import warning for daysUntil retained for future use
void daysUntil;
