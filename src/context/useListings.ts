import { useContext } from "react";

import { ListingsContext } from "@/context/listings-context";

export function useListings() {
  const context = useContext(ListingsContext);

  if (!context) {
    throw new Error("useListings must be used inside a ListingsProvider");
  }

  return context;
}
