import React, { useEffect, useMemo, useState } from "react";
import {
  getAuditLogs,
  getSoftwareModules,
  getBranches,
  getUsers,
} from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FormError from "../../../components/common/FormError";
import DateRangeFilter from "../../../components/common/DateRangeFilter";
import ActionMenu from "../../../components/common/ActionMenu";
import AuditLogDetailModal from "./AuditLogDetailModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Activity,
  Building2,
  FilterX,
  RefreshCw,
  Search,
  Users,
  Layers3,
} from "lucide-react";

const ALL_OPTION = "__all__";

const MetricCard = ({
  label,
  value,
  helper,
  icon: Icon,
  iconClassName,
}: any) => (
  <div className="border-slate-200 rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.18em]">
          {label}
        </p>
        <p className="text-slate-900 mt-2 text-2xl font-semibold tracking-tight">
          {value}
        </p>
        {helper && <p className="text-slate-500 mt-1 text-xs">{helper}</p>}
      </div>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          iconClassName || "bg-slate-100 text-slate-600"
        }`}
      >
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
    <label className="text-slate-500 block text-[11px] font-bold uppercase tracking-[0.18em]">
      {label}
    </label>
    <Select value={value || ALL_OPTION} onValueChange={onValueChange}>
      <SelectTrigger className="border-slate-200 h-11 w-full rounded-xl bg-white px-3.5 shadow-sm">
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

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [softwareModules, setSoftwareModules] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

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
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [searchDraft, setSearchDraft] = useState("");

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.search,
    filters.user_id,
    filters.branch_id,
    filters.software_id,
    filters.action,
    filters.entity_name,
    filters.date_from,
    filters.date_to,
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
        setLogs(
          Array.isArray(res.data.items)
            ? res.data.items
            : Array.isArray(res.data)
            ? res.data
            : []
        );
        setPagination(res.meta || res.pagination);
      }
    } catch (err: any) {
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
        getUsers({ limit: 100 }),
      ]);

      if (softRes.success)
        setSoftwareModules(
          Array.isArray(softRes.data.items)
            ? softRes.data.items
            : Array.isArray(softRes.data)
            ? softRes.data
            : []
        );
      if (branchRes.success)
        setBranches(
          Array.isArray(branchRes.data.items)
            ? branchRes.data.items
            : Array.isArray(branchRes.data)
            ? branchRes.data
            : []
        );
      if (userRes.success)
        setUsers(
          Array.isArray(userRes.data.items)
            ? userRes.data.items
            : Array.isArray(userRes.data)
            ? userRes.data
            : []
        );
    } catch (err) {
      console.error("Failed to load dropdown data", err);
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
    setFilters({
      ...filters,
      date_from: range.dateFrom,
      date_to: range.dateTo,
      page: 1,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters({
      ...filters,
      [name]: value === ALL_OPTION ? "" : value,
      page: 1,
    });
  };

  const clearFilters = () => {
    setSearchDraft("");
    setFilters({
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
  };

  const openDetails = (log: any) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const getRowActions = (row: any) => [
    {
      label: "View Details",
      icon: Activity,
      onClick: openDetails,
    },
  ];

  const totalResults = pagination?.total ?? logs.length;

  const currentUsers = useMemo(
    () =>
      new Set(
        logs.map((row: any) => row.user?.full_name || row.user_name || "System")
      ).size,
    [logs]
  );
  const currentBranches = useMemo(
    () =>
      new Set(
        logs.map(
          (row: any) => row.branch?.branch_name || row.branch_name || "-"
        )
      ).size,
    [logs]
  );
  const currentActions = useMemo(
    () => new Set(logs.map((row: any) => row.action || "UNKNOWN")).size,
    [logs]
  );
  const activeFilterCount = useMemo(
    () =>
      [
        filters.search,
        filters.date_from,
        filters.date_to,
        filters.user_id,
        filters.branch_id,
        filters.software_id,
        filters.action,
        filters.entity_name,
      ].filter(Boolean).length,
    [filters]
  );

  const columns = [
    {
      header: "Date / Time",
      accessor: "created_at",
      cell: (row: any) => (
        <div className="whitespace-nowrap">
          <span className="text-slate-900 font-semibold">
            {new Date(row.created_at).toLocaleDateString()}
          </span>
          <br />
          <span className="text-slate-500 text-xs">
            {new Date(row.created_at).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      header: "User",
      accessor: "user_name",
      cell: (row: any) => row.user?.full_name || row.user_name || "System",
    },
    {
      header: "Branch",
      accessor: "branch_name",
      cell: (row: any) => row.branch?.branch_name || row.branch_name || "-",
    },
    {
      header: "Software",
      accessor: "software_name",
      cell: (row: any) =>
        row.software?.software_name ||
        row.software_module?.software_name ||
        row.software_name ||
        "-",
    },
    {
      header: "Action",
      accessor: "action",
      cell: (row: any) => (
        <span className="border-slate-200 bg-slate-50 text-slate-700 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
          {row.action || "-"}
        </span>
      ),
    },
    {
      header: "Entity Name",
      accessor: "entity_name",
      cell: (row: any) => (
        <span className="text-slate-900 font-medium">
          {row.entity_name || "-"}
        </span>
      ),
    },
    {
      header: "Entity ID",
      accessor: "entity_id",
      cell: (row: any) => (
        <span className="text-slate-600 font-mono text-xs">
          {row.entity_id || "-"}
        </span>
      ),
    },
    {
      header: "IP Address",
      accessor: "ip_address",
      cell: (row: any) => (
        <span className="text-slate-500 font-mono text-xs">
          {row.ip_address || "-"}
        </span>
      ),
    },
    {
      header: "Actions",
      cellClassName: "text-right",
      cell: (row: any) => (
        <ActionMenu actions={getRowActions(row)} item={row} />
      ),
    },
  ];

  const softwareOptions = softwareModules.map((module: any) => ({
    value: String(module.id),
    label:
      module.software_name || module.software_code || `Module ${module.id}`,
  }));
  const branchOptions = branches.map((branch: any) => ({
    value: String(branch.id),
    label: branch.branch_name || `Branch ${branch.id}`,
  }));
  const userOptions = users.map((user: any) => ({
    value: String(user.id),
    label: user.full_name || user.name || `User ${user.id}`,
  }));

  return (
    <div className="bg-slate-50 min-h-full">
      <PageHeader
        title="Audit Logs"
        description="Track system activity, configuration changes, and user actions."
        badge={
          <span className="border-slate-200 bg-slate-50 text-slate-600 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold">
            {Number(totalResults || 0).toLocaleString()} total
          </span>
        }
        action={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={fetchLogs}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={clearFilters}
              disabled={!activeFilterCount}
            >
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
            icon={Activity}
            iconClassName="bg-blue-50 text-blue-600"
          />
          <MetricCard
            label="Users"
            value={currentUsers.toLocaleString()}
            helper="Unique users on page"
            icon={Users}
            iconClassName="bg-slate-100 text-slate-700"
          />
          <MetricCard
            label="Branches"
            value={currentBranches.toLocaleString()}
            helper="Unique branches on page"
            icon={Building2}
            iconClassName="bg-violet-50 text-violet-600"
          />
          <MetricCard
            label="Actions"
            value={currentActions.toLocaleString()}
            helper="Unique action types"
            icon={Layers3}
            iconClassName="bg-emerald-50 text-emerald-600"
          />
        </section>

        <section className="border-slate-200 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <form
              onSubmit={handleSearch}
              className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="space-y-1.5">
                <label className="text-slate-500 block text-[11px] font-bold uppercase tracking-[0.18em]">
                  Search
                </label>
                <Input
                  placeholder="Search user, action, entity, IP..."
                  name="search"
                  value={searchDraft}
                  onChange={(e: any) => setSearchDraft(e.target.value)}
                  className="border-slate-200 h-11 rounded-xl bg-white shadow-sm"
                />
              </div>

              <Button
                type="submit"
                variant="info"
                className="h-11 w-11 rounded-xl px-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <DateRangeFilter
              dateFrom={filters.date_from}
              dateTo={filters.date_to}
              onChange={handleDateRangeChange}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <FilterSelect
              label="Software"
              value={filters.software_id}
              placeholder="All software"
              options={softwareOptions}
              onValueChange={(value) =>
                handleSelectChange("software_id", value)
              }
            />

            <FilterSelect
              label="Branch"
              value={filters.branch_id}
              placeholder="All branches"
              options={branchOptions}
              onValueChange={(value) => handleSelectChange("branch_id", value)}
            />

            <FilterSelect
              label="User"
              value={filters.user_id}
              placeholder="All users"
              options={userOptions}
              onValueChange={(value) => handleSelectChange("user_id", value)}
            />

            <div className="space-y-1.5">
              <label className="text-slate-500 block text-[11px] font-bold uppercase tracking-[0.18em]">
                Action
              </label>
              <Input
                placeholder="CREATE, UPDATE..."
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="border-slate-200 h-11 rounded-xl bg-white shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 block text-[11px] font-bold uppercase tracking-[0.18em]">
                Entity
              </label>
              <Input
                placeholder="Entity name"
                name="entity_name"
                value={filters.entity_name}
                onChange={handleFilterChange}
                className="border-slate-200 h-11 rounded-xl bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 rounded-xl"
              onClick={fetchLogs}
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 gap-2 rounded-xl"
              onClick={clearFilters}
              disabled={!activeFilterCount}
            >
              <FilterX className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-slate-900 text-sm font-semibold">
                Audit trail
              </h2>
              <p className="text-slate-500 text-xs">
                Activity captured on the current result set.
              </p>
            </div>
            <span className="border-slate-200 text-slate-500 rounded-full border bg-white px-3 py-1 text-xs font-semibold shadow-sm">
              {logs.length.toLocaleString()} rows on this page
            </span>
          </div>

          <DataTable
            columns={columns}
            data={logs}
            loading={loading}
            emptyTitle="No audit logs found"
            emptyDescription="Try widening the date range or clearing filters."
          />
        </section>

        <Pagination
          pagination={pagination}
          onPageChange={(page: number) => setFilters({ ...filters, page })}
        />

        {isDetailOpen && (
          <AuditLogDetailModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            log={selectedLog}
          />
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
