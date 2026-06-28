import React, { useState, useEffect } from "react";
import { ERPListPage } from "components/erp/ERPListPage";
import { ERPFormModal, FormField } from "components/erp/ERPFormModal";
import api from "lib/api";

const fields: FormField[] = [
  {
    key: "name",
    label: "Designation Name",
    type: "text",
    required: true,
    placeholder: "e.g. Sales Executive",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    span: 2,
    placeholder: "Role description and responsibilities",
  },
];

export default function DesignationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/designations");
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch designations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelected(null);
    setIsEdit(false);
    setShowForm(true);
  };
  const handleEdit = (row: any) => {
    setSelected(row);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleSave = async (values: Record<string, any>) => {
    setSaving(true);
    try {
      if (isEdit && selected) {
        await api.put(`/admin/designations/${selected.id}`, values);
      } else {
        await api.post("/admin/designations", values);
      }
      await fetchData();
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save designation", err);
      alert("Failed to save designation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ERPListPage
        title="Designations"
        subtitle="Manage job designations and descriptions"
        searchKey="name"
        data={data}
        isLoading={loading}
        onAdd={handleAdd}
        addLabel="Add Designation"
        onRowClick={handleEdit}
        columns={[
          { key: "name", label: "Designation" },
          { key: "description", label: "Description" },
        ]}
      />
      <ERPFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={isEdit ? "Edit Designation" : "Add Designation"}
        fields={fields}
        initialValues={selected || {}}
        onSave={handleSave}
        isLoading={saving}
        isEditMode={isEdit}
      />
    </>
  );
}
