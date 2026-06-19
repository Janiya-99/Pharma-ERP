import React from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { users } from "variables/mockData";

export default function UsersPage() {
  return (
    <ERPListPage
      title="Users"
      subtitle="Manage system users, roles, and branch access"
      searchKey="name"
      data={users}
      onAdd={() => {}}
      addLabel="Add User"
      columns={[
        { key: "employeeId", label: "Emp. ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "designation", label: "Designation" },
        { key: "branch", label: "Branch" },
        { key: "role", label: "Role" },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
