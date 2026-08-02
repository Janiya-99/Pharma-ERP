import React, { useState, useEffect } from "react";
import {
  getPlatformSupportTickets,
  getPlatformTicketMessages,
  sendPlatformTicketMessage,
} from "../../api/platformAdminApi";
import { toast } from "sonner";
import { MessageSquare, Calendar, ShieldAlert, Send } from "lucide-react";

export const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await getPlatformSupportTickets();
      if (res.success) {
        setTickets(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

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
      const res = await sendPlatformTicketMessage(selectedTicket.id, {
        message_text: newMessage,
      });
      if (res.success) {
        setMessages([...messages, res.data]);
        setNewMessage("");
        toast.success("Response sent to the company admin!");
      }
    } catch (err) {
      toast.error("Failed to send message response");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Owner Support Desk</h2>
        <p className="text-sm text-slate-400">Respond to technical issues, branch capacity extension queries, and customer tickets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[450px]">
        {/* Tickets list */}
        <div className="md:col-span-1 border border-slate-800 rounded-xl bg-slate-950/20 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tickets Index</h3>
          </div>

          {loading ? (
            <div className="text-slate-500 text-center py-8 text-xs">Loading desk tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-slate-500 text-center py-8 text-xs">No tickets logged in the portal.</div>
          ) : (
            <div className="divide-y divide-slate-850 flex-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-4 cursor-pointer transition-all hover:bg-slate-900/10 ${
                    selectedTicket?.id === t.id ? "bg-indigo-950/10 border-l-2 border-indigo-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-indigo-400 font-bold">{t.ticket_number}</span>
                    <span className="text-slate-500 font-semibold">{t.priority}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1.5 truncate">{t.subject}</h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{t.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messaging Box */}
        <div className="md:col-span-2 border border-slate-800 rounded-xl bg-slate-950/20 flex flex-col justify-between overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedTicket.subject}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Ticket ID: {selectedTicket.ticket_number}</p>
                </div>
                <span className="inline-flex px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-semibold uppercase">
                  {selectedTicket.status}
                </span>
              </div>

              {/* Chat flow */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/10">
                {/* original description */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-850 text-xs">
                  <p className="font-semibold text-indigo-400">Issue description:</p>
                  <p className="text-slate-300 mt-1">{selectedTicket.description}</p>
                </div>

                {messages.map((m) => {
                  const isAdmin = m.sender_type === "platform_admin";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl border text-xs leading-relaxed ${
                          isAdmin
                            ? "bg-indigo-950/20 border-indigo-500/50 text-slate-200"
                            : "bg-slate-950 border-slate-850 text-slate-300"
                        }`}
                      >
                        <p className="font-semibold text-[10px] text-slate-500 mb-1">
                          {isAdmin ? "Platform Admin Response" : "Company User"}
                        </p>
                        <p>{m.message_text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Send input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-850 bg-slate-950/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Type support response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
                <button
                  type="submit"
                  className="py-2 px-4 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Send className="h-3 w-3" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 p-6 text-center">
              <MessageSquare className="h-8 w-8 text-slate-700 animate-bounce" />
              <div>
                <h4 className="font-bold text-slate-400 text-sm">Select Support Ticket</h4>
                <p className="text-xs text-slate-650 mt-0.5">Choose an issue ticket from the index panel to reply.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SupportTicketsPage;
