
const BalanceStatusBadge = ({ isBalanced }: { isBalanced?: boolean }) => {
  if (isBalanced) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800  ">
        Balanced
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800  ">
      Difference Found
    </span>
  );
};
export default BalanceStatusBadge;
