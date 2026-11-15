import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, MessageSquare, Send, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import PageHeader from "@/components/seller/PageHeader";
import ProductThumb from "@/components/seller/ProductThumb";
import { useAuth } from "@/context/useAuth";
import { formatMoney, toMarketProduct } from "@/lib/adapters";
import { api, ApiError } from "@/lib/api";
import { type MarketCondition, type MarketProduct } from "@/data/seller";

const conditions: MarketCondition[] = [
  "Brand New",
  "Like New",
  "Used",
  "For Parts",
];

const sortOptions = [
  "Recommended",
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
];

export default function BrowseMarket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const focusName = searchParams.get("q");

  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<MarketCondition[]>(
    [],
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("Recommended");
  const [visibleCount, setVisibleCount] = useState(6);
  const [chatInput, setChatInput] = useState("");
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMarket() {
      setLoading(true);
      setError("");

      try {
        const page = await api.market.list();
        const mapped = page.data.map(toMarketProduct);

        if (!active) return;

        setProducts(mapped);

        setSelectedId((previous) => {
          if (previous && mapped.some((item) => item.id === previous)) {
            return previous;
          }

          if (focusName) {
            const match = mapped.find((item) =>
              item.name.toLowerCase().includes(focusName.toLowerCase()),
            );

            if (match) return match.id;
          }

          return mapped[0]?.id ?? null;
        });
      } catch (caught) {
        if (active) {
          setError(
            caught instanceof ApiError
              ? caught.message
              : "Could not load the market right now.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMarket();

    return () => {
      active = false;
    };
  }, [focusName]);

  const categories = Array.from(
    new Set(products.map((product) => product.category)),
  ).sort();

  const selectedProduct =
    products.find((product) => product.id === selectedId) ?? null;

  const isOwnListing =
    selectedProduct?.sellerId !== undefined &&
    selectedProduct.sellerId === user?.id;

  const filteredProducts = products
    .filter(
      (product) =>
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category),
    )
    .filter(
      (product) =>
        selectedConditions.length === 0 ||
        selectedConditions.includes(product.condition),
    )
    .filter(
      (product) => minPrice === "" || product.price >= Number(minPrice),
    )
    .filter(
      (product) => maxPrice === "" || product.price <= Number(maxPrice),
    );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "Price: Low to High") return a.price - b.price;
    if (sort === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < sortedProducts.length;

  const toggleCategory = (category: string) => {
    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category],
    );
  };

  const toggleCondition = (condition: MarketCondition) => {
    setSelectedConditions((previous) =>
      previous.includes(condition)
        ? previous.filter((item) => item !== condition)
        : [...previous, condition],
    );
  };

  const selectProduct = (id: string) => {
    setSelectedId(id);
    setChatInput("");
  };

  const startConversation = async (product: MarketProduct, message?: string) => {
    const conversation = await api.conversations.start(product.id);

    if (message?.trim()) {
      await api.messages.send(conversation.id, message.trim());
    }

    navigate(`/seller/messages?conversation=${conversation.id}`);
  };

  const handleMessageSeller = async () => {
    if (!selectedProduct || isOwnListing) return;

    setError("");
    setStartingChat(true);

    try {
      await startConversation(selectedProduct);
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

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct || isOwnListing || !chatInput.trim()) return;

    setError("");
    setStartingChat(true);

    try {
      await startConversation(selectedProduct, chatInput);
      setChatInput("");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not send that message.",
      );
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">

      {/* Filters */}
      <aside className="h-fit rounded-[10px] border border-[#E8ECE7] bg-white p-5 lg:sticky lg:top-24">
        <h2 className="text-[15px] font-semibold text-black">Filters</h2>

        {/* Price range */}
        <div className="mt-5 border-t border-[#F0F2EE] pt-4">
          <h3 className="text-[13px] font-semibold text-black">Price Range</h3>

          <div className="relative mt-4 h-1 rounded-full bg-[#DDE3DC]">
            <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-black/80" />
            <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-black bg-white" />
            <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-black bg-white" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="₱500"
              aria-label="Minimum price"
              className="h-9 w-full rounded-md border border-[#DDE3DC] px-2.5 text-[13px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black"
            />
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="₱10,000"
              aria-label="Maximum price"
              className="h-9 w-full rounded-md border border-[#DDE3DC] px-2.5 text-[13px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black"
            />
          </div>
        </div>

        {/* Category */}
        <div className="mt-5 border-t border-[#F0F2EE] pt-4">
          <h3 className="text-[13px] font-semibold text-black">Category</h3>

          <div className="mt-3 space-y-2.5">
            {categories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-2 text-[13px] text-[#4A4A4A]"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="h-3.5 w-3.5 rounded border-[#DDE3DC] accent-black"
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div className="mt-5 border-t border-[#F0F2EE] pt-4">
          <h3 className="text-[13px] font-semibold text-black">Condition</h3>

          <div className="mt-3 space-y-2.5">
            {conditions.map((condition) => (
              <label
                key={condition}
                className="flex cursor-pointer items-center gap-2 text-[13px] text-[#4A4A4A]"
              >
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(condition)}
                  onChange={() => toggleCondition(condition)}
                  className="h-3.5 w-3.5 rounded border-[#DDE3DC] accent-black"
                />
                {condition}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Market */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
        <div>
          <PageHeader
            title="Browse Market"
            description="Explore all listings"
            actions={
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#929792]">Sort:</span>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    aria-label="Sort listings"
                    className="h-9 appearance-none rounded-md border border-[#DDE3DC] bg-white py-1 pl-3 pr-8 text-[13px] text-black outline-none transition focus:border-black"
                  >
                    {sortOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>

                  <ChevronDown
                    size={11}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#6B726B]"
                    aria-hidden="true"
                  />
                </div>
              </div>
            }
          />

          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-[#F3D3CE] bg-[#FDF2F1] px-4 py-3 text-[13px] text-[#B42318]"
            >
              {error}
            </p>
          ) : null}

          {/* Product grid */}
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4">
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => selectProduct(product.id)}
                className={`overflow-hidden rounded-[10px] border bg-white text-left transition hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)] ${
                  selectedId === product.id
                    ? "border-black ring-1 ring-black"
                    : "border-[#E8ECE7]"
                }`}
              >
                <div
                  className={`relative flex h-[140px] items-center justify-center overflow-hidden text-5xl ${product.tone}`}
                >
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-white/85 px-2.5 py-1 text-[12px] font-medium text-[#4A4A4A]">
                    {product.condition}
                  </span>

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden="true">{product.emoji}</span>
                  )}
                </div>

                <div className="p-3.5">
                  <p className="truncate text-[14px] font-semibold text-black">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-black">
                    {formatMoney(product.price)}
                  </p>
                  <p className="mt-1 text-[12px] text-[#929792]">
                    {product.location}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {loading ? (
            <p className="mt-8 rounded-[10px] border border-dashed border-[#DDE3DC] bg-white px-5 py-12 text-center text-[13px] text-[#929792]">
              Loading the market…
            </p>
          ) : sortedProducts.length === 0 ? (
            <p className="mt-8 rounded-[10px] border border-dashed border-[#DDE3DC] bg-white px-5 py-12 text-center text-[13px] text-[#929792]">
              No items match your filters. Try adjusting your search.
            </p>
          ) : null}

          {hasMoreProducts ? (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((previous) => previous + 6)}
                className="h-10 rounded-md border border-[#DDE3DC] bg-white px-4 text-[13px] font-medium text-[#4A4A4A] transition hover:border-black hover:text-black"
              >
                Load more finds
              </button>
            </div>
          ) : null}
        </div>

        {/* Item details */}
        <aside className="h-fit rounded-[10px] border border-[#E8ECE7] bg-white p-4 xl:sticky xl:top-24">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-black">
              Item Details
            </h2>

            {selectedProduct ? (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close item details"
                className="rounded-md p-1 text-[#8A9089] hover:bg-[#F4F7F1] hover:text-black"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>

          {selectedProduct ? (
            <div className="mt-3">
              <ProductThumb
                emoji={selectedProduct.emoji}
                image={selectedProduct.image}
                alt={selectedProduct.name}
                tone={selectedProduct.tone}
                size="xl"
              />

              <span className="mt-3 inline-flex rounded-full bg-[#E9F0E4] px-3 py-1 text-[12px] font-medium text-[#3F6B3F]">
                {selectedProduct.condition}
              </span>

              <h3 className="mt-2 text-[16px] font-semibold text-black">
                {selectedProduct.name}
              </h3>

              <p className="mt-1 text-[20px] font-semibold text-black">
                {formatMoney(selectedProduct.price)}
              </p>

              <p className="mt-1 text-[12px] text-[#929792]">
                {selectedProduct.category} · {selectedProduct.location}
              </p>

              {/* Seller */}
              <div className="mt-4 flex items-center gap-2.5 border-t border-[#F0F2EE] pt-4">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#E9F0E4] text-[13px] font-semibold text-black">
                  {selectedProduct.seller.avatarUrl ? (
                    <img
                      src={selectedProduct.seller.avatarUrl}
                      alt={selectedProduct.seller.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    selectedProduct.seller.initials
                  )}
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-black">
                    {selectedProduct.seller.name}
                  </p>
                  <p className="text-[12px] text-[#929792]">
                    {selectedProduct.seller.location}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-[13px] font-semibold text-black">
                  Description
                </h4>
                <p className="mt-1 text-[13px] leading-relaxed text-[#6B726B]">
                  {selectedProduct.description}
                </p>
              </div>

              {isOwnListing ? (
                <p className="mt-4 rounded-md bg-[#F4F7F1] px-3 py-2 text-center text-[12px] text-[#6B726B]">
                  This is your listing.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleMessageSeller()}
                  disabled={startingChat}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-black text-[13px] font-medium text-white transition hover:bg-[#292929] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MessageSquare size={13} aria-hidden="true" />
                  {startingChat ? "Opening chat…" : "Message Seller"}
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  navigate(`/seller/market/${selectedProduct.id}`)
                }
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md border border-[#DDE3DC] bg-white text-[13px] font-medium text-black transition hover:border-black"
              >
                View full listing
              </button>

              {/* Chat */}
              {!isOwnListing ? (
                <div className="mt-4 overflow-hidden rounded-lg border border-[#E8ECE7]">
                  <p className="border-b border-[#E8ECE7] bg-[#F7F9F5] px-3 py-2 text-[13px] font-semibold text-black">
                    Chat with {selectedProduct.seller.name}
                  </p>

                  <div className="p-3">
                    <p className="rounded-md bg-[#F4F7F1] px-3 py-2 text-[12px] leading-relaxed text-[#6B726B]">
                      Ask if it&apos;s still available or arrange a meet-up. Your
                      chat continues in Messages.
                    </p>
                  </div>

                  <form
                    onSubmit={(event) => void handleSendMessage(event)}
                    className="flex items-center gap-2 border-t border-[#E8ECE7] p-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      placeholder="Type a message..."
                      aria-label="Message the seller"
                      className="h-9 w-full rounded-md bg-[#F4F7F1] px-3 text-[13px] text-black outline-none placeholder:text-[#8A9089] focus:ring-2 focus:ring-black/10"
                    />

                    <button
                      type="submit"
                      disabled={startingChat}
                      aria-label="Send message"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-black text-white transition hover:bg-[#292929] disabled:opacity-60"
                    >
                      <Send size={12} aria-hidden="true" />
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="py-12 text-center text-[13px] leading-relaxed text-[#929792]">
              Select an item to view its details.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
