import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { ListingsContext } from "@/context/listings-context";
import { useAuth } from "@/context/useAuth";
import { toSellerListing } from "@/lib/adapters";
import { api, ApiError } from "@/lib/api";
import type { ListingStatus, SellerListing } from "@/data/seller";
import type { ApiListing, ListingInput, Paginated } from "@/lib/types";

type ListingsState = {
  ownerId: number | null;
  items: SellerListing[];
};

const emptyState: ListingsState = { ownerId: null, items: [] };

export default function ListingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [state, setState] = useState<ListingsState>(emptyState);
  const [error, setError] = useState<string | null>(null);

  const listings = useMemo(() => {
    if (!user || state.ownerId !== user.id) return [];

    return state.items;
  }, [user, state]);

  const loading = user !== null && state.ownerId !== user.id;

  const applyPage = useCallback(
    (ownerId: number, page: Paginated<ApiListing>) => {
      setState({ ownerId, items: page.data.map(toSellerListing) });
      setError(null);
    },
    [],
  );

  useEffect(() => {
    if (!user) return;

    let active = true;
    const ownerId = user.id;

    api.listings
      .list()
      .then((page) => {
        if (active) applyPage(ownerId, page);
      })
      .catch((caught: unknown) => {
        if (!active) return;

        setState((previous) =>
          previous.ownerId === ownerId ? previous : { ownerId, items: [] },
        );
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Could not load your listings.",
        );
      });

    return () => {
      active = false;
    };
  }, [user, applyPage]);

  const refresh = useCallback(async () => {
    if (!user) return;

    try {
      const page = await api.listings.list();

      applyPage(user.id, page);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not load your listings.",
      );
    }
  }, [user, applyPage]);

  const createListing = useCallback(
    async (input: ListingInput) => {
      const created = toSellerListing(await api.listings.create(input));

      setState((previous) => ({
        ownerId: previous.ownerId ?? user?.id ?? null,
        items: [created, ...previous.items],
      }));

      return created;
    },
    [user],
  );

  const updateListing = useCallback(
    async (id: string, input: Partial<ListingInput>) => {
      const updated = toSellerListing(await api.listings.update(id, input));

      setState((previous) => ({
        ownerId: previous.ownerId,
        items: previous.items.map((listing) =>
          listing.id === id ? updated : listing,
        ),
      }));

      return updated;
    },
    [],
  );

  const setListingStatus = useCallback(
    async (id: string, status: ListingStatus) => {
      // Optimistic update so the table reacts immediately.
      setState((previous) => ({
        ownerId: previous.ownerId,
        items: previous.items.map((listing) =>
          listing.id === id ? { ...listing, status } : listing,
        ),
      }));

      try {
        await api.listings.update(id, { status });
      } catch (caught) {
        await refresh();
        throw caught;
      }
    },
    [refresh],
  );

  const deleteListing = useCallback(async (id: string) => {
    let snapshot: ListingsState = emptyState;

    setState((previous) => {
      snapshot = previous;

      return {
        ownerId: previous.ownerId,
        items: previous.items.filter((listing) => listing.id !== id),
      };
    });

    try {
      await api.listings.remove(id);
    } catch (caught) {
      setState(snapshot);
      throw caught;
    }
  }, []);

  const getListing = useCallback(
    (id: string) => listings.find((listing) => listing.id === id),
    [listings],
  );

  const value = useMemo(
    () => ({
      listings,
      loading,
      error,
      refresh,
      createListing,
      updateListing,
      setListingStatus,
      deleteListing,
      getListing,
    }),
    [
      listings,
      loading,
      error,
      refresh,
      createListing,
      updateListing,
      setListingStatus,
      deleteListing,
      getListing,
    ],
  );

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
}
