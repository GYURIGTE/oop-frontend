import type {
  ApiConversation,
  ApiListing,
  ApiMessage,
  ApiUser,
} from "@/lib/types";
import type {
  ChatMessage,
  Conversation,
  MarketProduct,
  SellerListing,
} from "@/data/seller";

const categoryStyles: Record<string, { emoji: string; tone: string }> = {
  Electronics: { emoji: "📱", tone: "bg-[#F7EFE6]" },
  Clothing: { emoji: "👕", tone: "bg-[#F1F4EE]" },
  Apparel: { emoji: "👟", tone: "bg-[#EEF2EA]" },
  "Pet Supplies": { emoji: "🧺", tone: "bg-[#F8ECE9]" },
  Audio: { emoji: "🔊", tone: "bg-[#F8E7E7]" },
  "Home & Living": { emoji: "🧴", tone: "bg-[#FBE8ED]" },
  Vehicles: { emoji: "🛵", tone: "bg-[#F7E8E6]" },
  Furniture: { emoji: "🪑", tone: "bg-[#F5EFE6]" },
  Sports: { emoji: "🚲", tone: "bg-[#E8F0E5]" },
  Books: { emoji: "📚", tone: "bg-[#F7EFE6]" },
};

const fallbackStyle = { emoji: "📦", tone: "bg-[#F4F7F1]" };

export function categoryStyle(category: string) {
  return categoryStyles[category] ?? fallbackStyle;
}

export function formatMoney(value: number) {
  return `₱${value.toLocaleString()}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatClockTime(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatMessageTime(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const today = startOfDay(new Date());
  const day = startOfDay(date);

  if (today === day) return time;

  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${datePart}, ${time}`;
}

export function formatListingDate(value: string | null): string {
  if (!value) return "Listed recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Listed recently";

  return `Listed ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function toSellerListing(listing: ApiListing): SellerListing {
  const style = categoryStyle(listing.category);

  return {
    id: String(listing.id),
    name: listing.name,
    category: listing.category,
    date: formatListingDate(listing.createdAt),
    price: listing.price,
    status: listing.status,
    views: listing.views,
    messages: listing.messages ?? 0,
    emoji: style.emoji,
    tone: style.tone,
    condition: listing.condition as SellerListing["condition"],
    location: listing.location ?? "",
    description: listing.description ?? "",
    image: listing.image ?? listing.images?.[0] ?? undefined,
    images: listing.images?.length ? listing.images : undefined,
  };
}

export function toMarketProduct(listing: ApiListing): MarketProduct {
  const style = categoryStyle(listing.category);
  const seller = listing.seller;

  return {
    id: String(listing.id),
    name: listing.name,
    category: listing.category,
    price: listing.price,
    location: listing.location ?? seller?.location ?? "Cebu",
    condition: listing.condition as MarketProduct["condition"],
    emoji: style.emoji,
    tone: style.tone,
    image: listing.image ?? listing.images?.[0] ?? undefined,
    seller: {
      name: seller?.fullName ?? "BALIGYA seller",
      initials: seller?.initials ?? "BS",
      location: seller?.location ?? listing.location ?? "Cebu",
    },
    sellerId: seller?.id,
    description: listing.description ?? "No description has been added yet.",
  };
}

export function toChatMessage(message: ApiMessage): ChatMessage {
  return {
    id: String(message.id),
    from: message.mine ? "me" : "them",
    text: message.body,
    time: formatMessageTime(message.createdAt),
    read: message.readAt !== null,
  };
}

export function toConversation(
  conversation: ApiConversation,
  currentUserId?: number,
): Conversation {
  const listing = conversation.listing;
  const style = categoryStyle(listing?.category ?? "Other");
  const other = conversation.otherUser;
  const seller = conversation.seller;
  const isSeller = currentUserId !== undefined && seller?.id === currentUserId;
  const counterpart = other ?? (isSeller ? conversation.buyer : seller);

  return {
    id: String(conversation.id),
    name: counterpart?.fullName ?? "BALIGYA user",
    initials: counterpart?.initials ?? "BU",
    avatarUrl: counterpart?.avatarUrl ?? undefined,
    listing: listing?.name ?? "Listing",
    listingId: listing ? String(listing.id) : undefined,
    listingCategory: listing?.category,
    listingCondition: listing?.condition,
    listingDescription: listing?.description ?? undefined,
    preview: conversation.lastMessage?.body ?? "No messages yet.",
    time: formatMessageTime(conversation.lastMessageAt ?? conversation.createdAt),
    unread: conversation.unreadCount > 0,
    productEmoji: style.emoji,
    productTone: style.tone,
    productImage:
      listing?.image ?? listing?.images?.[0] ?? undefined,
    productPrice: listing?.price ?? 0,
    listedAt: formatListingDate(listing?.createdAt ?? null).replace(
      "Listed ",
      "",
    ),
    messages: (conversation.messages ?? []).map(toChatMessage),
    lastMessageAt: conversation.lastMessageAt,
  };
}

export function toAuthUser(user: ApiUser) {
  return {
    ...user,
    location: user.location ?? "",
    bio: user.bio ?? "",
    phone: user.phone ?? "",
    username: user.username ?? "",
  };
}

export type AuthUser = ReturnType<typeof toAuthUser>;
