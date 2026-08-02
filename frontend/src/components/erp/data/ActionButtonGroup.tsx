import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

interface ActionItem {
  /** Button label */
  label: string;
  /** Button variant from the ERP button system */
  variant?: ButtonProps["variant"];
  /** Click handler */
  onClick?: () => void;
  /** Lucide icon component */
  icon?: ReactNode;
  /** Disable this action */
  disabled?: boolean;
  /** Use pill shape */
  pill?: boolean;
  /** Additional className */
  className?: string;
}

interface ActionButtonGroupProps {
  /** Action definitions */
  actions: ActionItem[];
  /** Size for all buttons */
  size?: ButtonProps["size"];
  /** Additional className for the container */
  className?: string;
}

/**
 * Renders a consistent group of action buttons.
 * Use in table rows, page headers, or card action areas.
 */
export function ActionButtonGroup({
  actions,
  size = "sm",
  className,
}: ActionButtonGroupProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {actions.map((action, idx) => (
        <Button
          key={idx}
          variant={action.variant || "outline"}
          size={size}
          pill={action.pill}
          onClick={action.onClick}
          disabled={action.disabled}
          className={action.className}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
