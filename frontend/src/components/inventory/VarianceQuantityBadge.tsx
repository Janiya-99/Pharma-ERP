
const VarianceQuantityBadge = ({ variance }: { variance?: unknown }) => {
  const value = parseFloat(variance || 0);

  if (value > 0) {
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200   ">
        +{value.toFixed(3)}
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200   ">
        {value.toFixed(3)}
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200   ">
      0.000
    </span>
  );
};

export default VarianceQuantityBadge;
