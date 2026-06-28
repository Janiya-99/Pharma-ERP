
const GRNTotalsCard = ({ grn, lines }: { grn?: unknown; lines?: unknown }) => {
  const tQty = lines?.reduce((sum: unknown, l: unknown) => sum + (Number(l.quantity_received) || 0), 0) || grn?.total_quantity || 0;
  const tFreeQty = lines?.reduce((sum: unknown, l: unknown) => sum + (Number(l.free_quantity) || 0), 0) || grn?.total_free_quantity || 0;
  const tStockQty = lines?.reduce((sum: unknown, l: unknown) => sum + (Number(l.quantity_received) || 0) + (Number(l.free_quantity) || 0), 0) || grn?.total_stock_quantity || 0;
  
  const subTotal = lines?.reduce((sum: unknown, l: unknown) => sum + ((Number(l.quantity_received) || 0) * (Number(l.unit_cost) || 0)), 0) || grn?.subtotal_amount || 0;
  const tDiscount = lines?.reduce((sum: unknown, l: unknown) => sum + (Number(l.discount_amount) || 0), 0) || grn?.discount_amount || 0;
  const tTax = lines?.reduce((sum: unknown, l: unknown) => sum + (Number(l.tax_amount) || 0), 0) || grn?.tax_amount || 0;
  const tTotal = lines?.reduce((sum: unknown, l: unknown) => sum + (((Number(l.quantity_received) || 0) * (Number(l.unit_cost) || 0)) - (Number(l.discount_amount) || 0) + (Number(l.tax_amount) || 0)), 0) || grn?.total_amount || 0;

  const formatLKR = (val: unknown) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val || 0);

  return (
    <div className="bg-gray-50 dark:bg-navy-800 rounded-xl p-4 border border-gray-100 dark:border-navy-700">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm border-b pb-2 dark:border-navy-600">GRN Totals</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Total Quantity:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{Number(tQty).toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Total Free Quantity:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{Number(tFreeQty).toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center font-bold">
          <span className="text-brand-600 dark:text-brand-400">Total Stock Qty:</span>
          <span className="text-brand-600 dark:text-brand-400">{Number(tStockQty).toFixed(3)}</span>
        </div>

        <div className="h-px bg-gray-200 dark:bg-navy-600 my-2"></div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{formatLKR(subTotal)}</span>
        </div>
        <div className="flex justify-between items-center text-red-600 dark:text-red-400">
          <span>Discount:</span>
          <span>- {formatLKR(tDiscount)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Tax:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{formatLKR(tTax)}</span>
        </div>
        
        <div className="flex justify-between items-center font-bold pt-2 border-t border-gray-200 dark:border-navy-600 text-base">
          <span className="text-brand-600 dark:text-brand-400">Total Amount:</span>
          <span className="text-brand-600 dark:text-brand-400">{formatLKR(tTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default GRNTotalsCard;
