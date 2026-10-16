import React from "react";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface PageTitleCardProps {
  title: string | React.ReactNode;
  description?: string;
  moduleTag?: string;
  icon?: LucideIcon;
  backTo?: string;
  onBack?: () => void;
  backAction?: React.ReactNode | (() => void);
  quote?: {
    text: string;
    author?: string;
  };
  accent?: "blue" | "indigo" | "emerald" | "amber" | "purple" | "cyan";
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const accentStyles = {
  blue: {
    tagBg: "bg-blue-50/90 text-blue-700 border-blue-200/70",
    glow1: "bg-blue-400/15",
    glow2: "bg-indigo-400/10",
    iconBg: "bg-blue-600 text-white shadow-blue-500/25",
    iconColor: "text-white",
    activeText: "text-blue-600",
  },
  indigo: {
    tagBg: "bg-indigo-50/90 text-indigo-700 border-indigo-200/70",
    glow1: "bg-indigo-400/15",
    glow2: "bg-purple-400/10",
    iconBg: "bg-indigo-600 text-white shadow-indigo-500/25",
    iconColor: "text-white",
    activeText: "text-indigo-600",
  },
  emerald: {
    tagBg: "bg-emerald-50/90 text-emerald-700 border-emerald-200/70",
    glow1: "bg-emerald-400/15",
    glow2: "bg-teal-400/10",
    iconBg: "bg-emerald-600 text-white shadow-emerald-500/25",
    iconColor: "text-white",
    activeText: "text-emerald-600",
  },
  amber: {
    tagBg: "bg-amber-50/90 text-amber-700 border-amber-200/70",
    glow1: "bg-amber-400/15",
    glow2: "bg-orange-400/10",
    iconBg: "bg-amber-600 text-white shadow-amber-500/25",
    iconColor: "text-white",
    activeText: "text-amber-600",
  },
  purple: {
    tagBg: "bg-purple-50/90 text-purple-700 border-purple-200/70",
    glow1: "bg-purple-400/15",
    glow2: "bg-pink-400/10",
    iconBg: "bg-purple-600 text-white shadow-purple-500/25",
    iconColor: "text-white",
    activeText: "text-purple-600",
  },
  cyan: {
    tagBg: "bg-cyan-50/90 text-cyan-700 border-cyan-200/70",
    glow1: "bg-cyan-400/15",
    glow2: "bg-blue-400/10",
    iconBg: "bg-cyan-600 text-white shadow-cyan-500/25",
    iconColor: "text-white",
    activeText: "text-cyan-600",
  },
};

export const PageTitleCard: React.FC<PageTitleCardProps> = ({
  title,
  description,
  moduleTag,
  icon: Icon,
  backTo,
  onBack,
  backAction,
  accent = "indigo",
  actions,
  children,
  className = "",
}) => {
  const navigate = useNavigate();
  const currentAccent = accentStyles[accent] || accentStyles.indigo;

  const handleBack = () => {
    if (typeof backAction === "function") {
      (backAction as () => void)();
    } else if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const hasBack = Boolean(backAction || onBack || backTo);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/30 backdrop-blur-xl p-5 sm:p-6 lg:p-7 shadow-xs transition-all duration-300 mb-6 ${className}`}
    >
      {/* ── AMBIENT GLOW EFFECTS ── */}
      <div
        className={`absolute -right-16 -top-16 w-80 h-80 rounded-full ${currentAccent.glow1} blur-3xl pointer-events-none`}
      />
      <div
        className={`absolute -right-8 -bottom-16 w-64 h-64 rounded-full ${currentAccent.glow2} blur-2xl pointer-events-none`}
      />

      {/* ── SUBTLE GEOMETRIC / PHARMACEUTICAL SVG WATERMARK ── */}
      <div className="absolute right-0 top-0 bottom-0 w-80 lg:w-96 opacity-[0.035] pointer-events-none select-none text-slate-900 overflow-hidden">
        <svg
          viewBox="0 0 400 200"
          className="w-full h-full object-cover -mr-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M 50,30 L 80,10 L 110,30 L 110,60 L 80,80 L 50,60 Z" />
          <path d="M 110,30 L 140,10 L 170,30 L 170,60 L 140,80 L 110,60 Z" />
          <path d="M 80,80 L 110,60 L 140,80 L 140,110 L 110,130 L 80,110 Z" />
          <path d="M 170,30 L 200,10 L 230,30 L 230,60 L 200,80 L 170,60 Z" />
          <circle cx="80" cy="10" r="3" fill="currentColor" />
          <circle cx="140" cy="10" r="3" fill="currentColor" />
          <circle cx="200" cy="10" r="3" fill="currentColor" />
          <path
            d="M 10,160 Q 60,160 80,140 T 110,160 T 140,120 T 170,180 T 200,160 L 390,160"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* ── HEADER CONTENT CONTAINER ── */}
      <div className="relative z-10">
        {/* Breadcrumb / Back Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2.5">
          {hasBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <span>{moduleTag || "Workspace"}</span>
          )}
          {moduleTag && hasBack && (
            <>
              <span>›</span>
              <span>{moduleTag}</span>
            </>
          )}
          <span>›</span>
          <span className={`${currentAccent.activeText} font-bold truncate max-w-[280px]`}>
            {typeof title === "string" ? title : "Details"}
          </span>
        </div>

        {/* Section Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Icon Badge & Title / Description */}
          <div className="flex items-center gap-3.5">
            {Icon ? (
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${currentAccent.iconBg} shadow-md`}
              >
                <Icon className="h-6 w-6 stroke-[2.2]" />
              </div>
            ) : hasBack && typeof backAction !== "object" ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}

            {typeof backAction === "object" && backAction}

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          {actions && (
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Optional sub-row */}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
};

export default PageTitleCard;
