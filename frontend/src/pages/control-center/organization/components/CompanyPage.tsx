import React, { useState, useEffect } from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { ERPFormModal, FormField } from "components/erp/ERPFormModal";
import { ERPDetailPanel, DetailField } from "components/erp/ERPDetailPanel";
import api from "lib/api";
import { toast } from "sonner";

const companyFields: FormField[] = [
  {
    key: "name",
    label: "Company Name",
    type: "text",
    required: true,
    placeholder: "e.g. PharmaDist Lanka",
  },
  {
    key: "legalName",
    label: "Legal Name",
    type: "text",
    required: true,
    placeholder: "Full legal entity name",
  },
  {
    key: "regNo",
    label: "Registration No.",
    type: "text",
    required: true,
    placeholder: "e.g. PV00123456",
  },
  {
    key: "tin",
    label: "TIN Number",
    type: "text",
    placeholder: "Tax ID Number",
  },
  {
    key: "vat",
    label: "VAT Number",
    type: "text",
    placeholder: "VAT Registration No.",
  },
  {
    key: "address",
    label: "Address",
    type: "textarea",
    span: 2,
    placeholder: "Full company address",
  },
  {
    key: "phone",
    label: "Phone",
    type: "tel",
    required: true,
    placeholder: "+94 11 234 5678",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "info@company.lk",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
    ],
  },
];

export default function CompanyPage() {
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
      const res = await api.get("/admin/companies");
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch companies", err);
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
    setShowDetail(false);
  };

  const handleView = (row: any) => {
    setSelected(row);
    setShowDetail(true);
  };

  const handleSave = async (values: Record<string, any>, isDraft: boolean) => {
    setSaving(true);
    try {
      if (isEdit && selected) {
        await api.put(`/admin/companies/${selected.id}`, values);
        toast.success("Company updated successfully");
      } else {
        await api.post("/admin/companies", values);
        toast.success("Company added successfully");
      }
      await fetchData();
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save company", err);
      toast.error("Failed to save company. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const detailFields: DetailField[] = selected
    ? [
        { label: "Company Name", value: selected.name },
        { label: "Legal Name", value: selected.legalName },
        { label: "Registration No.", value: selected.regNo },
        { label: "TIN", value: selected.tin },
        { label: "VAT No.", value: selected.vat },
        { label: "Status", value: <StatusBadge status={selected.status} /> },
        { label: "Address", value: selected.address, span: 2 },
        { label: "Phone", value: selected.phone },
        { label: "Email", value: selected.email },
      ]
    : [];

  return (
    <>
      <ERPListPage
        title="Company"
        subtitle="Manage company registration, tax, and license details"
        searchKey="name"
        data={data}
        isLoading={loading}
        onAdd={handleAdd}
        addLabel="Edit Company"
        onRowClick={handleView}
        columns={[
          { key: "name", label: "Company Name" },
          { key: "legalName", label: "Legal Name" },
          { key: "regNo", label: "Reg. No." },
          { key: "tin", label: "TIN" },
          { key: "vat", label: "VAT No." },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          {
            key: "status",
            label: "Status",
            render: (row: any) => <StatusBadge status={row.status} />,
          },
        ]}
      />

      <ERPFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={isEdit ? "Edit Company" : "Add Company"}
        subtitle="Company registration and legal information"
        fields={companyFields}
        initialValues={selected || {}}
        onSave={handleSave}
        isLoading={saving}
        isEditMode={isEdit}
      />

      <ERPDetailPanel
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title={selected?.name || ""}
        subtitle="Company Details"
        status={selected?.status}
        fields={detailFields}
        onEdit={() => handleEdit(selected)}
      />
    </>
  );
}
