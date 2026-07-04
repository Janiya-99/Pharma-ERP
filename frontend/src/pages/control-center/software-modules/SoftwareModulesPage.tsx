import { useState, useEffect } from "react";
import { getSoftwareModules } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Badge from "../../../components/common/Badge";
import FormError from "../../../components/common/FormError";
import { LayoutGrid } from "lucide-react";

const SoftwareModulesPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await getSoftwareModules();
      if (res.success) {
        setModules(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load software modules");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Code",
      accessor: "software_code",
      cellClassName: "font-medium text-gray-900",
    },
    {
      header: "Name",
      accessor: "software_name",
    },
    {
      header: "Route Path",
      accessor: "route_path",
      cell: (row: unknown) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{row.route_path}</span>,
    },
    {
      header: "Display Order",
      accessor: "display_order",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row: unknown) => (
        <Badge variant={row.status === "active" ? "success" : "default"}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Software Modules"
        description="View system-registered ERP software modules."
      />

      <FormError message={error} />

      <div className="mb-4 flex bg-indigo-50 border border-indigo-100 p-4 rounded-md">
        <LayoutGrid className="h-5 w-5 text-indigo-800 mr-3 shrink-0" />
        <p className="text-sm text-indigo-800">
          Software modules are system-level components seeded by the platform. You cannot create or delete them from the frontend.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={modules}
        loading={loading}
        emptyTitle="No modules found"
      />
    </div>
  );
};

export default SoftwareModulesPage;
