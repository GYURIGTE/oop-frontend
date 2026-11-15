import { useEffect, useRef, useState, type FormEvent } from "react";
import { Ellipsis, Search, Send } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import PageHeader from "@/components/seller/PageHeader";
import ProductThumb from "@/components/seller/ProductThumb";
import { useAuth } from "@/context/useAuth";
import { formatMoney, toChatMessage, toConversation } from "@/lib/adapters";
import { api, ApiError } from "@/lib/api";
import type { ChatMessage, Conversation } from "@/data/seller";

const tabs = ["All messages", "Unread"] as const;
type Tab = (typeof tabs)[number];

type MenuPosition = {
  top: number;
  left: number;
};

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get("conversation");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(requestedId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("All messages");
  const [search, setSearch] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const messageListRef = useRef<HTMLDivElement>(null);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    conversations[0] ??
    null;

  // Load the conversation list once.
  useEffect(() => {
    let active = true;

    async function loadConversations() {
      setLoading(true);
      setError("");

      try {
        const list = await api.conversations.list();

        if (!active) return;

        const mapped = list.map((conversation) =>
          toConversation(conversation, user?.id),
        );

        setConversations(mapped);
        setSelectedId((previous) => {
          if (previous && mapped.some((item) => item.id === previous)) {
            return previous;
          }

          if (requestedId && mapped.some((item) => item.id === requestedId)) {
            return requestedId;
          }

          return mapped[0]?.id ?? null;
        });
      } catch (caught) {
        if (active) {
          setError(
            caught instanceof ApiError
              ? caught.message
              : "Could not load your conversations.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadConversations();

    return () => {
      active = false;
    };
  }, [user?.id, requestedId]);

  // Poll the open conversation so new messages appear without a refresh.
  useEffect(() => {
    if (!selectedId) return;

    let active = true;

    async function loadConversation() {
      try {
        const detail = await api.conversations.get(selectedId!);

        if (!active) return;

        setMessages((detail.messages ?? []).map(toChatMessage));

        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === String(detail.id)
              ? { ...toConversation(detail, user?.id), unread: false }
              : conversation,
          ),
        );
      } catch {
        // Keep the last good state while polling; surface hard errors below.
      }
    }

    void loadConversation();

    const timer = window.setInterval(() => {
      void loadConversation();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [selectedId, user?.id]);

  useEffect(() => {
    const container = messageListRef.current;

    if (container) container.scrollTop = container.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    if (!menuPosition) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuPosition(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuPosition]);

  const visibleConversations = conversations.filter((conversation) => {
    const matchesTab = activeTab === "All messages" || conversation.unread;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      conversation.name.toLowerCase().includes(query) ||
      conversation.listing.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setMessages([]);
    setMenuPosition(null);
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id
          ? { ...conversation, unread: false }
          : conversation,
      ),
    );
  };

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!messageInput.trim() || !selectedConversation) return;

    const body = messageInput.trim();
    setMessageInput("");
    setError("");

    try {
      const sent = await api.messages.send(selectedConversation.id, body);

      setMessages((previous) => [...previous, toChatMessage(sent)]);
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === selectedConversation.id
            ? {
                ...conversation,
                preview: body,
                time: "Just now",
                lastMessageAt: sent.createdAt,
              }
            : conversation,
        ),
      );
    } catch (caught) {
      setMessageInput(body);
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not send that message.",
      );
    }
  };

  const toggleMenu = (button: HTMLButtonElement) => {
    if (menuPosition) {
      setMenuPosition(null);
      return;
    }

    const rect = button.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 8,
      left: Math.max(8, rect.right - 184),
    });
  };

  const handleViewListing = () => {
    if (!selectedConversation) return;

    setMenuPosition(null);
    navigate(`/seller/messages/${selectedConversation.id}/listing`);
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;

    const conversationToDelete = selectedConversation;
    setMenuPosition(null);

    if (
      !window.confirm(
        `Delete your conversation with ${conversationToDelete.name}?`,
      )
    ) {
      return;
    }

    try {
      await api.conversations.remove(conversationToDelete.id);

      const nextConversations = conversations.filter(
        (conversation) => conversation.id !== conversationToDelete.id,
      );

      setConversations(nextConversations);

      if (selectedId === conversationToDelete.id) {
        setSelectedId(nextConversations[0]?.id ?? null);
      }
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not delete that conversation.",
      );
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="GOOD FINDS START WITH A CONVERSATION"
        title="Messages"
        description="Keep in touch with buyers and sellers, all in one place."
      />

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-[#F3D3CE] bg-[#FDF2F1] px-4 py-3 text-[13px] text-[#B42318]"
        >
          {error}
        </p>
      ) : null}

      <section className="grid overflow-hidden rounded-[10px] border border-[#E8ECE7] bg-white lg:h-[640px] lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Conversations */}
        <div className="flex min-h-0 flex-col border-b border-[#E8ECE7] lg:border-b-0 lg:border-r">
          <div className="border-b border-[#E8ECE7] p-4">
            <h2 className="text-[15px] font-semibold text-black">
              Conversations
            </h2>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F4F7F1] px-3">
              <Search size={13} className="text-[#8A9089]" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages"
                aria-label="Search messages"
                className="h-9 w-full bg-transparent text-[13px] text-black outline-none placeholder:text-[#8A9089]"
              />
            </div>

            <div className="mt-3 flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setMenuPosition(null);
                  }}
                  className={`rounded-md px-3.5 py-2 text-[12px] font-medium transition ${
                    activeTab === tab
                      ? "bg-black text-white"
                      : "text-[#6B726B] hover:bg-[#F4F7F1] hover:text-black"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {visibleConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => selectConversation(conversation.id)}
                className={`w-full border-b border-[#F0F2EE] px-4 py-3.5 text-left transition ${
                  selectedConversation?.id === conversation.id
                    ? "bg-[#F7F9F5]"
                    : "hover:bg-[#FAFBF9]"
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E9F0E4] text-[13px] font-semibold text-black">
                    {conversation.avatarUrl ? (
                      <img
                        src={conversation.avatarUrl}
                        alt={conversation.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      conversation.initials
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[14px] font-semibold text-black">
                        {conversation.name}
                      </p>
                      <span className="shrink-0 text-[12px] text-[#929792]">
                        {conversation.time}
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-[13px] text-[#6B726B]">
                      {conversation.listing}
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-[12px] text-[#929792]">
                        {conversation.preview}
                      </p>

                      {conversation.unread ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {visibleConversations.length === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-[#929792]">
                {loading
                  ? "Loading conversations…"
                  : "No conversations found."}
              </p>
            ) : null}
          </div>
        </div>

        {/* Chat */}
        {selectedConversation ? (
          <div className="flex min-h-[520px] flex-col">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-[#E8ECE7] px-4 py-3.5">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#E9F0E4] text-[13px] font-semibold text-black">
                {selectedConversation.avatarUrl ? (
                  <img
                    src={selectedConversation.avatarUrl}
                    alt={selectedConversation.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  selectedConversation.initials
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-black">
                  {selectedConversation.name}
                </p>
                <p className="truncate text-[12px] text-[#929792]">
                  {selectedConversation.listing}
                </p>
              </div>

              <button
                type="button"
                onClick={(event) => toggleMenu(event.currentTarget)}
                aria-label="Conversation options"
                aria-haspopup="menu"
                aria-expanded={menuPosition !== null}
                className={`rounded-md p-1.5 text-[#8A9089] transition hover:bg-[#F4F7F1] hover:text-black ${
                  menuPosition ? "bg-[#F4F7F1] text-black" : ""
                }`}
              >
                <Ellipsis size={15} />
              </button>
            </div>

            {/* Product bar */}
            <div className="flex items-center gap-3 border-b border-[#E8ECE7] bg-[#FBFCFA] px-4 py-3">
              <ProductThumb
                emoji={selectedConversation.productEmoji}
                image={selectedConversation.productImage}
                alt={selectedConversation.listing}
                tone={selectedConversation.productTone}
                size="sm"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-black">
                  {selectedConversation.listing}
                </p>
                <p className="text-[13px] text-[#6B726B]">
                  {formatMoney(selectedConversation.productPrice)}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/seller/messages/${selectedConversation.id}/listing`,
                  )
                }
                className="h-8 shrink-0 rounded-md border border-[#DDE3DC] bg-white px-3 text-[12px] font-medium text-black transition hover:border-black"
              >
                View listing
              </button>
            </div>

            {/* Messages */}
            <div
              ref={messageListRef}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.from === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] ${
                      message.from === "me" ? "text-right" : "text-left"
                    }`}
                  >
                    <p
                      className={`inline-block rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        message.from === "me"
                          ? "bg-black text-white"
                          : "bg-[#F4F7F1] text-black"
                      }`}
                    >
                      {message.text}
                    </p>

                    <p className="mt-1 text-[12px] text-[#929792]">
                      {message.time}
                      {message.read ? " · Read" : ""}
                    </p>
                  </div>
                </div>
              ))}

              {messages.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-[#929792]">
                  No messages yet. Say hello to get things started.
                </p>
              ) : null}
            </div>

            {/* Composer */}
            <form
              onSubmit={(event) => void handleSendMessage(event)}
              className="flex items-center gap-2 border-t border-[#E8ECE7] p-3"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                placeholder="Write a message..."
                aria-label="Write a message"
                className="h-11 w-full rounded-lg bg-[#F4F7F1] px-4 text-[13px] text-black outline-none placeholder:text-[#8A9089] focus:ring-2 focus:ring-black/10"
              />

              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-black px-4 text-[13px] font-medium text-white transition hover:bg-[#292929] active:scale-[0.99]"
              >
                <Send size={12} aria-hidden="true" />
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="flex min-h-[520px] items-center justify-center px-6 text-center">
            <p className="max-w-[260px] text-[13px] leading-relaxed text-[#929792]">
              No conversations left. Start a new chat from Browse Market.
            </p>
          </div>
        )}
      </section>

      {/* Conversation actions menu */}
      {menuPosition && selectedConversation ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuPosition(null)}
            aria-hidden="true"
          />

          <div
            role="menu"
            className="fixed z-50 w-[184px] origin-top-right animate-[dropdown-in_150ms_ease-out] overflow-hidden rounded-lg border border-[#E8ECE7] bg-white py-1 shadow-[0_14px_36px_rgba(0,0,0,0.14)] motion-reduce:animate-none"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleDeleteConversation()}
              className="block w-full px-3 py-2.5 text-left text-[13px] text-[#B42318] transition-[padding,background-color] duration-150 hover:bg-[#FDF2F1] hover:pl-4"
            >
              Delete Conversation
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleViewListing}
              className="block w-full px-3 py-2.5 text-left text-[13px] text-black transition-[padding,background-color] duration-150 hover:bg-[#F4F7F1] hover:pl-4"
            >
              View listing
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
