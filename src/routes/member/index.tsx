import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useStore, formatINR, isExpired, daysUntil } from "@/lib/store";
import { QRCodeSVG } from "qrcode.react";
import { Crown, MapPin, Calendar, IndianRupee, Activity, Star, Clock, Package } from "lucide-react";
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

        {/* Partner Venues — hotel-style cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Partner Venues</h3>
              <p className="text-xs text-muted-foreground">Your card unlocks these places.</p>
            </div>
            <span className="text-xs text-muted-foreground">{partners.filter((p) => p.status === "Active").length} active</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((p) => {
              const open = p.status === "Active";
              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group rounded-xl overflow-hidden border border-border bg-card hover:border-gold/60 hover:shadow-[0_10px_40px_-10px_oklch(0.78_0.12_75/0.4)] transition-all"
                >
                  <div className="relative h-36 overflow-hidden bg-secondary">
                    {p.photo ? (
                      <img
                        src={p.photo}
                        alt={p.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <Crown className="h-8 w-8 opacity-30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur ${
                          open ? "bg-success/20 text-success border border-success/40" : "bg-destructive/20 text-destructive border border-destructive/40"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-success animate-pulse" : "bg-destructive"}`} />
                        {open ? "Open Now" : "Closed"}
                      </span>
                    </div>
                    {p.rating !== undefined && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-[11px] font-semibold border border-gold/30">
                        <Star className="h-3 w-3 text-gold fill-gold" />
                        <span className="text-foreground">{p.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-lg font-bold text-foreground leading-tight">{p.name}</h4>
                    </div>
                    {p.cuisine && (
                      <p className="text-[11px] uppercase tracking-wider text-gold font-semibold">{p.cuisine}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>
                    {p.hours && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{p.hours}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Recent Purchases</h3>
            <Link to="/member/history" className="text-xs text-gold hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {myTxns.slice(0, 5).map((t) => {
              const itemCount = t.items.reduce((s, i) => s + i.qty, 0);
              const itemNames = t.items.map((i) => `${i.qty}× ${i.name}`).join(", ");
              return (
                <div key={t.id} className="flex items-start justify-between gap-3 py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-gold-muted flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{t.partnerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{itemNames}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span>{itemCount} item{itemCount === 1 ? "" : "s"}</span>
                        <span>·</span>
                        <span>{new Date(t.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gold">{formatINR(t.subtotal)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.paymentMode}</p>
                  </div>
                </div>
              );
            })}
            {myTxns.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No purchases yet</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
