import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth, rolePath } from "@/lib/auth";
import type { Role } from "@/lib/store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign In — Elite Club" },
      { name: "description", content: "Sign in to your Elite Club account" },
    ],
  }),
});

const ROLES: { value: Role; label: string; demo: string; desc: string }[] = [
  { value: "superadmin", label: "Superadmin", demo: "super@elite.club", desc: "Club owner — full control" },
  { value: "partner", label: "Partner Admin", demo: "raj@thevault.com", desc: "Bar/lounge owner — billing & members" },
  { value: "member", label: "Member", demo: "rahul@gmail.com", desc: "Customer — view card & history" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [role, setRole] = useState<Role>("superadmin");
  const [email, setEmail] = useState("super@elite.club");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate({ to: rolePath(user.role) });
  }, [user, navigate]);

  const handleRoleChange = (r: Role) => {
    setRole(r);
    setEmail(ROLES.find((x) => x.value === r)!.demo);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    const u = login(email, role);
    if (!u) {
      setError("Invalid credentials");
      return;
    }
    navigate({ to: rolePath(u.role) });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-chart-4/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="glass-panel p-8 gold-glow">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-gold-foreground mb-4">
              <Crown className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Elite Club</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleRoleChange(r.value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    role === r.value
                      ? "border-gold bg-gold-muted text-gold"
                      : "border-border bg-background/50 text-muted-foreground hover:border-gold/40"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {ROLES.find((r) => r.value === role)!.desc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gold text-gold-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Sign In <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-background/50 border border-border p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Demo Mode</p>
            <p className="text-xs text-foreground">Pick a role above. Email is pre-filled. Any password works.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
