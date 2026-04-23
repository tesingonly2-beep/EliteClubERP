import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useStore, formatINR } from "@/lib/store";
import { KPICard } from "@/components/KPICard";
import { IndianRupee, Receipt, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/partner/reports")({
  component: PartnerReports,
  head: () => ({ meta: [{ title: "Reports — Elite Club" }] }),
});

function PartnerReports() {
  const { user } = useAuth();
  const { transactions } = useStore();
  const myTxns = transactions.filter((t) => t.partnerId === user?.partnerId);
  const sales = myTxns.reduce((s, t) => s + t.subtotal, 0);
  const profit = myTxns.reduce((s, t) => s + t.profit, 0);
  const yourShare = myTxns.reduce((s, t) => s + t.partnerShare, 0);
  const uniqueMembers = new Set(myTxns.map((t) => t.memberId)).size;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Your performance overview.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Sales" value={formatINR(sales)} icon={IndianRupee} />
          <KPICard title="Total Profit" value={formatINR(profit)} icon={TrendingUp} />
          <KPICard title="Your Share" value={formatINR(yourShare)} icon={Receipt} />
          <KPICard title="Unique Members" value={String(uniqueMembers)} icon={Users} />
        </div>

        <div className="glass-panel p-5">
          <h3 className="font-display text-lg font-semibold mb-4">All Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Member</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Profit</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Your Share</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Mode</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {myTxns.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-3 font-medium text-foreground">{t.memberName}</td>
                    <td className="py-3 text-right text-foreground">{formatINR(t.subtotal)}</td>
                    <td className="py-3 text-right text-gold">{formatINR(t.profit)}</td>
                    <td className="py-3 text-right text-foreground">{formatINR(t.partnerShare)}</td>
                    <td className="py-3 text-center"><span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{t.paymentMode}</span></td>
                    <td className="py-3 text-muted-foreground">{new Date(t.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
                  </tr>
                ))}
                {myTxns.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No transactions yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
