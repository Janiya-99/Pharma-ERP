import React from "react";

const JsonViewer = ({ data }: { data?: Record<string, unknown> }) => {
  if (!data || Object.keys(data).length === 0) {
    return <span className="text-sm italic text-gray-400">No data</span>;
  }

  let displayData = data;
  if (typeof data === "string") {
    try {
      displayData = JSON.parse(data);
    } catch (e) {
      // Invalid JSON string
      return (
        <div className="whitespace-pre-wrap rounded bg-gray-50 p-2 text-sm text-gray-800">
          {data}
        </div>
      );
    }
  }

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800">
      {JSON.stringify(displayData, null, 2)}
    </pre>
  );
};

export default JsonViewer;
