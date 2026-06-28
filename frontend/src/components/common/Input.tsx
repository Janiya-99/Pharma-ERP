import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      className = "",
      id,
      ...props
    }: {
      label?: unknown;
      error?: unknown;
      className?: unknown;
      id?: string | number;
      props?: unknown;
    },
    ref: unknown
  ) => {
    const inputId = id || props.name;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-slate-950 mb-1.5 block text-xs font-semibold"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`text-slate-900 placeholder:text-slate-400 focus:ring-slate-100/50 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm shadow-sm 
        transition-all duration-150 focus:outline-none focus:ring-2
        ${
          error
            ? "border-red-500 focus:ring-red-100/50"
            : "border-slate-200 focus:border-slate-400 focus:ring-slate-100"
        }`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
