import React from "react";
import { Folder, FolderOpen, Tag } from "lucide-react";

const TreeNode = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-navy-700/50 rounded-lg cursor-pointer transition-colors ${level === 0 ? 'font-medium text-navy-700 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="w-5 flex justify-center">
          {hasChildren ? (
            isOpen ? <FolderOpen className="w-4 h-4 text-brand-500" /> : <Folder className="w-4 h-4 text-brand-500" />
          ) : (
            <Tag className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <span className="flex-1 truncate">{node.category_name}</span>
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-navy-700 px-2 py-0.5 rounded-full font-mono">
          {node.category_code}
        </span>
      </div>
      
      {hasChildren && isOpen && (
        <div className="border-l border-gray-200 dark:border-navy-600 ml-5">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCategoryTree = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <Folder className="w-12 h-12 text-gray-300 mb-3" />
        <p>No categories found</p>
      </div>
    );
  }

  // Build tree from flat list
  const buildTree = (items) => {
    const itemMap = {};
    const roots = [];

    items.forEach(item => {
      itemMap[item.id] = { ...item, children: [] };
    });

    items.forEach(item => {
      if (item.parent_id && itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.id]);
      } else {
        roots.push(itemMap[item.id]);
      }
    });

    return roots;
  };

  const treeData = buildTree(data);

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-4">
      <div className="space-y-1">
        {treeData.map(node => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
};

export default ProductCategoryTree;
