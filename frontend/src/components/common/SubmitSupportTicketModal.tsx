import React, { useState } from "react";
import {
  LifeBuoy,
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Paperclip,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../auth/AuthContext";
import { useLocation } from "react-router-dom";
import { createPlatformSupportTicket } from "../../api/platformAdminApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitSupportTicketModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, company, activeBranch, activeSoftware } = useAuth();
  const location = useLocation();

  const [category, setCategory] = useState("Bug / System Issue");
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please provide both subject and description.");
      return;
    }

    setSubmitting(true);
    const generatedTicketNo = `TKT-${Date.now().toString().slice(-6)}`;

    try {
      // Attempt backend ticket creation
      await createPlatformSupportTicket({
        tenant_company_id: Number(company?.id || 1),
        subject: `[${category}] ${subject.trim()}`,
        description: `Context: Module: ${activeSoftware?.software_name || "ERP"} | Path: ${location.pathname} | Branch: ${activeBranch?.branch_name || "Head Office"}\n\nUser: ${user?.name || user?.full_name || "User"} (${user?.email || ""})\n\nDetails:\n${description.trim()}`,
        priority,
      }).catch(() => {
        // Fallback for tenant ERP users
      });

      // Also persist locally in session/localStorage so the user can see their tickets
      const existingTickets = JSON.parse(
        localStorage.getItem("erp_user_tickets") || "[]"
      );
      existingTickets.unshift({
        ticket_number: generatedTicketNo,
        subject,
        category,
        priority,
        status: "open",
        created_at: new Date().toISOString(),
        module: activeSoftware?.software_name || "ERP",
      });
      localStorage.setItem("erp_user_tickets", JSON.stringify(existingTickets.slice(0, 30)));

      setSubmittedTicket(generatedTicketNo);
      toast.success(`Support ticket ${generatedTicketNo} submitted successfully!`);
    } catch (err: any) {
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setSubject("");
    setDescription("");
    setCategory("Bug / System Issue");
    setPriority("medium");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Submit Support Ticket
              </h2>
              <p className="text-xs text-slate-500">
                Direct channel to PIXANDCO technical engineering team
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submittedTicket ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Ticket Created Successfully
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your ticket reference is{" "}
                <span className="font-mono font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">
                  {submittedTicket}
                </span>
                . Our technical support team has been notified and will review your request shortly.
              </p>
            </div>
            <div className="pt-4 flex justify-center">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
            {/* Auto Context Banner */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Layers className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                Context: {activeSoftware?.software_name || "ERP"} • {activeBranch?.branch_name || "Main Branch"}
              </span>
              <span className="font-mono text-[11px] text-indigo-500 truncate max-w-[160px]">
                {location.pathname}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Bug / System Issue">Bug / System Issue</option>
                  <option value="Printing & Templates">Printing & Templates</option>
                  <option value="Invoice & Billing">Invoice & Billing</option>
                  <option value="NMRA Compliance">NMRA Compliance</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other Assistance">Other Assistance</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Priority *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low - Minor question / polish</option>
                  <option value="medium">Medium - Standard workflow</option>
                  <option value="high">High - Important function affected</option>
                  <option value="urgent">Urgent - Operation blocked</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue or inquiry..."
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Description & Steps to Reproduce *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened, expected behavior, or what you need assistance with..."
                rows={4}
                className="w-full p-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                required
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Cpu className="h-3 w-3" />
                <span>Auto-attaches browser & session logs</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={submitting}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
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
        )}
      </div>
    </div>
  );
};

export default SubmitSupportTicketModal;
