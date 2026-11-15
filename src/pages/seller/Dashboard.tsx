import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Ellipsis } from "lucide-react";
import { Link, useNavigate } from "react-router";

import PageHeader from "@/components/seller/PageHeader";
import ProductThumb from "@/components/seller/ProductThumb";
import StatCard from "@/components/seller/StatCard";
import StatusBadge from "@/components/seller/StatusBadge";
import { useListings } from "@/context/useListings";
import { useAuth } from "@/context/useAuth";
import { formatMoney } from "@/lib/adapters";
import { api } from "@/lib/api";
import type { SellerListing } from "@/data/seller";
import type { ApiConversation } from "@/lib/types";

type OpenMenu = {
  id: string;
  top: number;
  left: number;
};

type MonthlySeries = {
  labels: string[];
  sell: number[];
  buy: number[];
};

function buildMonthlySeries(
  conversations: ApiConversation[],
  userId: number,
): MonthlySeries {
  const now = new Date();
  const months: { key: string; label: string; sell: number; buy: number }[] =
    [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);

    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
      sell: 0,
      buy: 0,
    });
  }

  for (const conversation of conversations) {
    if (!conversation.createdAt) continue;

    const created = new Date(conversation.createdAt);

    if (Number.isNaN(created.getTime())) continue;

    const bucket = months.find(
      (month) => month.key === `${created.getFullYear()}-${created.getMonth()}`,
    );

    if (!bucket) continue;

    if (conversation.seller?.id === userId) {
      bucket.sell += 1;
    } else if (conversation.buyer?.id === userId) {
      bucket.buy += 1;
    }
  }

  return {
    labels: months.map((month) => month.label),
    sell: months.map((month) => month.sell),
    buy: months.map((month) => month.buy),
  };
}

type BuySellChartProps = {
  series: MonthlySeries;
  sellCount: number;
  buyCount: number;
  loading: boolean;
};

function BuySellChart({
  series,
  sellCount,
  buyCount,
  loading,
}: BuySellChartProps) {
  const left = 30;
  const right = 310;
  const top = 12;
  const bottom = 146;

  const total = sellCount + buyCount;
  const sellPercent = total > 0 ? Math.round((sellCount / total) * 100) : 0;
  const buyPercent = total > 0 ? 100 - sellPercent : 0;

  const maxValue = Math.max(
    1,
    ...series.sell,
    ...series.buy,
  );
  const axisMax = Math.max(4, maxValue);
  const stepX =
    series.labels.length > 1
      ? (right - left) / (series.labels.length - 1)
      : 0;
  const xAt = (index: number) => left + stepX * index;
  const yAt = (value: number) =>
    bottom - (value / axisMax) * (bottom - top);

  const ticks = Array.from({ length: 5 }, (_, index) =>
    Math.round((axisMax / 4) * index),
  ).filter((value, index, all) => all.indexOf(value) === index);

  const sellPoints = series.sell
    .map((value, index) => `${xAt(index)},${yAt(value)}`)
    .join(" ");
  const buyPoints = series.buy
    .map((value, index) => `${xAt(index)},${yAt(value)}`)
    .join(" ");

  return (
    <div className="rounded-[10px] border border-[#E8ECE7] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-black">
          Buy vs sell rate
        </h2>

        <div className="flex items-center gap-3 text-[11px] text-[#6B726B]">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-[#111111]" />
            Sell
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-[#9DB38F]" />
            Buy
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 320 180"
        role="img"
        aria-label="Line chart showing your buy and sell conversations over the last seven months"
        className="mt-4 h-auto w-full"
      >
        {ticks.map((value) => {
          const y = yAt(value);

          return (
            <g key={value}>
              <line
                x1={left}
                x2={right}
                y1={y}
                y2={y}
                stroke="#E8ECE7"
                strokeWidth="1"
              />
              <text
                x="4"
                y={y + 2.5}
                fill="#A6ACA5"
                fontSize="9"
                textAnchor="start"
              >
                {value}
              </text>
            </g>
          );
        })}

        <polyline
          points={sellPoints}
          fill="none"
          stroke="#111111"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <polyline
          points={buyPoints}
          fill="none"
          stroke="#9DB38F"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {series.sell.map((value, index) => (
          <circle
            key={`sell-${series.labels[index]}`}
            cx={xAt(index)}
            cy={yAt(value)}
            r="2.2"
            fill="#FFFFFF"
            stroke="#111111"
            strokeWidth="1.2"
          />
        ))}

        {series.buy.map((value, index) => (
          <circle
            key={`buy-${series.labels[index]}`}
            cx={xAt(index)}
            cy={yAt(value)}
            r="2.2"
            fill="#FFFFFF"
            stroke="#9DB38F"
            strokeWidth="1.2"
          />
        ))}

        {series.labels.map((label, index) => (
          <text
            key={`${label}-${index}`}
            x={xAt(index)}
            y="168"
            fill="#A6ACA5"
            fontSize="9"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[#F4F7F1] p-4">
          <p className="text-[13px] text-[#6B726B]">Sell</p>
          <p className="mt-1 text-[20px] font-semibold leading-none text-black">
            {loading ? "—" : `${sellPercent}%`}
          </p>
          <p className="mt-1 text-[11px] text-[#929792]">
            {loading ? "Loading activity" : `${sellCount} conversation${sellCount === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="rounded-lg bg-[#F4F7F1] p-4">
          <p className="text-[13px] text-[#6B726B]">Buy</p>
          <p className="mt-1 text-[20px] font-semibold leading-none text-black">
            {loading ? "—" : `${buyPercent}%`}
          </p>
          <p className="mt-1 text-[11px] text-[#929792]">
            {loading ? "Loading activity" : `${buyCount} conversation${buyCount === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[12px] text-[#929792]">
        Based on your buy and sell conversations over the last 7 months.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { listings, loading, deleteListing } = useListings();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<OpenMenu | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!user) return;

    let active = true;

    api.conversations
      .list()
      .then((list) => {
        if (active) setConversations(list);
      })
      .catch(() => {
        // Keep an empty chart if the API is unreachable.
      })
      .finally(() => {
        if (active) setChartLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const userId = user?.id ?? 0;
  const series = useMemo(
    () => buildMonthlySeries(conversations, userId),
    [conversations, userId],
  );
  const sellCount = series.sell.reduce((sum, value) => sum + value, 0);
  const buyCount = series.buy.reduce((sum, value) => sum + value, 0);

  const recentListings = listings.slice(0, 3);
  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
  const totalMessages = listings.reduce(
    (sum, listing) => sum + listing.messages,
    0,
  );
  const revenue = listings
    .filter((listing) => listing.status === "Sold")
    .reduce((sum, listing) => sum + listing.price, 0);

  const stats = [
    {
      label: "Total listings",
      value: loading ? "—" : String(listings.length),
      hint: "All your marketplace items",
    },
    {
      label: "Total revenue",
      value: loading ? "—" : formatMoney(revenue),
      hint: "From items marked as sold",
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

  const toggleMenu = (listingId: string, button: HTMLButtonElement) => {
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

  const handleViewListing = (listing: SellerListing) => {
    setOpenMenu(null);
    navigate(`/seller/market/${listing.id}`);
  };

  const handleEditListing = (listing: SellerListing) => {
    setOpenMenu(null);
    navigate(`/seller/listings/${listing.id}/edit`);
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

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="YOUR MARKETPLACE AT A GLANCE"
        title={`Welcome back, ${user?.firstName || user?.fullName || "seller"}.`}
        description="Here's how your good finds are doing."
      />

      {actionError ? (
        <p
          role="alert"
          className="rounded-lg border border-[#F3D3CE] bg-[#FDF2F1] px-4 py-3 text-[13px] text-[#B42318]"
        >
          {actionError}
        </p>
      ) : null}

      {/* Overview */}
      <section>
        <h2 className="text-[15px] font-semibold text-black">
          Dashboard overview
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
            />
          ))}
        </div>
      </section>

      {/* Lower grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">

        {/* Recent listings */}
        <section className="rounded-[10px] border border-[#E8ECE7] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-semibold text-black">
                Recent listings
              </h2>
              <p className="mt-1 text-[13px] text-[#929792]">
                Latest items listed by you
              </p>
            </div>

            <Link
              to="/seller/listings"
              className="flex items-center gap-1 text-[13px] font-semibold text-black hover:underline"
            >
              View all
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 hidden grid-cols-[minmax(0,1fr)_90px_96px_24px] gap-3 border-b border-[#E8ECE7] pb-2 sm:grid">
            <span className="text-[12px] font-semibold tracking-[0.12em] text-[#929792]">
              PRODUCT
            </span>
            <span className="text-[12px] font-semibold tracking-[0.12em] text-[#929792]">
              PRICE
            </span>
            <span className="text-center text-[12px] font-semibold tracking-[0.12em] text-[#929792]">
              STATUS
            </span>
            <span />
          </div>

          <ul>
            {recentListings.map((listing) => (
              <li
                key={listing.id}
                className="flex flex-wrap items-center gap-3 border-b border-[#F0F2EE] py-4 last:border-b-0 sm:grid sm:grid-cols-[minmax(0,1fr)_90px_96px_24px]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
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
                    <p className="mt-0.5 truncate text-[12px] text-[#929792]">
                      {listing.category} · {listing.date.replace("Listed ", "")}
                    </p>
                  </div>
                </div>

                <p className="text-[13px] font-semibold text-black">
                  {formatMoney(listing.price)}
                </p>

                <StatusBadge
                  status={listing.status}
                  className="justify-self-center"
                />

                <button
                  type="button"
                  onClick={(event) =>
                    toggleMenu(listing.id, event.currentTarget)
                  }
                  aria-label={`More options for ${listing.name}`}
                  aria-haspopup="menu"
                  aria-expanded={openMenu?.id === listing.id}
                  className={`rounded-md p-1 text-[#8A9089] transition hover:bg-[#F4F7F1] hover:text-black ${
                    openMenu?.id === listing.id
                      ? "bg-[#F4F7F1] text-black"
                      : ""
                  }`}
                >
                  <Ellipsis size={14} />
                </button>
              </li>
            ))}
          </ul>

          {recentListings.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[#929792]">
              {loading
                ? "Loading your listings…"
                : "No listings yet. Create your first one to get started."}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#F0F2EE] pt-4">
            <p className="text-[12px] text-[#929792]">
              Showing {recentListings.length} of {listings.length} listings
            </p>

            <Link
              to="/seller/listings"
              className="text-[13px] font-semibold text-black hover:underline"
            >
              Manage listings
            </Link>
          </div>
        </section>

        <BuySellChart
          series={series}
          sellCount={sellCount}
          buyCount={buyCount}
          loading={chartLoading}
        />
      </div>

      {/* Recent listing actions menu */}
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

            <button
              type="button"
              role="menuitem"
              onClick={() => handleEditListing(menuListing)}
              className="block w-full px-3 py-2.5 text-left text-[13px] text-black transition-[padding,background-color] duration-150 hover:bg-[#F4F7F1] hover:pl-4"
            >
              Edit listing
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => void handleDelete(menuListing)}
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
