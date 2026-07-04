import React, { useState } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { PrimaryContactBadge } from "../../../components/invoice-center";
import CustomerContactModal from "./CustomerContactModal";
import PermissionGuard from "../../../auth/PermissionGuard";
import { Plus, Edit, Trash2, Users } from "lucide-react";

interface Contact {
  id: number;
  contact_name: string;
  designation?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  is_primary: boolean;
  notes?: string;
}

interface CustomerContactInlineTableProps {
  customerId: number | string;
  contacts?: Contact[];
  onRefresh: () => void;
}

const CustomerContactInlineTable: React.FC<CustomerContactInlineTableProps> = ({
  customerId,
  contacts = [],
  onRefresh,
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    contact: Contact | null;
  }>({
    isOpen: false,
    contact: null,
  });

  const handleDelete = async (contactId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete contact "${name}"?`))
      return;
    try {
      await invoiceCenterApi.deleteCustomerContact(customerId, contactId);
      onRefresh();
    } catch (err) {
      console.error("Delete contact error:", err);
      alert("Failed to delete contact.");
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
      <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-navy-700">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">
            Contact Persons
          </h3>
        </div>
        <PermissionGuard permission="invoice_center.customer.update">
          <button
            onClick={() => setModalState({ isOpen: true, contact: null })}
            className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600 transition-all hover:bg-amber-100 dark:bg-navy-700 dark:text-amber-400 dark:hover:bg-navy-600"
          >
            <Plus className="h-4 w-4" /> Add Contact
          </button>
        </PermissionGuard>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:bg-navy-700/50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone / Mobile</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm dark:divide-navy-700">
            {contacts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No contact persons registered.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-gray-50/80 dark:hover:bg-navy-700/50"
                >
                  <td className="px-4 py-3 font-bold text-navy-900 dark:text-white">
                    {c.contact_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {c.designation || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {c.department || "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-indigo-600 dark:text-indigo-400">
                    {c.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {c.mobile || c.phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <PrimaryContactBadge isPrimary={c.is_primary} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGuard permission="invoice_center.customer.update">
                        <button
                          onClick={() =>
                            setModalState({ isOpen: true, contact: c })
                          }
                          className="rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50 dark:hover:bg-navy-700"
                          title="Edit Contact"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.contact_name)}
                          className="text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 transition-colors dark:hover:bg-navy-700"
                          title="Delete Contact"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CustomerContactModal
        isOpen={modalState.isOpen}
        customerId={customerId}
        contact={modalState.contact}
        onClose={() => setModalState({ isOpen: false, contact: null })}
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default CustomerContactInlineTable;
