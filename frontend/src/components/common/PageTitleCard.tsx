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
    iconBg: "bg-blue-600/10",
    iconColor: "text-blue-600",
    activeText: "text-blue-600",
  },
  indigo: {
    iconBg: "bg-indigo-600/10",
    iconColor: "text-indigo-600",
    activeText: "text-indigo-600",
  },
  emerald: {
    iconBg: "bg-emerald-600/10",
    iconColor: "text-emerald-600",
    activeText: "text-emerald-600",
  },
  amber: {
    iconBg: "bg-amber-600/10",
    iconColor: "text-amber-600",
    activeText: "text-amber-600",
  },
  purple: {
    iconBg: "bg-purple-600/10",
    iconColor: "text-purple-600",
    activeText: "text-purple-600",
  },
  cyan: {
    iconBg: "bg-cyan-600/10",
    iconColor: "text-cyan-600",
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
    <div className={`w-full mb-6 ${className}`}>
      {/* ── BREADCRUMB / BACK NAVIGATION ── */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
        {hasBack ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
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

      {/* ── SECTION TITLE BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Icon Badge & Title / Description */}
        <div className="flex items-center gap-3.5">
          {Icon ? (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${currentAccent.iconBg} ${currentAccent.iconColor} shadow-2xs`}
            >
              <Icon className="h-6 w-6 stroke-[2.2]" />
            </div>
          ) : hasBack && typeof backAction !== "object" ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}

          {typeof backAction === "object" && backAction}

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
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
  );
};

export default PageTitleCard;
