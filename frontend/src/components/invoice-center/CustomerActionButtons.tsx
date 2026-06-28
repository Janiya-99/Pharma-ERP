import React from "react";
import { Eye, Edit, ShieldAlert, Trash2 } from "lucide-react";
import PermissionGuard from "../../auth/PermissionGuard";

interface CustomerActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onChangeStatus?: () => void;
  onDelete?: () => void;
}

const CustomerActionButtons: React.FC<CustomerActionButtonsProps> = ({ onView, onEdit, onChangeStatus, onDelete }) => {
  return (
    <div className="flex items-center gap-1.5 justify-end">
      {onView && (
        <PermissionGuard permission="invoice_center.customer.view">
          <button
            onClick={onView}
            title="View Details"
            className="p-1.5 rounded-lg text-gray-500 hover:text-navy-900 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </PermissionGuard>
      )}

      {onEdit && (
        <PermissionGuard permission="invoice_center.customer.update">
          <button
            onClick={onEdit}
            title="Edit Customer"
            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-navy-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </PermissionGuard>
      )}

      {onChangeStatus && (
        <PermissionGuard permission="invoice_center.customer.update">
          <button
            onClick={onChangeStatus}
            title="Change Status"
            className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-navy-700 transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </PermissionGuard>
      )}

      {onDelete && (
        <PermissionGuard permission="invoice_center.customer.delete">
          <button
            onClick={onDelete}
            title="Delete Customer"
            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-navy-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </PermissionGuard>
      )}
    </div>
  );
};

export default CustomerActionButtons;
