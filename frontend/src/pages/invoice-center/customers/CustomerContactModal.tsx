import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { X } from "lucide-react";

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

interface CustomerContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: number | string;
  contact?: Contact | null;
}

const CustomerContactModal: React.FC<CustomerContactModalProps> = ({ isOpen, onClose, onSuccess, customerId, contact = null }) => {
  const [formData, setFormData] = useState({
    contact_name: "",
    designation: "",
    department: "",
    email: "",
    phone: "",
    mobile: "",
    is_primary: false,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setFormData({
        contact_name: contact.contact_name || "",
        designation: contact.designation || "",
        department: contact.department || "",
        email: contact.email || "",
        phone: contact.phone || "",
        mobile: contact.mobile || "",
        is_primary: Boolean(contact.is_primary),
        notes: contact.notes || "",
      });
    } else {
      setFormData({
        contact_name: "",
        designation: "",
        department: "",
        email: "",
        phone: "",
        mobile: "",
        is_primary: false,
        notes: "",
      });
    }
    setError(null);
  }, [contact, isOpen]);

  if (!isOpen || !customerId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact_name.trim()) {
      setError("Contact person name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (contact?.id) {
        await invoiceCenterApi.updateCustomerContact(customerId, contact.id, formData);
      } else {
        await invoiceCenterApi.createCustomerContact(customerId, formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save contact error:", err);
      setError(err.response?.data?.message || "Failed to save contact.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-navy-800 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">
            {contact ? "Edit Contact Person" : "Add Contact Person"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Name *</label>
            <input
              type="text"
              required
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              placeholder="e.g. Dr. Samantha Silva"
              className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Chief Pharmacist"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Procurement"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="samantha@hospital.com"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mobile Phone</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+94 77 987 6543"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Office Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+94 11 222 3344"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-navy-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                Mark as Primary Contact
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Availability, preferred calling times..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-navy-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md disabled:opacity-50"
            >
              {loading ? "Saving..." : contact ? "Update Contact" : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerContactModal;
