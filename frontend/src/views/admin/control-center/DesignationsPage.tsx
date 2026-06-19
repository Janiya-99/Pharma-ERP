import React from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { designations } from "variables/mockData";

export default function DesignationsPage() {
  return (
    <ERPListPage
      title="Designations"
      subtitle="Manage job designations and departments"
      searchKey="title"
      data={designations}
      onAdd={() => {}}
      addLabel="Add Designation"
      columns={[
        { key: "title", label: "Designation" },
        { key: "department", label: "Department" },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
