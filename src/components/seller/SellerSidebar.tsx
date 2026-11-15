import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Store,
  Tag,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import BaligyaLogo from "@/components/brand/BaligyaLogo";
import { useAuth } from "@/context/useAuth";
import { useNotifications } from "@/context/useNotifications";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { to: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/seller/listings", label: "My Listing", icon: Tag },
  { to: "/seller/market", label: "Browse Market", icon: Store },
  { to: "/seller/messages", label: "Messages", icon: MessageSquare },
  { to: "/seller/profile", label: "Profile", icon: User },
  { to: "/seller/settings", label: "Settings", icon: Settings },
];

type SellerSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function SellerSidebar({ open, onClose }: SellerSidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { unreadMessages } = useNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[#E8ECE7] bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-6">
          <BaligyaLogo />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-md p-1 text-[#6B726B] hover:bg-[#F4F7F1] hover:text-black lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <p className="mb-3 px-3 text-[12px] font-semibold tracking-[0.14em] text-[#929792]">
            SELLER WORKSPACE
          </p>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const badge =
                item.to === "/seller/messages" ? unreadMessages : 0;

              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3.5 py-3 text-[15px] transition ${
                        isActive
                          ? "bg-[#E9F0E4] font-semibold text-black shadow-[inset_3px_0_0_#111111]"
                          : "text-[#5B615A] hover:bg-[#F4F7F1] hover:text-black"
                      }`
                    }
                  >
                    <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>

                    {badge > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[12px] font-semibold text-white">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    ) : null}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Log out */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#DDE3DC] text-[14px] font-medium text-[#4A4A4A] transition hover:border-black hover:text-black"
          >
            <LogOut size={14} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
