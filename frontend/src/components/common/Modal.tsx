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
  size?: "sm" | "md" | "lg" | "xl";
}) => {
  const sizes = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
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
        className={`${sizeClass} flex h-full w-full flex-col p-0 shadow-2xl transition duration-300 glass-modal`}
        showCloseButton={true}
      >
        <SheetHeader className="glass-modal-header px-6 py-5">
          <SheetTitle className="text-lg font-bold leading-tight text-navy-700 dark:text-white">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
};

export default Modal;
