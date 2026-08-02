
const StockValueDisplay = ({ value }: { value?: unknown }) => {
  if (value === undefined || value === null) return <span className="text-gray-400">-</span>;
  
  const formattedValue = Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  return (
    <div className="text-right tabular-nums whitespace-nowrap font-medium text-navy-700 ">
      {formattedValue}
    </div>
  );
};

export default StockValueDisplay;
