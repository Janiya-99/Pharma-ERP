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
    sm: "!max-w-lg !w-full sm:!max-w-lg",
    md: "!max-w-2xl !w-full sm:!max-w-2xl",
    lg: "!max-w-4xl !w-full sm:!max-w-4xl lg:!max-w-[1020px] lg:!w-[65vw]",
    xl: "!max-w-5xl !w-full sm:!max-w-5xl lg:!max-w-[1140px] lg:!w-[70vw]",
    half: "!max-w-[66vw] !w-[66vw] sm:!max-w-[66vw] sm:!w-[66vw]",
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
