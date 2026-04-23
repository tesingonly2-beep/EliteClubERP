import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useStore, formatINR, isExpired, daysUntil } from "@/lib/store";
import { QRCodeSVG } from "qrcode.react";
import { Crown, MapPin, Calendar, IndianRupee, Activity } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/member/")({
  component: MemberHome,
  head: () => ({ meta: [{ title: "My Card — Elite Club" }] }),
});

function MemberHome() {
  const { user } = useAuth();
  const { members, transactions, partners } = useStore();
  const member = members.find((m) => m.id === user?.memberId);
  if (!member) return <DashboardLayout><div /></DashboardLayout>;

  const myTxns = transactions.filter((t) => t.memberId === member.id);
  const expired = isExpired(member.expiry);
  const days = daysUntil(member.expiry);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Welcome, {member.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground mt-1">Your Elite Club membership.</p>
        </div>

        {/* Membership Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 gold-glow"
          style={{ background: "linear-gradient(135deg, oklch(0.20 0.04 80) 0%, oklch(0.13 0.01 260) 60%, oklch(0.18 0.05 75) 100%)" }}
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="h-5 w-5 text-gold" />
                <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Elite Club</span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Member</p>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">{member.name}</h2>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Plan</p>
                  <p className="font-display text-xl font-bold text-gold">{member.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Valid Until</p>
                  <p className="text-sm font-semibold text-foreground">{new Date(member.expiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Status</p>
                  <span className={expired ? "status-inactive" : "status-active"}>{expired ? "Expired" : "Active"}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl shrink-0">
              <QRCodeSVG value={`elite-club:${member.id}`} size={120} bgColor="#ffffff" fgColor="#1a1a1a" level="H" />
            </div>
          </div>
        </motion.div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass-panel p-5">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-4 w-4 text-gold" />
              <p className="text-sm text-muted-foreground">Days Left</p>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{expired ? 0 : days}</p>
          </div>
          <div className="glass-panel p-5">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-4 w-4 text-gold" />
              <p className="text-sm text-muted-foreground">Total Visits</p>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{member.visits}</p>
          </div>
          <div className="glass-panel p-5">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="h-4 w-4 text-gold" />
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{formatINR(member.totalSpent)}</p>
          </div>
        </div>

        {/* Nearby Partners */}
        <div className="glass-panel p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Partner Venues</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partners.filter((p) => p.status === "Active").map((p) => (
              <div key={p.id} className="rounded-lg bg-background/50 p-4 hover:border-gold border border-transparent transition-colors">
                <p className="font-semibold text-foreground">{p.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />{p.location}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Recent Purchases</h3>
            <Link to="/member/history" className="text-xs text-gold hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {myTxns.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.partnerName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <p className="text-sm font-semibold text-gold">{formatINR(t.subtotal)}</p>
              </div>
            ))}
            {myTxns.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No purchases yet</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
