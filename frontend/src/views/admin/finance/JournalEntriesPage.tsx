import React from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { journalEntries } from "variables/mockData";
export default function JournalEntriesPage() {
  return (
    <ERPListPage
      title="Journal Entries"
      subtitle="Record and manage double-entry journal postings"
      searchKey="refNo"
      data={journalEntries}
      onAdd={() => {}}
      addLabel="New Journal"
      columns={[
        { key: "refNo", label: "Ref No." },
        { key: "date", label: "Date" },
        { key: "description", label: "Description" },
        {
          key: "totalDebit",
          label: "Debit",
          render: (r: unknown) => `LKR ${r.totalDebit.toLocaleString()}`,
        },
        {
          key: "totalCredit",
          label: "Credit",
          render: (r: unknown) => `LKR ${r.totalCredit.toLocaleString()}`,
        },
        { key: "createdBy", label: "Created By" },
        {
          key: "status",
          label: "Status",
          render: (r: unknown) => <StatusBadge status={r.status} />,
        },
      ]}
    />
  );
}
