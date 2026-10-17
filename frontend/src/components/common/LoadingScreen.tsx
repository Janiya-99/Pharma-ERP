import React, { useEffect, useState } from "react";

interface LoadingScreenProps {
  text?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  mode?: "fullscreen" | "page" | "minimal";
  theme?: "light" | "dark" | "auto";
  maxWaitMs?: number;
}

/**
 * LoadingScreen - Ultra-fast, zero-friction loader with fixed max time
 * Automatically ensures page transitions are silky smooth without jarring flashes.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text,
  badge = "ENTERPRISE OPERATIONS",
  title = "PIXANDCO",
  subtitle = "Loading view...",
  mode = "fullscreen",
  maxWaitMs = 600,
}) => {
  const [timedOut, setTimedOut] = useState(false);

  // Fixed time limit: never allow loader to hang or block the user for more than maxWaitMs
  useEffect(() => {
    if (mode === "fullscreen") {
      const timer = setTimeout(() => {
        setTimedOut(true);
      }, maxWaitMs);
      return () => clearTimeout(timer);
    }
  }, [mode, maxWaitMs]);

  if (timedOut && mode === "fullscreen") {
    return null;
  }

  // Modern page skeleton for smooth in-page routing without giant flashing text
  if (mode === "page") {
    return (
      <div className="w-full space-y-6 p-4 sm:p-6 animate-pulse">
        {/* Top header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-3.5 w-72 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>

        {/* Metric cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-6 w-6 bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Content table skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between gap-4 py-2.5">
              <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/6 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/5 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/8 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "minimal") {
    return (
      <div className="flex items-center justify-center p-6 text-slate-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Fullscreen initial app bootstrap loader (with clean subtle brand mark & auto-fade)
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen w-full items-center justify-center bg-white dark:bg-slate-950 text-slate-900 transition-opacity duration-300">
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* Subtle glowing pill */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
          <span className="text-[10px] font-semibold tracking-[0.28em] text-slate-400 uppercase select-none font-fira">
            {badge}
          </span>
        </div>

        {/* Clean, refined wordmark */}
        <h1 className="font-fira font-bold text-3xl sm:text-4xl tracking-[0.2em] uppercase text-slate-900 dark:text-white select-none">
          {title}
        </h1>

        {/* Minimal Hairline Progress Bar */}
        <div className="my-4 w-32 h-[2px] bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 rounded-full animate-sweep-line" />
        </div>

        {/* Subtitle */}
        <p className="font-fira text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide select-none">
          {text || subtitle}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
