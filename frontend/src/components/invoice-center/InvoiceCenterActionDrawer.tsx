import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const drawerWidthClass =
  "w-[calc(100vw-1rem)] overflow-y-auto rounded-l-xl border-slate-200 bg-white shadow-2xl sm:max-w-lg";

function Dialog({
  open,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof Sheet>) {
  return <Sheet open={open} onOpenChange={onOpenChange} {...props} />;
}

function DialogContent({
  className,
  ...props
}: React.ComponentProps<typeof SheetContent>) {
  return (
    <SheetContent
      side="right"
      className={cn(drawerWidthClass, className)}
      {...props}
    />
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <SheetHeader
      className={cn("border-b border-slate-100 px-5 py-4", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetTitle>) {
  return (
    <SheetTitle
      className={cn("text-base font-semibold text-slate-950", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetDescription>) {
  return (
    <SheetDescription
      className={cn("mt-1 text-sm leading-5 text-slate-500", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <SheetFooter
      className={cn(
        "mt-auto flex-row justify-end border-t border-slate-100 px-5 py-4",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
};
