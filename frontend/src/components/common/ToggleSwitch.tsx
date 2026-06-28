import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

const ToggleSwitch = ({
  checked,
  onChange,
  label,
  description,
  disabled,
}: ToggleSwitchProps) => {
  return (
    <div className="flex items-center justify-between gap-3">
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <p className="text-sm font-medium text-gray-700">{label}</p>
          )}
          {description && (
            <p className="mt-0.5 text-[12px] text-gray-400">{description}</p>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`toggle-switch shrink-0 ${
          checked ? "toggle-switch-on" : "toggle-switch-off"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <span
          className={`toggle-switch-dot ${
            checked ? "toggle-switch-dot-on" : "toggle-switch-dot-off"
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
