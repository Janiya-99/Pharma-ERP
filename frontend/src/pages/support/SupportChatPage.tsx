import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  getClientSupportTickets,
  createClientSupportTicket,
  getClientTicketMessages,
  sendClientTicketMessage,
  updateClientTicketStatus,
  deleteClientSupportTicket,
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
  FileText,
  Download,
  Eye,
  Image as ImageIcon,
  User,
  Trash2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface PendingAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export const SupportChatPage: React.FC = () => {
  const { user, company, activeBranch } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all");

  // Chat messages state
  const [messages, setMessages] = useState<SupportTicketMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [senderRole, setSenderRole] = useState<"client" | "support">("client");

  // Attachments state
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [newTicketAttachment, setNewTicketAttachment] = useState<PendingAttachment | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newTicketFileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isNewTicket = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Attachment size exceeds 10MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const pending: PendingAttachment = {
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: reader.result as string,
      };
      if (isNewTicket) {
        setNewTicketAttachment(pending);
      } else {
        setAttachment(pending);
      }
      toast.success(`Attached "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Clipboard Paste for Screenshots
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setAttachment({
              name: `screenshot-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.png`,
              type: file.type,
              size: file.size,
              dataUrl: reader.result as string,
            });
            toast.success("Screenshot attached from clipboard!");
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  // Handle send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && !attachment) || !selectedTicketId || sending) return;

    const text = inputMessage.trim();
    const currentAttachment = attachment;
    setInputMessage("");
    setAttachment(null);
    setSending(true);

    const isSupportSender = senderRole === "support";

    // Optimistic message update
    const tempMsg: SupportTicketMessageItem = {
      id: Date.now(),
      support_ticket_id: selectedTicketId,
      sender_type: isSupportSender ? "platform_admin" : "client",
      sender_id: user?.id || 1,
      message_text: text,
      attachment_url: currentAttachment?.dataUrl,
      attachment_name: currentAttachment?.name,
      attachment_type: currentAttachment?.type,
      attachment_size: currentAttachment?.size,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await sendClientTicketMessage(selectedTicketId, {
        message_text: text,
        sender_type: isSupportSender ? "platform_admin" : "client",
        attachment_url: currentAttachment?.dataUrl,
        attachment_name: currentAttachment?.name,
        attachment_type: currentAttachment?.type,
        attachment_size: currentAttachment?.size,
      });
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
        attachment_url: newTicketAttachment?.dataUrl,
        attachment_name: newTicketAttachment?.name,
        attachment_type: newTicketAttachment?.type,
        attachment_size: newTicketAttachment?.size,
      });

      toast.success(`Support ticket ${created.ticket_number} created successfully!`);
      setShowNewTicketModal(false);
      setNewSubject("");
      setNewDescription("");
      setNewPriority("medium");
      setNewTicketAttachment(null);

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
      await updateClientTicketStatus(selectedTicketId, newStatus);
      toast.success(`Ticket marked as ${newStatus.replace("_", " ")}`);
      fetchTickets(true);
    } catch (err) {
      toast.error("Failed to update ticket status");
    }
  };

  // Handle Delete Ticket
  const handleDeleteTicket = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this support ticket?")) return;
    try {
      await deleteClientSupportTicket(id);
      toast.success("Support ticket deleted successfully");
      setSelectedTicketId(null);
      setMessages([]);
      await fetchTickets(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete support ticket");
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
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
      {/* ── LEFT COLUMN: TICKET LIST DESK ── */}
      <div
        className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/70 ${
          selectedTicketId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-100/95 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
              <LifeBuoy className="h-5 w-5" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Support Ticket Desk</h2>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Engineering Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fetchTickets(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-white hover:text-slate-800 transition-colors cursor-pointer"
              title="Refresh tickets"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
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
              placeholder="Search tickets, subject, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-100/80 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
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
            {([
              { id: "all", label: `All (${tickets.length})` },
              { id: "open", label: "Open" },
              { id: "in_progress", label: "In Progress" },
              { id: "resolved", label: "Completed" },
              { id: "closed", label: "Closed" },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-indigo-600 text-white shadow-2xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingTickets && tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-500 mb-2" />
              <p className="text-xs font-medium">Loading ticket conversations...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No tickets found</p>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(true)}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Create your first ticket
              </button>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = t.id === selectedTicketId;
              const dateStr = new Date(t.created_at).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t.id)}
                  className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer border-l-4 ${
                    isSelected
                      ? "bg-indigo-50/60 border-l-indigo-600 shadow-2xs"
                      : "bg-white hover:bg-slate-50/80 border-l-transparent"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-2xs ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-indigo-500/20"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    #{t.ticket_number?.slice(-3) || t.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono text-[11px] font-bold text-indigo-600">
                        {t.ticket_number}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{dateStr}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                      {t.subject}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {t.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase border ${getPriorityBadge(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase border ${getStatusBadge(
                          t.status
                        )}`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                      {t.attachment_url && (
                        <span className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold text-slate-500">
                          <Paperclip className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: ACTIVE CONVERSATION PANEL ── */}
      <div className={`flex-1 flex flex-col bg-slate-50/50 ${!selectedTicketId ? "hidden md:flex" : "flex"}`}>
        {selectedTicket ? (
          <>
            {/* Ticket Desk Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-2xs z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedTicketId(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                      {selectedTicket.subject}
                    </h2>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
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

              {/* Quick Status & Management Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                {selectedTicket.status !== "resolved" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("resolved")}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title="Mark ticket as Completed / Resolved"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Completed</span>
                  </button>
                )}

                {selectedTicket.status !== "closed" ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("closed")}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title="Close this ticket"
                  >
                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                    <span>Close</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("open")}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title="Reopen this ticket"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                    <span>Reopen</span>
                  </button>
                )}

                {/* Delete Ticket Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
                  title="Permanently delete ticket"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Refresh Chat */}
                <button
                  type="button"
                  onClick={() => fetchMessages(selectedTicket.id)}
                  className="rounded-xl p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
                  title="Refresh conversation"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Conversation Stream Canvas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/60">
              {/* Security & Audit Notice */}
              <div className="flex justify-center my-1">
                <div className="flex items-center gap-2 rounded-xl bg-slate-200/80 border border-slate-300/80 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-2xs max-w-md text-center">
                  <Lock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span>End-to-end encrypted ticket channel direct to Ceylon Med Enterprise Platform Engineering.</span>
                </div>
              </div>

              {/* Initial Ticket Request - Rendered on RIGHT (Client User) */}
              <div className="flex flex-col items-end">
                <div className="max-w-xl rounded-2xl rounded-tr-xs bg-indigo-600 text-white p-4 shadow-md text-xs sm:text-sm">
                  <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-indigo-400/40 text-[10.5px] font-bold text-indigo-100 mb-2">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>You ({user?.name || "Client Admin"})</span>
                    </span>
                    <span className="font-mono text-indigo-200">Ticket Creator</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>

                  {/* Attachment if present in ticket header */}
                  {selectedTicket.attachment_url && (
                    <div className="mt-2.5 pt-2 border-t border-indigo-500/50">
                      {selectedTicket.attachment_type?.startsWith("image") ||
                      selectedTicket.attachment_name?.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                        <div
                          onClick={() => setPreviewImage(selectedTicket.attachment_url!)}
                          className="rounded-xl overflow-hidden bg-black/20 p-1 border border-indigo-400/30 cursor-pointer group hover:bg-black/30 transition-colors"
                        >
                          <img
                            src={selectedTicket.attachment_url}
                            alt={selectedTicket.attachment_name || "Attachment"}
                            className="max-h-60 w-auto rounded-lg object-contain mx-auto"
                          />
                          <p className="text-[10px] text-indigo-200 mt-1 truncate px-1 flex items-center justify-between">
                            <span>{selectedTicket.attachment_name || "Attached Screenshot"}</span>
                            <Eye className="h-3 w-3" />
                          </p>
                        </div>
                      ) : (
                        <a
                          href={selectedTicket.attachment_url}
                          download={selectedTicket.attachment_name || "attachment"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 border border-indigo-400/40 text-xs font-semibold text-white transition-colors"
                        >
                          <FileText className="h-4 w-4 text-indigo-200" />
                          <span className="truncate max-w-[200px]">{selectedTicket.attachment_name || "Download File"}</span>
                          <Download className="h-3.5 w-3.5 ml-1 text-indigo-200" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] text-indigo-200 font-mono">
                    <span>{new Date(selectedTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="h-3.5 w-3.5 text-indigo-300" />
                  </div>
                </div>
              </div>

              {/* Thread Messages */}
              {loadingMessages && messages.length === 0 ? (
                <div className="flex justify-center p-6">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : (
                messages.map((m) => {
                  // If sender is platform_admin or support -> LEFT (Desk)
                  // If sender is client -> RIGHT (User)
                  const isDeskReply = m.sender_type === "platform_admin" || m.sender_type === "support";
                  const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isDeskReply ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm transition-all ${
                          isDeskReply
                            ? "bg-white text-slate-850 rounded-tl-xs border border-slate-200 shadow-sm"
                            : "bg-indigo-600 text-white rounded-tr-xs shadow-md border border-indigo-500/50"
                        }`}
                      >
                        {/* Sender header */}
                        <div
                          className={`flex items-center justify-between gap-4 pb-1.5 mb-2 border-b text-[10.5px] ${
                            isDeskReply
                              ? "border-slate-100 text-slate-500"
                              : "border-indigo-400/40 text-indigo-100"
                          }`}
                        >
                          {isDeskReply ? (
                            <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                              <ShieldCheck className="h-4 w-4 text-indigo-600" />
                              <span>Engineering Support Desk</span>
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-semibold uppercase border border-indigo-200">Official Reply</span>
                            </span>
                          ) : (
                            <span className="font-bold flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              <span>You</span>
                            </span>
                          )}
                          <span className="text-[10px] font-mono opacity-80">{time}</span>
                        </div>

                        {/* Text Message */}
                        {m.message_text && (
                          <p className="whitespace-pre-wrap leading-relaxed">{m.message_text}</p>
                        )}

                        {/* File Attachment in Message */}
                        {m.attachment_url && (
                          <div className={`mt-2.5 pt-2 border-t ${isDeskReply ? "border-slate-100" : "border-indigo-400/40"}`}>
                            {m.attachment_type?.startsWith("image") ||
                            m.attachment_name?.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                              <div
                                onClick={() => setPreviewImage(m.attachment_url!)}
                                className={`rounded-xl overflow-hidden p-1 border cursor-pointer transition-all ${
                                  isDeskReply
                                    ? "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                    : "bg-black/20 border-indigo-400/30 hover:bg-black/30"
                                }`}
                              >
                                <img
                                  src={m.attachment_url}
                                  alt={m.attachment_name || "Attachment"}
                                  className="max-h-60 w-auto rounded-lg object-contain mx-auto"
                                />
                                <p
                                  className={`text-[10px] mt-1 truncate px-1 flex items-center justify-between ${
                                    isDeskReply ? "text-slate-500" : "text-indigo-200"
                                  }`}
                                >
                                  <span>{m.attachment_name || "Attached Screenshot"}</span>
                                  <Eye className="h-3 w-3" />
                                </p>
                              </div>
                            ) : (
                              <a
                                href={m.attachment_url}
                                download={m.attachment_name || "attachment"}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                                  isDeskReply
                                    ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                                    : "bg-indigo-700/80 hover:bg-indigo-700 border-indigo-400/40 text-white"
                                }`}
                              >
                                <FileText className={`h-4 w-4 ${isDeskReply ? "text-indigo-600" : "text-indigo-200"}`} />
                                <span className="truncate max-w-[200px]">{m.attachment_name || "Download Document"}</span>
                                <Download className="h-3.5 w-3.5 ml-1 opacity-70" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Status ticks */}
                        <div
                          className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] font-mono ${
                            isDeskReply ? "text-slate-400" : "text-indigo-200"
                          }`}
                        >
                          <span>{time}</span>
                          {!isDeskReply && <CheckCheck className="h-3.5 w-3.5 text-indigo-300" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment preview strip before sending */}
            {attachment && (
              <div className="px-4 py-2 bg-indigo-50/90 border-t border-indigo-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <Paperclip className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-indigo-950 truncate">{attachment.name}</p>
                    <p className="text-[10px] text-indigo-700 font-mono">{(attachment.size / 1024).toFixed(1)} KB ready to send</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="p-1 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Message Input Bar */}
            <div className="border-t border-slate-200 bg-white p-3 sm:p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-500">
                  Direct Line with Ceylon Med Engineering & Support Desk
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Tip: Paste (<kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border">Ctrl+V</kbd>) screenshots directly
                </span>
              </div>

              {/* Input field + actions */}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2.5"
              >
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e, false)}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.log,.zip"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    attachment
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                  title="Attach screenshot, log, or document"
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    placeholder={
                      senderRole === "support"
                        ? "Type official engineering response to client... (Press Enter to send)"
                        : "Type your message or issue details... (Press Enter to send)"
                    }
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none max-h-32 shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || (!inputMessage.trim() && !attachment)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md active:scale-95 transition-all cursor-pointer ${
                    senderRole === "support"
                      ? "bg-slate-900 hover:bg-slate-800 shadow-slate-900/30"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30"
                  } disabled:opacity-50`}
                  title="Send message"
                >
                  {sending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty Placeholder (When no ticket is selected on desktop) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <div className="h-20 w-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm border border-indigo-100">
              <Headphones className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Ceylon Med Enterprise Support Desk
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
              Real-time engineering communication channel. Select a support ticket on the left to review messages, attach logs, or open a new conversation.
            </p>
            <button
              type="button"
              onClick={() => setShowNewTicketModal(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Support Ticket</span>
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL: CREATE NEW SUPPORT TICKET ── */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
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
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
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
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              {/* Ticket Attachment Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attachment / Screenshot (Optional)
                </label>
                <input
                  type="file"
                  ref={newTicketFileInputRef}
                  onChange={(e) => handleFileSelect(e, true)}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.log,.zip"
                />
                {newTicketAttachment ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="h-4 w-4 text-indigo-600 shrink-0" />
                      <span className="font-medium text-indigo-900 truncate">{newTicketAttachment.name}</span>
                      <span className="text-[10px] text-indigo-600 shrink-0 font-mono">
                        ({(newTicketAttachment.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewTicketAttachment(null)}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => newTicketFileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-indigo-400 transition-colors"
                  >
                    <Paperclip className="h-4 w-4 text-slate-400" />
                    <span>Upload screenshot or document (up to 10MB)</span>
                  </button>
                )}
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {creatingTicket ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Submit Ticket & Open Desk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── IMAGE LIGHTBOX MODAL ── */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-white">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-indigo-400" />
                <span>Attachment Preview</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  download="ticket-attachment"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="Download Image"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center">
              <img
                src={previewImage}
                alt="Enlarged attachment"
                className="max-h-[80vh] max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChatPage;
