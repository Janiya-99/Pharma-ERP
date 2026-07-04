import * as React from "react";

import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  if (type === "date") {
    const value =
      typeof props.value === "string"
        ? props.value
        : typeof props.defaultValue === "string"
          ? props.defaultValue
          : "";

    return (
      <DatePicker
        value={value}
        disabled={props.disabled}
        placeholder={props.placeholder || "Pick a date"}
        aria-label={props["aria-label"] || props.name || props.id || "Pick a date"}
        triggerClassName={className}
        onChange={(nextValue) => {
          props.onChange?.({
            target: {
              value: nextValue,
              name: props.name,
            },
            currentTarget: {
              value: nextValue,
              name: props.name,
            },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      />
    );
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-xl border border-slate-300 bg-white/70 px-3 py-2 text-base text-[#1F2937] outline-none transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:border-slate-500 focus-visible:ring-2 focus-visible:ring-[#4854CC]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100/70 disabled:text-[#9CA3AF] disabled:opacity-70 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input };
