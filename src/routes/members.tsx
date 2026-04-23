import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { Search, Filter } from "lucide-react";

export const Route = createFileRoute("/members")({
  component: MembersPage,
  head: () => ({
    meta: [
      { title: "Members — Elite Club" },
      { name: "description", content: "Manage club members" },
    ],
  }),
});

const membersData = [
  { name: "Rahul Sharma", phone: "+91 98765 43210", plan: "Yearly", expiry: "2026-01-15", lastActivity: "Today", status: "Active" },
  { name: "Neha Gupta", phone: "+91 87654 32109", plan: "Octa", expiry: "2025-08-22", lastActivity: "Yesterday", status: "Active" },
  { name: "Amit Patel", phone: "+91 76543 21098", plan: "Daily", expiry: "2025-05-01", lastActivity: "2 days ago", status: "Active" },
  { name: "Kavya Nair", phone: "+91 65432 10987", plan: "Yearly", expiry: "2025-03-10", lastActivity: "1 week ago", status: "Expired" },
  { name: "Vikash Kumar", phone: "+91 54321 09876", plan: "Octa", expiry: "2025-09-30", lastActivity: "Today", status: "Active" },
  { name: "Sneha Reddy", phone: "+91 43210 98765", plan: "Yearly", expiry: "2025-12-05", lastActivity: "3 days ago", status: "Active" },
  { name: "Rohit Joshi", phone: "+91 32109 87654", plan: "Daily", expiry: "2025-04-25", lastActivity: "5 days ago", status: "Expired" },
  { name: "Ananya Singh", phone: "+91 21098 76543", plan: "Octa", expiry: "2025-11-18", lastActivity: "Today", status: "Active" },
];

function MembersPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");

  const filtered = membersData.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchesPlan = planFilter === "All" || m.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">Search and manage all club members.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {["All", "Daily", "Octa", "Yearly"].map((plan) => (
              <button
                key={plan}
                onClick={() => setPlanFilter(plan)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  planFilter === plan ? "bg-gold text-gold-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {plan}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Phone</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Expiry</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Last Activity</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{m.name}</td>
                    <td className="py-3 text-muted-foreground">{m.phone}</td>
                    <td className="py-3">
                      <span className="rounded-md bg-gold-muted px-2 py-0.5 text-xs font-medium text-gold">{m.plan}</span>
                    </td>
                    <td className="py-3 text-foreground">{m.expiry}</td>
                    <td className="py-3 text-muted-foreground">{m.lastActivity}</td>
                    <td className="py-3 text-center">
                      <span className={m.status === "Active" ? "status-active" : "status-inactive"}>{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
