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

const CustomerContactInlineTable: React.FC<CustomerContactInlineTableProps> = ({ customerId, contacts = [], onRefresh }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; contact: Contact | null }>({
    isOpen: false,
    contact: null,
  });

  const handleDelete = async (contactId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete contact "${name}"?`)) return;
    try {
      await invoiceCenterApi.deleteCustomerContact(customerId, contactId);
      onRefresh();
    } catch (err) {
      console.error("Delete contact error:", err);
      alert("Failed to delete contact.");
    }
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-navy-700">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">Contact Persons</h3>
        </div>
        <PermissionGuard permission="invoice_center.customer.update">
          <button
            onClick={() => setModalState({ isOpen: true, contact: null })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-navy-700 dark:hover:bg-navy-600 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </PermissionGuard>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-navy-700/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone / Mobile</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700 text-sm">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No contact persons registered.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/80 dark:hover:bg-navy-700/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-navy-900 dark:text-white">{c.contact_name}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{c.designation || "—"}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{c.department || "—"}</td>
                  <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">{c.email || "—"}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{c.mobile || c.phone || "—"}</td>
                  <td className="py-3 px-4"><PrimaryContactBadge isPrimary={c.is_primary} /></td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGuard permission="invoice_center.customer.update">
                        <button
                          onClick={() => setModalState({ isOpen: true, contact: c })}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-navy-700 transition-colors"
                          title="Edit Contact"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.contact_name)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-navy-700 transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
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
