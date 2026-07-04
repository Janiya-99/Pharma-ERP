import React from "react";
import { Eye, Edit, ShieldAlert, Trash2 } from "lucide-react";
import PermissionGuard from "../../auth/PermissionGuard";

interface CustomerActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onChangeStatus?: () => void;
  onDelete?: () => void;
}

const CustomerActionButtons: React.FC<CustomerActionButtonsProps> = ({
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {onView && (
        <PermissionGuard permission="invoice_center.customer.view">
          <button
            onClick={onView}
            title="View Details"
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-navy-900 dark:hover:bg-navy-700"
          >
            <Eye className="h-4 w-4" />
          </button>
        </PermissionGuard>
      )}

      {onEdit && (
        <PermissionGuard permission="invoice_center.customer.update">
          <button
            onClick={onEdit}
            title="Edit Customer"
            className="rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-800 dark:hover:bg-navy-700"
          >
            <Edit className="h-4 w-4" />
          </button>
        </PermissionGuard>
      )}

      {onChangeStatus && (
        <PermissionGuard permission="invoice_center.customer.update">
          <button
            onClick={onChangeStatus}
            title="Change Status"
            className="rounded-lg p-1.5 text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-navy-700"
          >
            <ShieldAlert className="h-4 w-4" />
          </button>
        </PermissionGuard>
      )}

      {onDelete && (
        <PermissionGuard permission="invoice_center.customer.delete">
          <button
            onClick={onDelete}
            title="Delete Customer"
            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg p-1.5 transition-colors dark:hover:bg-navy-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </PermissionGuard>
      )}
    </div>
  );
};

export default CustomerActionButtons;
