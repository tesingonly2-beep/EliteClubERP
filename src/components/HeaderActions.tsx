import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell, LogOut, Mail, Phone, MapPin, Crown, Briefcase, Calendar,
  Sparkles, AlertTriangle, TrendingUp, UserPlus, Receipt, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore, isExpired, daysUntil, formatINR } from "@/lib/store";

type NotifKind = "alert" | "info" | "success";
interface Notif {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  time: string;
}

export function HeaderActions() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { members, partners, transactions, settlements, inventory } = useStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const notifications: Notif[] = useMemo(() => {
    if (!user) return [];
    const items: Notif[] = [];

    if (user.role === "superadmin") {
      const expiredCount = members.filter((m) => isExpired(m.expiry)).length;
      if (expiredCount > 0) {
        items.push({
          id: "exp",
          kind: "alert",
          title: `${expiredCount} memberships expired`,
          body: "Members need to renew their plans.",
          time: "Now",
        });
      }
      const pending = settlements.filter((s) => s.status === "Pending");
      if (pending.length > 0) {
        items.push({
          id: "pay",
          kind: "alert",
          title: `${pending.length} settlements pending`,
          body: `${formatINR(pending.reduce((s, x) => s + x.amount, 0))} to release.`,
          time: "Today",
        });
      }
      const inactive = partners.filter((p) => p.status === "Inactive").length;
      if (inactive > 0) {
        items.push({
          id: "inactive",
          kind: "info",
          title: `${inactive} partners inactive`,
          body: "Reach out to re-engage them.",
          time: "Today",
        });
      }
      items.push({
        id: "rev",
        kind: "success",
        title: "Revenue trending up",
        body: "+12.5% vs last month across the network.",
        time: "Yesterday",
      });
    } else if (user.role === "partner") {
      const myInv = inventory.filter((i) => i.partnerId === user.partnerId);
      const lowStock = myInv.filter((i) => i.stock < 5);
      if (lowStock.length > 0) {
        items.push({
          id: "low",
          kind: "alert",
          title: `${lowStock.length} items low on stock`,
          body: lowStock.slice(0, 2).map((i) => i.name).join(", "),
          time: "Now",
        });
      }
      const myTxns = transactions.filter((t) => t.partnerId === user.partnerId);
      const todayMs = new Date().setHours(0, 0, 0, 0);
      const todayTxns = myTxns.filter((t) => new Date(t.createdAt).setHours(0, 0, 0, 0) === todayMs);
      if (todayTxns.length > 0) {
        items.push({
          id: "today",
          kind: "success",
          title: `${todayTxns.length} bills today`,
          body: `${formatINR(todayTxns.reduce((s, t) => s + t.subtotal, 0))} in sales so far.`,
          time: "Today",
        });
      }
      const mySettlement = settlements.find((s) => s.partnerId === user.partnerId && s.status === "Pending");
      if (mySettlement) {
        items.push({
          id: "settle",
          kind: "info",
          title: "Settlement pending",
          body: `${formatINR(mySettlement.amount)} for ${mySettlement.period}.`,
          time: "This week",
        });
      }
    } else if (user.role === "member") {
      const me = members.find((m) => m.id === user.memberId);
      if (me) {
        const d = daysUntil(me.expiry);
        if (isExpired(me.expiry)) {
          items.push({ id: "exp", kind: "alert", title: "Membership expired", body: "Renew to keep accessing partner venues.", time: "Now" });
        } else if (d <= 7) {
          items.push({ id: "expsoon", kind: "alert", title: `Expires in ${d} day${d === 1 ? "" : "s"}`, body: "Renew now to avoid interruption.", time: "Soon" });
        }
        const myTx = transactions.filter((t) => t.memberId === me.id);
        if (myTx[0]) {
          items.push({ id: "lastvisit", kind: "info", title: `Visit logged at ${myTx[0].partnerName}`, body: `${formatINR(myTx[0].subtotal)} on ${new Date(myTx[0].createdAt).toLocaleDateString("en-IN")}.`, time: "Recent" });
        }
        items.push({ id: "perks", kind: "success", title: "New perks unlocked", body: `${partners.filter((p) => p.status === "Active").length} venues accept your card.`, time: "Today" });
      }
    }
    return items;
  }, [user, members, partners, transactions, settlements, inventory]);

  if (!user) return null;
  const initials = user.name.split(" ").map((s) => s[0]).slice(0, 2).join("");

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  // ----- profile content per role -----
  let profileMeta: { line: string; icon: any }[] = [];
  let profileTitle = user.name;
  let profileSubtitle = user.role;

  if (user.role === "partner") {
    const partner = partners.find((p) => p.id === user.partnerId);
    const myTxns = transactions.filter((t) => t.partnerId === user.partnerId);
    const sales = myTxns.reduce((s, t) => s + t.subtotal, 0);
    profileTitle = partner?.name ?? user.name;
    profileSubtitle = `Owner: ${partner?.owner ?? user.name}`;
    profileMeta = [
      { line: user.email, icon: Mail },
      { line: partner?.location ?? "—", icon: MapPin },
      { line: `Status: ${partner?.status ?? "—"}`, icon: Sparkles },
      { line: `${myTxns.length} transactions · ${formatINR(sales)} sales`, icon: TrendingUp },
      { line: `Partner since ${partner ? new Date(partner.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}`, icon: Calendar },
    ];
  } else if (user.role === "superadmin") {
    profileSubtitle = "Club Owner";
    profileMeta = [
      { line: user.email, icon: Mail },
      { line: `${partners.length} partners · ${members.length} members`, icon: Briefcase },
      { line: `${formatINR(transactions.reduce((s, t) => s + t.subtotal, 0))} all-time revenue`, icon: TrendingUp },
    ];
  } else if (user.role === "member") {
    const me = members.find((m) => m.id === user.memberId);
    profileSubtitle = `${me?.plan ?? ""} member`;
    profileMeta = [
      { line: me?.email ?? user.email, icon: Mail },
      { line: me?.phone ?? "—", icon: Phone },
      { line: me?.city ?? "—", icon: MapPin },
      { line: `${me?.visits ?? 0} visits · ${formatINR(me?.totalSpent ?? 0)}`, icon: TrendingUp },
    ];
  }

  return (
    <div className="flex items-center gap-3">
      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
          className="relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {notifications.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-[22rem] max-h-[70vh] overflow-y-auto rounded-xl border border-gold/20 bg-card shadow-2xl z-50 gold-glow">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="font-display text-sm font-semibold">Notifications</p>
                <p className="text-[11px] text-muted-foreground">{notifications.length} new</p>
              </div>
              <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="divide-y divide-border/60">
              {notifications.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">You're all caught up ✨</p>
              )}
              {notifications.map((n) => (
                <NotificationRow key={n.id} n={n} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
          className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-accent transition-colors"
          aria-label="Profile"
        >
          <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center ring-1 ring-gold/40">
            <span className="text-xs font-semibold text-gold">{initials}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-foreground leading-tight">{user.name.split(" ")[0]}</p>
            <p className="text-[10px] text-muted-foreground capitalize leading-tight">{user.role}</p>
          </div>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gold/20 bg-card shadow-2xl z-50 overflow-hidden gold-glow">
            <div className="relative h-20 bg-gradient-to-br from-gold/40 via-gold/15 to-transparent">
              <div className="absolute -bottom-8 left-4 h-16 w-16 rounded-2xl bg-gold flex items-center justify-center text-gold-foreground font-display font-bold text-2xl ring-4 ring-card shadow-lg">
                {initials}
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold border border-gold/30">
                <Crown className="h-3 w-3" /> {user.role}
              </div>
            </div>
            <div className="px-4 pt-10 pb-4">
              <h3 className="font-display text-lg font-bold text-foreground truncate">{profileTitle}</h3>
              <p className="text-xs text-muted-foreground capitalize">{profileSubtitle}</p>

              <div className="mt-3 space-y-1.5">
                {profileMeta.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                    <m.icon className="h-3.5 w-3.5 text-gold shrink-0" />
                    <span className="truncate">{m.line}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleLogout}
                className="mt-4 w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-destructive/30 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationRow({ n }: { n: Notif }) {
  const palette = {
    alert: { Icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    info: { Icon: Receipt, color: "text-gold", bg: "bg-gold-muted" },
    success: { Icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  }[n.kind];
  const Icon = palette.Icon;
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-accent/40 transition-colors">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${palette.bg} ${palette.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{n.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
    </div>
  );
}

// Suppress unused
void UserPlus;
