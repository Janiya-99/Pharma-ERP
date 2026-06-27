import React, { useState, useEffect } from "react";
import { getPermissions, getPermissionsGrouped, getSoftwareModules } from "../../../api/controlApi";
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
  }, [filters.page, filters.software_id, filters.permission_group, filters.status, viewMode]);

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
      setError(err.response?.data?.message || "Failed to load grouped permissions");
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

  const formatLabel = (value?: string) => (value ? value.replace(/_/g, " ") : "-");

  const columns = [
    {
      header: "Software",
      accessor: "software_id",
      cell: (row: unknown) => row.software_module?.software_name || "-",
    },
    {
      header: "Permission Group",
      accessor: "permission_group",
      cell: (row: unknown) => <span className="capitalize">{formatLabel(row.permission_group)}</span>,
    },
    {
      header: "Permission Name",
      accessor: "permission_name",
      cellClassName: "font-medium text-gray-900",
    },
    {
      header: "Permission Key",
      accessor: "permission_key",
      cell: (row: unknown) => <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{row.permission_key}</span>,
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row: unknown) => <span className="text-gray-500 truncate block max-w-xs">{row.description || "-"}</span>,
    },
    {
      header: "Status",
      cell: (row: unknown) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Permissions"
        description="View system permissions. Permissions are system-seeded and read-only."
      />

      <FormError message={error} />

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex flex-col xl:flex-row gap-4 shadow-sm items-start xl:items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <Input
            placeholder="Search permissions..."
            name="search"
            value={filters.search}
            onChange={(e: any) => setFilters({ ...filters, search: e.target.value })}
            className="w-full xl:max-w-md"
          />
          <Button type="submit" variant="secondary" className="px-3">
            <Search className="w-4 h-4" />
          </Button>
        </form>
        
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
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
          
          <div className="border-l border-gray-300 mx-1 hidden xl:block"></div>
          
          <div className="flex bg-gray-100 rounded-md p-1 border border-gray-200">
            <button
              onClick={() => setViewMode("flat")}
              className={`px-3 py-1 text-sm font-medium rounded flex items-center transition-colors ${
                viewMode === "flat" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutList className="w-4 h-4 mr-1.5" /> List
            </button>
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-3 py-1 text-sm font-medium rounded flex items-center transition-colors ${
                viewMode === "grouped" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Layers className="w-4 h-4 mr-1.5" /> Grouped
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
            <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-500">
              Loading permissions...
            </div>
      ) : groupedPermissions.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-500">
              No permissions found
            </div>
          ) : (
            groupedPermissions.map((softwareGroup: any, idx: number) => {
              const permissionGroups = Array.isArray(softwareGroup?.groups) ? softwareGroup.groups : [];
              const permissionCount = permissionGroups.reduce(
                (count: number, group: any) => count + (Array.isArray(group?.permissions) ? group.permissions.length : 0),
                0
              );

              return (
                <div key={softwareGroup?.software_code || idx} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 capitalize flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {formatLabel(softwareGroup?.software_code)}
                    </h3>
                    <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      {permissionCount} Permissions
                    </span>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {permissionGroups.map((group: any, groupIdx: number) => (
                      <div key={`${softwareGroup?.software_code || idx}-${group?.permission_group || groupIdx}`} className="p-0">
                        <div className="flex items-center justify-between px-4 py-3 bg-white">
                          <h4 className="text-sm font-semibold text-gray-800 capitalize">
                            {formatLabel(group?.permission_group)}
                          </h4>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {Array.isArray(group?.permissions) ? group.permissions.length : 0} items
                          </span>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-white">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Key</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Description</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {(Array.isArray(group?.permissions) ? group.permissions : []).map((p: any) => (
                              <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.permission_name}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                  <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{p.permission_key}</span>
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-500">{p.description || "-"}</td>
                                <td className="px-6 py-3 whitespace-nowrap"><StatusBadge status={p.status} /></td>
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
