// Custom components
import React from "react";

function InputField(props: {
  id: string;
  label: string;
  extra: string;
  placeholder: string;
  variant: string;
  state?: string;
  disabled?: boolean;
  type?: string;
  icon?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { label, id, extra, type, placeholder, variant, state, disabled, icon, value, onChange } =
    props;

  const isLuxury = variant === "luxury";

  return (
    <div className={`${extra}`}>
      <label
        htmlFor={id}
        className={`text-[13px] tracking-wide ${
          isLuxury
            ? "mb-2 block font-medium text-white/70"
            : variant === "auth"
            ? "mb-2 block font-bold text-navy-700 dark:text-white"
            : "mb-2 block font-bold text-navy-700 dark:text-white"
        }`}
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          disabled={disabled}
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl px-4 py-3.5 text-[14px] font-medium leading-relaxed outline-none transition-all duration-300 shadow-sm ${
            isLuxury
              ? "auth-input-luxury"
              : disabled === true
              ? "border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed dark:border-white/5 dark:bg-white/5 dark:text-white/40"
              : state === "error"
              ? "border border-red-500 bg-red-50 text-red-600 placeholder:text-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-400 dark:bg-red-400/10"
              : state === "success"
              ? "border border-green-500 bg-green-50 text-green-600 placeholder:text-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:border-green-400 dark:bg-green-400/10"
              : "border border-gray-200 bg-white text-navy-700 placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 hover:border-gray-300 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-500 dark:focus:ring-brand-500/20"
          }`}
        />
        {icon && (
          <div className={`absolute right-4 flex items-center ${isLuxury ? "" : "text-gray-400 dark:text-white"}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default InputField;
