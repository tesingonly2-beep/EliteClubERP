import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useStore, type User, type Role } from "./store";

interface AuthState {
  user: User | null;
  login: (email: string, role: Role) => User | null;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, role) => {
        const users = useStore.getState().users;
        // Match by email if it exists in seed, otherwise pick first user with that role
        const found =
          users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role) ||
          users.find((u) => u.role === role);
        if (found) {
          set({ user: found });
          return found;
        }
        return null;
      },
      logout: () => set({ user: null }),
    }),
    { name: "elite-club-auth" },
  ),
);

export function rolePath(role: Role): string {
  if (role === "superadmin") return "/admin";
  if (role === "partner") return "/partner";
  return "/member";
}
