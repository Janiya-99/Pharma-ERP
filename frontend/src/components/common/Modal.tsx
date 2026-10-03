import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen?: boolean;
  onClose?: () => void;
  title?: any;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "half" | "full";
}) => {
  const sizes: Record<string, string> = {
    sm: "!max-w-md !w-full sm:!max-w-md",
    md: "!max-w-lg !w-full sm:!max-w-lg",
    lg: "!max-w-2xl !w-full sm:!max-w-2xl",
    xl: "!max-w-4xl !w-full sm:!max-w-4xl",
    half: "!max-w-[50vw] !w-[50vw] sm:!max-w-[50vw] sm:!w-[50vw]",
    full: "!max-w-full !w-full sm:!max-w-full sm:!w-full",
  };

  const sizeClass = sizes[size] || "sm:max-w-lg";

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open: any) => {
        if (!open) onClose?.();
      }}
    >
      <SheetContent
        side="right"
        className={`${sizeClass} flex h-full w-full flex-col p-0`}
        showCloseButton={true}
      >
        <SheetHeader className="px-8 py-6 border-b border-slate-100 bg-white">
          <SheetTitle className="text-xl font-bold tracking-tight text-slate-900 pr-8">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-white">{children}</div>
      </SheetContent>
    </Sheet>
  );
};

export default Modal;
