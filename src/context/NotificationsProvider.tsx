import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  NotificationsContext,
  type ListingNotification,
} from "@/context/notifications-context";
import { useAuth } from "@/context/useAuth";
import { api } from "@/lib/api";

const CONVERSATION_POLL_MS = 5_000;
const MARKET_POLL_MS = 60_000;

function storageKey(userId: number) {
  return `baligya.seenListings.${userId}`;
}

function readSeen(userId: number): number[] {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
}

function writeSeen(userId: number, ids: number[]) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(ids));
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

type SeenState = {
  userId: number | null;
  ids: number[];
};

export default function NotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState<ListingNotification[]>([]);
  const [seen, setSeen] = useState<SeenState>({ userId: null, ids: [] });

  const seenIds = useMemo(() => {
    if (!user) return [];

    if (seen.userId === user.id) return seen.ids;

    return readSeen(user.id);
  }, [user, seen]);

  // Unread badge: poll the conversation list so the number is always current.
  useEffect(() => {
    if (!user) return;

    let active = true;

    const load = () => {
      api.conversations
        .list()
        .then((list) => {
          if (!active) return;

          setUnreadMessages(
            list.reduce(
              (total, conversation) => total + (conversation.unreadCount ?? 0),
              0,
            ),
          );
        })
        .catch(() => {
          // Keep the last good count while offline.
        });
    };

    load();

    const timer = window.setInterval(load, CONVERSATION_POLL_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user]);

  // Bell dropdown: latest listings posted by other sellers.
  useEffect(() => {
    if (!user) return;

    let active = true;
    const ownerId = user.id;

    const load = () => {
      api.market
        .list({ sort: "newest" })
        .then((page) => {
          if (!active) return;

          setNotifications(
            page.data
              .filter((listing) => listing.seller?.id !== ownerId)
              .slice(0, 5)
              .map((listing) => ({
                id: listing.id,
                name: listing.name,
                price: listing.price,
                createdAt: listing.createdAt,
              })),
          );
        })
        .catch(() => {
          // Keep the last good list while offline.
        });
    };

    load();

    const timer = window.setInterval(load, MARKET_POLL_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user]);

  const markListingsSeen = useCallback(() => {
    if (!user) return;

    const ids = notifications.map((notification) => notification.id);

    writeSeen(user.id, ids);
    setSeen({ userId: user.id, ids });
  }, [user, notifications]);

  const value = useMemo(() => {
    const activeNotifications = user ? notifications : [];
    const unseenCount = user
      ? activeNotifications.filter((notification) => !seenIds.includes(notification.id))
          .length
      : 0;

    return {
      unreadMessages: user ? unreadMessages : 0,
      notifications: activeNotifications,
      unseenCount,
      markListingsSeen,
    };
  }, [user, unreadMessages, notifications, seenIds, markListingsSeen]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
