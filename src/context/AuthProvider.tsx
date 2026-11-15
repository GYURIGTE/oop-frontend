import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { AuthContext } from "@/context/auth-context";
import { api, clearToken, getToken, setToken } from "@/lib/api";
import { toAuthUser, type AuthUser } from "@/lib/adapters";
import type { RegisterInput } from "@/lib/types";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!getToken()) {
        if (active) setLoading(false);
        return;
      }

      try {
        const current = await api.auth.me();

        if (active) setUserState(toAuthUser(current));
      } catch {
        clearToken();

        if (active) setUserState(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (login: string, password: string) => {
    const result = await api.auth.login({
      email: login.trim(),
      password,
    });

    setToken(result.token);
    setUserState(toAuthUser(result.user));
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    const result = await api.auth.register(input);

    setToken(result.token);
    setUserState(toAuthUser(result.user));
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Sign out locally even if the request fails.
    }

    clearToken();
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const current = await api.auth.me();

    setUserState(toAuthUser(current));
  }, []);

  const setUser = useCallback((next: AuthUser) => {
    setUserState(next);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, refreshUser, setUser }),
    [user, loading, signIn, signUp, signOut, refreshUser, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
