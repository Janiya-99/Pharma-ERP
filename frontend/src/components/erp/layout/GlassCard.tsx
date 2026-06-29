import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  tinted?: boolean;
}

export function GlassCard({ children, className, tinted = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl backdrop-blur-xl",
        tinted
          ? "border border-slate-200/80 bg-slate-50/80 shadow-[0_8px_30px_rgba(2,62,138,0.08)]"
          : "border border-slate-200/80 bg-white/70 shadow-[0_8px_30px_rgba(2,62,138,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}
