import React from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import JsonViewer from "../../../components/common/JsonViewer";

const AuditLogDetailModal = ({
  isOpen,
  onClose,
  log,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  log?: unknown;
}) => {
  if (!log) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Log Details"
      size="3xl"
    >
      <div className="space-y-6">
        <div className="border-slate-200 bg-slate-50/80 rounded-2xl border p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.18em]">
                Action
              </p>
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                {log.action || "UNKNOWN"}
              </span>
              <div>
                <p className="text-slate-500 mt-3 text-[11px] font-bold uppercase tracking-[0.18em]">
                  Entity
                </p>
                <p className="text-slate-900 text-sm font-semibold">
                  {log.entity_name || "-"}{" "}
                  <span className="text-slate-500 font-mono">
                    #{log.entity_id || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.18em]">
                  Date / Time
                </p>
                <p className="text-slate-900 mt-1 text-sm font-semibold">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.18em]">
                  User
                </p>
                <p className="text-slate-900 mt-1 text-sm font-semibold">
                  {log.user?.full_name || log.user_name || "System"}
                </p>
              </div>
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.18em]">
                  Branch
                </p>
                <p className="text-slate-900 mt-1 text-sm font-semibold">
                  {log.branch?.branch_name || log.branch_name || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.18em]">
                  Software
                </p>
                <p className="text-slate-900 mt-1 text-sm font-semibold">
                  {log.software?.software_name ||
                    log.software_module?.software_name ||
                    log.software_name ||
                    "-"}
                </p>
              </div>
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.18em]">
                  IP Address
                </p>
                <p className="text-slate-700 mt-1 font-mono text-sm font-semibold">
                  {log.ip_address || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.18em]">
                  User Agent
                </p>
                <p
                  className="text-slate-600 mt-1 truncate text-xs font-medium"
                  title={log.user_agent}
                >
                  {log.user_agent || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="border-slate-200 flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-slate-200 bg-slate-50 border-b px-4 py-3">
              <h3 className="text-slate-700 flex items-center text-sm font-semibold">
                <span className="mr-2 h-2 w-2 rounded-full bg-red-400"></span>
                Before (Old Values)
              </h3>
            </div>
            <div className="bg-slate-50/60 max-h-96 flex-1 overflow-auto p-4">
              <JsonViewer data={log.old_values} />
            </div>
          </div>

          <div className="border-slate-200 flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-slate-200 bg-slate-50 border-b px-4 py-3">
              <h3 className="text-slate-700 flex items-center text-sm font-semibold">
                <span className="mr-2 h-2 w-2 rounded-full bg-green-400"></span>
                After (New Values)
              </h3>
            </div>
            <div className="bg-slate-50/60 max-h-96 flex-1 overflow-auto p-4">
              <JsonViewer data={log.new_values} />
            </div>
          </div>
        </div>

        <div className="border-slate-200 flex justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AuditLogDetailModal;
