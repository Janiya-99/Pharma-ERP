import React, { useState, useEffect } from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { ERPFormModal, FormField } from "components/erp/ERPFormModal";
import { ERPDetailPanel, DetailField } from "components/erp/ERPDetailPanel";
import api from "lib/api";
import { toast } from "sonner";

const branchFields: FormField[] = [
  { key: "name", label: "Branch Name", type: "text", required: true, placeholder: "e.g. Kandy Branch" },
  { key: "code", label: "Branch Code", type: "text", required: true, placeholder: "e.g. KDY", validate: (v: any) => v && v.length > 5 ? "Code must be 5 characters or less" : null },
  { key: "address", label: "Address", type: "textarea", span: 2, placeholder: "Full company address" },
  { key: "phone", label: "Contact Number", type: "tel", placeholder: "+94 81 222 3344" },
  { key: "is_active", label: "Status", type: "select", options: [
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ]},
];

export default function BranchPage() {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/branches");
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => { setSelected(null); setIsEdit(false); setShowForm(true); };
  const handleEdit = (row: any) => { setSelected(row); setIsEdit(true); setShowForm(true); setShowDetail(false); };
  const handleView = (row: any) => { setSelected(row); setShowDetail(true); };

  const handleSave = async (values: Record<string, any>) => {
    setSaving(true);
    try {
      const payload = { ...values, is_active: values.is_active === "true" || values.is_active === true };
      
      if (isEdit && selected) {
        await api.put(`/admin/branches/${selected.id}`, payload);
        toast.success("Branch updated successfully");
      } else {
        await api.post("/admin/branches", payload);
        toast.success("Branch added successfully");
      }
      await fetchData();
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save branch", err);
      toast.error("Failed to save branch. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const detailFields: DetailField[] = selected ? [
    { label: "Branch Name", value: selected.name },
    { label: "Branch Code", value: selected.code },
    { label: "Address", value: selected.address, span: 2 },
    { label: "Contact", value: selected.phone },
    { label: "Status", value: <StatusBadge status={selected.is_active ? "Active" : "Inactive"} /> },
  ] : [];

  return (
    <>
      <ERPListPage
        title="Branches"
        subtitle="Manage branch locations and regional operations"
        searchKey="name"
        data={data}
        isLoading={loading}
        onAdd={handleAdd}
        addLabel="Add Branch"
        onRowClick={handleView}
        columns={[
          { key: "code", label: "Code" },
          { key: "name", label: "Branch Name" },
          { key: "address", label: "Address" },
          { key: "phone", label: "Contact" },
          { key: "status", label: "Status", render: (row: any) => <StatusBadge status={row.is_active ? "Active" : "Inactive"} /> },
        ]}
      />

      <ERPFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={isEdit ? "Edit Branch" : "Add Branch"}
        subtitle="Branch location and contact details"
        fields={branchFields}
        initialValues={selected ? { ...selected, is_active: selected.is_active ? "true" : "false" } : { is_active: "true" }}
        onSave={handleSave}
        isLoading={saving}
        isEditMode={isEdit}
      />

      <ERPDetailPanel
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title={selected?.name || ""}
        subtitle={`Code: ${selected?.code}`}
        status={selected?.is_active ? "Active" : "Inactive"}
        fields={detailFields}
        onEdit={() => handleEdit(selected)}
      />
    </>
  );
}
