import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#4854CC]/30 focus-visible:ring-offset-1 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* ── Primary / Save / Submit ── */
        default:
          "border-transparent bg-[#4854CC] text-white shadow-sm hover:bg-[#005F95] hover:shadow-md",

        /* ── Secondary ── */
        secondary:
          "border-slate-200/80 bg-white/70 text-[#1F2937] shadow-sm backdrop-blur-xl hover:bg-slate-100/80 [&_svg]:text-[#4854CC]",

        /* ── Outline ── */
        outline:
          "border-slate-200/80 bg-white/70 text-[#1F2937] shadow-sm backdrop-blur-xl hover:bg-slate-100/80 [&_svg]:text-[#4854CC]",

        /* ── Edit ── */
        edit:
          "border-slate-200/80 bg-white/70 text-[#1F2937] shadow-sm backdrop-blur-xl hover:bg-[#4854CC]/10 [&_svg]:text-[#4854CC]",

        /* ── Destructive / Delete / Remove / Logout ── */
        destructive:
          "border-red-300/80 bg-red-50/70 text-red-700 shadow-sm backdrop-blur-xl hover:bg-red-100/80 [&_svg]:text-red-600",

        /* ── Approve ── */
        approve:
          "border-green-300 bg-green-50/70 text-green-800 shadow-sm backdrop-blur-xl hover:bg-green-100 [&_svg]:text-green-600",

        /* ── Reject ── */
        reject:
          "border-red-300 bg-red-50/70 text-red-700 shadow-sm backdrop-blur-xl hover:bg-red-100 [&_svg]:text-red-600",

        /* ── View ── */
        view:
          "border-slate-200/80 bg-white/70 text-[#1F2937] shadow-sm backdrop-blur-xl hover:bg-[#4854CC]/10 [&_svg]:text-[#4854CC]",

        /* ── Print ── */
        print:
          "border-slate-200/80 bg-white/70 text-[#1F2937] shadow-sm backdrop-blur-xl hover:bg-slate-100/80 [&_svg]:text-[#002137]",

        /* ── Export / Import ── */
        export:
          "border-slate-200/80 bg-white/70 text-[#1F2937] shadow-sm backdrop-blur-xl hover:bg-[#4854CC]/10 [&_svg]:text-[#4854CC]",

        /* ── Ghost ── */
        ghost:
          "border-transparent bg-transparent text-[#374151] hover:bg-slate-100/80 hover:text-[#1F2937] [&_svg]:text-[#4854CC]",

        /* ── Link ── */
        link:
          "border-transparent bg-transparent text-[#4854CC] underline-offset-4 hover:underline",

        /* ── Search / Filter ── */
        filter:
          "border-slate-200/80 bg-white/70 text-[#1F2937] shadow-sm backdrop-blur-xl hover:bg-slate-100/80 [&_svg]:text-[#4854CC]",

        /* ── Notification Badge ── */
        notification:
          "rounded-full border-transparent bg-[#4854CC] text-white shadow-sm hover:bg-[#005F95] [&_svg]:text-white",
      },
      size: {
        xs: "h-8 gap-1 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-9 gap-2 rounded-xl px-4 text-sm",
        lg: "h-10 gap-2 rounded-xl px-5 text-sm",
        icon: "size-9 rounded-lg p-0",
        "icon-xs": "size-8 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 rounded-lg p-0",
      },
      pill: {
        true: "!rounded-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      pill: false,
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  pill = false,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, pill, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
