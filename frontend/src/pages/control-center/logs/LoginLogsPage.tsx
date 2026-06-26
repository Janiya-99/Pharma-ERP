import React, { useState, useEffect } from "react";
import { getLoginLogs, getUsers } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FormError from "../../../components/common/FormError";
import DateRangeFilter from "../../../components/common/DateRangeFilter";
import LogStatusBadge from "../../../components/common/LogStatusBadge";
import { Search } from "lucide-react";

const LoginLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    date_from: "",
    date_to: "",
    user_id: "",
    email: "",
    status: "",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page, 
    filters.user_id, 
    filters.email, 
    filters.status, 
    filters.date_from,
    filters.date_to
  ]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLoginLogs(filters);
      if (res.success) {
        setLogs(Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []));
        setPagination(res.meta || res.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load login logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers({ limit: 100 });
      if (res.success) setUsers(Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      console.error("Failed to load users", err);
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
      cell: (row: unknown) => row.user?.full_name || row.user_name || "-"
    },
    {
      header: "Email",
      accessor: "email",
      cell: (row: unknown) => <span className="text-gray-600">{row.email || "-"}</span>
    },
    {
      header: "Login Status",
      accessor: "status",
      cell: (row: unknown) => <LogStatusBadge status={row.status} />
    },
    {
      header: "Failure Reason",
      accessor: "failure_reason",
      cell: (row: unknown) => <span className="text-red-600 text-xs">{row.failure_reason || "-"}</span>
    },
    {
      header: "IP Address",
      accessor: "ip_address",
      cell: (row: unknown) => <span className="font-mono text-xs text-gray-500 bg-gray-50 px-1 rounded">{row.ip_address || "-"}</span>
    },
    {
      header: "User Agent",
      accessor: "user_agent",
      cell: (row: unknown) => (
        <span className="text-xs text-gray-500 truncate block max-w-[200px]" title={row.user_agent}>
          {row.user_agent || "-"}
        </span>
      )
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Login Logs"
        description="Monitor user login attempts and authentication history."
      />

      <FormError message={error} />

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 space-y-4 shadow-sm">
        {/* Top row filters */}
        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 flex w-full xl:max-w-md gap-2">
            <Input
              placeholder="Search user, email, IP..."
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
            placeholder="Email Address"
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
            className="w-48"
          />

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="locked">Locked</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyTitle="No login logs found"
      />

      <Pagination
        pagination={pagination}
        onPageChange={(page: unknown) => setFilters({ ...filters, page })}
      />
    </div>
  );
};

export default LoginLogsPage;
