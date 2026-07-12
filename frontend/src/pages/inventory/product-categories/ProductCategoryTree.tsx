import React from "react";
import { Folder, FolderOpen, Tag } from "lucide-react";

const TreeNode = ({ node, level = 0 }: { node?: unknown; level?: unknown }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50  ${
          level === 0
            ? "font-medium text-navy-700 "
            : "text-gray-600 "
        }`}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="flex w-5 justify-center">
          {hasChildren ? (
            isOpen ? (
              <FolderOpen className="h-4 w-4 text-brand-500" />
            ) : (
              <Folder className="h-4 w-4 text-brand-500" />
            )
          ) : (
            <Tag className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <span className="flex-1 truncate">{node.category_name}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-400 ">
          {node.category_code}
        </span>
      </div>

      {hasChildren && isOpen && (
        <div className="ml-5 border-l border-gray-200 ">
          {node.children.map((child: unknown) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCategoryTree = ({ data }: { data?: Record<string, unknown> }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <Folder className="mb-3 h-12 w-12 text-gray-300" />
        <p>No categories found</p>
      </div>
    );
  }

  // Build tree from flat list
  const buildTree = (items: unknown) => {
    const itemMap = {};
    const roots = [];

    items.forEach((item: unknown) => {
      itemMap[item.id] = { ...item, children: [] };
    });

    items.forEach((item: unknown) => {
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
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm  ">
      <div className="space-y-1">
        {treeData.map((node: unknown) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
};

export default ProductCategoryTree;
