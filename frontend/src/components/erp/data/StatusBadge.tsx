import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        active: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50",
        approved: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50",
        posted: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50",
        completed: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50",
        paid: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50",
        success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50",

        pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50",
        suspended: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50",
        "on-hold": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50",
        "partially-paid": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50",
        "near-expiry": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700/50",
        warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50",

        inactive: "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700/50",
        draft: "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700/50",

        rejected: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
        locked: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
        cancelled: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
        unpaid: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
        expired: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
        recalled: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
        error: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",

        info: "bg-[#4854CC] text-white border-transparent dark:bg-[#4854CC] dark:text-white dark:border-transparent",
        "in-progress": "bg-[#4854CC] text-white border-transparent dark:bg-[#4854CC] dark:text-white dark:border-transparent",

        default: "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type StatusVariant = NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>;

// Map raw status strings to variant keys
const statusToVariant: Record<string, StatusVariant> = {
  active: "active",
  approved: "approved",
  posted: "posted",
  completed: "completed",
  paid: "paid",
  success: "success",
  pending: "pending",
  "pending approval": "pending",
  suspended: "suspended",
  "on hold": "on-hold",
  "partially paid": "partially-paid",
  "near expiry": "near-expiry",
  warning: "warning",
  inactive: "inactive",
  draft: "draft",
  rejected: "rejected",
  locked: "locked",
  cancelled: "cancelled",
  unpaid: "unpaid",
  expired: "expired",
  recalled: "recalled",
  error: "error",
  info: "info",
  "in progress": "in-progress",
};

interface StatusBadgeProps {
  /** Status value — will be mapped to a visual variant */
  status?: string;
  /** Override the display label */
  label?: string;
  /** Additional className */
  className?: string;
}

/**
 * Standardized status badge with CVA variants.
 * Automatically maps common ERP status strings to color variants.
 */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const normalised = (status || "").toLowerCase().trim();
  const variant: StatusVariant = statusToVariant[normalised] || "default";

  const displayLabel =
    label ||
    (status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : "Unknown");

  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {displayLabel}
    </span>
  );
}
