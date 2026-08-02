import Widget from "components/widget/Widget";
import { MdOutlineReceiptLong, MdShoppingCart, MdCreditCard } from "react-icons/md";

export default function InvoiceDashboard() {
  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold text-navy-700 ">Invoice Center Dashboard</h1>
        <p className="text-sm text-gray-400">Realtime overview of sales, orders, and receipts</p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
        <Widget
          icon={<MdShoppingCart className="h-6 w-6 text-brand-500 " />}
          title="Sales Orders"
          subtitle="0"
        />
        <Widget
          icon={<MdOutlineReceiptLong className="h-6 w-6 text-brand-500 " />}
          title="Invoices"
          subtitle="0"
        />
        <Widget
          icon={<MdCreditCard className="h-6 w-6 text-brand-500 " />}
          title="Customer Receipts"
          subtitle="0"
        />
      </div>
    </div>
  );
}
