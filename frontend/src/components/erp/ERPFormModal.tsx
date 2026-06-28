/**
 * ERPFormModal — Reusable modal dialog for Add/Edit forms across all modules.
 * Supports field validation, draft/submit modes, and disabled fields for posted records.
 */
import React, { useState, useEffect } from "react";
import { MdClose, MdSave, MdSend } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import { Calendar } from "components/ui/calendar";
import { Button } from "components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "components/ui/sheet";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "textarea"
  | "date"
  | "password";

export type FormField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options?: { label: string; value: string }[]; // For select fields
  span?: 1 | 2; // Grid column span (1=half, 2=full)
  validate?: (value: any) => string | null; // Custom validation returning error message or null
};

type ERPFormModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSave: (values: Record<string, any>, isDraft: boolean) => void;
  isLoading?: boolean;
  showDraft?: boolean; // Show "Save as Draft" button
  isEditMode?: boolean;
  isPosted?: boolean; // If true, all fields are disabled
};

export function ERPFormModal({
  open,
  onClose,
  title,
  subtitle,
  fields,
  initialValues = {},
  onSave,
  isLoading = false,
  showDraft = false,
  isEditMode = false,
  isPosted = false,
}: ERPFormModalProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      const defaults: Record<string, any> = {};
      fields.forEach((f: unknown) => {
        defaults[f.key] = initialValues[f.key] ?? "";
      });
      setValues(defaults);
      setErrors({});
      setTouched({});
    }
  }, [open, initialValues]);

  const handleChange = (key: string, value: any) => {
    setValues((prev: unknown) => ({ ...prev, [key]: value }));
    if (touched[key]) {
      validateField(key, value);
    }
  };

  const handleBlur = (key: string) => {
    setTouched((prev: unknown) => ({ ...prev, [key]: true }));
    validateField(key, values[key]);
  };

  const validateField = (key: string, value: any): boolean => {
    const field = fields.find((f: unknown) => f.key === key);
    if (!field) return true;

    let error = "";
    if (field.required && (!value || String(value).trim() === "")) {
      error = `${field.label} is required`;
    } else if (
      field.type === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      error = "Invalid email format";
    } else if (field.type === "number" && value && isNaN(Number(value))) {
      error = "Must be a number";
    } else if (field.validate) {
      const customError = field.validate(value);
      if (customError) error = customError;
    }

    setErrors((prev: unknown) => ({ ...prev, [key]: error }));
    return !error;
  };

  const validateAll = (): boolean => {
    let allValid = true;
    const newErrors: Record<string, string> = {};
    const allTouched: Record<string, boolean> = {};

    fields.forEach((field: unknown) => {
      allTouched[field.key] = true;
      const value = values[field.key];
      let error = "";

      if (field.required && (!value || String(value).trim() === "")) {
        error = `${field.label} is required`;
        allValid = false;
      } else if (
        field.type === "email" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        error = "Invalid email format";
        allValid = false;
      } else if (field.validate) {
        const customError = field.validate(value);
        if (customError) {
          error = customError;
          allValid = false;
        }
      }
      newErrors[field.key] = error;
    });

    setErrors(newErrors);
    setTouched(allTouched);
    return allValid;
  };

  const handleSubmit = (isDraft: boolean) => {
    if (!isDraft && !validateAll()) return;
    onSave(values, isDraft);
  };

  return (
    <Sheet open={open} onOpenChange={(val: unknown) => !val && onClose()}>
      <SheetContent
        side="right"
        className="flex w-[400px] flex-col border-none bg-gray-50 p-0 shadow-2xl dark:bg-navy-900 sm:w-[540px] sm:max-w-none"
      >
        {/* Header */}
        <SheetHeader className="border-b border-gray-100 bg-white px-6 py-5 text-left dark:border-navy-700 dark:bg-navy-800">
          <SheetTitle className="text-lg font-bold text-navy-700 dark:text-white">
            {title}
          </SheetTitle>
          {subtitle && (
            <SheetDescription className="mt-0.5 text-[12px] text-gray-400">
              {subtitle}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Posted notice */}
        {isPosted && (
          <div className="mx-6 mt-4 shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
            <p className="text-[12px] font-semibold text-amber-700">
              This record has been posted and cannot be edited.
            </p>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            {fields.map((field: unknown) => (
              <div
                key={field.key}
                className={field.span === 2 ? "sm:col-span-2" : ""}
              >
                <label className="mb-2 block text-[13px] font-bold text-navy-700 dark:text-white">
                  {field.label}
                  {field.required && (
                    <span className="ml-0.5 text-red-500">*</span>
                  )}
                </label>

                {field.type === "select" ? (
                  <Select
                    value={
                      values[field.key] !== undefined &&
                      values[field.key] !== null &&
                      values[field.key] !== ""
                        ? String(values[field.key])
                        : undefined
                    }
                    onValueChange={(val: unknown) => {
                      handleChange(field.key, val);
                      setTouched((prev: unknown) => ({
                        ...prev,
                        [field.key]: true,
                      }));
                    }}
                    disabled={isPosted || field.disabled}
                  >
                    <SelectTrigger
                      className={`h-[44px] w-full rounded-xl border bg-white px-4 text-sm text-navy-700 focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:disabled:bg-white/5 ${
                        errors[field.key] && touched[field.key]
                          ? "border-red-300 focus:ring-red-50 dark:focus:ring-red-500/20"
                          : "border-gray-200 shadow-sm focus:border-brand-400 focus:ring-brand-50 dark:focus:ring-brand-400/20"
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          field.placeholder || `Select ${field.label}`
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt: unknown) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "date" ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        disabled={isPosted || field.disabled}
                        className={`h-[44px] w-full justify-start rounded-xl border bg-white px-4 text-left font-normal text-navy-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:hover:bg-white/5 dark:disabled:bg-white/5 ${
                          !values[field.key] &&
                          "text-gray-400 dark:text-gray-500"
                        } ${
                          errors[field.key] && touched[field.key]
                            ? "border-red-300 focus:ring-red-50 dark:focus:ring-red-500/20"
                            : "border-gray-200 shadow-sm focus:border-brand-400 focus:ring-brand-50 dark:focus:ring-brand-400/20"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {values[field.key] ? (
                          format(new Date(values[field.key]), "PPP")
                        ) : (
                          <span>{field.placeholder || "Pick a date"}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="z-[105] w-auto p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          values[field.key]
                            ? new Date(values[field.key])
                            : undefined
                        }
                        onSelect={(date: unknown) => {
                          const dateString = date
                            ? format(date, "yyyy-MM-dd")
                            : "";
                          handleChange(field.key, dateString);
                          setTouched((prev: unknown) => ({
                            ...prev,
                            [field.key]: true,
                          }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : field.type === "textarea" ? (
                  <textarea
                    value={values[field.key] || ""}
                    onChange={(e: any) =>
                      handleChange(field.key, e.target.value)
                    }
                    onBlur={() => handleBlur(field.key)}
                    disabled={isPosted || field.disabled}
                    placeholder={field.placeholder}
                    rows={3}
                    className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-navy-700 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:placeholder:text-gray-500 dark:disabled:bg-white/5 ${
                      errors[field.key] && touched[field.key]
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50 dark:focus:ring-red-500/20"
                        : "border-gray-200 shadow-sm focus:border-brand-400 focus:ring-brand-50 dark:focus:ring-brand-400/20"
                    }`}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={values[field.key] || ""}
                    onChange={(e: any) =>
                      handleChange(field.key, e.target.value)
                    }
                    onBlur={() => handleBlur(field.key)}
                    disabled={isPosted || field.disabled}
                    placeholder={field.placeholder}
                    className={`h-[44px] w-full rounded-xl border bg-white px-4 text-sm text-navy-700 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:placeholder:text-gray-500 dark:disabled:bg-white/5 ${
                      errors[field.key] && touched[field.key]
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50 dark:focus:ring-red-500/20"
                        : "border-gray-200 shadow-sm focus:border-brand-400 focus:ring-brand-50 dark:focus:ring-brand-400/20"
                    }`}
                  />
                )}

                {/* Error message */}
                {errors[field.key] && touched[field.key] && (
                  <p className="mt-1 text-[11px] font-medium text-red-500">
                    {errors[field.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {!isPosted && (
          <SheetFooter className="mt-0 shrink-0 flex-row gap-2 border-t border-gray-100 bg-white px-6 py-4 dark:border-navy-700 dark:bg-navy-800 sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            {showDraft && (
              <button
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <MdSave size={16} />
                Save Draft
              </button>
            )}
            <button
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-200 transition-colors hover:bg-brand-600 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <MdSend size={16} />
              )}
              {isEditMode ? "Update" : "Create"}
            </button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default ERPFormModal;
