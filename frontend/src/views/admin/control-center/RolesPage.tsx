import React from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { roles } from "variables/mockData";

export default function RolesPage() {
  return (
    <ERPListPage
      title="Roles & Permissions"
      subtitle="Define roles and assign module-level permissions"
      searchKey="name"
      data={roles}
      onAdd={() => {}}
      addLabel="Add Role"
      columns={[
        { key: "name", label: "Role Name" },
        { key: "description", label: "Description" },
        { key: "userCount", label: "Users" },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
        {
          key: "actions", label: "Actions",
          render: () => (
            <button className="text-[12px] font-semibold text-brand-500 hover:underline">Manage Permissions</button>
          )
        },
      ]}
    />
  );
}
