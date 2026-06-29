import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  clearable?: boolean;
  "aria-label"?: string;
};

const toDate = (value?: string) => {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  triggerClassName,
  clearable = true,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const selected = toDate(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel || placeholder}
          className={cn(
            "h-9 w-full justify-start rounded-xl border-slate-300 bg-white/70 px-3 text-left font-normal text-[#1F2937] hover:bg-slate-100/80",
            !selected && "text-[#6B7280]",
            triggerClassName
          )}
        >
          <CalendarIcon className="h-4 w-4 text-[#0077B6]" />
          <span className="min-w-0 flex-1 truncate">
            {selected ? format(selected, "yyyy-MM-dd") : placeholder}
          </span>
          {clearable && selected && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date"
              className="ml-auto rounded-md p-0.5 text-[#6B7280] hover:bg-slate-200/80 hover:text-[#1F2937]"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onChange("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange("");
                }
              }}
            >
              <X className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", className)} align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
        />
      </PopoverContent>
    </Popover>
  );
}
