import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router";

import ProductThumb from "@/components/seller/ProductThumb";
import { useAuth } from "@/context/useAuth";
import {
  categoryStyle,
  formatMoney,
  toConversation,
} from "@/lib/adapters";
import { api, ApiError } from "@/lib/api";
import type { Conversation } from "@/data/seller";

export default function MessageListing() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(Boolean(conversationId));
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!conversationId) return;

    let active = true;

    async function loadConversation() {
      setLoading(true);
      setError("");

      try {
        const detail = await api.conversations.get(conversationId!);

        if (active) setConversation(toConversation(detail, user?.id));
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

    void loadConversation();

    return () => {
      active = false;
    };
  }, [conversationId, user?.id]);

  if (!conversationId || notFound) {
    return <Navigate to="/seller/messages" replace />;
  }

  if (loading) {
    return (
      <p className="py-16 text-center text-[13px] text-[#929792]">
        Loading listing…
      </p>
    );
  }

  if (!conversation) {
    return (
      <div className="space-y-4">
        <Link
          to="/seller/messages"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B726B] transition hover:text-black"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Messages
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

  const style = categoryStyle(conversation.listing);

  const handleEditListing = () => {
    if (conversation.listingId) {
      navigate(`/seller/listings/${conversation.listingId}/edit`);
      return;
    }

    navigate("/seller/listings");
  };

  return (
    <div className="space-y-6">
      <Link
        to="/seller/messages"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B726B] transition hover:text-black"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to {conversation.name}&apos;s chat
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.14em] text-[#929792]">
            LISTING FROM YOUR CONVERSATION
          </p>
          <h1 className="mt-1.5 text-[30px] font-normal leading-tight tracking-tight text-black sm:text-[34px]">
            {conversation.listing}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleEditListing}
          className="h-9 shrink-0 rounded-md border border-[#DDE3DC] bg-white px-3.5 text-[13px] font-medium text-black transition hover:border-black"
        >
          Edit listing
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[10px] border border-[#E8ECE7] bg-white p-4 sm:p-6">
            <ProductThumb
              emoji={style.emoji}
              image={conversation.productImage}
              alt={conversation.listing}
              tone={style.tone}
              size="hero"
            />
          </div>

          <section className="rounded-[10px] border border-[#E8ECE7] bg-white p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-black">
              About this find
            </h2>

            <p className="mt-2 text-[13px] leading-relaxed text-[#6B726B]">
              {conversation.listingDescription ||
                `You're chatting with ${conversation.name} about this item.`}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#F0F2EE] pt-4 sm:grid-cols-3">
              <div>
                <p className="text-[12px] text-[#929792]">Category</p>
                <p className="mt-1 text-[13px] font-medium text-black">
                  {conversation.listingCategory ?? "Other"}
                </p>
              </div>

              <div>
                <p className="text-[12px] text-[#929792]">Condition</p>
                <p className="mt-1 text-[13px] font-medium text-black">
                  {conversation.listingCondition ?? "Used"}
                </p>
              </div>

              <div>
                <p className="text-[12px] text-[#929792]">Listed</p>
                <p className="mt-1 text-[13px] font-medium text-black">
                  {conversation.listedAt ?? "Recently"}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="h-fit rounded-[10px] border border-[#E8ECE7] bg-white p-5">
          <h2 className="text-[16px] font-semibold text-black">
            {conversation.listing}
          </h2>

          <p className="mt-2 text-[22px] font-semibold text-black">
            {formatMoney(conversation.productPrice)}
          </p>

          <p className="mt-1 text-[12px] text-[#929792]">
            Listed {conversation.listedAt ?? "recently"}
          </p>

          <div className="mt-4 flex items-center gap-3 border-t border-[#F0F2EE] pt-4">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#E9F0E4] text-[13px] font-semibold text-black">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.initials ?? "BS"
              )}
            </div>

            <div>
              <p className="text-[13px] font-semibold text-black">
                {user?.fullName ?? "You"}
              </p>
              <p className="text-[12px] text-[#929792]">
                {user?.location || "Cebu"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
