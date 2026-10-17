import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  ServerCrash,
  FileWarning,
  ShieldAlert,
  KeyRound,
  Wrench,
  AlertOctagon,
  AlertCircle,
  Timer,
  Network,
  Clock,
  ArrowLeft,
  Home,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  ExternalLink,
  Layers,
  Building2,
  Boxes,
  Receipt,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

export interface ModernErrorPageProps {
  /**
   * HTTP error code to display (e.g. 404, 500, 422, 403, 401, 503)
   */
  code?: number | string;
  /**
   * Custom title override
   */
  title?: string;
  /**
   * Custom description / message override
   */
  message?: string;
  /**
   * Error instance passed from Error Boundary
   */
  error?: Error;
  /**
   * React ErrorInfo passed from Error Boundary
   */
  errorInfo?: React.ErrorInfo;
  /**
   * Optional callback to reset error boundary state
   */
  onReset?: () => void;
}

interface ErrorConfig {
  code: string;
  badge: string;
  title: string;
  subtitle: string;
  suggestion: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  gradientText: string;
  badgeBg: string;
  glowColor: string;
  borderColor: string;
}

const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  "404": {
    code: "404",
    badge: "404 • ROUTE RESOLUTION FAILED",
    title: "Page or Resource Not Found",
    subtitle:
      "The enterprise URL or resource you requested could not be located on this server. It may have been moved, renamed, or temporarily decommissioned.",
    suggestion:
      "Verify the route spelling, verify your branch tenancy, or navigate back to the operational module switchboard.",
    icon: Compass,
    accentColor: "#6366f1",
    gradientText: "from-indigo-400 via-indigo-600 to-violet-600",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
    glowColor: "rgba(99, 102, 241, 0.18)",
    borderColor: "border-indigo-500/20",
  },
  "500": {
    code: "500",
    badge: "500 • INTERNAL SYSTEM EXCEPTION",
    title: "Internal Engine Anomaly",
    subtitle:
      "An unhandled operational condition disrupted the application runtime. Server telemetry has flagged this incident for engineering review.",
    suggestion:
      "Attempt to reload the current route or reset local cache. If the condition persists, notify your technical operations supervisor.",
    icon: ServerCrash,
    accentColor: "#f43f5e",
    gradientText: "from-rose-500 via-red-600 to-pink-600",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    glowColor: "rgba(244, 63, 94, 0.18)",
    borderColor: "border-rose-500/20",
  },
  "422": {
    code: "422",
    badge: "422 • UNPROCESSABLE BUSINESS ENTITY",
    title: "Semantic Validation Mismatch",
    subtitle:
      "The request payload syntax was valid, but its business logic, fiscal balance equations, or statutory field constraints failed validation rules.",
    suggestion:
      "Verify all required tax rates, account ledger codes, product batch numbers, or debit/credit balancing totals before resubmitting.",
    icon: FileWarning,
    accentColor: "#f59e0b",
    gradientText: "from-amber-400 via-amber-600 to-orange-600",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    glowColor: "rgba(245, 158, 11, 0.18)",
    borderColor: "border-amber-500/20",
  },
  "403": {
    code: "403",
    badge: "403 • ENTERPRISE PRIVILEGE RESTRICTION",
    title: "Security Clearance Denied",
    subtitle:
      "Your corporate user credentials or current assigned role lack authorization clearance to access this branch, ledger, or administrative module.",
    suggestion:
      "Consult your Company Administrator in the Control Center to request permission assignment or verify your branch access matrix.",
    icon: ShieldAlert,
    accentColor: "#a855f7",
    gradientText: "from-purple-500 via-purple-600 to-fuchsia-600",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    glowColor: "rgba(168, 85, 247, 0.18)",
    borderColor: "border-purple-500/20",
  },
  "401": {
    code: "401",
    badge: "401 • AUTHENTICATION TOKEN ELAPSED",
    title: "Session Expired or Unauthorized",
    subtitle:
      "Your cryptographic authentication token has expired or was invalidated. Active credentials are required to maintain secure tenant access.",
    suggestion:
      "Authenticate through the corporate login gateway to establish a refreshed secure access token and resume your session.",
    icon: KeyRound,
    accentColor: "#06b6d4",
    gradientText: "from-cyan-400 via-sky-600 to-blue-600",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
    glowColor: "rgba(6, 182, 212, 0.18)",
    borderColor: "border-cyan-500/20",
  },
  "503": {
    code: "503",
    badge: "503 • SERVICE MAINTENANCE NODE",
    title: "Service Temporarily Unavailable",
    subtitle:
      "This service endpoint or database cluster replica is undergoing scheduled maintenance, scaling rebalancing, or migration procedures.",
    suggestion:
      "Data integrity and background queues remain safeguarded. The node will automatically resume normal operations momentarily.",
    icon: Wrench,
    accentColor: "#10b981",
    gradientText: "from-emerald-400 via-emerald-600 to-teal-600",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    glowColor: "rgba(16, 185, 129, 0.18)",
    borderColor: "border-emerald-500/20",
  },
  "429": {
    code: "429",
    badge: "429 • TRANSACTION RATE THROTTLED",
    title: "Request Rate Limit Exceeded",
    subtitle:
      "Too many transaction operations were dispatched within a brief observation window. Cluster rate protection has engaged.",
    suggestion:
      "Pause automated batch imports for 30–60 seconds before executing subsequent high-volume sync commands.",
    icon: Timer,
    accentColor: "#eab308",
    gradientText: "from-yellow-400 via-amber-500 to-orange-500",
    badgeBg: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800",
    glowColor: "rgba(234, 179, 8, 0.18)",
    borderColor: "border-yellow-500/20",
  },
  "400": {
    code: "400",
    badge: "400 • MALFORMED REQUEST DATA",
    title: "Bad Request Format",
    subtitle:
      "The server could not interpret the request due to malformed syntax, corrupted parameters, or invalid header formatting.",
    suggestion:
      "Check input parameters for illegal characters, verify request schema, or reload the form to discard invalid cached state.",
    icon: AlertCircle,
    accentColor: "#ef4444",
    gradientText: "from-red-400 via-rose-500 to-amber-600",
    badgeBg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    glowColor: "rgba(239, 68, 68, 0.18)",
    borderColor: "border-red-500/20",
  },
  "502": {
    code: "502",
    badge: "502 • GATEWAY NODE UNREACHABLE",
    title: "Bad Gateway Connection",
    subtitle:
      "The edge proxy received an invalid or null response from the upstream ERP backend daemon container.",
    suggestion:
      "Ensure the core backend container is running, check reverse proxy routing, or contact infrastructure engineering.",
    icon: Network,
    accentColor: "#3b82f6",
    gradientText: "from-blue-400 via-indigo-500 to-cyan-500",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    glowColor: "rgba(59, 130, 246, 0.18)",
    borderColor: "border-blue-500/20",
  },
  "504": {
    code: "504",
    badge: "504 • GATEWAY EXECUTION TIMEOUT",
    title: "Gateway Response Timeout",
    subtitle:
      "The backend microservice did not respond within the allotted gateway timeout window while processing this enterprise query.",
    suggestion:
      "Deep ledger consolidations or multi-branch batch calculations may require narrower filter date ranges.",
    icon: Clock,
    accentColor: "#64748b",
    gradientText: "from-slate-400 via-slate-600 to-indigo-600",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    glowColor: "rgba(100, 116, 139, 0.18)",
    borderColor: "border-slate-500/20",
  },
};

const DEFAULT_CONFIG: ErrorConfig = {
  code: "ERR",
  badge: "SYSTEM STATUS NOTICE",
  title: "Unexpected Operation Anomaly",
  subtitle:
    "An unforeseen response code or system state was encountered during execution of the requested operation.",
  suggestion:
    "Check network connectivity, inspect the diagnostic telemetry report below, or return to the main application interface.",
  icon: AlertOctagon,
  accentColor: "#6366f1",
  gradientText: "from-indigo-400 via-indigo-600 to-violet-600",
  badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
  glowColor: "rgba(99, 102, 241, 0.18)",
  borderColor: "border-indigo-500/20",
};

export const ModernErrorPage: React.FC<ModernErrorPageProps> = ({
  code: propCode,
  title: propTitle,
  message: propMessage,
  error,
  errorInfo,
  onReset,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();

  // Resolve initial code from props, route params, query param, or location state
  const initialCode = useMemo(() => {
    if (propCode) return String(propCode);
    if (params.code) return params.code;
    const qCode = searchParams.get("code");
    if (qCode) return qCode;
    if (location.state && typeof location.state === "object" && "code" in location.state) {
      return String((location.state as any).code);
    }
    return "404";
  }, [propCode, params.code, searchParams, location.state]);

  // Selected code for the interactive code switcher
  const [activeCode, setActiveCode] = useState<string>(initialCode);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync active code if route param changes
  useEffect(() => {
    setActiveCode(initialCode);
  }, [initialCode]);

  // Generate a persistent trace ID for this session/render
  const traceId = useMemo(() => {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TRC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${rand}`;
  }, []);

  const config = ERROR_CONFIGS[activeCode] || {
    ...DEFAULT_CONFIG,
    code: activeCode,
    badge: `${activeCode} • HTTP STATUS ANOMALY`,
    title: `HTTP ${activeCode} Incident`,
  };

  const displayTitle = propTitle || config.title;
  const displaySubtitle = propMessage || (error ? error.message : config.subtitle);
  const IconComponent = config.icon;

  const handleCopyDiagnostics = () => {
    const diagnostics = {
      status_code: activeCode,
      title: displayTitle,
      path: location.pathname + location.search,
      trace_id: traceId,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      error_message: error ? error.message : undefined,
      error_stack: error ? error.stack : undefined,
      component_stack: errorInfo ? errorInfo.componentStack : undefined,
    };

    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
    setCopied(true);
    toast.success("Diagnostics telemetry copied to clipboard", {
      description: `Trace ID: ${traceId}`,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/modules");
    }
  };

  const handleReload = () => {
    if (onReset) {
      onReset();
    }
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Background Architectural Canvas & Dynamic Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle dot matrix grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-30" />

        {/* Ambient Top Glow anchored to active status accent */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] rounded-full blur-[140px] opacity-60 transition-all duration-700"
          style={{ background: config.glowColor }}
        />

        {/* Secondary ambient floating rim */}
        <div
          className="absolute -bottom-40 right-10 w-[500px] h-[360px] rounded-full blur-[160px] opacity-40 transition-all duration-700"
          style={{ background: config.glowColor }}
        />
      </div>

      {/* Top Enterprise Navigation Header */}
      <header className="relative z-10 w-full px-6 py-5 sm:px-10 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md bg-white/40 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <Link
            to="/modules"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/25">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-fira font-extrabold text-base tracking-wider uppercase text-slate-900 dark:text-white">
                PIXANDCO
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase -mt-0.5">
                Enterprise Cloud
              </span>
            </div>
          </Link>
          <span className="hidden sm:inline-block h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-2" />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cluster Operational
          </span>
        </div>

        {/* Trace ID Tag & Quick Link */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Trace:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{traceId}</span>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Error Presentation Card */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col items-center justify-center">
        {/* Interactive Error Code Switcher Pills (User requirement: test and handle 404, 500, 422, and all codes) */}
        <div className="mb-8 w-full flex flex-col items-center">
          <div className="text-[11px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Interactive Error Code Inspector</span>
          </div>
          <div className="inline-flex p-1 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs gap-1 flex-wrap justify-center max-w-full">
            {Array.from(new Set([activeCode, "404", "500", "422", "403", "401", "503", "429", "400", "502", "504"])).map((codeKey) => {
              const isSelected = activeCode === codeKey;
              const cfg = ERROR_CONFIGS[codeKey] || DEFAULT_CONFIG;
              return (
                <button
                  key={codeKey}
                  onClick={() => {
                    setActiveCode(codeKey);
                    // update URL silently for shareability
                    window.history.replaceState(null, "", `/error/${codeKey}`);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm scale-105"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: cfg.accentColor }}
                  />
                  <span>{codeKey}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Central Glassmorphic Hero Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCode}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="w-full relative rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-10 md:p-12 overflow-hidden text-center"
          >
            {/* Top Glowing Ambient Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r opacity-90 transition-all duration-500"
              style={{
                backgroundImage: `linear-gradient(to right, transparent, ${config.accentColor}, transparent)`,
              }}
            />

            {/* Giant Watermark Background Number */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.035] dark:opacity-[0.06] font-black text-[180px] sm:text-[240px] md:text-[280px] tracking-tighter font-fira">
              {config.code}
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Category Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border mb-6 transition-all duration-300 ${config.badgeBg}`}
              >
                <IconComponent className="w-4 h-4 animate-pulse" />
                <span className="font-fira">{config.badge}</span>
              </div>

              {/* Large Stylized Status Code Typography */}
              <div className="relative mb-4 select-none">
                <span
                  className={`block text-7xl sm:text-8xl md:text-9xl font-black font-fira tracking-tight bg-gradient-to-br ${config.gradientText} bg-clip-text text-transparent drop-shadow-sm`}
                >
                  {config.code}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-fira text-slate-900 dark:text-white tracking-tight mb-3">
                {displayTitle}
              </h1>

              {/* Subtitle / Description */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed mb-6">
                {displaySubtitle}
              </p>

              {/* Suggestion / Remediation Box */}
              <div className="w-full max-w-2xl p-4 sm:p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 mb-8 text-left flex items-start gap-3.5 shadow-xs">
                <div
                  className="p-2 rounded-xl mt-0.5 text-white shadow-xs shrink-0"
                  style={{ backgroundColor: config.accentColor }}
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                    Recommended Resolution
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {config.suggestion}
                  </p>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
                <button
                  onClick={() => navigate("/modules")}
                  className="flex-1 min-w-[140px] px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm tracking-wide shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 font-fira"
                >
                  <Home className="w-4 h-4" />
                  <span>Modules</span>
                </button>

                <button
                  onClick={handleGoBack}
                  className="flex-1 min-w-[140px] px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 active:scale-95 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2 font-fira shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>

                <button
                  onClick={handleReload}
                  title="Reload application route"
                  className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 active:scale-95 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all flex items-center justify-center shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Toggle Diagnostics Drawer Button */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={() => setShowDiagnostics((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{showDiagnostics ? "Hide" : "Show"} Telemetry Diagnostics</span>
                  {showDiagnostics ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={handleCopyDiagnostics}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Trace</span>
                    </>
                  )}
                </button>
              </div>

              {/* Expandable Technical Diagnostics Accordion */}
              {showDiagnostics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 text-left font-mono text-[11px] overflow-x-auto shadow-inner border border-slate-800"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 mb-3 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-slate-500">HTTP Status: </span>
                      <span className="text-amber-400 font-bold">{activeCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Trace ID: </span>
                      <span className="text-emerald-400">{traceId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Route Path: </span>
                      <span className="text-indigo-300">{location.pathname}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Timestamp: </span>
                      <span>{new Date().toISOString()}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-2">
                      <span className="text-rose-400 font-bold">Exception: </span>
                      <span className="text-rose-200">{error.name}: {error.message}</span>
                      {error.stack && (
                        <pre className="mt-2 text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          {error.stack}
                        </pre>
                      )}
                    </div>
                  )}

                  {errorInfo && errorInfo.componentStack && (
                    <div className="mt-2">
                      <span className="text-slate-500 font-bold">Component Stack: </span>
                      <pre className="mt-1 text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  <div className="mt-2 text-[10px] text-slate-500">
                    User Agent: {navigator.userAgent}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Enterprise Quick-Module Shortcuts Grid */}
        <div className="w-full mt-10">
          <div className="text-center mb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-slate-400">
              Quick Navigation Shortcuts
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
            <Link
              to="/control-center/dashboard"
              className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col items-center text-center"
            >
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-fira">
                Control Center
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Admin & Users</span>
            </Link>

            <Link
              to="/finance/dashboard"
              className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 hover:shadow-md transition-all group flex flex-col items-center text-center"
            >
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-fira">
                Finance & GL
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Accounts & Books</span>
            </Link>

            <Link
              to="/inventory/dashboard"
              className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/50 hover:shadow-md transition-all group flex flex-col items-center text-center"
            >
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                <Boxes className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-fira">
                Inventory
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Stock & Warehouses</span>
            </Link>

            <Link
              to="/invoice-center/dashboard"
              className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/50 hover:shadow-md transition-all group flex flex-col items-center text-center"
            >
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-fira">
                Invoice Center
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Billing & Orders</span>
            </Link>

            <Link
              to="/platform-admin/dashboard"
              className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-rose-500/50 hover:shadow-md transition-all group flex flex-col items-center text-center col-span-2 sm:col-span-1"
            >
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-2 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-fira">
                Platform Admin
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Global Cluster</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer info bar */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md bg-white/30 dark:bg-slate-950/30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} PIXANDCO Enterprise Operating System. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
            <a
              href="https://erp.pixandco.lk"
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              System Health <ExternalLink className="w-3 h-3" />
            </a>
            <span>&bull;</span>
            <span>Security Protocol TLS 1.3</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernErrorPage;
