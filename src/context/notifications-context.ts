import { createContext } from "react";

export type ListingNotification = {
  id: number;
  name: string;
  price: number;
  createdAt: string | null;
};

export type NotificationsContextValue = {
  /** Total unread messages across every conversation. */
  unreadMessages: number;
  /** Latest marketplace listings posted by other sellers. */
  notifications: ListingNotification[];
  /** How many of those listings the seller has not seen yet. */
  unseenCount: number;
  markListingsSeen: () => void;
};

export const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);
