import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router";

import ProductThumb from "@/components/seller/ProductThumb";
import { useAuth } from "@/context/useAuth";
import { formatMoney, toMarketProduct } from "@/lib/adapters";
import { api, ApiError } from "@/lib/api";
import type { MarketProduct } from "@/data/seller";

export default function MarketListing() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<MarketProduct | null>(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!productId) return;

    let active = true;

    async function loadListing() {
      setLoading(true);
      setError("");

      try {
        const listing = await api.market.get(productId!);

        if (active) setProduct(toMarketProduct(listing));
      } catch (caught) {
        if (!active) return;

        if (caught instanceof ApiError && caught.status === 404) {
          setNotFound(true);
        } else {
          setError(
            caught instanceof ApiError
              ? caught.message
              : "Could not load this listing.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadListing();

    return () => {
      active = false;
    };
  }, [productId]);

  const isOwnListing =
    product?.sellerId !== undefined && product.sellerId === user?.id;

  const handleChatSeller = async () => {
    if (!product || isOwnListing) return;

    setStartingChat(true);

    try {
      const conversation = await api.conversations.start(product.id);
      navigate(`/seller/messages?conversation=${conversation.id}`);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not open that conversation.",
      );
    } finally {
      setStartingChat(false);
    }
  };

  if (!productId || notFound) {
    return <Navigate to="/seller/market" replace />;
  }

  if (loading) {
    return (
      <p className="py-16 text-center text-[13px] text-[#929792]">
        Loading listing…
      </p>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Link
          to="/seller/market"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B726B] transition hover:text-black"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Browse Market
        </Link>

        <p
          role="alert"
          className="rounded-lg border border-[#F3D3CE] bg-[#FDF2F1] px-4 py-3 text-[13px] text-[#B42318]"
        >
          {error || "Could not load this listing."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/seller/market"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B726B] transition hover:text-black"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to Browse Market
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[10px] border border-[#E8ECE7] bg-white p-4 sm:p-6">
            <ProductThumb
              emoji={product.emoji}
              image={product.image}
              alt={product.name}
              tone={product.tone}
              size="hero"
            />
          </div>

          <section className="rounded-[10px] border border-[#E8ECE7] bg-white p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-black">
              About this find
            </h2>

            <p className="mt-2 text-[13px] leading-relaxed text-[#6B726B]">
              {product.description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#F0F2EE] pt-4">
              <div>
                <p className="text-[12px] text-[#929792]">Condition</p>
                <p className="mt-1 text-[13px] font-medium text-black">
                  {product.condition}
                </p>
              </div>

              <div>
                <p className="text-[12px] text-[#929792]">Category</p>
                <p className="mt-1 text-[13px] font-medium text-black">
                  {product.category}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-[10px] border border-[#E8ECE7] bg-white p-5">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6B726B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3F6B3F]" />
              Available
            </p>

            <h1 className="mt-3 text-[22px] font-semibold leading-tight text-black">
              {product.name}
            </h1>

            <p className="mt-2 text-[24px] font-semibold text-black">
              {formatMoney(product.price)}
            </p>

            <p className="mt-3 text-[13px] text-[#6B726B]">
              {product.category}
            </p>
            <p className="mt-1 text-[13px] text-[#929792]">
              {product.location}
            </p>

            {isOwnListing ? (
              <p className="mt-4 rounded-md bg-[#F4F7F1] px-3 py-2 text-center text-[12px] text-[#6B726B]">
                This is your listing.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void handleChatSeller()}
                disabled={startingChat}
                className="mt-4 h-10 w-full rounded-md border border-[#DDE3DC] bg-white text-[13px] font-medium text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {startingChat ? "Opening chat…" : "Chat Seller"}
              </button>
            )}

            {error ? (
              <p role="alert" className="mt-3 text-[12px] text-[#B42318]">
                {error}
              </p>
            ) : null}
          </section>

          <section className="rounded-[10px] border border-[#E8ECE7] bg-white p-5">
            <h2 className="text-[15px] font-semibold text-black">
              Meet your buyer
            </h2>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#E9F0E4] text-[13px] font-semibold text-black">
                {product.seller.avatarUrl ? (
                  <img
                    src={product.seller.avatarUrl}
                    alt={product.seller.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  product.seller.initials
                )}
              </div>

              <div>
                <p className="text-[13px] font-semibold text-black">
                  {product.seller.name}
                </p>
                <p className="text-[12px] text-[#929792]">
                  {product.seller.location}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
