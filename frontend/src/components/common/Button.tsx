import React from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
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
      "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-200 focus-visible:ring-indigo-500",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-400",
    outline:
      "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 shadow-sm focus-visible:ring-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-200 focus-visible:ring-red-500",
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-gray-400",
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
      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
