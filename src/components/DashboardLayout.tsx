import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  Crown,
  LogOut,
  Receipt,
  Home,
  History,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/store";

const menuByRole: Record<Role, { title: string; to: string; icon: any }[]> = {
  superadmin: [
    { title: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { title: "Partners", to: "/admin/partners", icon: Users },
    { title: "Members", to: "/admin/members", icon: UserCheck },
    { title: "Membership Plans", to: "/admin/plans", icon: CreditCard },
    { title: "Transactions", to: "/admin/transactions", icon: ArrowLeftRight },
    { title: "Settlements", to: "/admin/settlements", icon: Wallet },
    { title: "Reports", to: "/admin/reports", icon: BarChart3 },
    { title: "Settings", to: "/admin/settings", icon: Settings },
  ],
  partner: [
    { title: "Dashboard", to: "/partner", icon: LayoutDashboard },
    { title: "Billing", to: "/partner/billing", icon: Receipt },
    { title: "Members", to: "/partner/members", icon: UserCheck },
    { title: "Reports", to: "/partner/reports", icon: BarChart3 },
  ],
  member: [
    { title: "Home", to: "/member", icon: Home },
    { title: "Subscription", to: "/member/subscription", icon: CreditCard },
    { title: "History", to: "/member/history", icon: History },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const items = menuByRole[user.role];
  const initials = user.name.split(" ").map((s) => s[0]).slice(0, 2).join("");

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col border-r border-border bg-sidebar shrink-0"
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold text-gold-foreground">
            <Crown className="h-5 w-5" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
                <h1 className="font-display text-lg font-bold text-sidebar-foreground whitespace-nowrap">Elite Club</h1>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{user.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {items.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/admin" && item.to !== "/partner" && item.to !== "/member" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive ? "bg-gold-muted text-gold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-gold" : ""}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-12 items-center justify-center border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        >
          <ChevronLeft className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </motion.aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-80 rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">3</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-gold">{initials}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-tight">{user.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
