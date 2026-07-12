
const AssetValueCard = ({ title, amount, className = "" }: { title?: unknown; amount?: unknown; className?: unknown }) => {
  return (
    <div className={`p-4 rounded-xl border border-gray-100 bg-white shadow-sm   ${className}`}>
      <p className="text-sm font-medium text-gray-500 ">{title}</p>
      <p className="mt-2 text-xl font-bold text-navy-700 ">
        <span className="text-sm font-normal text-gray-400 mr-1">LKR</span>
        {Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default AssetValueCard;
