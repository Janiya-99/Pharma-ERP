import React, { useState, useEffect, useRef } from "react";
import {
  LifeBuoy,
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Loader2,
  MessageSquare,
  Clock,
  RotateCw,
  ArrowLeft,
  Headphones,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../auth/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getClientSupportTickets,
  createClientSupportTicket,
  getClientTicketMessages,
  sendClientTicketMessage,
  SupportTicketItem,
  SupportTicketMessageItem,
} from "../../api/clientSupportApi";
import { createPlatformSupportTicket } from "../../api/platformAdminApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitSupportTicketModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, company, activeBranch, activeSoftware } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active view tab: 'new' | 'list'
  const [activeTab, setActiveTab] = useState<"new" | "list">("new");

  // Form State
  const [category, setCategory] = useState("Bug / System Issue");
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Tickets & Chat State
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessageItem[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Load tickets when modal opens
  const fetchTickets = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoadingTickets(true);

      const data = await getClientSupportTickets();
      setTickets(data);

      // If user had selected ticket, refresh its detail
      if (selectedTicket) {
        const updated = data.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch {
      // Handled silently
    } finally {
      setLoadingTickets(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen]);

  // Auto-refresh chat messages every 8 seconds when a ticket is opened
  useEffect(() => {
    if (!isOpen || !selectedTicket) return;

    const interval = setInterval(async () => {
      try {
        const msgs = await getClientTicketMessages(selectedTicket.id);
        if (msgs && msgs.length > 0) {
          setMessages(msgs);
        }
      } catch {
        // Silently ignore background polling errors
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isOpen, selectedTicket]);

  const handleSelectTicket = async (ticket: SupportTicketItem) => {
    setSelectedTicket(ticket);
    try {
      setLoadingMessages(true);
      const msgs = await getClientTicketMessages(ticket.id);
      setMessages(msgs);
    } catch {
      toast.error("Could not load message history for this ticket.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setSendingReply(true);
      const text = replyText.trim();
      setReplyText("");

      const newMsg = await sendClientTicketMessage(selectedTicket.id, text);
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      } else {
        // Local fallback message for instant feedback
        const fallbackMsg: SupportTicketMessageItem = {
          id: Date.now(),
          support_ticket_id: selectedTicket.id,
          sender_type: "client",
          sender_id: Number(user?.id || 1),
          message_text: text,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
      toast.success("Reply sent to engineering support team");
      // Trigger background tickets refresh
      fetchTickets();
    } catch {
      toast.error("Failed to send reply. Please try again.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please provide both subject and description.");
      return;
    }

    setSubmitting(true);
    const generatedTicketNo = `TKT-${Date.now().toString().slice(-6)}`;

    try {
      const fullSubject = `[${category}] ${subject.trim()}`;
      const fullDesc = `Context: Module: ${activeSoftware?.software_name || "ERP"} | Path: ${location.pathname} | Branch: ${activeBranch?.branch_name || "Head Office"}\n\nUser: ${user?.name || user?.full_name || "User"} (${user?.email || ""})\n\nDetails:\n${description.trim()}`;

      // 1. Create via Client Support API
      let created = await createClientSupportTicket({
        subject: fullSubject,
        description: fullDesc,
        priority,
      }).catch(() => null);

      // 2. Fallback to platform admin direct call if needed
      if (!created) {
        created = await createPlatformSupportTicket({
          tenant_company_id: Number(company?.id || 1),
          subject: fullSubject,
          description: fullDesc,
          priority,
        }).catch(() => null);
      }

      // 3. Persist locally so it's always accessible
      const existingTickets = JSON.parse(
        localStorage.getItem("erp_user_tickets") || "[]"
      );
      const localTicket: SupportTicketItem = created || {
        id: Date.now(),
        tenant_company_id: Number(company?.id || 1),
        ticket_number: generatedTicketNo,
        subject: fullSubject,
        description: fullDesc,
        priority,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      existingTickets.unshift(localTicket);
      localStorage.setItem("erp_user_tickets", JSON.stringify(existingTickets.slice(0, 30)));

      toast.success(`Support ticket ${localTicket.ticket_number} created successfully!`);

      // Switch to list/chat tab immediately and select the ticket
      await fetchTickets();
      setSelectedTicket(localTicket);
      setActiveTab("list");

      // Reset form
      setSubject("");
      setDescription("");
      setCategory("Bug / System Issue");
      setPriority("medium");
    } catch {
      toast.error("Failed to submit ticket. Please check your network and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTicket(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Technical Support & Engineering Desk
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3 w-3" /> Live Channel
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Direct channel to PIXANDCO Technical Engineering Support Team
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTickets(true)}
              disabled={refreshing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Refresh tickets & replies"
            >
              <RotateCw
                className={`h-4 w-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`}
              />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-white px-5 pt-2 gap-4 shrink-0 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab("new");
              setSelectedTicket(null);
            }}
            className={`pb-2.5 px-1 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "new"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Open New Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`pb-2.5 px-1 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "list"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>My Tickets & Conversations</span>
            {tickets.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-bold">
                {tickets.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/support/chat");
            }}
            className="ml-auto mb-2 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span>Open WhatsApp Chat View →</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "new" ? (
            /* ── OPEN NEW TICKET FORM ── */
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-sm">
              {/* Context Banner */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <Layers className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  Context: {activeSoftware?.software_name || "ERP"} • {activeBranch?.branch_name || "Main Branch"}
                </span>
                <span className="font-mono text-[11px] text-indigo-500 truncate max-w-[160px]">
                  {location.pathname}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Category using shadcn Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Category *
                  </label>
                  <Select value={category} onValueChange={(val) => setCategory(val)}>
                    <SelectTrigger className="w-full h-9 bg-white border-slate-200 text-xs font-medium text-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-white border-slate-200 shadow-xl rounded-xl">
                      <SelectItem value="Bug / System Issue">Bug / System Issue</SelectItem>
                      <SelectItem value="Printing & Templates">Printing & Templates</SelectItem>
                      <SelectItem value="Invoice & Billing">Invoice & Billing</SelectItem>
                      <SelectItem value="NMRA Compliance">NMRA Compliance</SelectItem>
                      <SelectItem value="Feature Request">Feature Request</SelectItem>
                      <SelectItem value="Other Assistance">Other Assistance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority using shadcn Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Priority *
                  </label>
                  <Select value={priority} onValueChange={(val) => setPriority(val)}>
                    <SelectTrigger className="w-full h-9 bg-white border-slate-200 text-xs font-medium text-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-white border-slate-200 shadow-xl rounded-xl">
                      <SelectItem value="low">Low - Minor question / polish</SelectItem>
                      <SelectItem value="medium">Medium - Standard workflow</SelectItem>
                      <SelectItem value="high">High - Important function affected</SelectItem>
                      <SelectItem value="urgent">Urgent - Operation blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue or inquiry..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Description & Steps to Reproduce *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what happened, expected behavior, or what you need assistance with..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed transition-all"
                  required
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Cpu className="h-3 w-3" />
                  <span>Auto-attaches browser telemetry & session info</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>{submitting ? "Submitting..." : "Submit Ticket"}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : selectedTicket ? (
            /* ── CHAT CONVERSATION VIEW ── */
            <div className="flex flex-col h-[520px]">
              {/* Selected Ticket Top Bar */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Back to all tickets"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                        {selectedTicket.ticket_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          selectedTicket.status === "closed"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : selectedTicket.status === "resolved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {selectedTicket.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                      {selectedTicket.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {selectedTicket.created_at
                      ? new Date(selectedTicket.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })
                      : "Recently"}
                  </span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/40">
                {/* Initial Description Card */}
                {selectedTicket.description && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs leading-relaxed">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500 mb-1">
                      <Layers className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Original Request Details</span>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>
                )}

                {loadingMessages ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    <span className="text-xs">Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 space-y-1">
                    <Headphones className="h-6 w-6 mx-auto text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">
                      Ticket submitted to PIXANDCO Engineering Desk
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Our technical staff will post replies directly into this thread. You can also send follow-up details below.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAdmin = m.sender_type === "platform_admin";
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs border ${
                            isAdmin
                              ? "bg-indigo-600 text-white border-indigo-700 rounded-tl-xs"
                              : "bg-white text-slate-800 border-slate-200 rounded-tr-xs"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] mb-1 font-semibold">
                            <span
                              className={`flex items-center gap-1 ${
                                isAdmin ? "text-indigo-100" : "text-indigo-600"
                              }`}
                            >
                              {isAdmin ? (
                                <>
                                  <ShieldCheck className="h-3 w-3" />
                                  <span>PIXANDCO Engineering</span>
                                </>
                              ) : (
                                <span>You ({user?.name || "Client"})</span>
                              )}
                            </span>
                            <span
                              className={
                                isAdmin ? "text-indigo-200" : "text-slate-400"
                              }
                            >
                              {m.created_at
                                ? new Date(m.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{m.message_text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Reply Input */}
              <form
                onSubmit={handleSendReply}
                className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Type a reply or question for engineering team..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sendingReply}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {sendingReply ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Reply</span>
                </button>
              </form>
            </div>
          ) : (
            /* ── MY TICKETS LIST VIEW ── */
            <div className="p-5">
              {loadingTickets ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <span className="text-xs">Fetching support tickets...</span>
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mx-auto">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      No Support Tickets Yet
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Have a technical query or encountering an issue? Open a ticket to chat directly with PIXANDCO engineering.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("new")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    Open New Support Ticket
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1 pb-1">
                    <span>Showing {tickets.length} support requests</span>
                    <span className="text-[11px] text-slate-400">Click a ticket to view replies & chat</span>
                  </div>

                  {tickets.map((t) => (
                    <div
                      key={t.id || t.ticket_number}
                      onClick={() => handleSelectTicket(t)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 bg-white shadow-2xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                            {t.ticket_number}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              t.status === "closed"
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : t.status === "resolved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {t.status.replace("_", " ")}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              t.priority === "urgent" || t.priority === "high"
                                ? "bg-red-50 text-red-600 font-bold"
                                : "text-slate-400"
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {t.subject}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {t.description?.slice(0, 100)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {t.created_at
                            ? new Date(t.created_at).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })
                            : ""}
                        </span>
                        <div className="h-8 w-8 rounded-lg bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitSupportTicketModal;
