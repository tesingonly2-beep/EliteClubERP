import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useStore, formatINR, isExpired, daysUntil, type BillItem, type Member } from "@/lib/store";
import { Search, Plus, Trash2, Check, AlertTriangle, User } from "lucide-react";

export const Route = createFileRoute("/partner/billing")({
  component: BillingPage,
  head: () => ({ meta: [{ title: "Billing — Elite Club" }] }),
});

function BillingPage() {
  const { user } = useAuth();
  const { partners, members, createTransaction } = useStore();
  const partner = partners.find((p) => p.id === user?.partnerId);

  const [search, setSearch] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [item, setItem] = useState({ name: "", mrp: "", qty: "1", cost: "" });
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Card">("UPI");
  const [success, setSuccess] = useState<string | null>(null);
  const itemNameRef = useRef<HTMLInputElement>(null);

  const matched = members.filter((m) => m.phone.includes(search) || m.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
  const expired = member ? isExpired(member.expiry) : false;

  const subtotal = items.reduce((s, i) => s + i.mrp, 0);
  const cost = items.reduce((s, i) => s + i.cost, 0);
  const profit = subtotal - cost;
  const clubShare = Math.round(profit / 2);
  const partnerShare = profit - clubShare;

  const addItem = () => {
    const mrp = Number(item.mrp);
    const qty = Number(item.qty);
    const cost = Number(item.cost) || mrp * 0.5;
    if (!item.name || !mrp || !qty) return;
    setItems([...items, { name: item.name, qty, mrp: mrp * qty, cost: cost * qty }]);
    setItem({ name: "", mrp: "", qty: "1", cost: "" });
    itemNameRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const generateBill = () => {
    if (!member || !partner || items.length === 0 || expired) return;
    const tx = createTransaction({
      memberId: member.id,
      memberName: member.name,
      partnerId: partner.id,
      partnerName: partner.name,
      items, subtotal, profit, clubShare, partnerShare, paymentMode,
    });
    setSuccess(`Bill ${tx.id.slice(0, 10)} generated for ${formatINR(subtotal)}`);
    setItems([]);
    setMember(null);
    setSearch("");
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate bills for members at {partner?.name}.</p>
        </div>

        {success && (
          <div className="glass-panel p-4 border-success/40 flex items-center gap-3">
            <Check className="h-5 w-5 text-success" />
            <p className="text-sm font-medium text-foreground">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: Member */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-display text-lg font-semibold">Member</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search} onChange={(e) => { setSearch(e.target.value); setMember(null); }}
                placeholder="Search by phone / name / scan QR"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            {!member && search && matched.length > 0 && (
              <div className="space-y-1">
                {matched.map((m) => (
                  <button key={m.id} onClick={() => { setMember(m); setSearch(""); }} className="w-full text-left rounded-lg p-2 hover:bg-accent transition-colors">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.phone}</p>
                  </button>
                ))}
              </div>
            )}

            {member && (
              <div className="rounded-lg bg-background/50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-muted">
                    <User className="h-6 w-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="text-gold font-medium">{member.plan}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Expiry</span><span className="text-foreground">{new Date(member.expiry).toLocaleDateString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                    <span className={expired ? "status-inactive" : "status-active"}>{expired ? "Expired" : `${daysUntil(member.expiry)}d left`}</span>
                  </div>
                </div>
                {expired && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-xs text-destructive font-medium">Membership expired. Billing blocked.</p>
                  </div>
                )}
                <button onClick={() => { setMember(null); setItems([]); }} className="w-full text-xs text-muted-foreground hover:text-foreground">Clear</button>
              </div>
            )}
          </div>

          {/* CENTER: Cart */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-display text-lg font-semibold">Cart</h3>

            <div className="grid grid-cols-12 gap-2">
              <input ref={itemNameRef} value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} onKeyDown={handleKey}
                placeholder="Item" className="col-span-4 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none" />
              <input value={item.mrp} onChange={(e) => setItem({ ...item, mrp: e.target.value })} onKeyDown={handleKey}
                placeholder="MRP" type="number" className="col-span-3 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none" />
              <input value={item.qty} onChange={(e) => setItem({ ...item, qty: e.target.value })} onKeyDown={handleKey}
                placeholder="Qty" type="number" className="col-span-2 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none" />
              <input value={item.cost} onChange={(e) => setItem({ ...item, cost: e.target.value })} onKeyDown={handleKey}
                placeholder="Cost" type="number" className="col-span-2 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none" />
              <button onClick={addItem} className="col-span-1 h-9 rounded-lg bg-gold text-gold-foreground flex items-center justify-center hover:opacity-90"><Plus className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground">Enter MRP and Cost (per unit). Press Enter to add quickly.</p>

            <div className="space-y-1 max-h-80 overflow-y-auto">
              {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No items added yet</p>}
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center py-2 border-b border-border/50 text-sm">
                  <span className="col-span-5 text-foreground">{it.name}</span>
                  <span className="col-span-2 text-center text-muted-foreground">×{it.qty}</span>
                  <span className="col-span-4 text-right font-medium text-foreground">{formatINR(it.mrp)}</span>
                  <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="col-span-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-display text-lg font-semibold">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold text-foreground">{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Profit</span><span className="font-semibold text-gold">{formatINR(profit)}</span></div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Club Share (50%)</span><span className="text-foreground">{formatINR(clubShare)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Partner Share (50%)</span><span className="text-foreground">{formatINR(partnerShare)}</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment Mode</p>
              <div className="grid grid-cols-3 gap-2">
                {(["Cash", "UPI", "Card"] as const).map((mode) => (
                  <button key={mode} onClick={() => setPaymentMode(mode)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${paymentMode === mode ? "border-gold bg-gold-muted text-gold" : "border-border bg-background/50 text-muted-foreground"}`}>
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateBill}
              disabled={!member || expired || items.length === 0}
              className="h-11 w-full rounded-lg bg-gold text-gold-foreground font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Generate Bill & Close
            </button>
            <p className="text-[10px] text-muted-foreground text-center">Profit auto-calculated. Bills cannot be deleted once generated.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
