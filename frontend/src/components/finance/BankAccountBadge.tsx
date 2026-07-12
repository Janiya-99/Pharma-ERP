
const BankAccountBadge = ({ isDefault }: { isDefault?: boolean }) => {
  if (isDefault) {
    return (
      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800  ">
        Default
      </span>
    );
  }
  return null;
};

export default BankAccountBadge;
