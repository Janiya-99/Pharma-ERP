import React from "react";

interface MoneyDisplayProps {
  amount: number | string;
  currency?: string;
  className?: string;
}

const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amount,
  currency = "LKR",
  className = "",
}: {
  amount?: unknown;
  currency?: unknown;
  className?: unknown;
}) => {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount || 0);

  return (
    <span className={`font-medium tracking-tight ${className}`}>
      {formattedAmount}
    </span>
  );
};

export default MoneyDisplay;
