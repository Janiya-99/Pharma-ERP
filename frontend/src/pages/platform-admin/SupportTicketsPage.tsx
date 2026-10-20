import React, { useState, useEffect } from "react";
import {
  getPlatformSupportTickets,
  getPlatformTicketMessages,
  sendPlatformTicketMessage,
  createPlatformSupportTicket,
  updatePlatformSupportTicketStatus,
  deletePlatformSupportTicket,
  getPlatformCompanies,
} from "../../api/platformAdminApi";
import { toast } from "sonner";
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  X,
  Filter,
  Trash2,
} from "lucide-react";

export const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Ticket Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    tenant_company_id: 0,
    subject: "",
    description: "",
    priority: "medium",
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      const [ticketRes, compRes] = await Promise.all([
        getPlatformSupportTickets(),
        getPlatformCompanies().catch(() => ({ data: [] })),
      ]);
      if (ticketRes.success) {
        setTickets(ticketRes.data || []);
      }
      setCompanies(compRes.data || []);
    } catch (err) {
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Auto-refresh chat messages every 8 seconds when a ticket is actively selected
  useEffect(() => {
    if (!selectedTicket) return;

    const interval = setInterval(async () => {
      try {
        const res = await getPlatformTicketMessages(selectedTicket.id);
        if (res.success && res.data) {
          setMessages(res.data);
        }
      } catch {}
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedTicket]);

  const refreshSelectedMessages = async () => {
    if (!selectedTicket) return;
    try {
      setRefreshing(true);
      const res = await getPlatformTicketMessages(selectedTicket.id);
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch {
      toast.error("Failed to refresh messages");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectTicket = async (ticket: any) => {
    try {
      setSelectedTicket(ticket);
      const res = await getPlatformTicketMessages(ticket.id);
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load message history");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      setSending(true);
      const res = await sendPlatformTicketMessage(selectedTicket.id, {
        message_text: newMessage,
      });
      if (res.success) {
        setMessages([...messages, res.data]);
        setNewMessage("");
        toast.success("Support reply sent successfully");
      }
    } catch (err) {
      toast.error("Failed to send message response");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      await updatePlatformSupportTicketStatus(selectedTicket.id, {
        status: newStatus,
      });
      const updated = { ...selectedTicket, status: newStatus };
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? updated : t))
      );
      toast.success(`Ticket marked as ${newStatus.replace("_", " ")}`);
    } catch (err) {
      toast.error("Failed to update ticket status");
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!selectedTicket) return;
    try {
      await updatePlatformSupportTicketStatus(selectedTicket.id, {
        priority: newPriority,
      });
      const updated = { ...selectedTicket, priority: newPriority };
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? updated : t))
      );
      toast.success(`Priority updated to ${newPriority}`);
    } catch (err) {
      toast.error("Failed to update ticket priority");
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this support ticket and all messages?"
      )
    ) {
      return;
    }
    try {
      await deletePlatformSupportTicket(ticketId);
      toast.success("Support ticket deleted successfully");
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
        setMessages([]);
      }
      loadTickets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete ticket");
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.tenant_company_id || !newTicketForm.subject.trim()) {
      toast.error("Please select a target company and specify a subject");
      return;
    }

    try {
      setCreatingTicket(true);
      const res = await createPlatformSupportTicket(newTicketForm);
      if (res.success) {
        toast.success("Support ticket dispatch completed");
        setShowCreateModal(false);
        setNewTicketForm({
          tenant_company_id: 0,
          subject: "",
          description: "",
          priority: "medium",
        });
        loadTickets();
      }
    } catch (err) {
      toast.error("Failed to create ticket");
    } finally {
      setCreatingTicket(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = t.ticket_number?.toLowerCase().includes(q);
      const matchSubject = t.subject?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchCompany =
        t.company_name?.toLowerCase().includes(q) ||
        t.company_code?.toLowerCase().includes(q);
      if (!matchNumber && !matchSubject && !matchDesc && !matchCompany) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Owner Support Desk</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {tickets.length} Tickets
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Resolve technical issues, billing inquiries, capacity extension requests, and dispatch notices.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadTickets()}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh tickets list"
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Ticket / Notice</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "All" },
            { id: "open", label: "Open" },
            { id: "in_progress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
            { id: "closed", label: "Closed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === tab.id
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority & Search Filters */}
        <div className="flex items-center gap-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Main Support Panel: Index List + Chat Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-270px)] min-h-[500px]">
        {/* Tickets list */}
        <div className="lg:col-span-1 border border-slate-800 rounded-2xl bg-slate-950 flex flex-col overflow-hidden shadow-lg">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ticket Index ({filteredTickets.length})
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-850">
            {loading ? (
              <div className="text-slate-500 text-center py-12 text-xs">
                Loading support tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-slate-500 text-center py-12 text-xs">
                No tickets found matching current filters.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className={`p-4 cursor-pointer transition-all hover:bg-slate-900/50 ${
                      isSelected
                        ? "bg-indigo-950/30 border-l-4 border-indigo-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-indigo-400 font-bold">
                        {t.ticket_number}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.priority === "urgent"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : t.priority === "high"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-xs truncate">
                      {t.subject}
                    </h4>

                    {t.company_name && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                        <Building2 className="h-3 w-3 text-slate-500" />
                        <span className="truncate">{t.company_name}</span>
                        {t.company_code && (
                          <span className="text-indigo-400 font-mono">
                            ({t.company_code})
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>
                        {t.created_at
                          ? new Date(t.created_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === "open"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : t.status === "in_progress"
                            ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                            : t.status === "resolved"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Messaging Box & Status Bar */}
        <div className="lg:col-span-2 border border-slate-800 rounded-2xl bg-slate-950 flex flex-col justify-between overflow-hidden shadow-lg">
          {selectedTicket ? (
            <>
              {/* Ticket Details & Action Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                        {selectedTicket.ticket_number}
                      </span>
                      <h3 className="font-bold text-white text-sm">
                        {selectedTicket.subject}
                      </h3>
                    </div>
                    {selectedTicket.company_name && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        <span>{selectedTicket.company_name}</span>
                        {selectedTicket.company_code && (
                          <span className="font-mono text-indigo-400">
                            ({selectedTicket.company_code})
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Priority Selector */}
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        selectedTicket.status === "open"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : selectedTicket.status === "in_progress"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : selectedTicket.status === "resolved"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {selectedTicket.status.replace("_", " ")}
                    </span>

                    {/* Refresh Chat Messages */}
                    <button
                      onClick={refreshSelectedMessages}
                      disabled={refreshing}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="Refresh conversation"
                    >
                      <RotateCw
                        className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Status Transitions & Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-850">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold uppercase">
                      Actions:
                    </span>
                    {selectedTicket.status !== "in_progress" && (
                      <button
                        onClick={() => handleStatusChange("in_progress")}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        In Progress
                      </button>
                    )}
                    {selectedTicket.status !== "resolved" && (
                      <button
                        onClick={() => handleStatusChange("resolved")}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Mark Completed / Resolved</span>
                      </button>
                    )}
                    {selectedTicket.status !== "closed" ? (
                      <button
                        onClick={() => handleStatusChange("closed")}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="h-3.5 w-3.5 text-rose-400" />
                        <span>Close Ticket</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange("open")}
                        className="px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                        <span>Reopen Ticket</span>
                      </button>
                    )}
                  </div>

                  {/* Delete Option */}
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    className="px-2.5 py-1 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                    title="Permanently delete ticket and all messages"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    <span>Delete Ticket</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950">
                {/* Initial Issue Description */}
                {selectedTicket.description && (
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs leading-relaxed">
                    <p className="font-bold text-indigo-400 uppercase text-[10px] tracking-wider mb-1">
                      Issue Description:
                    </p>
                    <p className="text-slate-200">{selectedTicket.description}</p>
                  </div>
                )}

                {messages.map((m) => {
                  const isAdmin = m.sender_type === "platform_admin";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl border text-xs leading-relaxed shadow-md ${
                          isAdmin
                            ? "bg-indigo-950/30 border-indigo-500/40 text-slate-100 rounded-tr-none"
                            : "bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] mb-1.5 font-semibold">
                          <span
                            className={
                              isAdmin ? "text-indigo-400 font-bold" : "text-slate-400"
                            }
                          >
                            {isAdmin ? "Platform Administration" : "Client User"}
                          </span>
                          <span className="text-slate-500">
                            {m.created_at
                              ? new Date(m.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p>{m.message_text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Type an official platform response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="py-2.5 px-5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{sending ? "Sending..." : "Send"}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 p-8 text-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-300 text-sm">
                  Select a Support Ticket
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Click on any ticket in the index to review conversation history, update status, and reply to client inquiries.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Create Support Ticket / Notice
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Send proactive technical notices or open a support line for a tenant.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Target Company *
                </label>
                <select
                  value={newTicketForm.tenant_company_id}
                  onChange={(e) =>
                    setNewTicketForm({
                      ...newTicketForm,
                      tenant_company_id: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value={0}>Select client company...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_code} - {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) =>
                    setNewTicketForm({
                      ...newTicketForm,
                      priority: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Scheduled Database Maintenance Notice"
                  value={newTicketForm.subject}
                  onChange={(e) =>
                    setNewTicketForm({
                      ...newTicketForm,
                      subject: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description / Message Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the technical issue, advice, or maintenance window..."
                  value={newTicketForm.description}
                  onChange={(e) =>
                    setNewTicketForm({
                      ...newTicketForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                >
                  {creatingTicket ? "Dispatching..." : "Dispatch Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketsPage;
