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
      <div className="flex items-center group py-1">
        {hasChildren ? (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded mr-1"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-5 h-5 mr-1 flex items-center justify-center">
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        
        {node.level === 1 ? (
          <Folder size={16} className="text-brand-500 mr-2" />
        ) : (
          <FileText size={16} className="text-gray-400 mr-2" />
        )}
        
        <span className="font-medium text-navy-700 dark:text-white mr-4">
          {node.name}
        </span>
        
        <span className="text-xs text-gray-400 mr-4">
          {node.type} • Level {node.level} • {node.normal_balance}
        </span>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
          <PermissionGuard permission="finance.account_classification.update">
            <button 
              onClick={() => onEdit(node)}
              className="text-xs text-brand-500 hover:text-brand-600 font-medium"
            >
              Edit
            </button>
          </PermissionGuard>
          {!hasChildren && (
            <PermissionGuard permission="finance.account_classification.delete">
              <button 
                onClick={() => onDelete(node)}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Delete
              </button>
            </PermissionGuard>
          )}
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div className="border-l border-gray-200 dark:border-navy-700 ml-2.5">
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
    <div className="py-2 overflow-x-auto">
      {data.map((node) => (
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
