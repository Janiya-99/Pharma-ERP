import React, { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", id, ...props }, ref) => {
  const inputId = id || props.name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors 
        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent
        ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
