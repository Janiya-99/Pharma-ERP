import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--erp-button-primary-bg)_30%,transparent)] focus-visible:ring-offset-1 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* ── Primary / Save / Submit ── */
        default:
          "border-transparent bg-[var(--erp-button-primary-bg)] text-[var(--erp-button-primary-fg)] shadow-sm hover:bg-[var(--erp-button-primary-hover)] hover:shadow-md [&_svg]:text-[var(--erp-button-primary-fg)]",

        /* ── Secondary ── */
        secondary:
          "border-slate-200/80 bg-[var(--erp-button-secondary-bg)] text-[var(--erp-button-secondary-fg)] shadow-sm backdrop-blur-xl hover:bg-[var(--erp-button-secondary-hover)] [&_svg]:text-[var(--erp-button-primary-bg)]",

        /* ── Outline ── */
        outline:
          "border-slate-200/80 bg-[var(--erp-button-secondary-bg)] text-[var(--erp-button-secondary-fg)] shadow-sm backdrop-blur-xl hover:bg-[var(--erp-button-secondary-hover)] [&_svg]:text-[var(--erp-button-primary-bg)]",

        /* ── Edit ── */
        edit: "border-slate-200/80 bg-[var(--erp-button-secondary-bg)] text-[var(--erp-button-secondary-fg)] shadow-sm backdrop-blur-xl hover:bg-[color-mix(in_srgb,var(--erp-button-primary-bg)_10%,white)] [&_svg]:text-[var(--erp-button-primary-bg)]",

        /* ── Destructive / Delete / Remove / Logout ── */
        destructive:
          "border-[color-mix(in_srgb,var(--erp-button-danger-bg)_25%,white)] bg-[color-mix(in_srgb,var(--erp-button-danger-bg)_8%,white)] text-[var(--erp-button-danger-bg)] shadow-sm backdrop-blur-xl hover:bg-[color-mix(in_srgb,var(--erp-button-danger-bg)_14%,white)] [&_svg]:text-[var(--erp-button-danger-bg)]",

        /* ── Approve ── */
        approve:
          "border-[color-mix(in_srgb,var(--erp-button-success-bg)_25%,white)] bg-[color-mix(in_srgb,var(--erp-button-success-bg)_8%,white)] text-[var(--erp-button-success-bg)] shadow-sm backdrop-blur-xl hover:bg-[color-mix(in_srgb,var(--erp-button-success-bg)_14%,white)] [&_svg]:text-[var(--erp-button-success-bg)]",

        /* ── Reject ── */
        reject:
          "border-[color-mix(in_srgb,var(--erp-button-danger-bg)_25%,white)] bg-[color-mix(in_srgb,var(--erp-button-danger-bg)_8%,white)] text-[var(--erp-button-danger-bg)] shadow-sm backdrop-blur-xl hover:bg-[color-mix(in_srgb,var(--erp-button-danger-bg)_14%,white)] [&_svg]:text-[var(--erp-button-danger-bg)]",

        /* ── View ── */
        view: "border-slate-200/80 bg-[var(--erp-button-secondary-bg)] text-[var(--erp-button-secondary-fg)] shadow-sm backdrop-blur-xl hover:bg-[color-mix(in_srgb,var(--erp-button-primary-bg)_10%,white)] [&_svg]:text-[var(--erp-button-primary-bg)]",

        /* ── Print ── */
        print:
          "border-slate-200/80 bg-[var(--erp-button-secondary-bg)] text-[var(--erp-button-secondary-fg)] shadow-sm backdrop-blur-xl hover:bg-[var(--erp-button-secondary-hover)] [&_svg]:text-[var(--erp-button-primary-bg)]",

        /* ── Export / Import ── */
        export:
          "border-slate-200/80 bg-[var(--erp-button-secondary-bg)] text-[var(--erp-button-secondary-fg)] shadow-sm backdrop-blur-xl hover:bg-[color-mix(in_srgb,var(--erp-button-primary-bg)_10%,white)] [&_svg]:text-[var(--erp-button-primary-bg)]",

        /* ── Ghost ── */
        ghost:
          "border-transparent bg-transparent text-[var(--erp-button-secondary-fg)] hover:bg-[var(--erp-button-secondary-hover)] [&_svg]:text-[var(--erp-button-primary-bg)]",

        /* ── Link ── */
        link: "border-transparent bg-transparent text-[var(--erp-button-primary-bg)] underline-offset-4 hover:underline",

        /* ── Search / Filter ── */
        filter:
          "border-slate-200/80 bg-[var(--erp-button-secondary-bg)] text-[var(--erp-button-secondary-fg)] shadow-sm backdrop-blur-xl hover:bg-[var(--erp-button-secondary-hover)] [&_svg]:text-[var(--erp-button-primary-bg)]",

        /* ── Notification Badge ── */
        notification:
          "rounded-full border-transparent bg-[var(--erp-button-primary-bg)] text-[var(--erp-button-primary-fg)] shadow-sm hover:bg-[var(--erp-button-primary-hover)] [&_svg]:text-[var(--erp-button-primary-fg)]",
      },
      size: {
        xs: "h-8 gap-1 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-9 gap-2 rounded-xl px-4 text-sm",
        lg: "h-10 gap-2 rounded-xl px-5 text-sm",
        icon: "size-9 rounded-lg p-0",
        "icon-xs": "size-8 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-3.5",
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
