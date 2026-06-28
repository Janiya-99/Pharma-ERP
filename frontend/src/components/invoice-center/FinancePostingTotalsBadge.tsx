import React from "react";
import { Badge } from "../ui/badge";

interface Props {
  debitTotal: number;
  creditTotal: number;
  className?: string;
}

export const FinancePostingTotalsBadge: React.FC<Props> = ({
  debitTotal,
  creditTotal,
  className,
}) => {
  const isBalanced = debitTotal.toFixed(2) === creditTotal.toFixed(2);

  return (
    <Badge
      variant="outline"
      className={`border-transparent ${
        isBalanced
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-red-100 text-red-800 hover:bg-red-200"
      } ${className || ""}`}
    >
      {isBalanced ? "Balanced" : "Unbalanced"}
    </Badge>
  );
};

export default FinancePostingTotalsBadge;
