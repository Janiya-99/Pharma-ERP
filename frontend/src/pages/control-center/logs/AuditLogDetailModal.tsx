import React from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import JsonViewer from "../../../components/common/JsonViewer";

const AuditLogDetailModal = ({ isOpen, onClose, log }: { isOpen?: boolean; onClose?: unknown; log?: unknown }) => {
  if (!log) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Log Details"
      size="3xl"
    >
      <div className="space-y-6">
        {/* Meta Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Action</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              {log.action}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Entity</p>
            <p className="text-sm font-medium text-gray-900">{log.entity_name} <span className="text-gray-500 font-mono">#{log.entity_id || "N/A"}</span></p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date / Time</p>
            <p className="text-sm font-medium text-gray-900">{new Date(log.created_at).toLocaleString()}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">User</p>
            <p className="text-sm font-medium text-gray-900">{log.user?.full_name || log.user_name || "System"}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Branch</p>
            <p className="text-sm font-medium text-gray-900">{log.branch?.branch_name || log.branch_name || "-"}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Software</p>
            <p className="text-sm font-medium text-gray-900">{log.software_module?.software_name || log.software_name || "-"}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">IP Address</p>
            <p className="text-sm font-mono text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded inline-block">{log.ip_address || "-"}</p>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">User Agent</p>
            <p className="text-xs text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded truncate" title={log.user_agent}>
              {log.user_agent || "-"}
            </p>
          </div>
        </div>

        {/* Data Changes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                Before (Old Values)
              </h3>
            </div>
            <div className="p-4 flex-1 bg-gray-50 overflow-auto max-h-96">
              <JsonViewer data={log.old_values} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                After (New Values)
              </h3>
            </div>
            <div className="p-4 flex-1 bg-gray-50 overflow-auto max-h-96">
              <JsonViewer data={log.new_values} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} type="button">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AuditLogDetailModal;
