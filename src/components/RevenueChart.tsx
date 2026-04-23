import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 420000, profit: 126000 },
  { month: "Feb", revenue: 480000, profit: 144000 },
  { month: "Mar", revenue: 510000, profit: 153000 },
  { month: "Apr", revenue: 390000, profit: 117000 },
  { month: "May", revenue: 560000, profit: 168000 },
  { month: "Jun", revenue: 620000, profit: 186000 },
  { month: "Jul", revenue: 700000, profit: 210000 },
];

const partnerData = [
  { name: "The Vault", revenue: 185000 },
  { name: "Sky Lounge", revenue: 142000 },
  { name: "Noir Bar", revenue: 128000 },
  { name: "Amber Club", revenue: 98000 },
  { name: "Eclipse", revenue: 76000 },
];

const membershipData = [
  { month: "Jan", members: 120 },
  { month: "Feb", members: 145 },
  { month: "Mar", members: 168 },
  { month: "Apr", members: 190 },
  { month: "May", members: 215 },
  { month: "Jun", members: 248 },
  { month: "Jul", members: 280 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-3 py-2">
      <p className="text-xs font-medium text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs text-muted-foreground">
          {p.name}: <span className="font-semibold text-gold">₹{(p.value / 1000).toFixed(0)}K</span>
        </p>
      ))}
    </div>
  );
}

export function RevenueOverTimeChart() {
  return (
    <div className="glass-panel p-5">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Revenue Over Time</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
          <XAxis dataKey="month" stroke="oklch(0.60 0.02 260)" fontSize={12} />
          <YAxis stroke="oklch(0.60 0.02 260)" fontSize={12} tickFormatter={(v) => `₹${v/1000}K`} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="revenue" stroke="oklch(0.78 0.12 75)" strokeWidth={2.5} dot={{ r: 4, fill: "oklch(0.78 0.12 75)" }} />
          <Line type="monotone" dataKey="profit" stroke="oklch(0.70 0.18 145)" strokeWidth={2} dot={{ r: 3, fill: "oklch(0.70 0.18 145)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PartnerContributionChart() {
  return (
    <div className="glass-panel p-5">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Partner-wise Contribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={partnerData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
          <XAxis dataKey="name" stroke="oklch(0.60 0.02 260)" fontSize={11} />
          <YAxis stroke="oklch(0.60 0.02 260)" fontSize={12} tickFormatter={(v) => `₹${v/1000}K`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" fill="oklch(0.78 0.12 75)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MembershipGrowthChart() {
  return (
    <div className="glass-panel p-5">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Membership Growth</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={membershipData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
          <XAxis dataKey="month" stroke="oklch(0.60 0.02 260)" fontSize={12} />
          <YAxis stroke="oklch(0.60 0.02 260)" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="members" stroke="oklch(0.75 0.12 280)" strokeWidth={2.5} dot={{ r: 4, fill: "oklch(0.75 0.12 280)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
