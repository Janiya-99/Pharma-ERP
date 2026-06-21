import React, { useEffect, useState } from "react";
import { financeApi } from "api/financeApi";
import DataTable from "components/erp/DataTable";
import PermissionGuard from "components/erp/PermissionGuard";
import FinancePageHeader from "components/finance/FinancePageHeader";
import { Button } from "components/ui/button";
import { Plus, List, Network } from "lucide-react";
import AccountClassificationFormModal from "./AccountClassificationFormModal";
import AccountClassificationTree from "./AccountClassificationTree";
import { toast } from "react-hot-toast";

export default function AccountClassificationsPage() {
  const [data, setData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "tree">("tree");
  const [search, setSearch] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchClassifications = async () => {
    setLoading(true);
    try {
      if (viewMode === "tree") {
        const res = await financeApi.getAccountClassificationsTree();
        if (res.data.success) {
          setTreeData(res.data.data);
        }
      } else {
        const res = await financeApi.getAccountClassifications({});
        if (res.data.success) {
          setData(res.data.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch classifications", err);
      toast.error("Failed to load classifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassifications();
  }, [viewMode]);

  const handleCreate = () => {
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (record: any) => {
    if (window.confirm(`Are you sure you want to delete ${record.name}?`)) {
      try {
        const res = await financeApi.deleteAccountClassification(record.id);
        if (res.data.success) {
          toast.success(`${record.name} deleted successfully`);
          fetchClassifications();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete classification");
      }
    }
  };

  const columns = [
    { header: "Type", accessor: "type" },
    { header: "Name", accessor: "name" },
    { header: "Level", accessor: "level" },
    { header: "Normal Balance", accessor: "normal_balance" },
    { 
      header: "Status", 
      accessor: "status",
      render: (val: string) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          val === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {val}
        </span>
      )
    },
  ];

  return (
    <div className="py-5">
      <FinancePageHeader 
        title="Account Classifications" 
        description="Manage the hierarchical classification of accounts"
        action={
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setViewMode(viewMode === "tree" ? "table" : "tree")}
            >
              {viewMode === "tree" ? (
                <><List className="mr-2 h-4 w-4" /> Table View</>
              ) : (
                <><Network className="mr-2 h-4 w-4" /> Tree View</>
              )}
            </Button>
            <PermissionGuard permission="finance.account_classification.create">
              <Button onClick={handleCreate} className="bg-brand-500 hover:bg-brand-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> New Classification
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-4">
        {viewMode === "tree" ? (
          <AccountClassificationTree 
            data={treeData} 
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onSearch={setSearch}
            searchPlaceholder="Search classifications..."
            actions={(record) => (
              <div className="flex space-x-2 justify-end">
                <PermissionGuard permission="finance.account_classification.update">
                  <button 
                    onClick={() => handleEdit(record)}
                    className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
                  >
                    Edit
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="finance.account_classification.delete">
                  <button 
                    onClick={() => handleDelete(record)}
                    className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
                  >
                    Delete
                  </button>
                </PermissionGuard>
              </div>
            )}
          />
        )}
      </div>

      <AccountClassificationFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        record={selectedRecord}
        onSuccess={fetchClassifications}
      />
    </div>
  );
}
