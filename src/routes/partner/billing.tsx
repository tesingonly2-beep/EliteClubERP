import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import {
  useStore,
  formatINR,
  isExpired,
  daysUntil,
  type BillItem,
  type Member,
  type Transaction,
  type InventoryItem,
} from "@/lib/store";
import {
  Search,
  Trash2,
  Check,
  AlertTriangle,
  User,
  ScanLine,
  Hand,
  Plus,
  Minus,
  Printer,
  X,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/partner/billing")({
  component: BillingPage,
  head: () => ({ meta: [{ title: "Billing — Elite Club" }] }),
});

type Mode = "auto" | "manual";

interface CartLine extends BillItem {
  unitMrp: number;
  unitCost: number;
}

function BillingPage() {
  const { user } = useAuth();
  const { partners, members, inventory, createTransaction } = useStore();
  const partner = partners.find((p) => p.id === user?.partnerId);
  const partnerInventory = useMemo(
    () => inventory.filter((i) => i.partnerId === partner?.id),
    [inventory, partner?.id],
  );

  const [mode, setMode] = useState<Mode>("auto");
  const [search, setSearch] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Card">("UPI");
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  // Scanner inputs
  const [barcodeInput, setBarcodeInput] = useState("");
  const scannerRef = useRef<HTMLInputElement>(null);
  // Manual mode
  const [manualSearch, setManualSearch] = useState("");

  const matchedMembers = members
    .filter((m) => m.phone.includes(search) || m.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);
  const expired = member ? isExpired(member.expiry) : false;
  const canBill = !!member && !expired;

  // Keep scanner input focused in auto mode
  useEffect(() => {
    if (mode === "auto" && canBill && !receipt) {
      scannerRef.current?.focus();
    }
  }, [mode, canBill, receipt, lines.length]);

  const subtotal = lines.reduce((s, i) => s + i.mrp, 0);
  const cost = lines.reduce((s, i) => s + i.cost, 0);
  const profit = subtotal - cost;
  const clubShare = Math.round(profit / 2);
  const partnerShare = profit - clubShare;

  const addInventoryToCart = (inv: InventoryItem, qty = 1) => {
    if (!canBill) {
      toast.error("Select an active member first");
      return;
    }
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.barcode === inv.barcode);
      if (idx >= 0) {
        const next = [...prev];
        const newQty = next[idx].qty + qty;
        next[idx] = {
          ...next[idx],
          qty: newQty,
          mrp: next[idx].unitMrp * newQty,
          cost: next[idx].unitCost * newQty,
        };
        return next;
      }
      return [
        ...prev,
        {
          name: inv.name,
          barcode: inv.barcode,
          qty,
          mrp: inv.mrp * qty,
          cost: inv.cost * qty,
          unitMrp: inv.mrp,
          unitCost: inv.cost,
        },
      ];
    });
  };

  const handleScan = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const found = partnerInventory.find((i) => i.barcode === trimmed);
    if (!found) {
      toast.error(`Unknown barcode: ${trimmed}`);
      return;
    }
    addInventoryToCart(found, 1);
    toast.success(`${found.name} added`);
    setBarcodeInput("");
  };

  const updateQty = (idx: number, delta: number) => {
    setLines((prev) => {
      const next = [...prev];
      const newQty = Math.max(1, next[idx].qty + delta);
      next[idx] = {
        ...next[idx],
        qty: newQty,
        mrp: next[idx].unitMrp * newQty,
        cost: next[idx].unitCost * newQty,
      };
      return next;
    });
  };

  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const generateBill = () => {
    if (!member || !partner || lines.length === 0 || expired) return;
    const tx = createTransaction({
      memberId: member.id,
      memberName: member.name,
      partnerId: partner.id,
      partnerName: partner.name,
      items: lines.map(({ unitMrp: _u, unitCost: _c, ...rest }) => rest),
      subtotal,
      profit,
      clubShare,
      partnerShare,
      paymentMode,
      mode,
    });
    setReceipt(tx);
  };

  const newBill = () => {
    setReceipt(null);
    setLines([]);
    setMember(null);
    setSearch("");
    setBarcodeInput("");
    setManualSearch("");
  };

  const filteredManual = manualSearch
    ? partnerInventory.filter(
        (i) =>
          i.name.toLowerCase().includes(manualSearch.toLowerCase()) ||
          i.category.toLowerCase().includes(manualSearch.toLowerCase()) ||
          i.barcode.includes(manualSearch),
      )
    : partnerInventory;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">
              <span className="h-px w-8 bg-gold/60" /> Point of Sale
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mt-1">Billing Console</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generating bills at <span className="text-foreground font-medium">{partner?.name}</span>
            </p>
          </div>

          {/* Mode toggle */}
          <div className="inline-flex rounded-xl border border-border bg-background/60 p-1 shadow-sm">
            <button
              onClick={() => setMode("auto")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                mode === "auto" ? "bg-gold text-gold-foreground shadow-md gold-glow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ScanLine className="h-4 w-4" />
              Scanner
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                mode === "manual" ? "bg-gold text-gold-foreground shadow-md gold-glow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Hand className="h-4 w-4" />
              Manual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: Member */}
          <div className="glass-panel p-5 space-y-5">
            <SectionHeader n={1} title="Select Member" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setMember(null);
                }}
                placeholder="Search by phone / name / scan QR"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            {!member && search && matchedMembers.length > 0 && (
              <div className="space-y-1 rounded-lg border border-border/60 bg-background/40 p-1">
                {matchedMembers.map((m) => {
                  const initials = m.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMember(m);
                        setSearch("");
                      }}
                      className="w-full flex items-center gap-3 text-left rounded-md p-2 hover:bg-accent transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-gold-muted overflow-hidden flex items-center justify-center text-[10px] font-bold text-gold shrink-0">
                        {m.photo ? <img src={m.photo} alt="" className="h-full w-full object-cover" /> : initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.phone}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {member && (
              <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold-muted to-transparent p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-gold-muted overflow-hidden flex items-center justify-center text-gold border-2 border-gold/40">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Plan" value={member.plan} />
                  <MiniStat label="Visits" value={String(member.visits)} />
                  <MiniStat label="Status" value={expired ? "Expired" : `${daysUntil(member.expiry)}d`} danger={expired} />
                </div>
                {expired && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-xs text-destructive font-medium">Membership expired. Billing blocked.</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setMember(null);
                    setLines([]);
                  }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear selection
                </button>
              </div>
            )}

            {/* Scanner / Manual picker */}
            <div className="pt-3 border-t border-border/60 space-y-3">
              <SectionHeader n={2} title={mode === "auto" ? "Scan Items" : "Pick Items"} />

              {mode === "auto" ? (
                <>
                  <div className="relative">
                    <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold animate-pulse" />
                    <input
                      ref={scannerRef}
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleScan(barcodeInput);
                        }
                      }}
                      placeholder={canBill ? "Waiting for scanner…" : "Select member first"}
                      disabled={!canBill}
                      className="h-11 w-full rounded-lg border-2 border-gold/40 bg-background pl-9 pr-4 text-sm font-mono focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-40"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    USB barcode scanners type the code + Enter automatically.
                  </p>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Quick-scan (demo)</p>
                    {partnerInventory.slice(0, 8).map((i) => (
                      <button
                        key={i.id}
                        disabled={!canBill}
                        onClick={() => handleScan(i.barcode)}
                        className="w-full text-left rounded-md border border-border bg-background/50 px-3 py-2 text-xs hover:border-gold/40 hover:bg-gold/5 disabled:opacity-30 flex items-center justify-between transition-colors"
                      >
                        <span className="truncate">{i.name}</span>
                        <span className="text-gold font-semibold ml-2">{formatINR(i.mrp)}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={manualSearch}
                      onChange={(e) => setManualSearch(e.target.value)}
                      placeholder="Search inventory…"
                      disabled={!canBill}
                      className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-40"
                    />
                  </div>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {filteredManual.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No items match</p>
                    )}
                    {filteredManual.map((i) => (
                      <button
                        key={i.id}
                        disabled={!canBill}
                        onClick={() => addInventoryToCart(i, 1)}
                        className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-left hover:border-gold/40 hover:bg-gold/5 disabled:opacity-30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground truncate">{i.name}</span>
                          <span className="text-xs text-gold font-semibold ml-2">{formatINR(i.mrp)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span className="rounded bg-accent/50 px-1.5 py-0.5">{i.category}</span>
                          <span>Stock: {i.stock >= 999 ? "∞" : i.stock}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CENTER: Cart */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-muted text-gold">
                  <ShoppingCart className="h-4 w-4" />
                </span>
                Current Bill
              </h3>
              {lines.length > 0 && (
                <span className="rounded-full bg-gold-muted px-2.5 py-0.5 text-xs font-semibold text-gold">
                  {lines.length} item{lines.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="space-y-2 min-h-[20rem] max-h-[34rem] overflow-y-auto pr-1">
              {lines.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="h-16 w-16 rounded-full bg-gold-muted/40 flex items-center justify-center mb-3">
                    <ShoppingCart className="h-7 w-7 opacity-40" />
                  </div>
                  <p className="text-sm font-medium">No items yet</p>
                  <p className="text-xs mt-1">{mode === "auto" ? "Scan a bottle to add" : "Pick items from the catalog"}</p>
                </div>
              )}
              {lines.map((it, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/60 bg-gradient-to-r from-background/60 to-background/20 p-3 space-y-2 hover:border-gold/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{it.name}</p>
                      {it.barcode && (
                        <p className="text-[10px] text-muted-foreground font-mono">{it.barcode}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatINR(it.unitMrp)} per unit</p>
                    </div>
                    <button
                      onClick={() => removeLine(idx)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center rounded-lg border border-border bg-background overflow-hidden">
                      <button onClick={() => updateQty(idx, -1)} className="h-8 w-8 flex items-center justify-center hover:bg-accent transition-colors">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold border-x border-border">{it.qty}</span>
                      <button onClick={() => updateQty(idx, 1)} className="h-8 w-8 flex items-center justify-center hover:bg-accent transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-base font-bold text-gold font-display">{formatINR(it.mrp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="glass-panel p-5 space-y-5 self-start lg:sticky lg:top-4">
            <SectionHeader n={3} title="Summary" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit</span>
                <span className="font-semibold text-gold">{formatINR(profit)}</span>
              </div>
              <div className="border-t border-dashed border-border pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Club Share (50%)</span>
                  <span className="text-foreground">{formatINR(clubShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Partner Share (50%)</span>
                  <span className="text-foreground">{formatINR(partnerShare)}</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="rounded-xl bg-gradient-to-br from-gold/30 via-gold-muted to-transparent border border-gold/40 p-4">
              <p className="text-[10px] uppercase tracking-wider text-gold font-semibold">Total Payable</p>
              <p className="font-display text-3xl font-bold text-foreground mt-1">{formatINR(subtotal)}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Payment Mode</p>
              <div className="grid grid-cols-3 gap-2">
                {(["Cash", "UPI", "Card"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMode(m)}
                    className={`rounded-lg border-2 px-2 py-2.5 text-xs font-semibold transition-all ${
                      paymentMode === m
                        ? "border-gold bg-gold-muted text-gold shadow-sm"
                        : "border-border bg-background/50 text-muted-foreground hover:border-gold/40"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateBill}
              disabled={!member || expired || lines.length === 0}
              className="h-12 w-full rounded-xl bg-gold text-gold-foreground font-bold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg gold-glow transition-all"
            >
              <Check className="h-5 w-5" /> Pay & Generate Receipt
            </button>
            <p className="text-[10px] text-muted-foreground text-center">
              Profit auto-calculated. Bills cannot be deleted once generated.
            </p>
          </div>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {receipt && <ReceiptModal tx={receipt} partner={partner?.name ?? ""} onClose={newBill} />}
    </DashboardLayout>
  );
}

function SectionHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold text-gold-foreground text-xs font-bold font-display">
        {n}
      </span>
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function MiniStat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-lg bg-background/60 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-xs font-bold mt-0.5 ${danger ? "text-destructive" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function ReceiptModal({ tx, partner, onClose }: { tx: Transaction; partner: string; onClose: () => void }) {
  const print = () => window.print();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 print:bg-white print:static print:p-0">
      <div className="bg-white text-black rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl print:rounded-none print:max-w-none print:shadow-none print:max-h-none" id="print-receipt">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 print:hidden">
          <p className="text-sm font-semibold text-gray-700">Receipt Generated</p>
          <button onClick={onClose} className="text-gray-500 hover:text-black"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 font-mono text-sm">
          <div className="text-center space-y-1 mb-4">
            <p className="text-lg font-bold tracking-wider">ELITE CLUB</p>
            <p className="text-xs">{partner}</p>
            <p className="text-[10px] text-gray-500">— Tax Invoice / Receipt —</p>
          </div>

          <div className="border-t border-dashed border-gray-300 pt-2 space-y-0.5 text-xs">
            <Row k="Receipt #" v={tx.receiptNo} bold />
            <Row k="Date" v={new Date(tx.createdAt).toLocaleString("en-IN")} />
            <Row k="Member" v={tx.memberName} />
            <Row k="Mode" v={tx.mode === "auto" ? "Scanner" : "Manual"} />
          </div>

          <div className="border-t border-dashed border-gray-300 mt-3 pt-2">
            <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider text-gray-500 pb-1">
              <span className="col-span-7">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-right">Amount</span>
            </div>
            {tx.items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 text-xs py-1">
                <span className="col-span-7 truncate">{it.name}</span>
                <span className="col-span-2 text-center">{it.qty}</span>
                <span className="col-span-3 text-right">{formatINR(it.mrp)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 mt-2 pt-2 space-y-0.5 text-xs">
            <Row k="Subtotal" v={formatINR(tx.subtotal)} />
            <Row k="Payment" v={tx.paymentMode} />
            <div className="border-t border-gray-400 pt-1 mt-1">
              <Row k="TOTAL PAID" v={formatINR(tx.subtotal)} bold big />
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-500 mt-4">
            Thank you for visiting!<br />Please keep this receipt for your records.
          </p>
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-gray-200 print:hidden">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
            New Bill
          </button>
          <button onClick={print} className="flex-1 h-10 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 flex items-center justify-center gap-2">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-receipt, #print-receipt * { visibility: visible; }
          #print-receipt { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

function Row({ k, v, bold, big }: { k: string; v: string; bold?: boolean; big?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold" : ""} ${big ? "text-base" : ""}`}>
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}
