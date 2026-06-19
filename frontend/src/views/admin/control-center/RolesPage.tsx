import React, { useState } from "react";
import { ERPListPage, StatusBadge } from "components/erp/ERPListPage";
import { ERPFormModal, FormField } from "components/erp/ERPFormModal";
import { MdClose, MdCheck, MdSave } from "react-icons/md";
import api from "lib/api";

// Permission categories and their permissions
const permissionMatrix = {
  "Control Center": [
    "company.view", "company.create", "company.edit",
    "user.view", "user.create", "user.edit",
    "role.view", "role.assign",
  ],
  "Finance": [
    "journal.view", "journal.create", "journal.post",
    "payment.view", "payment.create",
    "receipt.view", "receipt.create",
  ],
  "Inventory": [
    "product.view", "product.create", "product.edit",
    "grn.view", "grn.create", "grn.post",
    "transfer.view", "transfer.create",
    "adjustment.view", "adjustment.create",
  ],
  "Invoice Center": [
    "invoice.view", "invoice.create", "invoice.post",
    "sales_order.view", "sales_order.create",
    "credit_note.view", "credit_note.create",
    "debit_note.view", "debit_note.create",
  ],
  "Compliance": [
    "batch.hold", "batch.release",
    "recall.view", "recall.create",
    "disposal.view", "disposal.create",
    "license.view", "license.create",
  ],
};

// Mock role permissions
const rolePermissions: Record<string, string[]> = {
  "System Admin": Object.values(permissionMatrix).flat(),
  "Finance Manager": [
    "journal.view", "journal.create", "journal.post",
    "payment.view", "payment.create",
    "receipt.view", "receipt.create",
    "invoice.view",
  ],
  "Sales Manager": [
    "invoice.view", "invoice.create", "invoice.post",
    "sales_order.view", "sales_order.create",
    "product.view",
  ],
  "Warehouse Manager": [
    "product.view", "product.create", "product.edit",
    "grn.view", "grn.create", "grn.post",
    "transfer.view", "transfer.create",
    "adjustment.view", "adjustment.create",
  ],
  "Compliance Officer": [
    "batch.hold", "batch.release",
    "recall.view", "recall.create",
    "disposal.view", "disposal.create",
    "license.view", "license.create",
  ],
  "Sales Representative": [
    "invoice.view", "invoice.create",
    "sales_order.view", "sales_order.create",
    "product.view",
  ],
};

const roleFields: FormField[] = [
  { key: "name", label: "Role Name", type: "text", required: true, placeholder: "e.g. Finance Manager" },
  { key: "slug", label: "Role Slug", type: "text", required: true, placeholder: "e.g. finance_manager" },
  { key: "description", label: "Description", type: "textarea", span: 2, placeholder: "Role description and access scope" },
  { key: "status", label: "Status", type: "select", options: [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ]},
];

function PermissionPanel({
  open,
  onClose,
  roleName,
}: {
  open: boolean;
  onClose: () => void;
  roleName: string;
}) {
  const [perms, setPerms] = useState<string[]>(rolePermissions[roleName] || []);

  if (!open) return null;

  const togglePerm = (p: string) => {
    setPerms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const toggleCategory = (category: string) => {
    const categoryPerms = permissionMatrix[category as keyof typeof permissionMatrix];
    const allSelected = categoryPerms.every((p) => perms.includes(p));
    if (allSelected) {
      setPerms((prev) => prev.filter((p) => !categoryPerms.includes(p)));
    } else {
      setPerms((prev) => [...new Set([...prev, ...categoryPerms])]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-navy-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-navy-700">Permissions — {roleName}</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {perms.length} permissions assigned
            </p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            <MdClose size={20} />
          </button>
        </div>

        {/* Permission Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {Object.entries(permissionMatrix).map(([category, categoryPerms]) => {
            const allSelected = categoryPerms.every((p) => perms.includes(p));
            const someSelected = categoryPerms.some((p) => perms.includes(p));

            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      allSelected
                        ? "bg-brand-500 border-brand-500"
                        : someSelected
                        ? "bg-brand-100 border-brand-300"
                        : "border-gray-300 hover:border-brand-300"
                    }`}
                  >
                    {(allSelected || someSelected) && (
                      <MdCheck className="h-3.5 w-3.5 text-white" />
                    )}
                  </button>
                  <h3 className="text-sm font-bold text-navy-700">{category}</h3>
                  <span className="text-[11px] text-gray-400">
                    {categoryPerms.filter((p) => perms.includes(p)).length}/{categoryPerms.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 ml-8">
                  {categoryPerms.map((perm) => {
                    const isChecked = perms.includes(perm);
                    return (
                      <button
                        key={perm}
                        onClick={() => togglePerm(perm)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                          isChecked
                            ? "bg-brand-50 text-brand-600 border border-brand-200"
                            : "bg-gray-50 text-gray-500 border border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border ${
                            isChecked
                              ? "bg-brand-500 border-brand-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isChecked && <MdCheck className="h-3 w-3 text-white" />}
                        </div>
                        {perm}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => { console.log("Save perms for", roleName, perms); onClose(); }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 shadow-sm shadow-brand-200"
          >
            <MdSave size={16} />
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RolesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showPerms, setShowPerms] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/roles");
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => { setSelected(null); setIsEdit(false); setShowForm(true); };
  const handleManagePerms = (row: any) => { setSelected(row); setShowPerms(true); };

  const handleEdit = (row: any) => { setSelected(row); setIsEdit(true); setShowForm(true); };

  const handleSave = async (values: Record<string, any>) => {
    setSaving(true);
    try {
      if (isEdit && selected) {
        await api.put(`/admin/roles/${selected.id}`, values);
      } else {
        await api.post("/admin/roles", values);
      }
      await fetchData();
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save role", err);
      alert("Failed to save role. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ERPListPage
        title="Roles & Permissions"
        subtitle="Define roles and assign granular permissions per module"
        searchKey="name"
        data={data}
        isLoading={loading}
        onAdd={handleAdd}
        addLabel="Create Role"
        onRowClick={handleEdit}
        columns={[
          { key: "name", label: "Role Name" },
          { key: "slug", label: "Slug" },
          { key: "description", label: "Description" },
          { key: "userCount", label: "Users", render: () => "0" }, // Mocked for now
          {
            key: "actions",
            label: "Permissions",
            render: (row) => (
              <button
                onClick={(e) => { e.stopPropagation(); handleManagePerms(row); }}
                className="text-[12px] font-semibold text-brand-500 hover:underline"
              >
                Manage →
              </button>
            ),
          },
        ]}
      />

      <ERPFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={isEdit ? "Edit Role" : "Create Role"}
        subtitle="Role name and description"
        fields={roleFields}
        initialValues={selected || {}}
        onSave={handleSave}
        isLoading={saving}
        isEditMode={isEdit}
      />

      <PermissionPanel
        open={showPerms}
        onClose={() => setShowPerms(false)}
        roleName={selected?.name || ""}
      />
    </>
  );
}
