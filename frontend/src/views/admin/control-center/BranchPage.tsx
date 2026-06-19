import React from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { branches } from "variables/mockData";

export default function BranchPage() {
  return (
    <ERPListPage
      title="Branches"
      subtitle="Manage company branch locations and contacts"
      searchKey="branchName"
      data={branches}
      onAdd={() => {}}
      addLabel="Add Branch"
      columns={[
        { key: "branchCode", label: "Code" },
        { key: "branchName", label: "Branch Name" },
        { key: "address", label: "Address" },
        { key: "contactNo", label: "Contact" },
        { key: "email", label: "Email" },
        { key: "manager", label: "Manager" },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
