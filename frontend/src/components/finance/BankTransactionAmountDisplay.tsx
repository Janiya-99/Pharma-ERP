import React from "react";

const BankTransactionAmountDisplay = ({
  debitAmount,
  creditAmount,
}: {
  debitAmount?: unknown;
  creditAmount?: unknown;
}) => {
  const isDebit = parseFloat(debitAmount) > 0;
  const isCredit = parseFloat(creditAmount) > 0;

  const formatLKR = (amount: unknown) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  if (isDebit) {
    return (
      <span className="block text-right font-medium text-green-600">
        {formatLKR(debitAmount)}
      </span>
    );
  }

  if (isCredit) {
    return (
      <span className="block text-right font-medium text-red-600">
        {formatLKR(creditAmount)}
      </span>
    );
  }

  return <span className="block text-right text-gray-500">{formatLKR(0)}</span>;
};

export default BankTransactionAmountDisplay;
