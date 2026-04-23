import { AlertTriangle, TrendingUp, Clock, Wallet } from "lucide-react";

const alerts = [
  { icon: AlertTriangle, text: "Suspicious transaction: ₹45,000 at Partner #12", type: "destructive" as const, time: "2m ago" },
  { icon: TrendingUp, text: "High-value sale: ₹28,500 membership upgrade", type: "gold" as const, time: "15m ago" },
  { icon: Clock, text: "12 memberships expiring in next 7 days", type: "warning" as const, time: "1h ago" },
  { icon: Wallet, text: "Settlement pending for 3 partners (₹1,45,000)", type: "warning" as const, time: "3h ago" },
  { icon: TrendingUp, text: "New yearly membership: Rahul Sharma", type: "gold" as const, time: "5h ago" },
];

const colorMap = {
  destructive: "bg-destructive/10 text-destructive",
  gold: "bg-gold-muted text-gold",
  warning: "bg-warning/10 text-warning",
};

export function ActivityFeed() {
  return (
    <div className="glass-panel p-5">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Alerts & Activity</h3>
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg bg-background/50 p-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorMap[alert.type]}`}>
              <alert.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{alert.text}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
