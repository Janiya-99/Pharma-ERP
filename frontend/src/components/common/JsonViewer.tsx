
const JsonViewer = ({ data }: { data?: Record<string, unknown> }) => {
  if (!data || Object.keys(data).length === 0) {
    return <span className="text-gray-400 italic text-sm">No data</span>;
  }

  let displayData = data;
  if (typeof data === "string") {
    try {
      displayData = JSON.parse(data);
    } catch (e) {
      // Invalid JSON string
      return <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded whitespace-pre-wrap">{data}</div>;
    }
  }

  return (
    <pre className="text-xs bg-gray-50 text-gray-800 p-3 rounded-md border border-gray-200 overflow-x-auto whitespace-pre-wrap font-mono">
      {JSON.stringify(displayData, null, 2)}
    </pre>
  );
};

export default JsonViewer;
