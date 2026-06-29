import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface GlassButtonProps extends ButtonProps {
  children: ReactNode;
}

export function GlassButton({
  children,
  variant = "secondary",
  size = "default",
  ...props
}: GlassButtonProps) {
  return (
    <Button variant={variant} size={size} {...props}>
      {children}
    </Button>
  );
}
