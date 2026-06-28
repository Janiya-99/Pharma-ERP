import React, { useState } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { AddressTypeBadge, DefaultAddressBadge } from "../../../components/invoice-center";
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

const CustomerAddressInlineTable: React.FC<CustomerAddressInlineTableProps> = ({ customerId, addresses = [], onRefresh }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; address: Address | null }>({
    isOpen: false,
    address: null,
  });

  const handleDelete = async (addressId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete address "${title}"?`)) return;
    try {
      await invoiceCenterApi.deleteCustomerAddress(customerId, addressId);
      onRefresh();
    } catch (err) {
      console.error("Delete address error:", err);
      alert("Failed to delete address.");
    }
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-navy-700">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-500" />
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">Customer Addresses</h3>
        </div>
        <PermissionGuard permission="invoice_center.customer.update">
          <button
            onClick={() => setModalState({ isOpen: true, address: null })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-navy-700 dark:hover:bg-navy-600 text-brand-600 dark:text-brand-400 text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </PermissionGuard>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-navy-700/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Address</th>
              <th className="py-3 px-4">City / State</th>
              <th className="py-3 px-4">Defaults</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700 text-sm">
            {addresses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No branch or delivery addresses registered.
                </td>
              </tr>
            ) : (
              addresses.map((addr) => (
                <tr key={addr.id} className="hover:bg-gray-50/80 dark:hover:bg-navy-700/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-navy-900 dark:text-white">{addr.address_title}</td>
                  <td className="py-3 px-4"><AddressTypeBadge type={addr.address_type} /></td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">{addr.street_address}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{addr.city} {addr.state_province ? `(${addr.state_province})` : ""}</td>
                  <td className="py-3 px-4"><DefaultAddressBadge isDefaultBilling={addr.is_default_billing} isDefaultShipping={addr.is_default_shipping} /></td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGuard permission="invoice_center.customer.update">
                        <button
                          onClick={() => setModalState({ isOpen: true, address: addr })}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-navy-700 transition-colors"
                          title="Edit Address"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(addr.id, addr.address_title)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-navy-700 transition-colors"
                          title="Delete Address"
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
