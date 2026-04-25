import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useStore, formatINR } from "@/lib/store";
import { KPICard } from "@/components/KPICard";
import { IndianRupee, Receipt, TrendingUp, Users, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/partner/reports")({
  component: PartnerReports,
  head: () => ({ meta: [{ title: "Reports — Elite Club" }] }),
});

function PartnerReports() {
  const { user } = useAuth();
  const { transactions } = useStore();
  const [search, setSearch] = useState("");

  const myTxns = transactions.filter((t) => t.partnerId === user?.partnerId);
  const sales = myTxns.reduce((s, t) => s + t.subtotal, 0);
  const profit = myTxns.reduce((s, t) => s + t.profit, 0);
  const yourShare = myTxns.reduce((s, t) => s + t.partnerShare, 0);
  const uniqueMembers = new Set(myTxns.map((t) => t.memberId)).size;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return myTxns;
    return myTxns.filter(
      (t) =>
        t.memberName.toLowerCase().includes(q) ||
        t.receiptNo.toLowerCase().includes(q) ||
        t.paymentMode.toLowerCase().includes(q) ||
        String(t.subtotal).includes(q) ||
        t.items.some((i) => i.name.toLowerCase().includes(q)),
    );
  }, [myTxns, search]);

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

        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-display text-lg font-semibold">All Transactions</h3>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search receipt, member, item, mode…"
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Receipt</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Member</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Profit</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Your Share</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Mode</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-3 font-mono text-xs text-muted-foreground">{t.receiptNo}</td>
                    <td className="py-3 font-medium text-foreground">{t.memberName}</td>
                    <td className="py-3 text-right text-foreground">{formatINR(t.subtotal)}</td>
                    <td className="py-3 text-right text-gold">{formatINR(t.profit)}</td>
                    <td className="py-3 text-right text-foreground">{formatINR(t.partnerShare)}</td>
                    <td className="py-3 text-center"><span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{t.paymentMode}</span></td>
                    <td className="py-3 text-muted-foreground">{new Date(t.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      {search ? "No transactions match your search" : "No transactions yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

