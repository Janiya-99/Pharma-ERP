
const BankAccountBadge = ({ isDefault }: { isDefault?: boolean }) => {
  if (isDefault) {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        Default
      </span>
    );
  }
  return null;
};

export default BankAccountBadge;
