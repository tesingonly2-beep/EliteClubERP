import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useStore, formatINR } from "@/lib/store";
import { KPICard } from "@/components/KPICard";
import { IndianRupee, TrendingUp, Crown, Receipt, Plus, QrCode, UserPlus } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/partner/")({
  component: PartnerDashboard,
  head: () => ({ meta: [{ title: "Partner Dashboard — Elite Club" }] }),
});

function PartnerDashboard() {
  const { user } = useAuth();
  const { transactions, partners } = useStore();

  const partner = partners.find((p) => p.id === user?.partnerId);
  const myTxns = useMemo(() => transactions.filter((t) => t.partnerId === user?.partnerId), [transactions, user]);

  // Today's stats
  const today = new Date().setHours(0, 0, 0, 0);
  const todayTxns = myTxns.filter((t) => new Date(t.createdAt).setHours(0, 0, 0, 0) === today);
  const todaySales = todayTxns.reduce((s, t) => s + t.subtotal, 0);
  const todayProfit = todayTxns.reduce((s, t) => s + t.profit, 0);
  const yourShare = todayTxns.reduce((s, t) => s + t.partnerShare, 0);
  const clubShare = todayTxns.reduce((s, t) => s + t.clubShare, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">{partner?.name || "Partner"} — {partner?.location}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Today's Sales" value={formatINR(todaySales)} change={`${todayTxns.length} transactions`} icon={IndianRupee} delay={0} />
          <KPICard title="Today's Profit" value={formatINR(todayProfit)} icon={TrendingUp} delay={0.1} />
          <KPICard title="Your Share" value={formatINR(yourShare)} icon={Crown} delay={0.2} />
          <KPICard title="Club Share" value={formatINR(clubShare)} icon={Receipt} delay={0.3} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link to="/partner/billing" className="glass-panel p-5 flex items-center gap-4 hover:border-gold transition-colors group">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-muted group-hover:bg-gold group-hover:text-gold-foreground transition-colors">
              <Plus className="h-6 w-6 text-gold group-hover:text-gold-foreground" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Start New Bill</p>
              <p className="text-xs text-muted-foreground">Begin a new transaction</p>
            </div>
          </Link>
          <Link to="/partner/billing" className="glass-panel p-5 flex items-center gap-4 hover:border-gold transition-colors group">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-muted">
              <QrCode className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Scan Member</p>
              <p className="text-xs text-muted-foreground">Look up by QR / phone</p>
            </div>
          </Link>
          <Link to="/partner/members" className="glass-panel p-5 flex items-center gap-4 hover:border-gold transition-colors group">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-muted">
              <UserPlus className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Add Member</p>
              <p className="text-xs text-muted-foreground">Register new customer</p>
            </div>
          </Link>
        </div>

        <div className="glass-panel p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-2">
            {myTxns.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.memberName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gold">{formatINR(t.subtotal)}</p>
                  <p className="text-xs text-muted-foreground">{t.paymentMode}</p>
                </div>
              </div>
            ))}
            {myTxns.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No transactions yet. Start your first bill!</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
