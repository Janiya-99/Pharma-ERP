import React, { useState, useEffect } from "react";
import { getAuditLogs, getSoftwareModules, getBranches, getUsers } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FormError from "../../../components/common/FormError";
import DateRangeFilter from "../../../components/common/DateRangeFilter";
import ActionMenu from "../../../components/common/ActionMenu";
import AuditLogDetailModal from "./AuditLogDetailModal";
import { Search, Eye } from "lucide-react";

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [softwareModules, setSoftwareModules] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    date_from: "",
    date_to: "",
    user_id: "",
    branch_id: "",
    software_id: "",
    action: "",
    entity_name: "",
    page: 1,
    limit: 10,
  });

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page, 
    filters.user_id, 
    filters.branch_id, 
    filters.software_id, 
    filters.action, 
    filters.entity_name,
    filters.date_from,
    filters.date_to
  ]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAuditLogs(filters);
      if (res.success) {
        setLogs(Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []));
        setPagination(res.meta || res.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [softRes, branchRes, userRes] = await Promise.all([
        getSoftwareModules(),
        getBranches({ limit: 100 }),
        getUsers({ limit: 100 })
      ]);
      if (softRes.success) setSoftwareModules(softRes.data.items || softRes.data || []);
      if (branchRes.success) setBranches(branchRes.data.items || branchRes.data || []);
      if (userRes.success) setUsers(userRes.data.items || userRes.data || []);
    } catch (err) {
      console.error("Failed to load dropdown data", err);
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchLogs();
  };

  const handleFilterChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleDateRangeChange = (range: unknown) => {
    setFilters({ ...filters, date_from: range.dateFrom, date_to: range.dateTo, page: 1 });
  };

  const openDetails = (log: unknown) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const getRowActions = (row: unknown) => [
    {
      label: "View Details",
      icon: Eye,
      onClick: openDetails,
    }
  ];

  const columns = [
    {
      header: "Date / Time",
      accessor: "created_at",
      cell: (row: unknown) => (
        <div className="whitespace-nowrap">
          <span className="font-medium text-gray-900">{new Date(row.created_at).toLocaleDateString()}</span>
          <br />
          <span className="text-xs text-gray-500">{new Date(row.created_at).toLocaleTimeString()}</span>
        </div>
      )
    },
    {
      header: "User",
      accessor: "user_name",
      cell: (row: unknown) => row.user?.full_name || row.user_name || "System"
    },
    {
      header: "Branch",
      accessor: "branch_name",
      cell: (row: unknown) => row.branch?.branch_name || row.branch_name || "-"
    },
    {
      header: "Software",
      accessor: "software_name",
      cell: (row: unknown) => row.software_module?.software_name || row.software_name || "-"
    },
    {
      header: "Action",
      accessor: "action",
      cell: (row: unknown) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase tracking-wider">
          {row.action}
        </span>
      )
    },
    {
      header: "Entity Name",
      accessor: "entity_name",
    },
    {
      header: "Entity ID",
      accessor: "entity_id",
      cell: (row: unknown) => <span className="font-mono text-xs text-gray-600">{row.entity_id || "-"}</span>
    },
    {
      header: "IP Address",
      accessor: "ip_address",
      cell: (row: unknown) => <span className="font-mono text-xs text-gray-500">{row.ip_address || "-"}</span>
    },
    {
      header: "Actions",
      cellClassName: "text-right",
      cell: (row: unknown) => <ActionMenu actions={getRowActions(row)} item={row} />,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Audit Logs"
        description="Monitor system activity and user actions across the ERP."
      />

      <FormError message={error} />

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 space-y-4 shadow-sm">
        {/* Top row filters */}
        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 flex w-full xl:max-w-md gap-2">
            <Input
              placeholder="Search user, action, entity, IP..."
              name="search"
              value={filters.search}
              onChange={(e: any) => setFilters({ ...filters, search: e.target.value })}
              className="w-full"
            />
            <Button type="submit" variant="secondary" className="px-3">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          <DateRangeFilter 
            dateFrom={filters.date_from}
            dateTo={filters.date_to}
            onChange={handleDateRangeChange}
          />
        </div>

        {/* Bottom row filters */}
        <div className="flex flex-wrap gap-3">
          <select
            name="software_id"
            value={filters.software_id}
            onChange={handleFilterChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Software Modules</option>
            {softwareModules.map((s: unknown) => (
              <option key={s.id} value={s.id}>{s.software_name}</option>
            ))}
          </select>

          <select
            name="branch_id"
            value={filters.branch_id}
            onChange={handleFilterChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Branches</option>
            {branches.map((b: unknown) => (
              <option key={b.id} value={b.id}>{b.branch_name}</option>
            ))}
          </select>

          <select
            name="user_id"
            value={filters.user_id}
            onChange={handleFilterChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Users</option>
            {users.map((u: unknown) => (
              <option key={u.id} value={u.id}>{u.full_name}</option>
            ))}
          </select>

          <Input
            placeholder="Action (e.g. CREATE)"
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            className="w-40"
          />

          <Input
            placeholder="Entity Name"
            name="entity_name"
            value={filters.entity_name}
            onChange={handleFilterChange}
            className="w-40"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyTitle="No audit logs found"
      />

      <Pagination
        pagination={pagination}
        onPageChange={(page: unknown) => setFilters({ ...filters, page })}
      />

      {isDetailOpen && (
        <AuditLogDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          log={selectedLog}
        />
      )}
    </div>
  );
};

export default AuditLogsPage;
