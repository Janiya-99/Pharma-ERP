/**
 * ERPFormModal — Reusable modal dialog for Add/Edit forms across all modules.
 * Supports field validation, draft/submit modes, and disabled fields for posted records.
 */
import React, { useState, useEffect } from "react";
import { MdClose, MdSave, MdSend } from "react-icons/md";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import { Calendar } from "components/ui/calendar";
import { Button } from "components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export type FieldType = "text" | "email" | "tel" | "number" | "select" | "textarea" | "date" | "password";

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
      fields.forEach((f) => {
        defaults[f.key] = initialValues[f.key] ?? "";
      });
      setValues(defaults);
      setErrors({});
      setTouched({});
    }
  }, [open, initialValues]);

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (touched[key]) {
      validateField(key, value);
    }
  };

  const handleBlur = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    validateField(key, values[key]);
  };

  const validateField = (key: string, value: any): boolean => {
    const field = fields.find((f) => f.key === key);
    if (!field) return true;

    let error = "";
    if (field.required && (!value || String(value).trim() === "")) {
      error = `${field.label} is required`;
    } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Invalid email format";
    } else if (field.type === "number" && value && isNaN(Number(value))) {
      error = "Must be a number";
    } else if (field.validate) {
      const customError = field.validate(value);
      if (customError) error = customError;
    }

    setErrors((prev) => ({ ...prev, [key]: error }));
    return !error;
  };

  const validateAll = (): boolean => {
    let allValid = true;
    const newErrors: Record<string, string> = {};
    const allTouched: Record<string, boolean> = {};

    fields.forEach((field) => {
      allTouched[field.key] = true;
      const value = values[field.key];
      let error = "";

      if (field.required && (!value || String(value).trim() === "")) {
        error = `${field.label} is required`;
        allValid = false;
      } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-navy-700">{title}</h2>
            {subtitle && (
              <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Posted notice */}
        {isPosted && (
          <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-[12px] font-semibold text-amber-700">
              This record has been posted and cannot be edited.
            </p>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.span === 2 ? "sm:col-span-2" : ""}
              >
                <label className="block text-[13px] font-semibold text-navy-700 mb-1.5">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-0.5">*</span>
                  )}
                </label>

                {field.type === "select" ? (
                  <Select
                    value={values[field.key] ? String(values[field.key]) : undefined}
                    onValueChange={(val) => { handleChange(field.key, val); setTouched(prev => ({...prev, [field.key]: true})); }}
                    disabled={isPosted || field.disabled}
                  >
                    <SelectTrigger className={`w-full rounded-xl border px-4 h-[42px] text-sm text-navy-700 bg-white focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
                      errors[field.key] && touched[field.key]
                        ? "border-red-300 focus:ring-red-50"
                        : "border-gray-200 focus:ring-brand-50"
                    }`}>
                      <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
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
                        className={`w-full justify-start text-left font-normal h-[42px] rounded-xl border px-4 hover:bg-white text-navy-700 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
                          !values[field.key] && "text-gray-400"
                        } ${
                          errors[field.key] && touched[field.key]
                            ? "border-red-300 focus:ring-red-50"
                            : "border-gray-200 focus:ring-brand-50"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {values[field.key] ? format(new Date(values[field.key]), "PPP") : <span>{field.placeholder || "Pick a date"}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[105]" align="start">
                      <Calendar
                        mode="single"
                        selected={values[field.key] ? new Date(values[field.key]) : undefined}
                        onSelect={(date) => {
                          const dateString = date ? format(date, "yyyy-MM-dd") : "";
                          handleChange(field.key, dateString);
                          setTouched(prev => ({...prev, [field.key]: true}));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : field.type === "textarea" ? (
                  <textarea
                    value={values[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    onBlur={() => handleBlur(field.key)}
                    disabled={isPosted || field.disabled}
                    placeholder={field.placeholder}
                    rows={3}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm text-navy-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all resize-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
                      errors[field.key] && touched[field.key]
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-200 focus:border-brand-400 focus:ring-brand-50"
                    }`}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={values[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    onBlur={() => handleBlur(field.key)}
                    disabled={isPosted || field.disabled}
                    placeholder={field.placeholder}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm text-navy-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
                      errors[field.key] && touched[field.key]
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-200 focus:border-brand-400 focus:ring-brand-50"
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
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {showDraft && (
              <button
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <MdSave size={16} />
                Save Draft
              </button>
            )}
            <button
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 transition-colors shadow-sm shadow-brand-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <MdSend size={16} />
              )}
              {isEditMode ? "Update" : "Create"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ERPFormModal;
