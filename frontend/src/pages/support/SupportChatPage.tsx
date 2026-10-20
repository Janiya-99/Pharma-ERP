import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  getClientSupportTickets,
  createClientSupportTicket,
  getClientTicketMessages,
  sendClientTicketMessage,
  updateClientTicketStatus,
  SupportTicketItem,
  SupportTicketMessageItem,
} from "../../api/clientSupportApi";
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Check,
  CheckCheck,
  Clock,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Headphones,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  X,
  Sparkles,
  LifeBuoy,
  Building2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export const SupportChatPage: React.FC = () => {
  const { user, company, activeBranch } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");

  // Chat messages state
  const [messages, setMessages] = useState<SupportTicketMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New ticket dialog
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [creatingTicket, setCreatingTicket] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Read ticketId from query string on mount
  useEffect(() => {
    const qId = searchParams.get("ticketId");
    if (qId) {
      const parsed = parseInt(qId, 10);
      if (!isNaN(parsed)) {
        setSelectedTicketId(parsed);
      }
    }
  }, [searchParams]);

  // Load ticket list
  const fetchTickets = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingTickets(true);
    else setIsRefreshing(true);
    try {
      const data = await getClientSupportTickets();
      setTickets(data);

      // Default select first ticket if none selected and on desktop
      if (!selectedTicketId && data.length > 0 && window.innerWidth >= 768) {
        const queryId = searchParams.get("ticketId");
        if (queryId) {
          const match = data.find((t) => t.id === parseInt(queryId, 10));
          if (match) setSelectedTicketId(match.id);
          else setSelectedTicketId(data[0].id);
        } else {
          setSelectedTicketId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoadingTickets(false);
      setIsRefreshing(false);
    }
  }, [selectedTicketId, searchParams]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(() => {
      fetchTickets(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // Load messages for selected ticket
  const fetchMessages = useCallback(async (tId: number, quiet = false) => {
    if (!quiet) setLoadingMessages(true);
    try {
      const msgs = await getClientTicketMessages(tId);
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      if (!quiet) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTicketId) {
      fetchMessages(selectedTicketId);
      const interval = setInterval(() => {
        fetchMessages(selectedTicketId, true);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedTicketId, fetchMessages]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Handle select ticket
  const handleSelectTicket = (id: number) => {
    setSelectedTicketId(id);
    setSearchParams({ ticketId: id.toString() });
  };

  // Handle send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !selectedTicketId || sending) return;

    const text = inputMessage.trim();
    setInputMessage("");
    setSending(true);

    // Optimistic message update
    const tempMsg: SupportTicketMessageItem = {
      id: Date.now(),
      support_ticket_id: selectedTicketId,
      sender_type: "client",
      sender_id: user?.id || 1,
      message_text: text,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await sendClientTicketMessage(selectedTicketId, text);
      fetchMessages(selectedTicketId, true);
      fetchTickets(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Handle create new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) {
      toast.error("Please fill in both subject and description");
      return;
    }

    setCreatingTicket(true);
    try {
      const created = await createClientSupportTicket({
        subject: newSubject.trim(),
        description: newDescription.trim(),
        priority: newPriority,
      });

      toast.success(`Support ticket ${created.ticket_number} created successfully!`);
      setShowNewTicketModal(false);
      setNewSubject("");
      setNewDescription("");
      setNewPriority("medium");

      await fetchTickets();
      if (created?.id) {
        handleSelectTicket(created.id);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create support ticket");
    } finally {
      setCreatingTicket(false);
    }
  };

  // Handle change status
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicketId) return;
    try {
      toast.loading("Updating status...", { id: "ticket-status" });
      await updateClientTicketStatus(selectedTicketId, newStatus);
      toast.success(`Ticket marked as ${newStatus}`, { id: "ticket-status" });
      fetchTickets(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update ticket status", { id: "ticket-status" });
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSub = t.subject?.toLowerCase().includes(q);
      const matchNum = t.ticket_number?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      return matchSub || matchNum || matchDesc;
    }
    return true;
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const getPriorityBadge = (p: string) => {
    const lower = p.toLowerCase();
    if (lower === "urgent") return "bg-rose-100 text-rose-700 border-rose-200";
    if (lower === "high") return "bg-amber-100 text-amber-700 border-amber-200";
    if (lower === "low") return "bg-slate-100 text-slate-600 border-slate-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const getStatusBadge = (s: string) => {
    const lower = s.toLowerCase();
    if (lower === "resolved" || lower === "closed") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (lower === "in_progress") return "bg-sky-100 text-sky-800 border-sky-200";
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  return (
    <div className="flex h-[calc(100vh-4.25rem)] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
      {/* ── LEFT COLUMN: CONVERSATION LIST (WhatsApp Web Left Pane) ── */}
      <div
        className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/60 ${
          selectedTicketId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-100/90 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20">
              <Headphones className="h-5 w-5" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Engineering Support</h2>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live WhatsApp Chat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fetchTickets(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-800 transition-colors cursor-pointer"
              title="Refresh tickets"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
              title="Create new support ticket"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Ticket</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 border-b border-slate-200/70 bg-white space-y-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations or ticket #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-100/80 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs">
            {(["all", "open", "in_progress", "resolved"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] capitalize transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-emerald-600 text-white shadow-2xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {st === "all" ? `All (${tickets.length})` : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingTickets && tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600 mb-2" />
              <p className="text-xs font-semibold">Loading support conversations...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">No conversations found</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                {searchQuery ? "Try a different search query" : "Click 'New Ticket' to begin chatting with support"}
              </p>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = t.id === selectedTicketId;
              const dateObj = t.updated_at ? new Date(t.updated_at) : new Date(t.created_at);
              const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t.id)}
                  className={`flex items-start gap-3 p-3.5 transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-emerald-50/70 border-l-4 border-emerald-600"
                      : "hover:bg-slate-100/70 bg-white"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-700 font-extrabold text-xs shadow-2xs border border-slate-200">
                      {t.ticket_number?.slice(-4) || "TCK"}
                    </div>
                    {t.status === "open" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-white" />
                    )}
                    {t.status === "in_progress" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
                    )}
                    {t.status === "resolved" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-bold text-slate-900 truncate">
                        {t.subject || "Support Inquiry"}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                        {timeStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                        {t.ticket_number}
                      </span>
                      <span className={`text-[9.5px] font-bold uppercase px-1.5 py-0.2 rounded border ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {t.description || "No description provided"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: ACTIVE WHATSAPP CHAT PANEL ── */}
      <div className={`flex-1 flex flex-col bg-[#efeae2]/40 ${!selectedTicketId ? "hidden md:flex" : "flex"}`}>
        {selectedTicket ? (
          <>
            {/* WhatsApp Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/95 px-4 py-3 shadow-2xs z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedTicketId(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                      {selectedTicket.subject}
                    </h2>
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {selectedTicket.ticket_number}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Priority: <strong className="capitalize text-slate-700">{selectedTicket.priority}</strong></span>
                    <span>•</span>
                    <span className={`inline-flex items-center px-1.5 py-0.2 rounded font-bold uppercase text-[9.5px] border ${getStatusBadge(selectedTicket.status)}`}>
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 outline-none cursor-pointer shadow-2xs hover:border-emerald-500 transition-colors"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Mark Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <button
                  type="button"
                  onClick={() => fetchMessages(selectedTicket.id)}
                  className="rounded-xl p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
                  title="Refresh conversation"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* WhatsApp Chat Message Canvas (Patterned Wallpaper) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-gradient-to-b from-[#efeae2]/30 via-slate-50 to-slate-100/50">
              {/* WhatsApp Security Banner */}
              <div className="flex justify-center my-2">
                <div className="flex items-center gap-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 px-3 py-1.5 text-[11px] font-medium text-amber-800 shadow-2xs max-w-md text-center">
                  <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>Messages in this ticket are securely transmitted directly to Ceylon Med Enterprise Platform Engineering.</span>
                </div>
              </div>

              {/* Initial Ticket Description as first message */}
              <div className="flex flex-col items-end">
                <div className="max-w-xl rounded-2xl rounded-tr-xs bg-[#d9fdd3] text-slate-900 p-3.5 shadow-xs border border-emerald-200/60 text-xs sm:text-sm">
                  <div className="flex items-center justify-between gap-4 pb-1 border-b border-emerald-200/40 text-[10.5px] font-bold text-emerald-800 mb-1.5">
                    <span>You ({user?.name || "Client Admin"})</span>
                    <span className="font-mono font-normal text-emerald-700">Initial Request</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-emerald-800/80 font-mono">
                    <span>{new Date(selectedTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Thread Messages */}
              {loadingMessages && messages.length === 0 ? (
                <div className="flex justify-center p-6">
                  <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                messages.map((m) => {
                  const isUser = m.sender_type === "client" || m.sender_id === user?.id;
                  const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-xl rounded-2xl p-3.5 shadow-xs text-xs sm:text-sm transition-all ${
                          isUser
                            ? "bg-[#d9fdd3] text-slate-900 rounded-tr-xs border border-emerald-200/60"
                            : "bg-white text-slate-900 rounded-tl-xs border border-slate-200 shadow-2xs"
                        }`}
                      >
                        {/* Sender header */}
                        <div className="flex items-center justify-between gap-4 pb-1 mb-1.5 border-b border-slate-100 text-[10.5px]">
                          {isUser ? (
                            <span className="font-bold text-emerald-800">You</span>
                          ) : (
                            <span className="font-bold text-blue-700 flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                              <span>Platform Engineering Support</span>
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">{time}</span>
                        </div>

                        <p className="whitespace-pre-wrap leading-relaxed">{m.message_text}</p>

                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                          <span>{time}</span>
                          {isUser && <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* WhatsApp Style Message Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-slate-200 bg-slate-100/90 p-3 sm:p-4 flex items-center gap-2.5"
            >
              <button
                type="button"
                onClick={() => toast.info("Screenshots or logs can be pasted directly into the message text")}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
                title="Attach logs or screenshot"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  rows={1}
                  placeholder="Type a message or response to engineering support... (Press Enter to send)"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none max-h-32 shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                title="Send message"
              >
                {sending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </>
        ) : (
          /* Empty Placeholder (When no ticket is selected on desktop) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
              <Headphones className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Ceylon Med Enterprise Support Desk
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
              Send and receive priority engineering support messages in real-time. Select a ticket on the left to review replies or start a new conversation.
            </p>
            <button
              type="button"
              onClick={() => setShowNewTicketModal(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Support Ticket</span>
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL: CREATE NEW SUPPORT TICKET ── */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">New Engineering Support Ticket</h3>
                  <p className="text-[11px] text-slate-400">Direct escalation to Platform Support & Engineering</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ticket Subject / Issue Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sales invoice tax calculation discrepancy in Negombo branch"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Priority Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["low", "medium", "high", "urgent"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                        newPriority === p
                          ? p === "urgent"
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : p === "high"
                            ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                            : p === "medium"
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-700 text-white border-slate-700 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issue Description & Steps to Reproduce <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue in detail, including customer names, document numbers, or error messages encountered..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket || !newSubject.trim() || !newDescription.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {creatingTicket ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Submit & Start Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChatPage;
