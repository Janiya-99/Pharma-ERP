
const ReconciliationDifferenceBadge = ({ amount }: { amount?: unknown }) => {
  const isZero = amount === 0 || amount === "0" || amount === "0.00";
  
  if (isZero) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
        Balanced
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
      Difference: {amount}
    </span>
  );
};

export default ReconciliationDifferenceBadge;
