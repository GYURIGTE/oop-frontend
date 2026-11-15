import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/context/useAuth";

/**
 * Keeps signed-in users out of the auth pages. Without this, manually visiting
 * /auth/login while a session is active would show the login form again.
 */
export default function GuestOnly() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8F4]">
        <p className="text-[13px] text-[#6B726B]">Checking your session…</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return <Outlet />;
}
