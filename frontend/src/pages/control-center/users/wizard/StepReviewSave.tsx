import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Boxes,
  ShieldCheck,
  Lock,
  MapPin,
  Mail,
  Phone,
  Check,
  AlertCircle,
} from "lucide-react";
import { getBranches, getSoftwareModules } from "../../../../api/controlApi";

interface StepReviewSaveProps {
  formData: any;
  isEdit?: boolean;
  onSave: () => void;
  onSaveAndCreate: () => void;
  onBack: () => void;
  onCancel: () => void;
  saving: boolean;
}

const StepReviewSave = ({
  formData,
  isEdit,
  onSave,
  onSaveAndCreate,
  onBack,
  onCancel,
  saving,
}: StepReviewSaveProps) => {
  const [branchNames, setBranchNames] = useState<Record<string | number, string>>({});
  const [moduleNames, setModuleNames] = useState<Record<string | number, string>>({});

  useEffect(() => {
    loadNames();
  }, []);

  const loadNames = async () => {
    try {
      const [branchRes, moduleRes] = await Promise.all([
        getBranches({ limit: 200 }),
        getSoftwareModules(),
      ]);
      if (branchRes.success) {
        const map: Record<string | number, string> = {};
        (branchRes.data.items || branchRes.data || []).forEach((b: any) => {
          map[b.id] = b.branch_name;
        });
        setBranchNames(map);
      }
      if (moduleRes.success) {
        const map: Record<string | number, string> = {};
        (moduleRes.data.items || moduleRes.data || []).forEach((m: any) => {
          map[m.id] = m.software_name;
        });
        setModuleNames(map);
      }
    } catch {
      // silently continue
    }
  };

  const assignedBranches: (string | number)[] = formData.assigned_branches || [];
  const assignedModules: (string | number)[] = formData.software_modules || [];
  const roleAssignments: Record<string, any> = formData.role_assignments || {};

  // Validation checks
  const issues: string[] = [];
  if (!formData.first_name?.trim()) issues.push("First name is required");
  if (!formData.email?.trim()) issues.push("Email is required");
  if (!isEdit && !formData.password) issues.push("Password is required");
  if (!isEdit && formData.password && formData.password !== formData.confirm_password)
    issues.push("Passwords do not match");
  if (assignedBranches.length === 0) issues.push("At least one branch should be assigned");

  return (
    <div className="space-y-5">
      {/* Validation Issues */}
      {issues.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Please Review</p>
              <ul className="mt-1.5 space-y-1">
                {issues.map((issue, idx) => (
                  <li key={idx} className="text-xs text-amber-700 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-amber-400 shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Basic Details Card */}
      <div className="card-premium">
        <div className="card-premium-header">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-800">Basic User Details</h3>
          </div>
        </div>
        <div className="card-premium-body">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Name</p>
              <p className="text-sm font-medium text-gray-800">
                {formData.first_name} {formData.last_name}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Display Name</p>
              <p className="text-sm font-medium text-gray-800">
                {formData.display_name || `${formData.first_name} ${formData.last_name}`}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Employee Code</p>
              <p className="text-sm font-medium text-gray-800">{formData.employee_code || "—"}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-sm text-gray-700">{formData.email || "—"}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-sm text-gray-700">{formData.phone || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Status</p>
              <span className={`badge-status ${formData.status === "active" ? "badge-active" : "badge-inactive"}`}>
                {formData.status || "active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Access Card */}
      <div className="card-premium">
        <div className="card-premium-header">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-800">Branch Access</h3>
          </div>
          <span className="text-xs text-gray-400">{assignedBranches.length} branches</span>
        </div>
        <div className="card-premium-body">
          {assignedBranches.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No branches assigned</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedBranches.map((id) => (
                <span
                  key={id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    formData.primary_branch_id === id
                      ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  <MapPin className="h-3 w-3" />
                  {branchNames[id] || `Branch ${id}`}
                  {formData.primary_branch_id === id && (
                    <span className="text-[9px] uppercase tracking-wide font-bold ml-1 text-indigo-500">Primary</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Software Access Card */}
      <div className="card-premium">
        <div className="card-premium-header">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-800">Software Access</h3>
          </div>
          <span className="text-xs text-gray-400">{assignedModules.length} modules</span>
        </div>
        <div className="card-premium-body">
          {assignedModules.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No software modules assigned</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedModules.map((id) => (
                <span
                  key={id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    formData.default_software_id === id
                      ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  {moduleNames[id] || `Module ${id}`}
                  {formData.default_software_id === id && (
                    <span className="text-[9px] uppercase tracking-wide font-bold ml-1 text-indigo-500">Default</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Roles Card */}
      <div className="card-premium">
        <div className="card-premium-header">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-800">Roles</h3>
          </div>
        </div>
        <div className="card-premium-body">
          {Object.keys(roleAssignments).length === 0 ? (
            <p className="text-sm text-gray-400 italic">No roles assigned</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(roleAssignments).map(([moduleId, assignment]: [string, any]) => (
                <div key={moduleId} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50">
                  <span className="text-xs text-gray-500">{moduleNames[moduleId] || `Module ${moduleId}`}</span>
                  <span className="text-gray-300">→</span>
                  <span className="text-xs font-medium text-gray-700">
                    {assignment.role_name || `Role ID: ${assignment.role_id}`}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-auto">
                    {assignment.permissionCount || 0} permissions
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security Card */}
      <div className="card-premium">
        <div className="card-premium-header">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-800">Security</h3>
          </div>
        </div>
        <div className="card-premium-body">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Login</p>
              <span className={`badge-status ${formData.login_enabled !== false ? "badge-active" : "badge-inactive"}`}>
                {formData.login_enabled !== false ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">2FA</p>
              <span className={`badge-status ${formData.two_factor_enabled ? "badge-active" : "badge-inactive"}`}>
                {formData.two_factor_enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Force Password Change</p>
              <span className={`badge-status ${formData.force_password_change ? "badge-active" : "badge-inactive"}`}>
                {formData.force_password_change ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onCancel} className="wizard-nav-btn wizard-nav-btn-ghost">
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="wizard-nav-btn wizard-nav-btn-secondary">
            Back
          </button>
          {!isEdit && (
            <button
              type="button"
              onClick={onSaveAndCreate}
              disabled={saving || issues.length > 0}
              className="wizard-nav-btn wizard-nav-btn-secondary disabled:opacity-50"
            >
              Save & Create Another
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving || issues.length > 0}
            className="wizard-nav-btn wizard-nav-btn-primary disabled:opacity-50"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </div>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {isEdit ? "Update User" : "Save User"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepReviewSave;
