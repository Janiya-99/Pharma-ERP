
const EmptyState = ({ title, description, icon: Icon, action }: { title?: unknown; description?: unknown; Icon?: unknown; action?: unknown }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border rounded-lg bg-white border-gray-200 border-dashed">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 mb-4">
          <Icon className="h-6 w-6 text-blue-900" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
