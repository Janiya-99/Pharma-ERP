import React, { useState } from "react";
import { Eye, MoreHorizontal, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RecentTransaction } from "../types";
import { formatLKR } from "../utils";
import toast from "react-hot-toast";

interface TransactionRowItem {
  id: string;
  date: string;
  type: string;
  refNo: string;
  particulars: string;
  amount: number;
  isCredit: boolean; // positive = credit/receipt (+), negative = debit/payment (-)
  status: "Completed" | "Sent" | "Pending";
  category: "receipt" | "payment" | "invoice" | "bill" | "journal";
  route: string;
}

interface RecentTransactionsCardProps {
  transactions?: RecentTransaction[];
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "receipts" | "payments" | "journals">("all");

  // Conforming default data from Image 2
  const defaultItems: TransactionRowItem[] = [
    {
      id: "tx-1",
      date: "16 Oct 2026",
      type: "Customer Receipt",
      refNo: "CR-2026-1087",
      particulars: "Lanka Care Clinics",
      amount: 1250000,
      isCredit: true,
      status: "Completed",
      category: "receipt",
      route: "/finance/banking/receipt-vouchers",
    },
    {
      id: "tx-2",
      date: "16 Oct 2026",
      type: "Supplier Payment",
      refNo: "SP-2026-0456",
      particulars: "Global Pharma Supplies",
      amount: 850000,
      isCredit: false,
      status: "Completed",
      category: "payment",
      route: "/finance/banking/payment-vouchers",
    },
    {
      id: "tx-3",
      date: "15 Oct 2026",
      type: "Customer Invoice",
      refNo: "INV-2026-2314",
      particulars: "City General Hospital",
      amount: 2400000,
      isCredit: true,
      status: "Sent",
      category: "invoice",
      route: "/invoice-center/sales-invoices",
    },
    {
      id: "tx-4",
      date: "15 Oct 2026",
      type: "Purchase Bill",
      refNo: "PB-2026-1123",
      particulars: "MediCore Distributors",
      amount: 1320500,
      isCredit: false,
      status: "Pending",
      category: "bill",
      route: "/finance/banking/payment-vouchers",
    },
    {
      id: "tx-5",
      date: "14 Oct 2026",
      type: "Journal Entry",
      refNo: "JE-2026-0098",
      particulars: "Bank Charges",
      amount: 12500,
      isCredit: false,
      status: "Completed",
      category: "journal",
      route: "/finance/general-ledger/journal-entry",
    },
  ];

  // Map backend transactions if available, otherwise use defaults
  const items: TransactionRowItem[] =
    transactions && transactions.length > 0
      ? transactions.map((t, idx) => {
          const isCredit = t.credit > 0 || t.type.toLowerCase().includes("receipt");
          const amt = t.credit > 0 ? t.credit : t.debit > 0 ? t.debit : 50000;
          const cat = t.type.toLowerCase().includes("receipt")
            ? "receipt"
            : t.type.toLowerCase().includes("payment")
            ? "payment"
            : t.type.toLowerCase().includes("journal")
            ? "journal"
            : "invoice";
          return {
            id: `api-tx-${idx}`,
            date: t.date || "16 Oct 2026",
            type: t.type || "Journal Entry",
            refNo: t.voucher || t.reference || `TX-2026-${1000 + idx}`,
            particulars: t.account || "General Ledger Entry",
            amount: amt,
            isCredit,
            status: "Completed",
            category: cat as any,
            route: cat === "receipt" ? "/finance/banking/receipt-vouchers" : "/finance/banking/payment-vouchers",
          };
        })
      : defaultItems;

  // Filter based on active tab
  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "receipts") return item.category === "receipt" || item.type.includes("Receipt");
    if (activeTab === "payments") return item.category === "payment" || item.category === "bill" || item.type.includes("Payment");
    if (activeTab === "journals") return item.category === "journal" || item.type.includes("Journal");
    return true;
  });

  const getStatusBadge = (status: TransactionRowItem["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "Sent":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  return (
    <div className="col-span-12 lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Transactions
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate("/finance/general-ledger/account-ledger")}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto py-3 border-b border-slate-100/70">
        {[
          { key: "all", label: "All Transactions" },
          { key: "receipts", label: "Customer Receipts" },
          { key: "payments", label: "Supplier Payments" },
          { key: "journals", label: "Journal Entries" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-2xs font-bold"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto pt-2">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-2.5 pr-3 font-semibold">Date</th>
              <th className="py-2.5 pr-3 font-semibold">Type</th>
              <th className="py-2.5 pr-3 font-semibold">Reference No.</th>
              <th className="py-2.5 pr-3 font-semibold">Particulars</th>
              <th className="py-2.5 pr-3 font-semibold text-right">Amount (LKR)</th>
              <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              <th className="py-2.5 pl-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/70">
            {filteredItems.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/80 transition-colors group cursor-default"
              >
                <td className="py-3 pr-3 text-slate-700 whitespace-nowrap font-medium">
                  {row.date}
                </td>
                <td className="py-3 pr-3 text-slate-600 whitespace-nowrap font-medium">
                  {row.type}
                </td>
                <td className="py-3 pr-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => navigate(row.route)}
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    {row.refNo}
                  </button>
                </td>
                <td className="py-3 pr-3 text-slate-800 font-semibold max-w-[160px] truncate">
                  {row.particulars}
                </td>
                <td className="py-3 pr-3 text-right font-bold tabular-nums whitespace-nowrap">
                  <span
                    className={
                      row.isCredit ? "text-emerald-600" : "text-rose-600"
                    }
                  >
                    {row.isCredit ? "+ " : "- "}
                    {formatLKR(row.amount).replace("LKR ", "")}
                  </span>
                </td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-3 pl-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(row.route)}
                      title="View Details"
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success(`Viewing actions for ${row.refNo}`)}
                      title="More Options"
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
