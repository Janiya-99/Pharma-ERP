import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
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

  if (!customerId) return null;

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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[calc(100vw-1rem)] overflow-y-auto rounded-l-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl"
      >
        <SheetHeader className="border-b border-gray-100 bg-gray-50 px-6 py-5  ">
          <SheetTitle className="text-lg font-bold text-navy-900 ">
            {address ? "Edit Address" : "Add New Address"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
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
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
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
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
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
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
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
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
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
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
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
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-2 ">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-900 ">
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
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-900 ">
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
                : address
                ? "Update Address"
                : "Add Address"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CustomerAddressModal;
