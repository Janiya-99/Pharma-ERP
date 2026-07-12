import { useAuth } from "../../auth/AuthContext";
import { MdEdit, MdDelete, MdSend, MdCheckCircle, MdCancel, MdLibraryAddCheck } from "react-icons/md";

const PettyCashActionButtons = ({
  approvalStatus,
  postedStatus,
  permissions,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  onPost,
}: { approvalStatus?: unknown; postedStatus?: unknown; permissions?: unknown; onEdit?: unknown; onDelete?: unknown; onSubmit?: unknown; onApprove?: unknown; onReject?: unknown; onPost?: unknown }) => {
  const { hasPermission } = useAuth();

  const showEdit = (approvalStatus === "draft" || approvalStatus === "rejected") && postedStatus === "unposted";
  const showDelete = (approvalStatus === "draft" || approvalStatus === "rejected") && postedStatus === "unposted";
  const showSubmit = (approvalStatus === "draft" || approvalStatus === "rejected") && postedStatus === "unposted";
  const showApprove = approvalStatus === "pending";
  const showReject = approvalStatus === "pending";
  const showPost = approvalStatus === "approved" && postedStatus === "unposted";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showEdit && hasPermission(permissions.update) && (
        <button
          onClick={onEdit}
          className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-brand-600 shadow-sm ring-1 ring-inset ring-brand-200 hover:bg-brand-50    "
        >
          <MdEdit className="h-4 w-4" />
          Edit
        </button>
      )}

      {showDelete && hasPermission(permissions.delete) && (
        <button
          onClick={onDelete}
          className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-50    "
        >
          <MdDelete className="h-4 w-4" />
          Delete
        </button>
      )}

      {showSubmit && hasPermission(permissions.submit) && (
        <button
          onClick={onSubmit}
          className="flex items-center gap-2 rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
        >
          <MdSend className="h-4 w-4" />
          Submit
        </button>
      )}

      {showApprove && hasPermission(permissions.approve) && (
        <button
          onClick={onApprove}
          className="flex items-center gap-2 rounded-md bg-green-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-600"
        >
          <MdCheckCircle className="h-4 w-4" />
          Approve
        </button>
      )}

      {showReject && hasPermission(permissions.reject) && (
        <button
          onClick={onReject}
          className="flex items-center gap-2 rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-600"
        >
          <MdCancel className="h-4 w-4" />
          Reject
        </button>
      )}

      {showPost && hasPermission(permissions.post) && (
        <button
          onClick={onPost}
          className="flex items-center gap-2 rounded-md bg-purple-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-purple-600"
        >
          <MdLibraryAddCheck className="h-4 w-4" />
          Post
        </button>
      )}
    </div>
  );
};

export default PettyCashActionButtons;
