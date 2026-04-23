import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useStore, daysUntil, isExpired, PLAN_PRICES, type Plan, PLAN_DAYS } from "@/lib/store";
import { CreditCard, Star, Zap, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/member/subscription")({
  component: SubscriptionPage,
  head: () => ({ meta: [{ title: "Subscription — Elite Club" }] }),
});

function SubscriptionPage() {
  const { user } = useAuth();
  const { members, updateMember } = useStore();
  const member = members.find((m) => m.id === user?.memberId);
  const [success, setSuccess] = useState<string | null>(null);

  if (!member) return <DashboardLayout><div /></DashboardLayout>;

  const expired = isExpired(member.expiry);

  const plans = [
    { key: "Daily" as Plan, name: "Daily Pass", price: PLAN_PRICES.Daily, duration: "1 Day", icon: Zap, features: ["Single day access", "All partner venues"] },
    { key: "Octa" as Plan, name: "Octa Pass", price: PLAN_PRICES.Octa, duration: "8 Days", icon: Star, features: ["8 day access", "Priority seating", "Drink discounts"] },
    { key: "Yearly" as Plan, name: "Yearly Elite", price: PLAN_PRICES.Yearly, duration: "365 Days", icon: CreditCard, features: ["Unlimited access", "VIP treatment", "Exclusive events"] },
  ];

  const upgrade = (plan: Plan) => {
    const days = PLAN_DAYS[plan];
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + days);
    updateMember(member.id, { plan, expiry: newExpiry.toISOString() });
    setSuccess(`Upgraded to ${plan}. Valid until ${newExpiry.toLocaleDateString("en-IN")}.`);
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Subscription</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your membership plan.</p>
        </div>

        {success && (
          <div className="glass-panel p-4 border-success/40 flex items-center gap-3">
            <Check className="h-5 w-5 text-success" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Current Plan */}
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Plan</p>
          <div className="flex items-end justify-between mt-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-gold">{member.plan}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {expired ? "Expired" : `${daysUntil(member.expiry)} days remaining`} · Valid until {new Date(member.expiry).toLocaleDateString("en-IN")}
              </p>
            </div>
            <span className={expired ? "status-inactive" : "status-active"}>{expired ? "Expired" : "Active"}</span>
          </div>
        </div>

        {/* Available plans */}
        <div>
          <h3 className="font-display text-xl font-semibold mb-4">Upgrade or Renew</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <div key={p.key} className={`glass-panel p-6 flex flex-col ${member.plan === p.key && !expired ? "border-gold" : ""}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-muted">
                    <p.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold">{p.name}</h4>
                    <p className="text-xs text-muted-foreground">{p.duration}</p>
                  </div>
                </div>
                <p className="font-display text-3xl font-bold text-gold mb-4">₹{p.price.toLocaleString("en-IN")}</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => upgrade(p.key)}
                  className="h-10 w-full rounded-lg bg-gold text-gold-foreground font-semibold hover:opacity-90"
                >
                  {member.plan === p.key && !expired ? "Renew" : "Upgrade"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
