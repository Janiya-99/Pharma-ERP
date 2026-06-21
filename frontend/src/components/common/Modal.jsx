import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const sizes = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  const sizeClass = sizes[size] || "sm:max-w-lg";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent 
        side="right" 
        className={`${sizeClass} w-full h-full flex flex-col p-0 bg-white dark:bg-navy-800 border-l border-gray-100 dark:border-navy-700 shadow-2xl transition duration-300`}
        showCloseButton={true}
      >
        <SheetHeader className="px-6 py-5 border-b border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900">
          <SheetTitle className="text-lg font-bold text-navy-700 dark:text-white leading-tight">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Modal;
