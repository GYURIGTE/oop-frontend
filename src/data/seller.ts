// Shared view-model types for the BALIGYA seller workspace.
// Data now comes from the Laravel API (see src/lib/api.ts); these types keep
// the UI components stable regardless of the transport.

export type ListingStatus = "Active" | "Sold" | "Draft";

export type MarketCondition = "Brand New" | "Like New" | "Used" | "For Parts";

export type SellerListing = {
  id: string;
  name: string;
  category: string;
  date: string;
  price: number;
  status: ListingStatus;
  views: number;
  messages: number;
  emoji: string;
  tone: string;
  condition?: MarketCondition;
  location?: string;
  description?: string;
  image?: string;
  images?: string[];
};

export type MarketProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  location: string;
  condition: MarketCondition;
  emoji: string;
  tone: string;
  image?: string;
  seller: {
    name: string;
    initials: string;
    location: string;
    avatarUrl?: string | null;
  };
  sellerId?: number;
  description: string;
};

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  read?: boolean;
};

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  listing: string;
  listingId?: string;
  listingCategory?: string;
  listingCondition?: string;
  listingDescription?: string;
  preview: string;
  time: string;
  unread: boolean;
  productEmoji: string;
  productTone: string;
  productImage?: string;
  productPrice: number;
  listedAt?: string;
  messages: ChatMessage[];
  lastMessageAt?: string | null;
};

export const listingCategories = [
  "Clothing",
  "Electronics",
  "Pet Supplies",
  "Audio",
  "Home & Living",
  "Vehicles",
  "Furniture",
  "Sports",
  "Books",
  "Apparel",
  "Other",
];

export const marketConditions: MarketCondition[] = [
  "Brand New",
  "Like New",
  "Used",
  "For Parts",
];
