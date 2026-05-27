import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};
type UserRole = "user" | "admin" | "sysadmin";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const AuthStore = create<AuthState>()(
  immer(
    (set) => ({
      user: null,
      setUser: (user: User | null) => set({ user })
    })
  )
);
