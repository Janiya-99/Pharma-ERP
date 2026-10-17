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
  Settings,
  Key,
  Eye,
  EyeOff,
  Cpu,
  ExternalLink,
} from "lucide-react";
import { useAiCopilot, CopilotTab } from "../../context/AiCopilotContext";
import {
  generateAiPageSummary,
  generateAiPageDocumentation,
  sendAiChatbotMessage,
  getGeminiApiKey,
  setGeminiApiKey,
  getGeminiModel,
  setGeminiModel,
  hasActiveGeminiKey,
  testGeminiApiKey,
  AiPageSummaryResult,
  AiDocumentationResult,
} from "../../services/geminiService";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  suggestedActions?: string[];
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

  // Settings & Model Configuration state
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getGeminiApiKey());
  const [selectedModel, setSelectedModel] = useState<string>(() => getGeminiModel());
  const [showKeyVisibility, setShowKeyVisibility] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => hasActiveGeminiKey());

  // Summary state
  const [summary, setSummary] = useState<AiPageSummaryResult | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Documentation state
  const [docs, setDocs] = useState<AiDocumentationResult | null>(null);
  const [docsLoading, setDocsLoading] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);
  const [harvestStats, setHarvestStats] = useState({ rows: 0, kpis: 0, formFields: 0 });
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const prevRouteRef = useRef(pageContext.route);

  // Synchronize settings state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getGeminiApiKey());
      setSelectedModel(getGeminiModel());
      setHasApiKey(hasActiveGeminiKey());
    }
  }, [isOpen]);

  // Enhanced function to harvest all visible live screen records, form inputs, and metric cards
  const harvestScreenData = () => {
    try {
      const kpis: Array<{ label: string; value: string }> = [];
      const tableRows: Array<Record<string, string>> = [];
      const formFields: Array<{ name: string; label: string; value: string }> = [];
      const breadcrumbs: string[] = [];

      // 1. Scrape metric / KPI cards
      document.querySelectorAll(".glass-card, [data-testid='kpi-card'], .rounded-2xl, .rounded-xl").forEach((card) => {
        const textEls = card.querySelectorAll("p, span, h2, h3, h4, div");
        let foundLabel = "";
        let foundValue = "";

        textEls.forEach((el) => {
          const txt = el.textContent?.trim() || "";
          if (!foundLabel && txt.length > 2 && txt.length < 35 && !txt.match(/^(LKR|\$|\d|Total)/i) && !el.children.length) {
            foundLabel = txt;
          } else if (!foundValue && (txt.includes("LKR") || txt.match(/^\d+([\.,]\d+)?(\s*[KMkBb%])?$/) || txt.match(/^(Active|Blocked|Expired|Pending|Approved)$/i))) {
            foundValue = txt;
          }
        });

        if (foundLabel && foundValue && !kpis.some(k => k.label === foundLabel)) {
          kpis.push({ label: foundLabel, value: foundValue });
        }
      });

      // 2. Scrape all visible data tables (up to 200 rows across tables)
      const tables = document.querySelectorAll("table");
      tables.forEach((table) => {
        const headers: string[] = [];
        table.querySelectorAll("thead th").forEach((th) => {
          const hText = th.textContent?.trim() || "";
          if (hText && !hText.toLowerCase().includes("action")) {
            headers.push(hText);
          }
        });

        table.querySelectorAll("tbody tr").forEach((tr) => {
          if (tableRows.length >= 200) return;
          const tds = tr.querySelectorAll("td");
          if (tds.length > 0) {
            const row: Record<string, string> = {};
            let hasData = false;
            tds.forEach((td, cIdx) => {
              const h = headers[cIdx] || `col_${cIdx}`;
              const val = td.textContent?.trim() || "";
              if (val && !val.toLowerCase().includes("action")) {
                row[h] = val;
                hasData = true;
              }
            });
            if (hasData) tableRows.push(row);
          }
        });
      });

      // 3. Scrape visible form inputs/selects/textareas from modals or detail forms
      document.querySelectorAll("input, select, textarea").forEach((el: any) => {
        const type = (el.type || "").toLowerCase();
        if (type === "hidden" || type === "submit" || type === "button") return;
        const val = el.value?.trim() || "";
        const name = el.name || el.id || el.placeholder || "field";
        const labelEl = el.closest("label") || el.parentElement?.querySelector("label") || document.querySelector(`label[for='${el.id}']`);
        const label = labelEl?.textContent?.trim() || el.placeholder || name;

        if (label && label.length < 50) {
          formFields.push({ name, label, value: val });
        }
      });

      // 4. Scrape breadcrumbs
      document.querySelectorAll("nav ol li, [aria-label='breadcrumb'] li, .breadcrumb").forEach((bc) => {
        const txt = bc.textContent?.trim() || "";
        if (txt && !breadcrumbs.includes(txt)) {
          breadcrumbs.push(txt);
        }
      });

      return {
        kpis: kpis.slice(0, 10),
        tableRows,
        formFields: formFields.slice(0, 30),
        breadcrumbs,
      };
    } catch {
      return { kpis: [], tableRows: [], formFields: [], breadcrumbs: [] };
    }
  };

  useEffect(() => {
    if (isOpen) {
      const h = harvestScreenData();
      setHarvestStats({ rows: h.tableRows.length, kpis: h.kpis.length, formFields: h.formFields.length });
    }
  }, [isOpen, pageContext.route]);

  // Dynamic contextual title for the assistant
  const copilotTitle = React.useMemo(() => {
    const route = pageContext.route || "";
    if (route.includes("finance")) return "Treasury & Fiscal AI Copilot";
    if (route.includes("inventory")) return "Supply Chain & Batch AI Copilot";
    if (route.includes("invoice-center")) return "Revenue & Receivables AI Copilot";
    if (route.includes("compliance")) return "NMRA Regulatory & QA Copilot";
    if (route.includes("control-center")) return "Governance & Security AI Copilot";
    if (pageContext.moduleName) return `${pageContext.moduleName} AI Copilot`;
    return "Pharma Enterprise AI Copilot";
  }, [pageContext.route, pageContext.moduleName]);

  // Synchronize active tab from context
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  // Handle route / module change: automatically reset stale summaries and docs
  useEffect(() => {
    if (prevRouteRef.current && prevRouteRef.current !== pageContext.route) {
      setSummary(null);
      setDocs(null);
    }
    prevRouteRef.current = pageContext.route;
  }, [pageContext.route]);

  // Clear conversation history
  const handleClearChat = () => {
    setMessages([]);
    setSummary(null);
    setDocs(null);
    toast.success("Conversation cleared. Ready for fresh queries.");
  };

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

      const screenData = harvestScreenData();
      const enrichedContext = {
        ...pageContext,
        activeData: pageContext.activeData || screenData.tableRows,
        kpis: screenData.kpis,
        count: pageContext.count || screenData.tableRows.length,
        formFields: screenData.formFields,
        breadcrumbs: screenData.breadcrumbs,
      };

      const res = await sendAiChatbotMessage(historyPayload, enrichedContext);
      if (res.success && res.reply) {
        const botMsg: ChatMessage = {
          id: `m-${Date.now()}`,
          role: "model",
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedActions: res.suggestedActions,
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

  // Settings Handlers
  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: "Please enter a valid Google Gemini API key first." });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await testGeminiApiKey(apiKeyInput, selectedModel);
      setTestResult(res);
      if (res.success) {
        toast.success(`Connected to Google ${selectedModel}!`);
      } else {
        toast.error("Failed to verify Google Gemini API key");
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || "Network error verifying API key." });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveSettings = () => {
    setGeminiApiKey(apiKeyInput.trim());
    setGeminiModel(selectedModel.trim());
    const active = hasActiveGeminiKey();
    setHasApiKey(active);
    setShowSettings(false);
    if (active) {
      toast.success(`Google Gemini Cloud activated with model ${selectedModel}`);
    } else {
      toast.info("Switched to Local Data Intelligence Mode");
    }
  };

  const handleClearKey = () => {
    setGeminiApiKey("");
    setApiKeyInput("");
    setHasApiKey(false);
    setTestResult(null);
    toast.info("Gemini API key cleared. Operating in Local Analytical Engine mode.");
  };

  // Generate page summary
  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const screenData = harvestScreenData();
      const res = await generateAiPageSummary({
        pageTitle: pageContext.pageTitle,
        route: pageContext.route || "/",
        activeData: pageContext.activeData || screenData.tableRows,
        kpis: screenData.kpis,
        count: pageContext.count || screenData.tableRows.length,
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
                {pageContext.moduleName || "Enterprise"} Copilot
                <span className="rounded-md bg-white/20 px-1 py-0.2 text-[9px] font-semibold text-white/90">
                  {hasApiKey ? "Gemini 2.5" : "AI Copilot"}
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
                        <h2 className="text-sm font-bold text-slate-900">{copilotTitle}</h2>
                        {hasApiKey ? (
                          <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
                            title="Connected to Google Gemini Cloud API. Click to change model or key."
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {selectedModel} (Cloud)
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                            title="Running Local Analytical Engine. Click to connect Google Gemini Cloud API."
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                            Data Intelligence (Local)
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-500 truncate max-w-xs font-medium">
                          Active: <span className="font-semibold text-slate-700">{pageContext.pageTitle}</span>
                        </p>
                        {harvestStats.rows > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.2 text-[10px] font-semibold text-blue-700 border border-blue-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                            {harvestStats.rows} Records
                          </span>
                        )}
                        {harvestStats.formFields > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.2 text-[10px] font-semibold text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            {harvestStats.formFields} Form Inputs
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer border ${
                        showSettings
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 shadow-2xs"
                      }`}
                      title="AI Model & Google Gemini API Settings"
                    >
                      <Settings className="h-3 w-3" />
                      <span>{showSettings ? "Assistant" : "Settings"}</span>
                    </button>
                    <button
                      onClick={handleClearChat}
                      className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200/80 bg-white shadow-2xs"
                      title="Clear conversation history and reset context"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Clear</span>
                    </button>
                    <button
                      onClick={closeCopilot}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                      title="Close Copilot (Esc)"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* 3 Navigation Tabs (hidden when Settings is open) */}
                {!showSettings && (
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
                      <span>Live Chat</span>
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
                )}
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5">

                {/* ── SETTINGS VIEW (WHEN ACTIVE) ── */}
                {showSettings && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Status Card */}
                    <div className={`rounded-2xl p-4 border ${
                      hasApiKey
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                        : "bg-purple-50/70 border-purple-200 text-purple-900"
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-xs">
                        {hasApiKey ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Google Gemini Cloud Active ({selectedModel})</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                            <span>Data Intelligence Local Engine Active</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed opacity-90">
                        {hasApiKey
                          ? `Your Pharma Copilot communicates directly with Google's latest ${selectedModel} model with real-time multi-turn reasoning and live table telemetry.`
                          : "Running in zero-config offline mode with built-in mathematical calculations, record lookups, batch expiry audits, and SOP guides."}
                      </p>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 text-indigo-600" />
                        AI Model Selection
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          {
                            id: "gemini-2.5-flash",
                            name: "Gemini 2.5 Flash",
                            desc: "Google's Latest Recommended Flagship — Ultra-fast, high precision",
                            tag: "Latest Default",
                            recommended: true,
                          },
                          {
                            id: "gemini-2.0-flash",
                            name: "Gemini 2.0 Flash",
                            desc: "Fast multimodal reasoning and structured outputs",
                            tag: "Stable",
                          },
                          {
                            id: "gemini-1.5-flash",
                            name: "Gemini 1.5 Flash",
                            desc: "Lightweight, high-frequency queries and summaries",
                            tag: "Fast",
                          },
                          {
                            id: "gemini-1.5-pro",
                            name: "Gemini 1.5 Pro",
                            desc: "Maximum reasoning capacity for massive complex datasets",
                            tag: "Deep Reasoning",
                          },
                        ].map((m) => (
                          <div
                            key={m.id}
                            onClick={() => setSelectedModel(m.id)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between ${
                              selectedModel === m.id
                                ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/30"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{m.name}</span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                                  m.recommended ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {m.tag}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-500">{m.desc}</p>
                            </div>
                            <input
                              type="radio"
                              name="gemini_model_choice"
                              checked={selectedModel === m.id}
                              onChange={() => setSelectedModel(m.id)}
                              className="mt-1 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* API Key Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Key className="h-4 w-4 text-indigo-600" />
                          Google Gemini API Key
                        </label>
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <span>Get Free Key</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          type={showKeyVisibility ? "text" : "password"}
                          value={apiKeyInput}
                          onChange={(e) => {
                            setApiKeyInput(e.target.value);
                            setTestResult(null);
                          }}
                          placeholder="AIzaSy..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeyVisibility(!showKeyVisibility)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showKeyVisibility ? "Hide key" : "Show key"}
                        >
                          {showKeyVisibility ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Saved in your browser's private local storage. Never shared with any third-party.
                      </p>
                    </div>

                    {/* Test Connection */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTestConnection}
                          disabled={!apiKeyInput.trim() || isTestingKey}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {isTestingKey ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Testing Connection...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="h-3.5 w-3.5" />
                              <span>Test Google API Connection</span>
                            </>
                          )}
                        </button>
                        {apiKeyInput && (
                          <button
                            type="button"
                            onClick={handleClearKey}
                            className="rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {testResult && (
                        <div className={`rounded-xl p-3 text-xs flex items-start gap-2 border ${
                          testResult.success
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}>
                          {testResult.success ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <span className="leading-relaxed">{testResult.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Save Buttons */}
                    <div className="pt-4 border-t border-slate-200 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:scale-101 active:scale-99 transition-all cursor-pointer"
                      >
                        Save Configuration
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSettings(false)}
                        className="rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {/* ── TAB 1: LIVE CHATBOT ── */}
                {!showSettings && currentTab === "chat" && (
                  <div className="flex flex-col h-full space-y-4">
                    {messages.length === 0 && (
                      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white p-5 text-center my-auto">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 mb-3">
                          <Bot className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {copilotTitle}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                          Ask me anything about <span className="font-semibold text-slate-700">{pageContext.pageTitle}</span>, financial calculations, batch inventory, NMRA compliance, or operational workflows.
                        </p>

                        {/* Quick Prompts */}
                        <div className="mt-4 flex flex-col gap-1.5 text-left">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Suggested Inquiries
                          </span>
                          {(pageContext.route?.includes("finance")
                            ? [
                                `Analyze fiscal health and cash positions on ${pageContext.pageTitle}`,
                                "Calculate gross profit vs net profit margin performance",
                                "Summarize overdue receivables and pending payment obligations",
                                "Audit trial balance and general ledger reconciliation",
                              ]
                            : pageContext.route?.includes("inventory")
                            ? [
                                `Check stock levels and batch movements on ${pageContext.pageTitle}`,
                                "Which product batches expire within the next 30 days?",
                                "Identify warehouse locations below safety reorder levels",
                                "Verify Goods Receipt Notes (GRN) posting status",
                              ]
                            : pageContext.route?.includes("invoice-center")
                            ? [
                                `Review customer collections and aging on ${pageContext.pageTitle}`,
                                "Which accounts are currently exceeding approved credit limits?",
                                "What is our current receipt collection efficiency?",
                                "Explain billing approval and credit note procedures",
                              ]
                            : pageContext.route?.includes("compliance")
                            ? [
                                `Audit NMRA regulatory status on ${pageContext.pageTitle}`,
                                "Check batches currently under quality quarantine hold",
                                "Review active product registration license expiries",
                                "Generate CAPA guidelines for batch inspection failure",
                              ]
                            : [
                                `Summarize active configuration on ${pageContext.pageTitle}`,
                                "Review user branch access and role permission matrix",
                                "Explain system security policies and audit trails",
                                "What are the mandatory compliance settings for this module?",
                              ]
                          ).map((prompt, i) => (
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
                            {/* Clickable Follow-up Suggestions */}
                            {msg.role === "model" && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                                <span className="text-[10px] font-bold text-slate-400 w-full flex items-center gap-1">
                                  <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                                  Suggested Inquiries:
                                </span>
                                {msg.suggestedActions.map((action, aIdx) => (
                                  <button
                                    key={aIdx}
                                    onClick={() => handleSendPrompt(action)}
                                    className="text-[11px] font-medium text-indigo-700 bg-white hover:bg-indigo-50 hover:text-indigo-900 border border-indigo-200/80 rounded-full px-2.5 py-1 transition-all shadow-2xs hover:scale-102 cursor-pointer flex items-center gap-1"
                                  >
                                    <span>{action}</span>
                                    <ArrowRight className="h-2.5 w-2.5 text-indigo-400" />
                                  </button>
                                ))}
                              </div>
                            )}
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
                          <span>{hasApiKey ? `Google ${selectedModel} is analyzing ERP data...` : "Pharma AI engine is computing analysis..."}</span>
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
                          Analyzing {pageContext.pageTitle} telemetry with {hasApiKey ? `Google ${selectedModel}` : "AI Copilot"}...
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

              {/* Chat Input Bar (visible on chat tab when not in settings mode) */}
              {currentTab === "chat" && !showSettings && (
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
