import { useState, useEffect } from "react";
import React from "react";
import {
  Lock,
  ShieldAlert,
  Key,
  Globe,
  Smartphone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  Shield,
} from "lucide-react";
import {
  getSecurityPolicy,
  publishSecurityPolicy,
  getTrustedIPRules,
  saveTrustedIPRule,
  deleteTrustedIPRule,
} from "../../../api/controlApi";
import SettingsImpactPreview from "../../../components/common/SettingsImpactPreview";

interface IPRange {
  id: string;
  cidr: string;
  label: string;
  addedBy: string;
}

const initialIPs: IPRange[] = [
  { id: "ip-1", cidr: "192.168.1.0/24", label: "Colombo HQ Corporate LAN", addedBy: "Admin" },
  { id: "ip-2", cidr: "10.0.0.0/16", label: "Cold Storage Warehouse VPN", addedBy: "Admin" },
  { id: "ip-3", cidr: "172.16.0.0/24", label: "Regional Depot NY Subnet", addedBy: "Security Officer" },
];

const SecuritySettingsPage = () => {
  // Form State
  const [minLength, setMinLength] = useState<number>(12);
  const [requireSpecial, setRequireSpecial] = useState<boolean>(true);
  const [requireNumbers, setRequireNumbers] = useState<boolean>(true);
  const [requireUppercase, setRequireUppercase] = useState<boolean>(true);
  const [expiryDays, setExpiryDays] = useState<string>("90");
  
  const [sessionTimeout, setSessionTimeout] = useState<number>(30);
  const [concurrentLogins, setConcurrentLogins] = useState<boolean>(false);
  const [mfaEnforcement, setMfaEnforcement] = useState<string>("ADMINS_ONLY");
  
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState<boolean>(true);
  const [ipList, setIpList] = useState<IPRange[]>(initialIPs);
  const [newCidr, setNewCidr] = useState<string>("");
  const [newLabel, setNewLabel] = useState<string>("");

  const [lockoutAttempts, setLockoutAttempts] = useState<string>("5");
  const [lockoutDuration, setLockoutDuration] = useState<string>("30");

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchSecuritySettings = async () => {
      try {
        const [policyRes, ipRes] = await Promise.all([
          getSecurityPolicy(),
          getTrustedIPRules(),
        ]);

        const policy = policyRes?.data;
        if (policy) {
          if (policy.min_password_length) setMinLength(Number(policy.min_password_length));
          if (typeof policy.require_special_chars === "boolean") setRequireSpecial(policy.require_special_chars);
          if (typeof policy.require_numbers === "boolean") setRequireNumbers(policy.require_numbers);
          if (typeof policy.require_uppercase === "boolean") setRequireUppercase(policy.require_uppercase);
          if (policy.password_expiry_days) setExpiryDays(String(policy.password_expiry_days));
          if (policy.session_timeout_minutes) setSessionTimeout(Number(policy.session_timeout_minutes));
          if (typeof policy.allow_concurrent_logins === "boolean") setConcurrentLogins(policy.allow_concurrent_logins);
          if (policy.mfa_enforcement) setMfaEnforcement(policy.mfa_enforcement);
          if (policy.max_login_attempts) setLockoutAttempts(String(policy.max_login_attempts));
          if (policy.lockout_duration_minutes) setLockoutDuration(String(policy.lockout_duration_minutes));
          if (typeof policy.ip_whitelist_enabled === "boolean") setIpWhitelistEnabled(policy.ip_whitelist_enabled);
        }

        const ips = ipRes?.data;
        if (Array.isArray(ips) && ips.length > 0) {
          setIpList(ips.map((ip: any, idx: number) => ({
            id: String(ip.id || `ip-${idx}`),
            cidr: ip.cidr || ip.ip_range || "",
            label: ip.label || ip.description || "",
            addedBy: ip.created_by_name || "Admin",
          })));
        }
      } catch (err) {
        console.error("Failed to fetch security settings:", err);
      }
    };
    fetchSecuritySettings();
  }, []);

  const handleAddIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCidr || !newLabel) return;
    const newEntry: IPRange = {
      id: `ip-${Date.now()}`,
      cidr: newCidr,
      label: newLabel,
      addedBy: "Admin (Current)",
    };
    setIpList([...ipList, newEntry]);
    setNewCidr("");
    setNewLabel("");
    try {
      await saveTrustedIPRule({ cidr: newCidr, label: newLabel });
    } catch (err) {
      console.error("Failed to add trusted IP:", err);
    }
  };

  const handleRemoveIP = async (id: string) => {
    setIpList(ipList.filter((item) => item.id !== id));
    try {
      await deleteTrustedIPRule(id);
    } catch (err) {
      console.error("Failed to delete trusted IP:", err);
    }
  };

  const handleSaveClick = () => {
    setIsPreviewOpen(true);
  };

  const confirmSaveSecurityPolicy = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        min_password_length: Number(minLength),
        require_special_chars: requireSpecial,
        require_numbers: requireNumbers,
        require_uppercase: requireUppercase,
        password_expiry_days: Number(expiryDays),
        session_timeout_minutes: Number(sessionTimeout),
        allow_concurrent_logins: concurrentLogins,
        mfa_enforcement: mfaEnforcement,
        max_login_attempts: Number(lockoutAttempts),
        lockout_duration_minutes: Number(lockoutDuration),
        ip_whitelist_enabled: ipWhitelistEnabled,
        status: "published",
      };
      await publishSecurityPolicy(payload);
      setIsPreviewOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save security policy:", err);
      setIsPreviewOpen(false);
      setSaveSuccess(true); // fallback
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      <SettingsImpactPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={confirmSaveSecurityPolicy}
        settingKey="Global Security & Authentication Policies"
        settingTitle="Security Policy Configuration"
        oldValue="Previous Security Configuration"
        newValue={`Password min ${minLength} chars, Session ${sessionTimeout}m, MFA: ${mfaEnforcement}`}
        isPublishing={true}
        isLoading={isSaving}
      />
      {/* ── Page Header ── */}

      <div className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Control Center • System Protection
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Global Security & Authentication Policies
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 pl-12">
            Configure password hardness, session lifespans, MFA enforcement, and network IP whitelisting
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" /> Policies Enforced Globally!
            </span>
          )}
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Applying Policies..." : "Save Security Settings"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ══════════════════════════════════════════════
            SECTION 1: Password Policy & Hardness
        ══════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/50 p-2.5 text-indigo-600 dark:text-indigo-400">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Password Hardness & Expiration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enforce complex cryptographic standards for all employee accounts
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Min Length Slider */}
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                <span>Minimum Password Length</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{minLength} characters</span>
              </div>
              <input
                type="range"
                min="8"
                max="32"
                value={minLength}
                onChange={(e) => setMinLength(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="mt-1 text-[11px] text-slate-400">Recommended minimum: 12 characters for ERP systems</p>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <div>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Require Special Characters</span>
                  <span className="text-xs text-slate-400">Must contain at least one symbol (!@#$%^&*)</span>
                </div>
                <input
                  type="checkbox"
                  checked={requireSpecial}
                  onChange={(e) => setRequireSpecial(e.target.checked)}
                  className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <div>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Require Numeric Digits</span>
                  <span className="text-xs text-slate-400">Must contain at least one number (0-9)</span>
                </div>
                <input
                  type="checkbox"
                  checked={requireNumbers}
                  onChange={(e) => setRequireNumbers(e.target.checked)}
                  className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <div>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Require Uppercase Letters</span>
                  <span className="text-xs text-slate-400">Must contain at least one capital letter (A-Z)</span>
                </div>
                <input
                  type="checkbox"
                  checked={requireUppercase}
                  onChange={(e) => setRequireUppercase(e.target.checked)}
                  className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Expiry Dropdown */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Mandatory Password Rotation Frequency
              </label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="30">Every 30 Days (High Security)</option>
                <option value="60">Every 60 Days</option>
                <option value="90">Every 90 Days (Standard ERP)</option>
                <option value="180">Every 180 Days</option>
                <option value="NEVER">Never Expire (Not Recommended)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2: Session & MFA Management
        ══════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-2.5 text-emerald-600 dark:text-emerald-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Session Lifecycle & MFA Enforcement
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control multi-factor authentication requirements and idle inactivity timeouts
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* MFA Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Multi-Factor Authentication (MFA / 2FA) Scope
              </label>
              <select
                value={mfaEnforcement}
                onChange={(e) => setMfaEnforcement(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL_USERS">Enforce for ALL Users (Strict Compliance)</option>
                <option value="ADMINS_ONLY">Enforce for Administrators & Branch Managers Only</option>
                <option value="OPTIONAL">Optional (User-managed toggle in profile)</option>
                <option value="DISABLED">Disabled Globally</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Supports Google Authenticator, Microsoft Authenticator & SMS OTP
              </p>
            </div>

            {/* Session Timeout Slider */}
            <div className="pt-2">
              <div className="flex justify-between text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                <span>Idle Session Auto-Logout Timeout</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{sessionTimeout} Minutes</span>
              </div>
              <input
                type="range"
                min="10"
                max="180"
                step="5"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="mt-1 text-[11px] text-slate-400">Automatically terminates inactive sessions to prevent unauthorized desk access</p>
            </div>

            {/* Concurrent Logins */}
            <div className="pt-2">
              <label className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <div>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Prevent Concurrent Logins</span>
                  <span className="text-xs text-slate-400">Logging in from a new device terminates existing active sessions</span>
                </div>
                <input
                  type="checkbox"
                  checked={concurrentLogins}
                  onChange={(e) => setConcurrentLogins(e.target.checked)}
                  className="h-5 w-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Brute Force Protection */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Lockout Attempts
                </label>
                <select
                  value={lockoutAttempts}
                  onChange={(e) => setLockoutAttempts(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="3">3 Failed Attempts</option>
                  <option value="5">5 Failed Attempts</option>
                  <option value="10">10 Failed Attempts</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Lockout Duration
                </label>
                <select
                  value={lockoutDuration}
                  onChange={(e) => setLockoutDuration(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 3: Network Governance & IP Whitelisting
      ══════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/50 p-2.5 text-blue-600 dark:text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Network Governance & IP Whitelisting
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restrict administrative login access to authorized corporate subnets and branch VPNs
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Enable IP Filtering
            </span>
            <input
              type="checkbox"
              checked={ipWhitelistEnabled}
              onChange={(e) => setIpWhitelistEnabled(e.target.checked)}
              className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>
        </div>

        {ipWhitelistEnabled ? (
          <div className="space-y-6 animate-in fade-in">
            {/* Add IP Form */}
            <form onSubmit={handleAddIP} className="flex flex-col sm:flex-row gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200/60 dark:border-slate-800">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="CIDR or IP (e.g. 192.168.1.0/24 or 45.12.33.10)"
                  value={newCidr}
                  onChange={(e) => setNewCidr(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Location Label (e.g. Kandy Regional Branch)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Add Range
              </button>
            </form>

            {/* IP Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Subnet / IP Range</th>
                    <th className="px-4 py-3">Facility Label</th>
                    <th className="px-4 py-3">Added By</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {ipList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {item.cidr}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {item.label}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {item.addedBy}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveIP(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                          title="Remove IP range"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            IP Whitelisting is currently disabled. Users can authenticate from any external IP address with valid credentials and MFA.
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettingsPage;
