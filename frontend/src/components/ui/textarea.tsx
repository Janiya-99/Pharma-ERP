import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content flex min-h-16 w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2 text-base text-[#1F2937] outline-none transition-colors placeholder:text-[#9CA3AF] focus-visible:border-slate-500 focus-visible:ring-2 focus-visible:ring-[#0077B6]/20 disabled:cursor-not-allowed disabled:bg-slate-100/70 disabled:text-[#9CA3AF] disabled:opacity-70 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
