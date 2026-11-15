import { useEffect, useState } from "react";
import { Ellipsis, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router";

import PageHeader from "@/components/seller/PageHeader";
import ProductThumb from "@/components/seller/ProductThumb";
import StatCard from "@/components/seller/StatCard";
import StatusBadge from "@/components/seller/StatusBadge";
import { useListings } from "@/context/useListings";
import { formatMoney } from "@/lib/adapters";
import {
  type ListingStatus,
  type SellerListing,
} from "@/data/seller";

const tabs = ["All listings", "Active", "Sold", "Drafts"] as const;
type Tab = (typeof tabs)[number];

const statusByTab: Record<Exclude<Tab, "All listings">, ListingStatus> = {
  Active: "Active",
  Sold: "Sold",
  Drafts: "Draft",
};

type OpenMenu = {
  id: string;
  top: number;
  left: number;
};

export default function MyListing() {
  const navigate = useNavigate();
  const { listings, loading, error, setListingStatus, deleteListing } =
    useListings();

  const [activeTab, setActiveTab] = useState<Tab>("All listings");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<OpenMenu | null>(null);
  const [actionError, setActionError] = useState("");

  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
  const totalMessages = listings.reduce(
    (sum, listing) => sum + listing.messages,
    0,
  );

  const listingStats = [
    {
      label: "Total listings",
      value: loading ? "—" : String(listings.length),
      hint: "All your marketplace items",
    },
    {
      label: "Total views",
      value: loading ? "—" : totalViews.toLocaleString(),
      hint: "People discovering your finds",
    },
    {
      label: "Messages",
      value: loading ? "—" : String(totalMessages),
      hint: "Conversations about your items",
    },
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesTab =
      activeTab === "All listings" ||
      listing.status === statusByTab[activeTab];
    const matchesSearch = listing.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    return matchesTab && matchesSearch;
  });

  const menuListing = openMenu
    ? listings.find((listing) => listing.id === openMenu.id)
    : undefined;

  useEffect(() => {
    if (!openMenu) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [openMenu]);

  const updateStatus = async (id: string, status: ListingStatus) => {
    setOpenMenu(null);
    setActionError("");

    try {
      await setListingStatus(id, status);
    } catch {
      setActionError("Could not update that listing. Please try again.");
    }
  };

  const handleViewListing = (listing: SellerListing) => {
    setOpenMenu(null);
    navigate(`/seller/market/${listing.id}`);
  };

  const handleDelete = async (listing: SellerListing) => {
    setOpenMenu(null);
    setActionError("");

    if (!window.confirm(`Delete "${listing.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteListing(listing.id);
    } catch {
      setActionError("Could not delete that listing. Please try again.");
    }
  };

  const toggleMenu = (
    listingId: string,
    button: HTMLButtonElement,
  ) => {
    if (openMenu?.id === listingId) {
      setOpenMenu(null);
      return;
    }

    const rect = button.getBoundingClientRect();

    setOpenMenu({
      id: listingId,
      top: rect.bottom + 8,
      left: Math.max(8, rect.right - 168),
    });
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="YOUR ITEMS, YOUR NEXT CHAPTER"
        title="My Listing"
        description="Give your good finds a new home. Manage all your listings here."
        actions={
          <button
            type="button"
            onClick={() => navigate("/seller/listings/new")}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-black px-4 text-[13px] font-medium text-white transition hover:bg-[#292929] active:scale-[0.99]"
          >
            <Plus size={14} aria-hidden="true" />
            Create listing
          </button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {listingStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
          />
        ))}
      </div>

      {error || actionError ? (
        <p
          role="alert"
          className="rounded-lg border border-[#F3D3CE] bg-[#FDF2F1] px-4 py-3 text-[13px] text-[#B42318]"
        >
          {actionError || error}
        </p>
      ) : null}

      {/* Listings */}
      <section className="rounded-[10px] border border-[#E8ECE7] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#E8ECE7] p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${
                  activeTab === tab
                    ? "bg-black text-white shadow-sm"
                    : "text-[#6B726B] hover:bg-[#F4F7F1] hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex w-full items-center gap-2 rounded-lg bg-[#F4F7F1] px-3 lg:max-w-[260px]">
            <Search size={14} className="text-[#8A9089]" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your listings"
              aria-label="Search your listings"
              className="h-10 w-full bg-transparent text-[13px] text-black outline-none placeholder:text-[#8A9089]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-[#E8ECE7] bg-[#F7F9F5]">
                <th className="px-5 py-3 text-[12px] font-semibold tracking-[0.12em] text-[#929792]">
                  PRODUCT
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold tracking-[0.12em] text-[#929792]">
                  PRICE
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold tracking-[0.12em] text-[#929792]">
                  STATUS
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold tracking-[0.12em] text-[#929792]">
                  VIEWS
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold tracking-[0.12em] text-[#929792]">
                  MESSAGES
                </th>
                <th className="w-[240px] px-5 py-3 text-right text-[12px] font-semibold tracking-[0.12em] text-[#929792]">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredListings.map((listing) => (
                <tr
                  key={listing.id}
                  className="border-b border-[#F0F2EE] last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <ProductThumb
                        emoji={listing.emoji}
                        image={listing.image}
                        alt={listing.name}
                        tone={listing.tone}
                        size="sm"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-black">
                          {listing.name}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#929792]">
                          {listing.category}
                        </p>
                        <p className="text-[12px] text-[#929792]">
                          {listing.date}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-black">
                    {formatMoney(listing.price)}
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={listing.status} />
                  </td>

                  <td className="px-4 py-4 text-[13px] text-[#6B726B]">
                    {listing.views}
                  </td>

                  <td className="px-4 py-4 text-[13px] text-[#6B726B]">
                    {listing.messages}
                  </td>

                  <td className="w-[240px] px-5 py-4">
                    <div className="ml-auto grid w-[192px] grid-cols-[56px_100px_28px] items-center gap-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/seller/listings/${listing.id}/edit`)
                        }
                        className="w-full rounded-md py-1.5 text-center text-[13px] font-medium text-black transition hover:bg-[#F4F7F1]"
                      >
                        Edit
                      </button>

                      {listing.status === "Sold" ? (
                        <button
                          type="button"
                          onClick={() => updateStatus(listing.id, "Active")}
                          className="w-full rounded-md py-1.5 text-center text-[13px] text-[#6B726B] transition hover:bg-[#F4F7F1] hover:text-black"
                        >
                          Relist
                        </button>
                      ) : listing.status === "Draft" ? (
                        <button
                          type="button"
                          onClick={() => updateStatus(listing.id, "Active")}
                          className="w-full rounded-md py-1.5 text-center text-[13px] text-[#6B726B] transition hover:bg-[#F4F7F1] hover:text-black"
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateStatus(listing.id, "Sold")}
                          className="w-full rounded-md py-1.5 text-center text-[13px] text-[#6B726B] transition hover:bg-[#F4F7F1] hover:text-black"
                        >
                          Mark sold
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(event) =>
                          toggleMenu(listing.id, event.currentTarget)
                        }
                        aria-label={`More options for ${listing.name}`}
                        aria-haspopup="menu"
                        aria-expanded={openMenu?.id === listing.id}
                        className={`mx-auto rounded-md p-1.5 text-[#8A9089] transition hover:bg-[#F4F7F1] hover:text-black ${
                          openMenu?.id === listing.id ? "bg-[#F4F7F1] text-black" : ""
                        }`}
                      >
                        <Ellipsis size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredListings.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-[#929792]">
              {loading
                ? "Loading your listings…"
                : "No listings match your filters yet."}
            </p>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-[#E8ECE7] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#929792]">
            Showing {filteredListings.length} of {listings.length} listings
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="h-9 rounded-md border border-[#DDE3DC] px-3 text-[13px] font-medium text-[#6B726B] transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[#DDE3DC] disabled:hover:text-[#6B726B]"
            >
              Previous
            </button>

            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E9F0E4] text-[12px] font-semibold text-black">
              1
            </span>

            <button
              type="button"
              disabled
              className="h-9 rounded-md border border-[#DDE3DC] px-3 text-[13px] font-medium text-[#6B726B] transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[#DDE3DC] disabled:hover:text-[#6B726B]"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Row actions menu */}
      {openMenu && menuListing ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenMenu(null)}
            aria-hidden="true"
          />

          <div
            role="menu"
            className="fixed z-50 w-[168px] origin-top-right animate-[dropdown-in_150ms_ease-out] overflow-hidden rounded-lg border border-[#E8ECE7] bg-white py-1 shadow-[0_14px_36px_rgba(0,0,0,0.14)] motion-reduce:animate-none"
            style={{ top: openMenu.top, left: openMenu.left }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => handleViewListing(menuListing)}
              className="block w-full px-3 py-2.5 text-left text-[13px] text-black transition-[padding,background-color] duration-150 hover:bg-[#F4F7F1] hover:pl-4"
            >
              View listing
            </button>

            {menuListing.status === "Sold" ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => updateStatus(menuListing.id, "Active")}
                className="block w-full px-3 py-2.5 text-left text-[13px] text-black transition-[padding,background-color] duration-150 hover:bg-[#F4F7F1] hover:pl-4"
              >
                Relist
              </button>
            ) : menuListing.status === "Draft" ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => updateStatus(menuListing.id, "Active")}
                className="block w-full px-3 py-2.5 text-left text-[13px] text-black transition-[padding,background-color] duration-150 hover:bg-[#F4F7F1] hover:pl-4"
              >
                Publish
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={() => updateStatus(menuListing.id, "Sold")}
                className="block w-full px-3 py-2.5 text-left text-[13px] text-black transition-[padding,background-color] duration-150 hover:bg-[#F4F7F1] hover:pl-4"
              >
                Mark as sold
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => handleDelete(menuListing)}
              className="block w-full px-3 py-2.5 text-left text-[13px] text-[#B42318] transition-[padding,background-color] duration-150 hover:bg-[#FDF2F1] hover:pl-4"
            >
              Delete listing
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
