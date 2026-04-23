import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/partners")({
  component: PartnersPage,
  head: () => ({
    meta: [
      { title: "Partners — Elite Club" },
      { name: "description", content: "Manage club partners" },
    ],
  }),
});

const partnersData = [
  { id: 1, name: "The Vault", owner: "Raj Malhotra", location: "Mumbai", revenue: "₹4,85,000", profit: "₹1,45,500", clubShare: "₹72,750", members: 68, status: "Active" },
  { id: 2, name: "Sky Lounge", owner: "Priya Sharma", location: "Delhi", revenue: "₹3,42,000", profit: "₹1,02,600", clubShare: "₹51,300", members: 52, status: "Active" },
  { id: 3, name: "Noir Bar", owner: "Vikram Singh", location: "Bangalore", revenue: "₹2,98,000", profit: "₹89,400", clubShare: "₹44,700", members: 45, status: "Active" },
  { id: 4, name: "Amber Club", owner: "Aisha Khan", location: "Pune", revenue: "₹2,15,000", profit: "₹64,500", clubShare: "₹32,250", members: 38, status: "Inactive" },
  { id: 5, name: "Eclipse", owner: "Arjun Patel", location: "Hyderabad", revenue: "₹1,76,000", profit: "₹52,800", clubShare: "₹26,400", members: 31, status: "Active" },
];

function PartnersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const filtered = partnersData.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const detail = selected !== null ? partnersData.find((p) => p.id === selected) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Partners</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all club partners and their performance.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Add Partner
          </button>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="flex gap-6">
          <div className={`glass-panel p-5 ${detail ? "flex-1" : "w-full"}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Partner</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Owner</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Location</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Revenue</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Members</th>
                    <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p.id)}
                      className={`border-b border-border/50 cursor-pointer transition-colors ${selected === p.id ? "bg-gold-muted" : "hover:bg-accent/30"}`}
                    >
                      <td className="py-3 font-medium text-foreground">{p.name}</td>
                      <td className="py-3 text-foreground">{p.owner}</td>
                      <td className="py-3 text-muted-foreground">{p.location}</td>
                      <td className="py-3 text-right text-foreground">{p.revenue}</td>
                      <td className="py-3 text-right text-foreground">{p.members}</td>
                      <td className="py-3 text-center">
                        <span className={p.status === "Active" ? "status-active" : "status-inactive"}>{p.status}</span>
                      </td>
                      <td className="py-3">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {detail && (
            <div className="glass-panel p-5 w-80 shrink-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-foreground">{detail.name}</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
              </div>
              <div className="space-y-3">
                {[
                  ["Revenue", detail.revenue],
                  ["Profit", detail.profit],
                  ["Club Share", detail.clubShare],
                  ["Members", String(detail.members)],
                  ["Owner", detail.owner],
                  ["Location", detail.location],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{val}</span>
                  </div>
                ))}
              </div>
              <span className={detail.status === "Active" ? "status-active" : "status-inactive"}>{detail.status}</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
