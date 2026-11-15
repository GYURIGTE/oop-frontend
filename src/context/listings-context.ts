import { createContext } from "react";

import { type ListingStatus, type SellerListing } from "@/data/seller";
import type { ListingInput } from "@/lib/types";

export type ListingsContextValue = {
  listings: SellerListing[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createListing: (input: ListingInput) => Promise<SellerListing>;
  updateListing: (
    id: string,
    input: Partial<ListingInput>,
  ) => Promise<SellerListing>;
  setListingStatus: (id: string, status: ListingStatus) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  getListing: (id: string) => SellerListing | undefined;
};

export const ListingsContext = createContext<ListingsContextValue | null>(
  null,
);
