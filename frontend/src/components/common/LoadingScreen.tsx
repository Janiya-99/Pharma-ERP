import React from "react";

interface LoadingScreenProps {
  text?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  mode?: "fullscreen" | "page" | "minimal";
  theme?: "light" | "dark" | "auto";
}

/**
 * LoadingScreen - PIXANDCO Pure White Modern Text Animation Loader
 * Features pure white background, animated PIXANDCO typography, and zero latency.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text,
  badge = "ENTERPRISE PHARMA SYSTEM",
  title = "PIXANDCO",
  subtitle = "Intelligent healthcare & enterprise operations",
  mode = "fullscreen",
}) => {
  const isPage = mode === "page";
  const displaySubtitle = text || subtitle;

  const content = (
    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
      {/* Top Tracked Subtitle with Minimalist Pill */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
        <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.32em] text-slate-400 dark:text-slate-400 uppercase select-none font-fira">
          {badge}
        </span>
      </div>

      {/* Main PIXANDCO Animated Wordmark */}
      <div className="relative my-2 select-none">
        <h1 className="font-fira font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-[0.24em] uppercase text-slate-900 animate-text-shine animate-letter-pulse">
          {title}
        </h1>
      </div>

      {/* Modern Hairline Separator with Light Sweep */}
      <div className="my-5 sm:my-6 w-28 sm:w-36 md:w-48 h-[1.5px] bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-600 to-transparent animate-sweep-line" />
      </div>

      {/* Sleek Subtitle */}
      <p className="font-fira text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wider max-w-md select-none">
        {displaySubtitle}
      </p>

      {/* Micro Subtle Loading Indicator Bar */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="w-20 h-[2px] bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500 rounded-full animate-sweep-line" />
        </div>
        <span className="text-[9.5px] font-fira uppercase tracking-[0.22em] text-slate-400 dark:text-slate-400 font-semibold">
          Loading workspace
        </span>
      </div>
    </div>
  );

  if (isPage) {
    return (
      <div className="w-full min-h-[50vh] py-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs transition-all duration-300">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen w-full items-center justify-center bg-white dark:bg-slate-950 text-slate-900 transition-colors duration-300">
      {/* Soft Ambient Center Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950 pointer-events-none" />
      {content}
    </div>
  );
};

export default LoadingScreen;
