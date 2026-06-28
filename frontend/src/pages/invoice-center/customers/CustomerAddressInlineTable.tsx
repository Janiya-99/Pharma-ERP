import React, { useState } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import {
  AddressTypeBadge,
  DefaultAddressBadge,
} from "../../../components/invoice-center";
import CustomerAddressModal from "./CustomerAddressModal";
import PermissionGuard from "../../../auth/PermissionGuard";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";

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

interface CustomerAddressInlineTableProps {
  customerId: number | string;
  addresses?: Address[];
  onRefresh: () => void;
}

const CustomerAddressInlineTable: React.FC<CustomerAddressInlineTableProps> = ({
  customerId,
  addresses = [],
  onRefresh,
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    address: Address | null;
  }>({
    isOpen: false,
    address: null,
  });

  const handleDelete = async (addressId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete address "${title}"?`))
      return;
    try {
      await invoiceCenterApi.deleteCustomerAddress(customerId, addressId);
      onRefresh();
    } catch (err) {
      console.error("Delete address error:", err);
      alert("Failed to delete address.");
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
      <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-navy-700">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-brand-500" />
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">
            Customer Addresses
          </h3>
        </div>
        <PermissionGuard permission="invoice_center.customer.update">
          <button
            onClick={() => setModalState({ isOpen: true, address: null })}
            className="flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition-all hover:bg-brand-100 dark:bg-navy-700 dark:text-brand-400 dark:hover:bg-navy-600"
          >
            <Plus className="h-4 w-4" /> Add Address
          </button>
        </PermissionGuard>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:bg-navy-700/50">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">City / State</th>
              <th className="px-4 py-3">Defaults</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm dark:divide-navy-700">
            {addresses.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No branch or delivery addresses registered.
                </td>
              </tr>
            ) : (
              addresses.map((addr) => (
                <tr
                  key={addr.id}
                  className="transition-colors hover:bg-gray-50/80 dark:hover:bg-navy-700/50"
                >
                  <td className="px-4 py-3 font-bold text-navy-900 dark:text-white">
                    {addr.address_title}
                  </td>
                  <td className="px-4 py-3">
                    <AddressTypeBadge type={addr.address_type} />
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-600 dark:text-gray-300">
                    {addr.street_address}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {addr.city}{" "}
                    {addr.state_province ? `(${addr.state_province})` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <DefaultAddressBadge
                      isDefaultBilling={addr.is_default_billing}
                      isDefaultShipping={addr.is_default_shipping}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGuard permission="invoice_center.customer.update">
                        <button
                          onClick={() =>
                            setModalState({ isOpen: true, address: addr })
                          }
                          className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-navy-700"
                          title="Edit Address"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(addr.id, addr.address_title)
                          }
                          className="text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 transition-colors dark:hover:bg-navy-700"
                          title="Delete Address"
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

      <CustomerAddressModal
        isOpen={modalState.isOpen}
        customerId={customerId}
        address={modalState.address}
        onClose={() => setModalState({ isOpen: false, address: null })}
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default CustomerAddressInlineTable;
