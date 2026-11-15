import { createContext } from "react";

import type { AuthUser } from "@/lib/adapters";
import type { RegisterInput } from "@/lib/types";

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (login: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
