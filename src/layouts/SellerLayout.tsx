import { useState } from "react";
import { Outlet } from "react-router";

import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerTopbar from "@/components/seller/SellerTopbar";

export default function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8F4]">
      <SellerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[260px]">
        <SellerTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1180px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
