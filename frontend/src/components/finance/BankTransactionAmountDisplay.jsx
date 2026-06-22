import React from "react";

const BankTransactionAmountDisplay = ({ debitAmount, creditAmount }) => {
  const isDebit = parseFloat(debitAmount) > 0;
  const isCredit = parseFloat(creditAmount) > 0;

  const formatLKR = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  if (isDebit) {
    return <span className="text-green-600 font-medium text-right block">{formatLKR(debitAmount)}</span>;
  }

  if (isCredit) {
    return <span className="text-red-600 font-medium text-right block">{formatLKR(creditAmount)}</span>;
  }

  return <span className="text-gray-500 text-right block">{formatLKR(0)}</span>;
};

export default BankTransactionAmountDisplay;
