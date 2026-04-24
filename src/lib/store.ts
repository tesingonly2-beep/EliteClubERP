import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "superadmin" | "partner" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  partnerId?: string;
  memberId?: string;
}

export interface Partner {
  id: string;
  name: string;
  owner: string;
  location: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export type Plan = "Daily" | "Octa" | "Yearly";

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  plan: Plan;
  joinedAt: string;
  expiry: string; // ISO date
  totalSpent: number;
  visits: number;
}

export interface BillItem {
  name: string;
  qty: number;
  mrp: number; // total price charged to member
  cost: number; // partner cost
  barcode?: string;
}

export interface InventoryItem {
  id: string;
  partnerId: string;
  name: string;
  barcode: string;
  category: string;
  mrp: number; // per unit price charged to member
  cost: number; // per unit partner cost
  stock: number;
}

export interface Transaction {
  id: string;
  receiptNo: string;
  memberId: string;
  memberName: string;
  partnerId: string;
  partnerName: string;
  items: BillItem[];
  subtotal: number;
  profit: number;
  clubShare: number;
  partnerShare: number;
  paymentMode: "Cash" | "UPI" | "Card";
  mode: "auto" | "manual";
  createdAt: string; // ISO datetime
}

export interface Settlement {
  id: string;
  partnerId: string;
  partnerName: string;
  period: string; // e.g. "Apr 2025"
  amount: number;
  status: "Paid" | "Pending";
}

interface State {
  users: User[];
  partners: Partner[];
  members: Member[];
  transactions: Transaction[];
  settlements: Settlement[];
  inventory: InventoryItem[];

  // mutations
  addPartner: (p: Omit<Partner, "id" | "createdAt">) => Partner;
  updatePartner: (id: string, patch: Partial<Partner>) => void;
  deletePartner: (id: string) => void;

  addMember: (m: Omit<Member, "id" | "joinedAt" | "totalSpent" | "visits">) => Member;
  updateMember: (id: string, patch: Partial<Member>) => void;

  createTransaction: (t: Omit<Transaction, "id" | "createdAt" | "receiptNo">) => Transaction;

  addInventoryItem: (i: Omit<InventoryItem, "id">) => InventoryItem;
  updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  markSettlementPaid: (id: string) => void;
  resetData: () => void;
}

const PLAN_DAYS: Record<Plan, number> = { Daily: 1, Octa: 8, Yearly: 365 };
export const PLAN_PRICES: Record<Plan, number> = { Daily: 500, Octa: 3500, Yearly: 25000 };

const today = () => new Date().toISOString();
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

const seedUsers: User[] = [
  { id: "u-super", name: "Aarav Mehta", email: "super@elite.club", role: "superadmin" },
  { id: "u-partner-1", name: "Raj Malhotra", email: "raj@thevault.com", role: "partner", partnerId: "p-1" },
  { id: "u-partner-2", name: "Priya Sharma", email: "priya@skylounge.com", role: "partner", partnerId: "p-2" },
  { id: "u-member-1", name: "Rahul Sharma", email: "rahul@gmail.com", phone: "+91 98765 43210", role: "member", memberId: "m-1" },
];

const seedPartners: Partner[] = [
  { id: "p-1", name: "The Vault", owner: "Raj Malhotra", location: "Mumbai", status: "Active", createdAt: addDays(-180) },
  { id: "p-2", name: "Sky Lounge", owner: "Priya Sharma", location: "Delhi", status: "Active", createdAt: addDays(-150) },
  { id: "p-3", name: "Noir Bar", owner: "Vikram Singh", location: "Bangalore", status: "Active", createdAt: addDays(-120) },
  { id: "p-4", name: "Amber Club", owner: "Aisha Khan", location: "Pune", status: "Inactive", createdAt: addDays(-90) },
  { id: "p-5", name: "Eclipse", owner: "Arjun Patel", location: "Hyderabad", status: "Active", createdAt: addDays(-60) },
];

const seedMembers: Member[] = [
  { id: "m-1", name: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul@gmail.com", plan: "Yearly", joinedAt: addDays(-100), expiry: addDays(265), totalSpent: 12500, visits: 14 },
  { id: "m-2", name: "Neha Gupta", phone: "+91 87654 32109", plan: "Octa", joinedAt: addDays(-30), expiry: addDays(5), totalSpent: 8400, visits: 6 },
  { id: "m-3", name: "Amit Patel", phone: "+91 76543 21098", plan: "Daily", joinedAt: addDays(-1), expiry: addDays(0), totalSpent: 1500, visits: 1 },
  { id: "m-4", name: "Kavya Nair", phone: "+91 65432 10987", plan: "Yearly", joinedAt: addDays(-400), expiry: addDays(-35), totalSpent: 32000, visits: 28 },
  { id: "m-5", name: "Vikash Kumar", phone: "+91 54321 09876", plan: "Octa", joinedAt: addDays(-10), expiry: addDays(-2), totalSpent: 5200, visits: 4 },
  { id: "m-6", name: "Sneha Reddy", phone: "+91 43210 98765", plan: "Yearly", joinedAt: addDays(-60), expiry: addDays(305), totalSpent: 18500, visits: 11 },
  { id: "m-7", name: "Rohit Joshi", phone: "+91 32109 87654", plan: "Daily", joinedAt: addDays(-3), expiry: addDays(-3), totalSpent: 800, visits: 1 },
  { id: "m-8", name: "Ananya Singh", phone: "+91 21098 76543", plan: "Octa", joinedAt: addDays(-20), expiry: addDays(210), totalSpent: 6900, visits: 5 },
];

const seedTransactions: Transaction[] = [
  {
    id: "txn-1", memberId: "m-1", memberName: "Rahul Sharma", partnerId: "p-1", partnerName: "The Vault",
    items: [{ name: "Whiskey", qty: 2, mrp: 3000, cost: 1800 }, { name: "Snacks", qty: 1, mrp: 500, cost: 200 }],
    subtotal: 3500, profit: 1500, clubShare: 750, partnerShare: 750, paymentMode: "UPI", createdAt: addDays(-1),
  },
  {
    id: "txn-2", memberId: "m-2", memberName: "Neha Gupta", partnerId: "p-2", partnerName: "Sky Lounge",
    items: [{ name: "Cocktails", qty: 3, mrp: 2400, cost: 1200 }],
    subtotal: 2400, profit: 1200, clubShare: 600, partnerShare: 600, paymentMode: "Card", createdAt: addDays(-2),
  },
  {
    id: "txn-3", memberId: "m-1", memberName: "Rahul Sharma", partnerId: "p-1", partnerName: "The Vault",
    items: [{ name: "Wine", qty: 1, mrp: 1800, cost: 900 }],
    subtotal: 1800, profit: 900, clubShare: 450, partnerShare: 450, paymentMode: "Cash", createdAt: addDays(-5),
  },
];

const seedSettlements: Settlement[] = [
  { id: "s-1", partnerId: "p-1", partnerName: "The Vault", period: "Apr 2025", amount: 72750, status: "Pending" },
  { id: "s-2", partnerId: "p-2", partnerName: "Sky Lounge", period: "Apr 2025", amount: 51300, status: "Pending" },
  { id: "s-3", partnerId: "p-3", partnerName: "Noir Bar", period: "Apr 2025", amount: 44700, status: "Paid" },
  { id: "s-4", partnerId: "p-4", partnerName: "Amber Club", period: "Mar 2025", amount: 32250, status: "Paid" },
  { id: "s-5", partnerId: "p-5", partnerName: "Eclipse", period: "Apr 2025", amount: 26400, status: "Pending" },
];

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      partners: seedPartners,
      members: seedMembers,
      transactions: seedTransactions,
      settlements: seedSettlements,

      addPartner: (p) => {
        const partner: Partner = { ...p, id: newId("p"), createdAt: today() };
        set({ partners: [...get().partners, partner] });
        return partner;
      },
      updatePartner: (id, patch) =>
        set({ partners: get().partners.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
      deletePartner: (id) => set({ partners: get().partners.filter((p) => p.id !== id) }),

      addMember: (m) => {
        const member: Member = {
          ...m,
          id: newId("m"),
          joinedAt: today(),
          totalSpent: 0,
          visits: 0,
        };
        set({ members: [...get().members, member] });
        return member;
      },
      updateMember: (id, patch) =>
        set({ members: get().members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }),

      createTransaction: (t) => {
        const tx: Transaction = { ...t, id: newId("txn"), createdAt: today() };
        set({
          transactions: [tx, ...get().transactions],
          members: get().members.map((m) =>
            m.id === t.memberId
              ? { ...m, totalSpent: m.totalSpent + t.subtotal, visits: m.visits + 1 }
              : m,
          ),
        });
        return tx;
      },

      markSettlementPaid: (id) =>
        set({
          settlements: get().settlements.map((s) =>
            s.id === id ? { ...s, status: "Paid" } : s,
          ),
        }),

      resetData: () =>
        set({
          users: seedUsers,
          partners: seedPartners,
          members: seedMembers,
          transactions: seedTransactions,
          settlements: seedSettlements,
        }),
    }),
    { name: "elite-club-store" },
  ),
);

export { PLAN_DAYS };

// --- helpers ---
export function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function isExpired(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}
