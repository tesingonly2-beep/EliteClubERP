import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useStore, formatINR } from "@/lib/store";
import { TrendingUp, Users, IndianRupee, Receipt } from "lucide-react";
import { KPICard } from "@/components/KPICard";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports — Elite Club" }] }),
});

function ReportsPage() {
  const { transactions, members, partners } = useStore();
  const totalRevenue = transactions.reduce((s, t) => s + t.subtotal, 0);
  const avgTransaction = transactions.length ? Math.round(totalRevenue / transactions.length) : 0;
  const topPartner = [...partners].sort((a, b) => {
    const sa = transactions.filter((t) => t.partnerId === a.id).reduce((s, t) => s + t.subtotal, 0);
    const sb = transactions.filter((t) => t.partnerId === b.id).reduce((s, t) => s + t.subtotal, 0);
    return sb - sa;
  })[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Analytics and insights across the network.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Revenue" value={formatINR(totalRevenue)} icon={IndianRupee} />
          <KPICard title="Total Transactions" value={String(transactions.length)} icon={Receipt} />
          <KPICard title="Avg Transaction" value={formatINR(avgTransaction)} icon={TrendingUp} />
          <KPICard title="Total Members" value={String(members.length)} icon={Users} />
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Top Performing Partner</h3>
          {topPartner && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-2xl font-bold text-gold">{topPartner.name}</p>
                <p className="text-sm text-muted-foreground">{topPartner.location}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Revenue Generated</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatINR(transactions.filter((t) => t.partnerId === topPartner.id).reduce((s, t) => s + t.subtotal, 0))}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
