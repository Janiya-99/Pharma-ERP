import React from "react";
import { ChevronRight, ChevronDown, Folder, FileText } from "lucide-react";
import PermissionGuard from "components/erp/PermissionGuard";

interface AccountClassificationTreeProps {
  data: any[];
  loading: boolean;
  onEdit: (record: any) => void;
  onDelete: (record: any) => void;
}

const TreeNode = ({ node, onEdit, onDelete }: any) => {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-6 mt-2">
      <div className="group flex items-center py-1">
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mr-1 flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="mr-1 flex h-5 w-5 items-center justify-center">
            <div className="h-1 w-1 rounded-full bg-gray-300" />
          </div>
        )}

        {node.level === 1 ? (
          <Folder size={16} className="mr-2 text-brand-500" />
        ) : (
          <FileText size={16} className="mr-2 text-gray-400" />
        )}

        <span className="mr-4 font-medium text-navy-700 dark:text-white">
          {node.name}
        </span>

        <span className="mr-4 text-xs text-gray-400">
          {node.type} • Level {node.level} • {node.normal_balance}
        </span>

        <div className="flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
          <PermissionGuard permission="finance.account_classification.update">
            <button
              onClick={() => onEdit(node)}
              className="text-xs font-medium text-brand-500 hover:text-brand-600"
            >
              Edit
            </button>
          </PermissionGuard>
          {!hasChildren && (
            <PermissionGuard permission="finance.account_classification.delete">
              <button
                onClick={() => onDelete(node)}
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="ml-2.5 border-l border-gray-200 dark:border-navy-700">
          {node.children.map((child: any) => (
            <TreeNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function AccountClassificationTree({
  data,
  loading,
  onEdit,
  onDelete,
}: AccountClassificationTreeProps) {
  if (loading) {
    return <div className="p-4 text-gray-500">Loading tree...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-4 text-gray-500">No classifications found.</div>;
  }

  return (
    <div className="overflow-x-auto py-2">
      {data.map((node: unknown) => (
        <TreeNode
          key={node.id}
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
