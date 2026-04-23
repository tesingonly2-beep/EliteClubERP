import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { useStore, isExpired } from "@/lib/store";
import { Search } from "lucide-react";

export const Route = createFileRoute("/partner/members")({
  component: PartnerMembersPage,
  head: () => ({ meta: [{ title: "Members — Elite Club" }] }),
});

function PartnerMembersPage() {
  const { members } = useStore();
  const [search, setSearch] = useState("");
  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse all club members.</p>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone..."
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
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
                  <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const exp = isExpired(m.expiry);
                  return (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-3 font-medium text-foreground">{m.name}</td>
                      <td className="py-3 text-muted-foreground">{m.phone}</td>
                      <td className="py-3"><span className="rounded-md bg-gold-muted px-2 py-0.5 text-xs font-medium text-gold">{m.plan}</span></td>
                      <td className="py-3 text-foreground">{new Date(m.expiry).toLocaleDateString("en-IN")}</td>
                      <td className="py-3 text-center"><span className={exp ? "status-inactive" : "status-active"}>{exp ? "Expired" : "Active"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
