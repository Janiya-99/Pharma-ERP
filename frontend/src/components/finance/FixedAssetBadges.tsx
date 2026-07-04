
export const FixedAssetStatusBadge = ({ status }: { status?: unknown }) => {
  if (!status) return null;
  const normalizedStatus = status.toLowerCase();
  
  const colors = {
    active: "bg-green-100 text-green-700 border-green-200",
    fully_depreciated: "bg-indigo-100 text-indigo-700 border-indigo-200",
    disposed: "bg-red-100 text-red-700 border-red-200",
    written_off: "bg-orange-100 text-orange-700 border-orange-200",
    inactive: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const displayNames = {
    active: "Active",
    fully_depreciated: "Fully Depreciated",
    disposed: "Disposed",
    written_off: "Written Off",
    inactive: "Inactive",
  };

  const style = colors[normalizedStatus] || colors.inactive;
  const label = displayNames[normalizedStatus] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {label}
    </span>
  );
};

export const DepreciationMethodBadge = ({ method }: { method?: unknown }) => {
  if (!method) return null;
  
  const label = method === "straight_line" ? "Straight Line" : method;
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-indigo-50 text-indigo-700 border-indigo-100">
      {label}
    </span>
  );
};

export const DepreciationPostedStatusBadge = ({ status }: { status?: unknown }) => {
  if (!status) return null;
  const normalizedStatus = status.toLowerCase();
  
  const colors = {
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    posted: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    unposted: "bg-yellow-100 text-yellow-700 border-yellow-200"
  };

  const style = colors[normalizedStatus] || colors.draft;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${style}`}>
      {status}
    </span>
  );
};

export const DisposalTypeBadge = ({ type }: { type?: unknown }) => {
  if (!type) return null;
  const normalizedType = type.toLowerCase();
  
  const colors = {
    sale: "bg-green-100 text-green-700 border-green-200",
    write_off: "bg-red-100 text-red-700 border-red-200",
    scrap: "bg-orange-100 text-orange-700 border-orange-200",
    lost: "bg-red-100 text-red-700 border-red-200",
    damaged: "bg-orange-100 text-orange-700 border-orange-200",
  };

  const style = colors[normalizedType] || colors.scrap;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${style}`}>
      {type.replace("_", " ")}
    </span>
  );
};

export const GainLossBadge = ({ amount }: { amount?: unknown }) => {
  if (amount === undefined || amount === null) return null;
  
  let type = "zero";
  if (amount > 0) type = "gain";
  if (amount < 0) type = "loss";
  
  const colors = {
    gain: "bg-green-100 text-green-700 border-green-200",
    loss: "bg-red-100 text-red-700 border-red-200",
    zero: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[type]}`}>
      {type === "gain" ? "Gain" : type === "loss" ? "Loss" : "No Gain/Loss"}
    </span>
  );
};
