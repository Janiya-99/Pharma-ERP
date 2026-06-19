import React, { useState } from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { ERPFormModal, FormField } from "components/erp/ERPFormModal";
import { ERPDetailPanel, DetailField } from "components/erp/ERPDetailPanel";
import { ERPConfirmDialog } from "components/erp/ERPConfirmDialog";
import api from "lib/api";

const userFields: FormField[] = [
  { key: "full_name", label: "Full Name", type: "text", required: true, placeholder: "e.g. Amal Perera" },
  { key: "email", label: "Email", type: "email", required: true, placeholder: "amal@pharmadist.lk" },
  { key: "phone", label: "Mobile", type: "tel", placeholder: "+94 71 123 4567" },
  // NOTE: In edit mode, password should be hidden or optional, but our form modal is generic
  { key: "password", label: "Password", type: "password", placeholder: "Min 8 characters" },
  { key: "designation_id", label: "Designation", type: "select", options: [] }, // Populated dynamically
  { key: "branch_id", label: "Branch", type: "select", required: true, options: [] },
  { key: "role_ids", label: "Role", type: "select", required: true, options: [] },
  { key: "is_active", label: "Status", type: "select", options: [
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ]},
];

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form options
  const [branches, setBranches] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, bRes, rRes, dRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/branches"),
        api.get("/admin/roles"),
        api.get("/admin/designations"),
      ]);
      setData(uRes.data.data || []);
      setBranches(bRes.data.data || []);
      setRoles(rRes.data.data || []);
      setDesignations(dRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch user data", err);
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
      const payload: any = {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        branch_id: Number(values.branch_id),
        role_ids: [Number(values.role_ids)], // Convert single select back to array
        is_active: values.is_active === "true" || values.is_active === true,
      };
      
      if (values.designation_id) {
        payload.designation_id = Number(values.designation_id);
      }
      
      if (!isEdit && values.password) {
        payload.password = values.password;
      }

      if (isEdit && selected) {
        await api.put(`/admin/users/${selected.id}`, payload);
      } else {
        await api.post("/admin/users", payload);
      }
      await fetchData();
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save user", err);
      alert("Failed to save user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Dynamically update form fields with options
  const dynamicFields = [...userFields];
  const bField = dynamicFields.find(f => f.key === "branch_id");
  if (bField) bField.options = branches.map(b => ({ label: b.name, value: b.id.toString() }));
  
  const dField = dynamicFields.find(f => f.key === "designation_id");
  if (dField) dField.options = designations.map(d => ({ label: d.name, value: d.id.toString() }));
  
  const rField = dynamicFields.find(f => f.key === "role_ids");
  if (rField) rField.options = roles.map(r => ({ label: r.name, value: r.id.toString() }));

  const detailFields: DetailField[] = selected ? [
    { label: "Full Name", value: selected.full_name },
    { label: "Email", value: selected.email },
    { label: "Mobile", value: selected.phone },
    { label: "Designation", value: selected.designation?.name },
    { label: "Branch", value: selected.branch?.name },
    { label: "Status", value: <StatusBadge status={selected.is_active ? "Active" : "Inactive"} /> },
  ] : [];

  return (
    <>
      <ERPListPage
        title="Users"
        subtitle="Manage system users, roles, and branch access"
        searchKey="full_name"
        data={data}
        isLoading={loading}
        onAdd={handleAdd}
        addLabel="Add User"
        onRowClick={handleView}
        columns={[
          { key: "full_name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "designation", label: "Designation", render: (row) => row.designation?.name || "—" },
          { key: "branch", label: "Branch", render: (row) => row.branch?.name || "—" },
          { key: "status", label: "Status", render: (row) => <StatusBadge status={row.is_active ? "Active" : "Inactive"} /> },
        ]}
      />

      <ERPFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={isEdit ? "Edit User" : "Add User"}
        subtitle="User account and access configuration"
        fields={dynamicFields.map(f => isEdit && f.key === "password" ? { ...f, required: false, disabled: true, placeholder: "Hidden in edit mode" } : f)}
        initialValues={selected ? {
          ...selected,
          branch_id: selected.branch_id?.toString(),
          designation_id: selected.designation_id?.toString(),
          role_ids: selected.roles?.[0]?.id?.toString() || "",
          is_active: selected.is_active ? "true" : "false"
        } : { is_active: "true" }}
        onSave={handleSave}
        isLoading={saving}
        isEditMode={isEdit}
      />

      <ERPDetailPanel
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title={selected?.full_name || ""}
        subtitle={selected?.designation?.name || "User"}
        status={selected?.is_active ? "Active" : "Inactive"}
        fields={detailFields}
        onEdit={() => handleEdit(selected)}
        onDelete={() => { setShowDetail(false); setShowConfirm(true); }}
      />

      <ERPConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { console.log("Deactivate:", selected?.name); setShowConfirm(false); }}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${selected?.name}? They will lose access to the system.`}
        confirmLabel="Deactivate"
        confirmVariant="danger"
      />
    </>
  );
}
