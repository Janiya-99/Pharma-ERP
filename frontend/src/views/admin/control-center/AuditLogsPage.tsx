import React from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { auditLogs } from "variables/mockData";

export default function AuditLogsPage() {
  return (
    <ERPListPage
      title="Audit Logs"
      subtitle="System audit trail — all user actions are recorded"
      searchKey="user"
      data={auditLogs}
      columns={[
        { key: "dateTime", label: "Date / Time" },
        { key: "user", label: "User" },
        { key: "module", label: "Module" },
        { key: "action", label: "Action" },
        { key: "table", label: "Table" },
        { key: "recordId", label: "Record ID" },
        { key: "ip", label: "IP Address" },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
