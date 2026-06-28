import React from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { chartOfAccounts } from "variables/mockData";
export default function ChartOfAccountsPage() {
  return (
    <ERPListPage
      title="Chart of Accounts"
      subtitle="Manage the accounting chart of accounts"
      searchKey="name"
      data={chartOfAccounts}
      onAdd={() => {}}
      addLabel="Add Account"
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Account Name" },
        { key: "type", label: "Type" },
        {
          key: "isCashBank",
          label: "Cash/Bank",
          render: (r: unknown) => (r.isCashBank ? "Yes" : "No"),
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
