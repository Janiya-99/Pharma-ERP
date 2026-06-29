import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface Address {
  id: number;
  address_title: string;
  address_type: string;
  street_address: string;
  city: string;
  state_province?: string;
  postal_code?: string;
  country: string;
  is_default_billing: boolean;
  is_default_shipping: boolean;
}

interface CustomerAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: number | string;
  address?: Address | null;
}

const CustomerAddressModal: React.FC<CustomerAddressModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerId,
  address = null,
}) => {
  const [formData, setFormData] = useState({
    address_title: "",
    address_type: "shipping",
    street_address: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "Sri Lanka",
    is_default_billing: false,
    is_default_shipping: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      setFormData({
        address_title: address.address_title || "",
        address_type: address.address_type || "shipping",
        street_address: address.street_address || "",
        city: address.city || "",
        state_province: address.state_province || "",
        postal_code: address.postal_code || "",
        country: address.country || "Sri Lanka",
        is_default_billing: Boolean(address.is_default_billing),
        is_default_shipping: Boolean(address.is_default_shipping),
      });
    } else {
      setFormData({
        address_title: "",
        address_type: "shipping",
        street_address: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "Sri Lanka",
        is_default_billing: false,
        is_default_shipping: false,
      });
    }
    setError(null);
  }, [address, isOpen]);

  if (!isOpen || !customerId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.address_title.trim() ||
      !formData.street_address.trim() ||
      !formData.city.trim()
    ) {
      setError("Title, Street Address, and City are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (address?.id) {
        await invoiceCenterApi.updateCustomerAddress(
          customerId,
          address.id,
          formData
        );
      } else {
        await invoiceCenterApi.createCustomerAddress(customerId, formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save address error:", err);
      setError(err.response?.data?.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-navy-700 dark:bg-navy-800">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-6 dark:border-navy-700 dark:bg-navy-900/50">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">
            {address ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="bg-rose-50 border-rose-200 text-rose-600 rounded-xl border p-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Address Title *
              </label>
              <input
                type="text"
                required
                value={formData.address_title}
                onChange={(e) =>
                  setFormData({ ...formData, address_title: e.target.value })
                }
                placeholder="e.g. Main Warehouse"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Address Type
              </label>
              <Select
                value={formData.address_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, address_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select address type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Street Address *
            </label>
            <textarea
              rows={2}
              required
              value={formData.street_address}
              onChange={(e) =>
                setFormData({ ...formData, street_address: e.target.value })
              }
              placeholder="123 Industrial Park Rd..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Colombo"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                State / Province
              </label>
              <input
                type="text"
                value={formData.state_province}
                onChange={(e) =>
                  setFormData({ ...formData, state_province: e.target.value })
                }
                placeholder="Western"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                placeholder="10100"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="Sri Lanka"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-2 dark:border-navy-700">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-900 dark:text-white">
              <input
                type="checkbox"
                checked={formData.is_default_billing}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_default_billing: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              Set as Default Billing Address
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-900 dark:text-white">
              <input
                type="checkbox"
                checked={formData.is_default_shipping}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_default_shipping: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              Set as Default Shipping Address
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-navy-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-navy-600 dark:text-gray-300 dark:hover:bg-navy-700"
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
                : address
                ? "Update Address"
                : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerAddressModal;
