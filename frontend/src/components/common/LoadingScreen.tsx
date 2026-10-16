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
 * LoadingScreen - PIXANDCO Modern Luxury Editorial Loader
 * Designed to mirror high-fashion minimalist typography with zero latency.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text,
  badge = "PIXANDCO ENTERPRISE",
  title = "Pixandco",
  subtitle = "Intelligent healthcare & enterprise operations",
  mode = "fullscreen",
  theme = "auto",
}) => {
  const isPage = mode === "page";
  const displaySubtitle = text || subtitle;

  const content = (
    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 animate-editorial-pulse">
      {/* Top Tracked Subtitle with Dot */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-[#A39688] dark:bg-[#9B8F82]" />
        <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.32em] text-[#8F8377] dark:text-[#9F9387] uppercase select-none">
          {badge}
        </span>
      </div>

      {/* Main Luxury Wordmark */}
      <h1 className="font-serif-luxury text-5xl sm:text-7xl md:text-8xl font-normal tracking-tight text-[#1C1A17] dark:text-[#EDE8E1] select-none leading-none">
        {title}
      </h1>

      {/* Hairline Separator with Light Sweep */}
      <div className="my-5 sm:my-6 w-24 sm:w-32 md:w-40 h-[1px] bg-[#D7CDC4] dark:bg-[#3D3833] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8F8377] dark:via-[#D7CDC4] to-transparent animate-sweep-line" />
      </div>

      {/* Italicized Aesthetic Subtitle */}
      <p className="font-serif-luxury italic text-sm sm:text-base text-[#6E645B] dark:text-[#A89E94] tracking-wide max-w-md select-none">
        {displaySubtitle}
      </p>

      {/* Micro Subtle Loading Indicator Bar */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="w-16 h-[1.5px] bg-[#E5DDD5] dark:bg-[#2A2622] rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-[#8F8377] dark:bg-[#C9BFB5] rounded-full animate-sweep-line" />
        </div>
        <span className="text-[9.5px] font-sans uppercase tracking-[0.2em] text-[#A89C90] dark:text-[#6E645B]">
          Loading workspace
        </span>
      </div>
    </div>
  );

  if (isPage) {
    return (
      <div className="w-full min-h-[50vh] py-16 flex items-center justify-center bg-[#FAF8F5]/80 dark:bg-[#0E121A]/80 backdrop-blur-md rounded-2xl border border-[#EBE4DC]/60 dark:border-slate-800/60 transition-all duration-300">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen w-full items-center justify-center bg-[#FAF8F5] dark:bg-[#0D111A] text-slate-900 transition-colors duration-300">
      {/* Subtle Warm Linen Texture Background */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      {/* Soft Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/70 via-transparent to-transparent dark:from-indigo-950/20 dark:via-transparent dark:to-transparent pointer-events-none" />
      {content}
    </div>
  );
};

export default LoadingScreen;
