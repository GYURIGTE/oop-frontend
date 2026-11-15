import { Navigate } from "react-router";

import SellerLayout from "@/layouts/SellerLayout";
import { useAuth } from "@/context/useAuth";

export default function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8F4]">
        <p className="text-[13px] text-[#6B726B]">Loading your workspace…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <SellerLayout />;
}
