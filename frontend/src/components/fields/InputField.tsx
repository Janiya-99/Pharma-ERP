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
        className={`text-sm ${
          isLuxury
            ? "ml-0.5 font-medium text-white/60"
            : variant === "auth"
            ? "ml-1.5 font-medium text-navy-700 dark:text-white"
            : "ml-3 font-bold text-navy-700 dark:text-white"
        }`}
      >
        {label}
      </label>
      <div className="relative mt-2 flex items-center">
        <input
          disabled={disabled}
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`flex h-12 w-full items-center justify-center rounded-xl p-3 text-sm outline-none transition-all duration-300 ${
            isLuxury
              ? "auth-input-luxury"
              : disabled === true
              ? "border bg-white/0 !border-none !bg-gray-100 dark:!bg-white/5 dark:placeholder:!text-[rgba(255,255,255,0.15)]"
              : state === "error"
              ? "border bg-white/0 border-red-500 text-red-500 placeholder:text-red-500 dark:!border-red-400 dark:!text-red-400 dark:placeholder:!text-red-400"
              : state === "success"
              ? "border bg-white/0 border-green-500 text-green-500 placeholder:text-green-500 dark:!border-green-400 dark:!text-green-400 dark:placeholder:!text-green-400"
              : "border bg-white/0 border-gray-200 dark:!border-white/10 dark:text-white"
          }`}
        />
        {icon && (
          <div className={`absolute right-3 flex items-center ${isLuxury ? "" : "text-gray-400 dark:text-white"}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default InputField;
