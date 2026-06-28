import React from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { invoices } from "variables/mockData";
export default function InvoicesPage() {
  return (
    <ERPListPage
      title="Invoices"
      subtitle="Manage sales invoices and billing"
      searchKey="customer"
      data={invoices}
      onAdd={() => {}}
      addLabel="New Invoice"
      columns={[
        { key: "refNo", label: "Invoice No." },
        { key: "date", label: "Date" },
        { key: "customer", label: "Customer" },
        {
          key: "subtotal",
          label: "Subtotal",
          render: (r: unknown) => `LKR ${r.subtotal.toLocaleString()}`,
        },
        {
          key: "tax",
          label: "Tax",
          render: (r: unknown) => `LKR ${r.tax.toLocaleString()}`,
        },
        {
          key: "total",
          label: "Total",
          render: (r: unknown) => `LKR ${r.total.toLocaleString()}`,
        },
        {
          key: "balance",
          label: "Balance",
          render: (r: unknown) => `LKR ${r.balance.toLocaleString()}`,
        },
        {
          key: "status",
          label: "Status",
          render: (r: unknown) => <StatusBadge status={r.status} />,
        },
      ]}
    />
  );
}
