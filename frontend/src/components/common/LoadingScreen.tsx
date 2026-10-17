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
 * LoadingScreen - Ultra-fast, minimal spinner & skeleton
 * Completely removes large blocking brand loaders and ensures instant page transitions.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text,
  mode = "fullscreen",
  maxWaitMs = 350,
}) => {
  const [timedOut, setTimedOut] = useState(false);

  // Auto-dismiss safety: never hang or block the user for more than maxWaitMs
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, maxWaitMs);
    return () => clearTimeout(timer);
  }, [maxWaitMs]);

  if (timedOut) {
    return null;
  }

  // Modern page skeleton for in-page navigation without flashing text
  if (mode === "page") {
    return (
      <div className="w-full space-y-5 p-4 sm:p-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-44 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-3.5 w-64 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3"
            >
              <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 space-y-3">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          {[1, 2, 3].map((row) => (
            <div key={row} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Minimal sleek spinner for route transitions
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen w-full items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xs transition-opacity duration-200">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <div className="h-2 w-2 rounded-full bg-indigo-600" />
        </div>
        {text && (
          <p className="text-xs font-medium text-slate-500 select-none">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
