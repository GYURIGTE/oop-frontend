import { useEffect, useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import { useNavigate } from "react-router";

import { useAuth } from "@/context/useAuth";
import { useNotifications } from "@/context/useNotifications";
import { formatMoney } from "@/lib/adapters";

type SellerTopbarProps = {
  onMenuClick: () => void;
};

export default function SellerTopbar({ onMenuClick }: SellerTopbarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unseenCount, markListingsSeen } = useNotifications();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!notificationsOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [notificationsOpen]);

  const fullName = user?.fullName ?? "BALIGYA seller";
  const initials = user?.initials ?? "BS";

  const toggleNotifications = () => {
    const next = !notificationsOpen;

    setNotificationsOpen(next);

    if (next) markListingsSeen();
  };

  const openListing = (id: number) => {
    setNotificationsOpen(false);
    navigate(`/seller/market/${id}`);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#E8ECE7] bg-white px-4 sm:px-6 lg:px-8">

      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-md p-2 text-[#4A4A4A] hover:bg-[#F4F7F1] hover:text-black lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="hidden w-full max-w-[360px] items-center gap-2 rounded-lg bg-[#F4F7F1] px-3 sm:flex">
        <Search size={14} className="text-[#8A9089]" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search listings, messages..."
          aria-label="Search listings and messages"
          className="h-10 w-full bg-transparent text-[14px] text-black outline-none placeholder:text-[#8A9089]"
        />
      </div>

      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleNotifications}
            aria-label="Notifications"
            aria-haspopup="dialog"
            aria-expanded={notificationsOpen}
            className={`relative rounded-md p-2 text-[#4A4A4A] transition hover:bg-[#F4F7F1] hover:text-black ${
              notificationsOpen ? "bg-[#F4F7F1] text-black" : ""
            }`}
          >
            <Bell size={17} strokeWidth={1.8} />
            {unseenCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-black" />
            ) : null}
          </button>

          {notificationsOpen ? (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setNotificationsOpen(false)}
                aria-hidden="true"
              />

              <div
                role="dialog"
                aria-label="Notifications"
                className="absolute right-0 top-[calc(100%+10px)] z-40 w-[320px] origin-top-right animate-[dropdown-in_150ms_ease-out] overflow-hidden rounded-lg border border-[#E8ECE7] bg-white shadow-[0_14px_36px_rgba(0,0,0,0.14)] motion-reduce:animate-none"
              >
                <div className="flex items-center justify-between border-b border-[#E8ECE7] px-4 py-3">
                  <p className="text-[14px] font-semibold text-black">
                    Notifications
                  </p>

                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                    className="rounded p-0.5 text-[#8A9089] transition hover:text-black"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => openListing(notification.id)}
                      className="block w-full border-b border-[#F0F2EE] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#FAFBF9]"
                    >
                      <p className="text-[13px] font-semibold text-black">
                        New Listing Posted!
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-[#4A4A4A]">
                        A new item, {notification.name}, is now available for{" "}
                        {formatMoney(notification.price)}.
                      </p>
                      <p className="mt-1 text-[11px] text-[#929792]">
                        Recently posted
                      </p>
                    </button>
                  ))}

                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-[12px] text-[#929792]">
                      No new listings yet. Check back soon.
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="text-[14px] font-semibold leading-tight text-black">
              {fullName}
            </p>
            <p className="text-[12px] text-[#929792]">Seller account</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#E9F0E4] text-[14px] font-semibold text-black">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
