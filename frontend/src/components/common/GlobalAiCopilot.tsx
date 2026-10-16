import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Bot,
  FileText,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useAiCopilot, CopilotTab } from "../../context/AiCopilotContext";
import {
  generateAiPageSummary,
  generateAiPageDocumentation,
  sendAiChatbotMessage,
  AiPageSummaryResult,
  AiDocumentationResult,
} from "../../services/geminiService";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export const GlobalAiCopilot: React.FC = () => {
  const {
    isOpen,
    activeTab,
    pageContext,
    initialPrompt,
    openCopilot,
    closeCopilot,
    toggleCopilot,
  } = useAiCopilot();

  const [currentTab, setCurrentTab] = useState<CopilotTab>(activeTab);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Summary state
  const [summary, setSummary] = useState<AiPageSummaryResult | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Documentation state
  const [docs, setDocs] = useState<AiDocumentationResult | null>(null);
  const [docsLoading, setDocsLoading] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Synchronize active tab from context
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  // Handle initial prompt from deep-links
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendPrompt(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  // Keyboard shortcut Ctrl+J to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        toggleCopilot();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCopilot]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Auto-load summary or docs when switching tabs if empty or route changed
  useEffect(() => {
    if (isOpen) {
      if (currentTab === "summary" && !summary && !summaryLoading) {
        handleGenerateSummary();
      } else if (currentTab === "docs" && !docs && !docsLoading) {
        handleGenerateDocs();
      }
    }
  }, [isOpen, currentTab, pageContext.route]);

  // Send chatbot prompt
  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: promptText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await sendAiChatbotMessage(historyPayload, pageContext);
      if (res.success && res.reply) {
        const botMsg: ChatMessage = {
          id: `m-${Date.now()}`,
          role: "model",
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        toast.error("Failed to receive AI response");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      toast.error("Error communicating with AI Copilot");
    } finally {
      setChatLoading(false);
    }
  };

  // Generate page summary
  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await generateAiPageSummary({
        pageTitle: pageContext.pageTitle,
        route: pageContext.route || "/",
        activeData: pageContext.activeData,
        count: pageContext.count,
      });
      setSummary(res);
    } catch (err) {
      console.error("Summary error:", err);
      toast.error("Failed to generate page summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Generate page documentation
  const handleGenerateDocs = async () => {
    setDocsLoading(true);
    try {
      const res = await generateAiPageDocumentation({
        pageTitle: pageContext.pageTitle,
        route: pageContext.route || "/",
        moduleName: pageContext.moduleName,
      });
      setDocs(res);
    } catch (err) {
      console.error("Docs error:", err);
      toast.error("Failed to generate documentation");
    } finally {
      setDocsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      {/* ── Floating Launcher Orb / Pill ── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center">
          <button
            onClick={() => openCopilot("chat")}
            className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 py-3 text-white shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-600/40 active:scale-95 cursor-pointer ring-2 ring-white/40"
            title="Open Pharma AI Copilot (Ctrl+J)"
          >
            <div className="relative">
              <Sparkles className="h-5 w-5 text-amber-300 transition-transform duration-300 group-hover:rotate-12" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                AI Copilot
                <span className="rounded-md bg-white/20 px-1 py-0.2 text-[9px] font-semibold text-white/90">
                  Gemini
                </span>
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── Slide-Over Copilot Drawer ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in">
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-xl bg-white/95 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-slate-200">
              
              {/* Drawer Header */}
              <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/30">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900">Pharma AI Copilot</h2>
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Gemini 3.6 Flash
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs font-medium">
                        Active: <span className="font-semibold text-slate-700">{pageContext.pageTitle}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={closeCopilot}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                      title="Close Copilot (Esc)"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* 3 Navigation Tabs */}
                <div className="mt-3 flex rounded-xl bg-slate-100/90 p-1 border border-slate-200/60 text-xs font-semibold">
                  <button
                    onClick={() => setCurrentTab("chat")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all cursor-pointer ${
                      currentTab === "chat"
                        ? "bg-white text-indigo-700 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>AI Chatbot</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab("summary")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all cursor-pointer ${
                      currentTab === "summary"
                        ? "bg-white text-indigo-700 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Page Summary</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab("docs")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all cursor-pointer ${
                      currentTab === "docs"
                        ? "bg-white text-indigo-700 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>SOP & Docs</span>
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5">
                
                {/* ── TAB 1: LIVE CHATBOT ── */}
                {currentTab === "chat" && (
                  <div className="flex flex-col h-full space-y-4">
                    {messages.length === 0 && (
                      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white p-5 text-center my-auto">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 mb-3">
                          <Bot className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">
                          How can I assist you on this page?
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                          Ask me anything about <span className="font-semibold text-slate-700">{pageContext.pageTitle}</span>, financial calculations, batch expiry, NMRA regulations, or operational tasks.
                        </p>

                        {/* Quick Prompts */}
                        <div className="mt-4 flex flex-col gap-1.5 text-left">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Suggested Prompts
                          </span>
                          {[
                            `Summarize current data on ${pageContext.pageTitle}`,
                            "Explain NMRA batch recall and quarantine procedures",
                            "What are the mandatory field validations on this form?",
                            "Analyze credit risks and overdue collections for this month",
                          ].map((prompt, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendPrompt(prompt)}
                              className="text-left text-xs text-slate-700 bg-white hover:bg-indigo-50/80 hover:text-indigo-700 border border-slate-200/80 rounded-xl px-3 py-2 transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
                            >
                              <span className="truncate">{prompt}</span>
                              <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages stream */}
                    <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                              msg.role === "user"
                                ? "bg-indigo-600 text-white shadow-xs rounded-br-xs"
                                : "bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs"
                            }`}
                          >
                            <div className="whitespace-pre-line font-sans prose prose-xs max-w-none">
                              {msg.text}
                            </div>
                          </div>
                          <div className="mt-1 flex items-center gap-2 px-1 text-[10px] text-slate-400">
                            <span>{msg.timestamp}</span>
                            {msg.role === "model" && (
                              <button
                                onClick={() => copyToClipboard(msg.text, msg.id)}
                                className="hover:text-indigo-600 transition-colors cursor-pointer"
                                title="Copy answer"
                              >
                                {copied === msg.id ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {chatLoading && (
                        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 border border-slate-200/80 p-3 text-xs text-slate-500 w-fit">
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                          <span>Gemini is analyzing ERP data...</span>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>
                  </div>
                )}

                {/* ── TAB 2: PAGE SUMMARY ── */}
                {currentTab === "summary" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Real-Time Executive Summary
                        </span>
                        {summary?.timestamp && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {summary.timestamp}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleGenerateSummary}
                        disabled={summaryLoading}
                        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${summaryLoading ? "animate-spin" : ""}`} />
                        <span>Re-analyze</span>
                      </button>
                    </div>

                    {summaryLoading ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
                        <Loader2 className="h-7 w-7 animate-spin text-indigo-600 mx-auto" />
                        <p className="text-xs font-medium text-slate-600">
                          Analyzing {pageContext.pageTitle} telemetry with Gemini 3.6 Flash...
                        </p>
                      </div>
                    ) : summary ? (
                      <div className="space-y-4">
                        {/* Executive Summary Card */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Executive Synthesis
                            </span>
                            <button
                              onClick={() => copyToClipboard(summary.executiveSummary, "sum-text")}
                              className="text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Copy summary"
                            >
                              {copied === "sum-text" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          <p className="text-xs leading-relaxed text-slate-600 font-normal">
                            {summary.executiveSummary}
                          </p>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-3 gap-2.5">
                          {summary.keyMetrics.map((kpi, i) => (
                            <div key={i} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-center">
                              <span className="text-[10px] font-medium text-slate-500 block truncate">{kpi.label}</span>
                              <span className={`text-xs font-bold mt-1 block truncate ${
                                kpi.tone === "positive" ? "text-emerald-600" :
                                kpi.tone === "warning" ? "text-amber-600" :
                                kpi.tone === "negative" ? "text-rose-600" : "text-slate-900"
                              }`}>
                                {kpi.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Risk Assessment */}
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                            <span>Risk & Compliance Assessment</span>
                          </div>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            {summary.riskAssessment}
                          </p>
                        </div>

                        {/* Action Items Checklist */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2.5">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Recommended Action Items
                          </span>
                          <div className="space-y-2">
                            {summary.actionItems.map((act, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 mt-0.5">
                                  {i + 1}
                                </span>
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* ── TAB 3: SOP & DOCUMENTATION ── */}
                {currentTab === "docs" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        SOP & Field Reference
                      </span>
                      <button
                        onClick={handleGenerateDocs}
                        disabled={docsLoading}
                        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${docsLoading ? "animate-spin" : ""}`} />
                        <span>Refresh SOP</span>
                      </button>
                    </div>

                    {docsLoading ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
                        <Loader2 className="h-7 w-7 animate-spin text-indigo-600 mx-auto" />
                        <p className="text-xs font-medium text-slate-600">
                          Generating SOP & Field Documentation for {pageContext.pageTitle}...
                        </p>
                      </div>
                    ) : docs ? (
                      <div className="space-y-4">
                        {/* Title & Overview */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2">
                          <h3 className="text-sm font-bold text-slate-900">{docs.title}</h3>
                          <p className="text-xs leading-relaxed text-slate-600">
                            {docs.overview}
                          </p>
                        </div>

                        {/* Workflows */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2.5">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-indigo-600" /> Operational Workflows
                          </span>
                          <div className="space-y-2">
                            {docs.keyWorkflows.map((wf, i) => (
                              <div key={i} className="rounded-xl border border-slate-200/60 bg-slate-50 p-2.5 space-y-1">
                                <span className="text-xs font-bold text-slate-900">{wf.step}</span>
                                <p className="text-[11px] text-slate-600">{wf.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Field Glossary */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2.5">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-blue-600" /> Field Definitions & Constraints
                          </span>
                          <div className="divide-y divide-slate-100 text-xs">
                            {docs.fieldGlossary.map((fg, i) => (
                              <div key={i} className="py-2 first:pt-0 last:pb-0 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-800 font-mono text-[11px]">{fg.field}</span>
                                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">{fg.requirement}</span>
                                </div>
                                <p className="text-[11px] text-slate-500">{fg.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Compliance & SOP Rules */}
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Sri Lanka NMRA & Audit Compliance
                          </span>
                          <ul className="space-y-1.5 text-xs text-emerald-800 list-disc list-inside">
                            {docs.complianceAndSOP.map((rule, i) => (
                              <li key={i}>{rule}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Accounting Impact */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-purple-600" /> Subledger & Accounting Impact
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                            {docs.accountingImpact.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Chat Input Bar (visible on chat tab) */}
              {currentTab === "chat" && (
                <div className="border-t border-slate-200 bg-white p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendPrompt(chatInput);
                    }}
                    className="relative flex items-center"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Ask anything about ${pageContext.pageTitle}...`}
                      disabled={chatLoading}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-12 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="absolute right-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      {chatLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </form>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>Press Enter to send</span>
                    <span>Shortcut: <kbd className="font-mono bg-slate-100 px-1 rounded">Ctrl+J</kbd></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default GlobalAiCopilot;
