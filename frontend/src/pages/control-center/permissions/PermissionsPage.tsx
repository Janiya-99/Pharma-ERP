import { useState, useEffect, useMemo } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { getPermissions, getPermissionsGrouped, getSoftwareModules } from "../../../api/controlApi";
import { PageTitleCard } from "../../../components/common/PageTitleCard";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FormError from "../../../components/common/FormError";
import StatusBadge from "../../../components/common/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Search, LayoutList, Layers, Key, ShieldCheck, RefreshCw, FilterX, Building2 } from "lucide-react";

const ALL_OPTION = "__all__";

const MetricCard = ({
  label,
  value,
  helper,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
}) => (
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

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [softwareModules, setSoftwareModules] = useState<any[]>([]);

  const [viewMode, setViewMode] = useState<"flat" | "grouped">("flat");
  const [searchDraft, setSearchDraft] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    software_id: "",
    permission_group: "",
    status: "",
    page: 1,
    limit: 15,
  });

  useEffect(() => {
    fetchSoftwareModules();
  }, []);

  useEffect(() => {
    if (viewMode === "flat") {
      fetchPermissions();
    } else {
      fetchGroupedPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.limit,
    filters.search,
    filters.software_id,
    filters.permission_group,
    filters.status,
    viewMode,
  ]);

  const fetchSoftwareModules = async () => {
    try {
      const res = await getSoftwareModules();
      if (res.success) {
        setSoftwareModules(Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []));
      }
    } catch (err) {
      console.error("Failed to fetch software modules", err);
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPermissions(filters);
      if (res.success) {
        setPermissions(Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []));
        setPagination(res.meta || res.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupedPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPermissionsGrouped({
        software_id: filters.software_id,
        search: filters.search,
        status: filters.status,
      });
      if (res.success) {
        setGroupedPermissions(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load grouped permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchDraft, page: 1 }));
  };

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value === ALL_OPTION ? "" : value, page: 1 }));
  };

  const clearFilters = () => {
    setSearchDraft("");
    setFilters({
      search: "",
      software_id: "",
      permission_group: "",
      status: "",
      page: 1,
      limit: 15,
    });
  };

  const refreshData = () => {
    if (viewMode === "flat") {
      fetchPermissions();
    } else {
      fetchGroupedPermissions();
    }
  };

  const formatLabel = (value?: string) => (value ? value.replace(/_/g, " ") : "-");

  const activeFilterCount = useMemo(
    () => [filters.search, filters.software_id, filters.permission_group, filters.status].filter(Boolean).length,
    [filters]
  );

  const totalResults = pagination?.total ?? permissions.length;

  const activeCount = useMemo(
    () => permissions.filter((p: any) => (p.status || "active").toLowerCase() === "active").length,
    [permissions]
  );

  const totalGroupsCount = useMemo(() => {
    if (viewMode === "grouped") {
      return groupedPermissions.reduce(
        (acc: number, sg: any) => acc + (Array.isArray(sg?.groups) ? sg.groups.length : 0),
        0
      );
    }
    return new Set(permissions.map((p: any) => p.permission_group).filter(Boolean)).size;
  }, [groupedPermissions, permissions, viewMode]);

  const softwareOptions = softwareModules.map((m: any) => ({
    value: String(m.id),
    label: m.software_name || m.software_code || `Module ${m.id}`,
  }));

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Client-side filtering for grouped permissions when search draft or status filter is applied
  const filteredGrouped = useMemo(() => {
    if (!filters.search && !filters.status) return groupedPermissions;

    const searchLower = filters.search.toLowerCase();
    const statusLower = filters.status.toLowerCase();

    return groupedPermissions
      .map((sg: any) => {
        const groups = (Array.isArray(sg?.groups) ? sg.groups : [])
          .map((g: any) => {
            const perms = (Array.isArray(g?.permissions) ? g.permissions : []).filter((p: any) => {
              const matchSearch =
                !searchLower ||
                (p.permission_name || "").toLowerCase().includes(searchLower) ||
                (p.permission_key || "").toLowerCase().includes(searchLower) ||
                (p.description || "").toLowerCase().includes(searchLower);

              const matchStatus = !statusLower || (p.status || "").toLowerCase() === statusLower;

              return matchSearch && matchStatus;
            });

            return { ...g, permissions: perms };
          })
          .filter((g: any) => g.permissions.length > 0);

        return { ...sg, groups };
      })
      .filter((sg: any) => sg.groups.length > 0);
  }, [groupedPermissions, filters.search, filters.status]);

  const columns = [
    {
      header: "Software",
      accessor: "software_id",
      cell: (row: any) =>
        row.software_name ||
        row.software?.software_name ||
        row.software_module?.software_name ||
        (row.software_code ? formatLabel(row.software_code) : "-"),
    },
    {
      header: "Permission Group",
      accessor: "permission_group",
      cell: (row: any) => <span className="capitalize">{formatLabel(row.permission_group)}</span>,
    },
    {
      header: "Permission Name",
      accessor: "permission_name",
      cellClassName: "font-medium text-gray-900",
    },
    {
      header: "Permission Key",
      accessor: "permission_key",
      cell: (row: any) => (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">{row.permission_key}</span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row: any) => <span className="block max-w-xs truncate text-slate-500">{row.description || "-"}</span>,
    },
    {
      header: "Status",
      cell: (row: any) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="min-h-full space-y-6">
      <PageTitleCard
        title="System Permissions Registry"
        description="Explore the comprehensive security registry of system capability keys, actions, and software scopes."
        moduleTag="Control Center"
        icon={Key}
        accent="indigo"
        backTo="/control-center/dashboard"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
              {Number(totalResults || 0).toLocaleString()} permissions
            </span>
            <Button type="button" variant="outline" size="sm" className="gap-2 rounded-xl" onClick={refreshData}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl"
              onClick={clearFilters}
              disabled={!activeFilterCount}
            >
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode("flat")}
                className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "flat" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LayoutList className="mr-1.5 h-3.5 w-3.5" /> List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grouped")}
                className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "grouped" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Layers className="mr-1.5 h-3.5 w-3.5" /> Grouped
              </button>
            </div>
          </div>
        }
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <FormError message={error} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Permissions"
            value={Number(totalResults || 0).toLocaleString()}
            helper="Registered capabilities"
            icon={Key}
            iconClassName="bg-indigo-50 text-indigo-600"
          />
          <MetricCard
            label="Active Permissions"
            value={activeCount.toLocaleString()}
            helper="Currently operable"
            icon={ShieldCheck}
            iconClassName="bg-emerald-50 text-emerald-600"
          />
          <MetricCard
            label="Software Scopes"
            value={softwareModules.length.toLocaleString()}
            helper="Connected modules"
            icon={Building2}
            iconClassName="bg-violet-50 text-violet-600"
          />
          <MetricCard
            label="Permission Groups"
            value={totalGroupsCount.toLocaleString()}
            helper="Domain categories"
            icon={Layers}
            iconClassName="bg-slate-100 text-slate-700"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <form onSubmit={handleSearch} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Search</label>
                <Input
                  placeholder="Search key, permission name, description..."
                  name="search"
                  value={searchDraft}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchDraft(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white shadow-sm"
                />
              </div>

              <Button type="submit" variant="info" className="h-11 w-11 self-end rounded-xl px-0">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <div className="grid gap-4 sm:grid-cols-2">
              <FilterSelect
                label="Software Module"
                value={filters.software_id}
                placeholder="All Software Modules"
                options={softwareOptions}
                onValueChange={(val) => handleSelectChange("software_id", val)}
              />

              <FilterSelect
                label="Status"
                value={filters.status}
                placeholder="All Statuses"
                options={statusOptions}
                onValueChange={(val) => handleSelectChange("status", val)}
              />
            </div>
          </div>

          {viewMode === "flat" && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Permission Group
                </label>
                <Input
                  placeholder="e.g. user, role, product..."
                  name="permission_group"
                  value={filters.permission_group}
                  onChange={handleFilterChange}
                  className="h-11 rounded-xl border-slate-200 bg-white shadow-sm"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="outline" className="h-11 gap-2 rounded-xl" onClick={refreshData}>
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

        {viewMode === "flat" ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Permissions Catalog</h2>
                <p className="text-xs text-slate-500">Security access keys available across modules.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                {permissions.length.toLocaleString()} items on this page
              </span>
            </div>

            <DataTable
              columns={columns}
              data={permissions}
              loading={loading}
              emptyTitle="No permissions found"
              emptyDescription="Try clearing filters or checking other software modules."
            />
            <Pagination pagination={pagination} onPageChange={(page: number) => setFilters({ ...filters, page })} />
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Grouped Structure</h2>
                <p className="text-xs text-slate-500">Hierarchical overview organized by software module and domain.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                {filteredGrouped.length.toLocaleString()} software scopes
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-medium text-slate-500 shadow-sm">
                Loading grouped permissions...
              </div>
            ) : filteredGrouped.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-medium text-slate-500 shadow-sm">
                No permissions found matching current criteria.
              </div>
            ) : (
              filteredGrouped.map((softwareGroup: any, idx: number) => {
                const permissionGroups = Array.isArray(softwareGroup?.groups) ? softwareGroup.groups : [];
                const permissionCount = permissionGroups.reduce(
                  (count: number, group: any) =>
                    count + (Array.isArray(group?.permissions) ? group.permissions.length : 0),
                  0
                );

                return (
                  <div
                    key={softwareGroup?.software_code || idx}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
                      <h3 className="flex items-center gap-2 font-semibold text-slate-900 capitalize">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        {formatLabel(softwareGroup?.software_code)}
                      </h3>
                      <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {permissionCount} Permissions
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {permissionGroups.map((group: any, groupIdx: number) => (
                        <div key={`${softwareGroup?.software_code || idx}-${group?.permission_group || groupIdx}`} className="p-0">
                          <div className="flex items-center justify-between bg-slate-50/40 px-5 py-3">
                            <h4 className="text-sm font-semibold text-slate-800 capitalize">
                              {formatLabel(group?.permission_group)}
                            </h4>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {Array.isArray(group?.permissions) ? group.permissions.length : 0} items
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                              <thead className="bg-white text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <tr>
                                  <th className="w-1/4 px-6 py-3">Name</th>
                                  <th className="w-1/4 px-6 py-3">Key</th>
                                  <th className="w-1/3 px-6 py-3">Description</th>
                                  <th className="px-6 py-3">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {(Array.isArray(group?.permissions) ? group.permissions : []).map((p: any) => (
                                  <tr key={p.id} className="transition-colors hover:bg-slate-50/80">
                                    <td className="whitespace-nowrap px-6 py-3 font-medium text-slate-900">
                                      {p.permission_name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-3 text-slate-500">
                                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                                        {p.permission_key}
                                      </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">{p.description || "-"}</td>
                                    <td className="whitespace-nowrap px-6 py-3">
                                      <StatusBadge status={p.status} />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default PermissionsPage;
