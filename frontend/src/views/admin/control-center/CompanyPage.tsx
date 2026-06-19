import React from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { companies } from "variables/mockData";

export default function CompanyPage() {
  return (
    <ERPListPage
      title="Company"
      subtitle="Manage company registration, tax, and license details"
      searchKey="name"
      data={companies}
      onAdd={() => {}}
      addLabel="Edit Company"
      columns={[
        { key: "name", label: "Company Name" },
        { key: "legalName", label: "Legal Name" },
        { key: "regNo", label: "Reg. No." },
        { key: "tin", label: "TIN" },
        { key: "vat", label: "VAT No." },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
