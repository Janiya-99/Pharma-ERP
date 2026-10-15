import React from "react";
import { ArrowLeft, Sparkles, Quote, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export interface PageTitleCardProps {
  title: string | React.ReactNode;
  description?: string;
  moduleTag?: string;
  icon?: LucideIcon;
  backTo?: string;
  onBack?: () => void;
  backAction?: React.ReactNode;
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
    tagBg: "bg-blue-50/80 text-blue-700 border-blue-200/60",
    glow1: "bg-blue-400/15",
    glow2: "bg-indigo-400/10",
    iconBg: "bg-blue-600 text-white shadow-blue-500/20",
    quoteIcon: "text-blue-500",
  },
  indigo: {
    tagBg: "bg-indigo-50/80 text-indigo-700 border-indigo-200/60",
    glow1: "bg-indigo-400/15",
    glow2: "bg-purple-400/10",
    iconBg: "bg-indigo-600 text-white shadow-indigo-500/20",
    quoteIcon: "text-indigo-500",
  },
  emerald: {
    tagBg: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60",
    glow1: "bg-emerald-400/15",
    glow2: "bg-teal-400/10",
    iconBg: "bg-emerald-600 text-white shadow-emerald-500/20",
    quoteIcon: "text-emerald-500",
  },
  amber: {
    tagBg: "bg-amber-50/80 text-amber-700 border-amber-200/60",
    glow1: "bg-amber-400/15",
    glow2: "bg-orange-400/10",
    iconBg: "bg-amber-600 text-white shadow-amber-500/20",
    quoteIcon: "text-amber-500",
  },
  purple: {
    tagBg: "bg-purple-50/80 text-purple-700 border-purple-200/60",
    glow1: "bg-purple-400/15",
    glow2: "bg-pink-400/10",
    iconBg: "bg-purple-600 text-white shadow-purple-500/20",
    quoteIcon: "text-purple-500",
  },
  cyan: {
    tagBg: "bg-cyan-50/80 text-cyan-700 border-cyan-200/60",
    glow1: "bg-cyan-400/15",
    glow2: "bg-blue-400/10",
    iconBg: "bg-cyan-600 text-white shadow-cyan-500/20",
    quoteIcon: "text-cyan-500",
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
  quote,
  accent = "indigo",
  actions,
  children,
  className = "",
}) => {
  const navigate = useNavigate();
  const currentAccent = accentStyles[accent] || accentStyles.indigo;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

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

      {/* ── PHARMACEUTICAL LATTICE WATERMARK ── */}
      <div className="absolute right-0 top-0 bottom-0 w-80 lg:w-96 opacity-[0.045] pointer-events-none select-none text-slate-900 overflow-hidden">
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

      {/* ── HEADER CONTENT GRID ── */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Column: Title & Identity */}
        <div className="min-w-0 max-w-3xl flex items-start gap-4">
          {backAction ? (
            backAction
          ) : (backTo || onBack) ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-white/90 shadow-2xs hover:bg-slate-100 transition-all cursor-pointer mt-1"
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          ) : null}

          <div className="min-w-0">
            {moduleTag && (
              <div className="mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-2xs ${currentAccent.tagBg}`}
                >
                  <Sparkles className="w-3 h-3" />
                  {moduleTag}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className={`p-2.5 rounded-xl ${currentAccent.iconBg} shrink-0 hidden sm:flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {title}
                </h1>
                {description && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Quote */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {quote && (
            <div className="hidden xl:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs backdrop-blur-sm max-w-xs">
              <Quote className={`w-4 h-4 shrink-0 ${currentAccent.quoteIcon}`} />
              <div className="text-[11px] leading-tight text-slate-600">
                <span className="italic">"{quote.text}"</span>
                {quote.author && (
                  <span className="block font-semibold text-slate-800 mt-0.5">
                    — {quote.author}
                  </span>
                )}
              </div>
            </div>
          )}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {children && <div className="mt-4 relative z-10">{children}</div>}
    </div>
  );
};

export default PageTitleCard;
