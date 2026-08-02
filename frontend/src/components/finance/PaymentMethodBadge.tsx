
const getMethodConfig = (method: unknown) => {
  switch (method?.toLowerCase()) {
    case "cash":
      return { label: "Cash", className: "bg-green-100 text-green-800" };
    case "bank_transfer":
      return { label: "Bank Transfer", className: "bg-indigo-100 text-indigo-800" };
    case "cheque":
      return { label: "Cheque", className: "bg-purple-100 text-purple-800" };
    case "online_transfer":
      return { label: "Online Transfer", className: "bg-indigo-100 text-indigo-800" };
    case "card":
      return { label: "Card", className: "bg-orange-100 text-orange-800" };
    default:
      return { label: method?.replace(/_/g, " ") || "Unknown", className: "bg-gray-100 text-gray-800 capitalize" };
  }
};

export default function PaymentMethodBadge({ method }: { method?: unknown }) {
  const config = getMethodConfig(method);

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
