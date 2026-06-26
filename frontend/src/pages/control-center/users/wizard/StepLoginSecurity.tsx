import React from "react";
import Input from "../../../../components/common/Input";
import ToggleSwitch from "../../../../components/common/ToggleSwitch";

interface StepLoginSecurityProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  isEdit?: boolean;
}

const StepLoginSecurity = ({ formData, onChange, isEdit }: StepLoginSecurityProps) => {
  const handleChange = (e: any) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <div className="card-premium">
      <div className="card-premium-header">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Login & Security</h3>
          <p className="text-xs text-gray-500 mt-0.5">Configure login credentials and security settings</p>
        </div>
      </div>

      <div className="card-premium-body space-y-6">
        {/* Login toggle */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <ToggleSwitch
            checked={formData.login_enabled !== false}
            onChange={(v) => onChange("login_enabled", v)}
            label="Login Enabled"
            description="Allow this user to log in to the system"
          />
        </div>

        {/* Password */}
        {!isEdit && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password *"
                type="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
              />
              <Input
                label="Confirm Password *"
                type="password"
                name="confirm_password"
                value={formData.confirm_password || ""}
                onChange={handleChange}
                placeholder="Re-enter password"
              />
            </div>
          </div>
        )}

        {isEdit && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-sm text-amber-700 font-medium">
              To reset this user's password, use the "Reset Password" action from the user profile page.
            </p>
          </div>
        )}

        <div className="section-divider" />

        {/* Security toggles */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Security Options</h4>

          <div className="p-4 rounded-xl border border-gray-100 space-y-4">
            <ToggleSwitch
              checked={formData.force_password_change || false}
              onChange={(v) => onChange("force_password_change", v)}
              label="Force Password Change On First Login"
              description="User must set a new password after their first login"
            />

            <div className="border-t border-gray-100 pt-4">
              <ToggleSwitch
                checked={formData.two_factor_enabled || false}
                onChange={(v) => onChange("two_factor_enabled", v)}
                label="Two-Factor Authentication"
                description="Require a second verification step during login"
              />
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Advanced */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Advanced Settings</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Account Expiry Date"
              type="date"
              name="account_expiry"
              value={formData.account_expiry || ""}
              onChange={handleChange}
            />
            <Input
              label="Allowed Login Time"
              type="text"
              name="allowed_login_time"
              value={formData.allowed_login_time || ""}
              onChange={handleChange}
              placeholder="e.g. 08:00 - 18:00"
            />
          </div>

          <Input
            label="Allowed IPs"
            type="text"
            name="allowed_ips"
            value={formData.allowed_ips || ""}
            onChange={handleChange}
            placeholder="Comma-separated IPs, e.g. 192.168.1.1, 10.0.0.0/24"
          />
          <p className="text-[11px] text-gray-400 -mt-2">
            Leave blank to allow login from any IP address
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepLoginSecurity;
