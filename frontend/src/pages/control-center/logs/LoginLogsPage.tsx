import React, { useEffect, useMemo, useState } from "react";
import { getLoginLogs, getUsers } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FormError from "../../../components/common/FormError";
import DateRangeFilter from "../../../components/common/DateRangeFilter";
import LogStatusBadge from "../../../components/common/LogStatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Search, RefreshCw, FilterX, Clock3, ShieldCheck, ShieldAlert, Users } from "lucide-react";

const ALL_OPTION = "__all__";

const MetricCard = ({ label, value, helper, icon: Icon, iconClassName }: any) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
        {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName || "bg-slate-100 text-slate-600"}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  </div>
);

const FilterSelect = ({
  label,
  value,
  placeholder,
  options,
  onValueChange,
  className = "",
}: {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onValueChange: (value: string) => void;
  className?: string;
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</label>
    <Select value={value || ALL_OPTION} onValueChange={onValueChange}>
      <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white px-3.5 shadow-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_OPTION}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const LoginLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [searchDraft, setSearchDraft] = useState("");

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
    filters.search,
    filters.user_id,
    filters.email,
    filters.status,
    filters.date_from,
    filters.date_to,
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
    } catch (err: any) {
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchDraft, page: 1 });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleDateRangeChange = (range: any) => {
    setFilters({ ...filters, date_from: range.dateFrom, date_to: range.dateTo, page: 1 });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters({ ...filters, [name]: value === ALL_OPTION ? "" : value, page: 1 });
  };

  const clearFilters = () => {
    setSearchDraft("");
    setFilters({
      search: "",
      date_from: "",
      date_to: "",
      user_id: "",
      email: "",
      status: "",
      page: 1,
      limit: 10,
    });
  };

  const totalResults = pagination?.total ?? logs.length;

  const currentUsers = useMemo(
    () => new Set(logs.map((row: any) => row.user?.full_name || row.user_name || row.email || "System")).size,
    [logs]
  );
  const successCount = useMemo(() => logs.filter((row: any) => row.status === "success").length, [logs]);
  const failureCount = useMemo(() => logs.filter((row: any) => row.status === "failed").length, [logs]);
  const activeFilterCount = useMemo(
    () => [filters.search, filters.date_from, filters.date_to, filters.user_id, filters.email, filters.status].filter(Boolean).length,
    [filters]
  );

  const columns = [
    {
      header: "Date / Time",
      accessor: "created_at",
      cell: (row: any) => (
        <div className="whitespace-nowrap">
          <span className="font-semibold text-slate-900">{new Date(row.created_at).toLocaleDateString()}</span>
          <br />
          <span className="text-xs text-slate-500">{new Date(row.created_at).toLocaleTimeString()}</span>
        </div>
      ),
    },
    {
      header: "User",
      accessor: "user_name",
      cell: (row: any) => row.user?.full_name || row.user_name || "-",
    },
    {
      header: "Email",
      accessor: "email",
      cell: (row: any) => <span className="text-slate-600">{row.email || row.user?.email || "-"}</span>,
    },
    {
      header: "Login Status",
      accessor: "status",
      cell: (row: any) => <LogStatusBadge status={row.status} />,
    },
    {
      header: "Failure Reason",
      accessor: "failure_reason",
      cell: (row: any) => <span className="text-xs text-rose-600">{row.failure_reason || "-"}</span>,
    },
    {
      header: "IP Address",
      accessor: "ip_address",
      cell: (row: any) => <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">{row.ip_address || "-"}</span>,
    },
    {
      header: "User Agent",
      accessor: "user_agent",
      cell: (row: any) => (
        <span className="block max-w-[220px] truncate text-xs text-slate-500" title={row.user_agent}>
          {row.user_agent || "-"}
        </span>
      ),
    },
  ];

  const userOptions = users.map((user: any) => ({
    value: String(user.id),
    label: user.full_name || user.name || `User ${user.id}`,
  }));

  return (
    <div className="min-h-full bg-slate-50">
      <PageHeader
        title="Login Logs"
        description="Monitor user authentication attempts and access history."
        badge={
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            {Number(totalResults || 0).toLocaleString()} total
          </span>
        }
        action={
          <>
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={clearFilters} disabled={!activeFilterCount}>
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
          </>
        }
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <FormError message={error} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Results"
            value={Number(totalResults || 0).toLocaleString()}
            helper="Current filtered total"
            icon={Clock3}
            iconClassName="bg-blue-50 text-blue-600"
          />
          <MetricCard
            label="Success"
            value={successCount.toLocaleString()}
            helper="Current page"
            icon={ShieldCheck}
            iconClassName="bg-emerald-50 text-emerald-600"
          />
          <MetricCard
            label="Failed"
            value={failureCount.toLocaleString()}
            helper="Current page"
            icon={ShieldAlert}
            iconClassName="bg-rose-50 text-rose-600"
          />
          <MetricCard
            label="Users"
            value={currentUsers.toLocaleString()}
            helper="Unique users on page"
            icon={Users}
            iconClassName="bg-slate-100 text-slate-700"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <form onSubmit={handleSearch} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Search</label>
                <Input
                  placeholder="Search user, email, IP..."
                  name="search"
                  value={searchDraft}
                  onChange={(e: any) => setSearchDraft(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white shadow-sm"
                />
              </div>

              <Button type="submit" variant="info" className="h-11 w-11 rounded-xl px-0">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <DateRangeFilter
              dateFrom={filters.date_from}
              dateTo={filters.date_to}
              onChange={handleDateRangeChange}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <FilterSelect
              label="User"
              value={filters.user_id}
              placeholder="All users"
              options={userOptions}
              onValueChange={(value) => handleSelectChange("user_id", value)}
            />

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Email</label>
              <Input
                placeholder="Email address"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                className="h-11 rounded-xl border-slate-200 bg-white shadow-sm"
              />
            </div>

            <FilterSelect
              label="Status"
              value={filters.status}
              placeholder="All statuses"
              options={[
                { value: "success", label: "Success" },
                { value: "failed", label: "Failed" },
                { value: "locked", label: "Locked" },
                { value: "inactive", label: "Inactive" },
                { value: "suspended", label: "Suspended" },
              ]}
              onValueChange={(value) => handleSelectChange("status", value)}
            />

            <div className="flex items-end gap-2">
              <Button type="button" variant="outline" className="h-11 flex-1 gap-2 rounded-xl" onClick={fetchLogs}>
                <RefreshCw className="h-4 w-4" />
                Reload
              </Button>
              <Button type="button" variant="ghost" className="h-11 gap-2 rounded-xl" onClick={clearFilters} disabled={!activeFilterCount}>
                <FilterX className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Login activity</h2>
              <p className="text-xs text-slate-500">Authentication attempts on the current result set.</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
              {logs.length.toLocaleString()} rows on this page
            </span>
          </div>

          <DataTable
            columns={columns}
            data={logs}
            loading={loading}
            emptyTitle="No login logs found"
            emptyDescription="Try widening the date range or clearing filters."
          />
        </section>

        <Pagination
          pagination={pagination}
          onPageChange={(page: number) => setFilters({ ...filters, page })}
        />
      </div>
    </div>
  );
};

export default LoginLogsPage;
