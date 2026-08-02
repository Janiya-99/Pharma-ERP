import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";

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

const CustomerContactModal: React.FC<CustomerContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerId,
  contact = null,
}) => {
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

  if (!customerId) return null;

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
        await invoiceCenterApi.updateCustomerContact(
          customerId,
          contact.id,
          formData
        );
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[calc(100vw-1rem)] overflow-y-auto rounded-l-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl"
      >
        <SheetHeader className="border-b border-gray-100 bg-gray-50 px-6 py-5  ">
          <SheetTitle className="text-lg font-bold text-navy-900 ">
            {contact ? "Edit Contact Person" : "Add Contact Person"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Contact Name *
            </label>
            <input
              type="text"
              required
              value={formData.contact_name}
              onChange={(e) =>
                setFormData({ ...formData, contact_name: e.target.value })
              }
              placeholder="e.g. Dr. Samantha Silva"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                placeholder="Chief Pharmacist"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Procurement"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="samantha@hospital.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Mobile Phone
              </label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                placeholder="+94 77 987 6543"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Office Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+94 11 222 3344"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-navy-900 ">
                <input
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={(e) =>
                    setFormData({ ...formData, is_primary: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                Mark as Primary Contact
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Availability, preferred calling times..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 ">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50   "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-600 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : contact
                ? "Update Contact"
                : "Add Contact"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CustomerContactModal;
