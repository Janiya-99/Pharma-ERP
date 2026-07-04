import React from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost"
  | "info";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps {
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  [key: string]: unknown;
}

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled = false,
  onClick,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl select-none";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-br from-[#4854CC] to-[#3730a3] text-white hover:from-[#5b66d6] hover:to-[#4854CC] active:from-[#3730a3] active:to-[#312e81] shadow-sm shadow-indigo-200/50 focus-visible:ring-indigo-500",
    secondary:
      "bg-white/50 text-gray-700 hover:bg-white/70 active:bg-white/80 backdrop-blur-sm border border-white/50 focus-visible:ring-gray-400",
    outline:
      "border bg-white/40 text-gray-700 hover:bg-white/60 active:bg-white/70 backdrop-blur-sm shadow-sm focus-visible:ring-gray-400" + " border-[rgba(148,163,184,0.3)]",
    danger:
      "bg-gradient-to-br from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 active:from-red-700 active:to-red-900 shadow-sm shadow-red-200/50 focus-visible:ring-red-500",
    ghost:
      "bg-transparent text-gray-600 hover:bg-white/40 hover:text-gray-800 backdrop-blur-sm focus-visible:ring-gray-400",
    info: "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white hover:from-indigo-600 hover:to-indigo-800 active:from-indigo-700 active:to-indigo-900 shadow-sm shadow-indigo-200/50 focus-visible:ring-indigo-500",
  };

  const sizes: Record<ButtonSize, string> = {
    xs: "h-7 px-2.5 text-xs gap-1",
    sm: "h-8 px-3 text-sm gap-1.5",
    md: "h-9 px-4 text-sm gap-2",
    lg: "h-11 px-5 text-base gap-2",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
