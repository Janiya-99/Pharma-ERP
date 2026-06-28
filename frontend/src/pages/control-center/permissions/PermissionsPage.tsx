import React, { useState, useEffect } from "react";
import {
  getPermissions,
  getPermissionsGrouped,
  getSoftwareModules,
} from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FormError from "../../../components/common/FormError";
import StatusBadge from "../../../components/common/StatusBadge";
import { Search, LayoutList, Layers } from "lucide-react";

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [softwareModules, setSoftwareModules] = useState([]);

  const [viewMode, setViewMode] = useState("flat"); // "flat" or "grouped"

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
    filters.software_id,
    filters.permission_group,
    filters.status,
    viewMode,
  ]);

  const fetchSoftwareModules = async () => {
    try {
      const res = await getSoftwareModules();
      if (res.success) setSoftwareModules(res.data.items || res.data);
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
        setPermissions(res.data.items || res.data);
        setPagination(res.meta || res.pagination);
      }
    } catch (err) {
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
        setGroupedPermissions(res.data || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load grouped permissions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    if (viewMode === "flat") {
      fetchPermissions();
    } else {
      fetchGroupedPermissions();
    }
  };

  const handleFilterChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const formatLabel = (value?: string) =>
    value ? value.replace(/_/g, " ") : "-";

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
      cell: (row: unknown) => (
        <span className="capitalize">{formatLabel(row.permission_group)}</span>
      ),
    },
    {
      header: "Permission Name",
      accessor: "permission_name",
      cellClassName: "font-medium text-gray-900",
    },
    {
      header: "Permission Key",
      accessor: "permission_key",
      cell: (row: unknown) => (
        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700">
          {row.permission_key}
        </span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row: unknown) => (
        <span className="block max-w-xs truncate text-gray-500">
          {row.description || "-"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row: unknown) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Permissions"
        description="View system permissions. Permissions are system-seeded and read-only."
      />

      <FormError message={error} />

      <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center">
        <form onSubmit={handleSearch} className="flex w-full flex-1 gap-2">
          <Input
            placeholder="Search permissions..."
            name="search"
            value={filters.search}
            onChange={(e: any) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="w-full xl:max-w-md"
          />
          <Button type="submit" variant="secondary" className="px-3">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex w-full flex-wrap gap-2 xl:w-auto">
          <select
            name="software_id"
            value={filters.software_id}
            onChange={handleFilterChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Software Modules</option>
            {softwareModules.map((s: unknown) => (
              <option key={s.id} value={s.id}>
                {s.software_name}
              </option>
            ))}
          </select>

          {viewMode === "flat" && (
            <Input
              placeholder="Group (e.g. user)"
              name="permission_group"
              value={filters.permission_group}
              onChange={handleFilterChange}
              className="w-32"
            />
          )}

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="mx-1 hidden border-l border-gray-300 xl:block"></div>

          <div className="flex rounded-md border border-gray-200 bg-gray-100 p-1">
            <button
              onClick={() => setViewMode("flat")}
              className={`flex items-center rounded px-3 py-1 text-sm font-medium transition-colors ${
                viewMode === "flat"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutList className="mr-1.5 h-4 w-4" /> List
            </button>
            <button
              onClick={() => setViewMode("grouped")}
              className={`flex items-center rounded px-3 py-1 text-sm font-medium transition-colors ${
                viewMode === "grouped"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Layers className="mr-1.5 h-4 w-4" /> Grouped
            </button>
          </div>
        </div>
      </div>

      {viewMode === "flat" ? (
        <>
          <DataTable
            columns={columns}
            data={permissions}
            loading={loading}
            emptyTitle="No permissions found"
          />
          <Pagination
            pagination={pagination}
            onPageChange={(page: unknown) => setFilters({ ...filters, page })}
          />
        </>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
              Loading permissions...
            </div>
          ) : groupedPermissions.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
              No permissions found
            </div>
          ) : (
            groupedPermissions.map((softwareGroup: any, idx: number) => {
              const permissionGroups = Array.isArray(softwareGroup?.groups)
                ? softwareGroup.groups
                : [];
              const permissionCount = permissionGroups.reduce(
                (count: number, group: any) =>
                  count +
                  (Array.isArray(group?.permissions)
                    ? group.permissions.length
                    : 0),
                0
              );

              return (
                <div
                  key={softwareGroup?.software_code || idx}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <h3 className="flex items-center gap-2 font-semibold capitalize text-gray-800">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      {formatLabel(softwareGroup?.software_code)}
                    </h3>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500">
                      {permissionCount} Permissions
                    </span>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {permissionGroups.map((group: any, groupIdx: number) => (
                      <div
                        key={`${softwareGroup?.software_code || idx}-${
                          group?.permission_group || groupIdx
                        }`}
                        className="p-0"
                      >
                        <div className="flex items-center justify-between bg-white px-4 py-3">
                          <h4 className="text-sm font-semibold capitalize text-gray-800">
                            {formatLabel(group?.permission_group)}
                          </h4>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                            {Array.isArray(group?.permissions)
                              ? group.permissions.length
                              : 0}{" "}
                            items
                          </span>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-white">
                            <tr>
                              <th className="w-1/4 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Name
                              </th>
                              <th className="w-1/4 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Key
                              </th>
                              <th className="w-1/3 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Description
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {(Array.isArray(group?.permissions)
                              ? group.permissions
                              : []
                            ).map((p: any) => (
                              <tr key={p.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-900">
                                  {p.permission_name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500">
                                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                                    {p.permission_key}
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-500">
                                  {p.description || "-"}
                                </td>
                                <td className="whitespace-nowrap px-6 py-3">
                                  <StatusBadge status={p.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
