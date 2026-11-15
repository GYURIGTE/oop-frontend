// Shapes returned by the Laravel API (JSON:API-ish `data` envelopes are
// unwrapped in src/lib/api.ts before they reach these types).

export type ApiUser = {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  initials: string;
  email: string;
  username: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
};

export type ApiListing = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  price: number;
  condition: string;
  location: string | null;
  status: "Active" | "Sold" | "Draft";
  views: number;
  image: string | null;
  images: string[];
  imageItems: { id: number; url: string }[];
  messages?: number;
  seller?: ApiUser;
  createdAt: string | null;
  date: string | null;
};

export type ApiMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  body: string;
  mine: boolean;
  readAt: string | null;
  createdAt: string | null;
  time?: string | null;
};

export type ApiConversation = {
  id: number;
  listing: ApiListing | null;
  buyer: ApiUser | null;
  seller: ApiUser | null;
  otherUser: ApiUser | null;
  lastMessage: ApiMessage | null;
  messages?: ApiMessage[];
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string | null;
};

export type ApiMeetup = {
  id: number;
  conversationId: number;
  proposedBy: number;
  proposer: ApiUser | null;
  location: string;
  scheduledAt: string | null;
  status: "Proposed" | "Accepted" | "Declined" | "Completed" | "Cancelled";
  note: string | null;
  createdAt: string | null;
};

export type Paginated<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type AuthPayload = {
  user: ApiUser;
  token: string;
};

export type RegisterInput = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
};

export type LoginInput = {
  email: string;
  password: string;
  device_name?: string;
};

export type ListingInput = {
  name: string;
  category: string;
  description?: string;
  price: number;
  condition: string;
  location?: string;
  status?: "Active" | "Sold" | "Draft";
  images?: File[];
  removedImageIds?: number[];
};

export type ProfileInput = {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  phone?: string;
  bio?: string;
  location?: string;
  avatar?: File | null;
};

export type MeetupInput = {
  location: string;
  scheduled_at: string;
  note?: string;
};
