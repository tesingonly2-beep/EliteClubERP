import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CreditCard, Star, Zap } from "lucide-react";
import { useStore, PLAN_PRICES } from "@/lib/store";

export const Route = createFileRoute("/admin/plans")({
  component: PlansPage,
  head: () => ({ meta: [{ title: "Plans — Elite Club" }] }),
});

function PlansPage() {
  const { members } = useStore();
  const plans = [
    { name: "Daily Pass", key: "Daily" as const, price: PLAN_PRICES.Daily, duration: "1 Day", icon: Zap, features: ["Single day access", "All partner venues", "Basic amenities"] },
    { name: "Octa Pass", key: "Octa" as const, price: PLAN_PRICES.Octa, duration: "8 Days", icon: Star, features: ["8 day access", "All partners", "Priority seating", "Drink discounts"] },
    { name: "Yearly Elite", key: "Yearly" as const, price: PLAN_PRICES.Yearly, duration: "365 Days", icon: CreditCard, features: ["Unlimited access", "VIP treatment", "Exclusive events", "Partner discounts"] },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Membership Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure membership tiers.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const count = members.filter((m) => m.plan === plan.key).length;
            return (
              <div key={plan.key} className="glass-panel p-6 flex flex-col hover:border-gold transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-muted">
                    <plan.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.duration}</p>
                  </div>
                </div>
                <p className="font-display text-3xl font-bold text-gold mb-1">₹{plan.price.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground mb-4">{count} active members</p>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button className="mt-6 w-full rounded-lg border border-gold/30 py-2 text-sm font-medium text-gold hover:bg-gold-muted transition-colors">Edit Plan</button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
