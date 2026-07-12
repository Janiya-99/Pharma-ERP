
const BankTransactionTypeBadge = ({ type }: { type?: unknown }) => {
  const getBadgeClass = (type: unknown) => {
    switch (type) {
      case "deposit":
      case "transfer_in":
        return "bg-green-100 text-green-800  ";
      case "withdrawal":
      case "transfer_out":
        return "bg-red-100 text-red-800  ";
      case "bank_charge":
        return "bg-orange-100 text-orange-800  ";
      case "interest_income":
        return "bg-indigo-100 text-indigo-800  ";
      case "adjustment":
        return "bg-gray-100 text-gray-800  ";
      default:
        return "bg-gray-100 text-gray-800  ";
    }
  };

  const formattedType = type ? type.replace(/_/g, " ").replace(/\b\w/g, (l: unknown) => l.toUpperCase()) : "Unknown";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeClass(type)}`}>
      {formattedType}
    </span>
  );
};

export default BankTransactionTypeBadge;
