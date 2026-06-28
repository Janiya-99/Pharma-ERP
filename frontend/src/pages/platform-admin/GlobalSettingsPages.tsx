import React, { useState, useEffect } from "react";
import {
  getPlatformSettings,
  updateBrandingSettings,
  updateEmailSettings,
  updateGatewaySettings,
  updateBackupSettings,
} from "../../api/platformAdminApi";
import { toast } from "sonner";
import { Mail, Palette, Server, Wallet, Info } from "lucide-react";

// 1. SoftwareCompanyProfilePage
export const SoftwareCompanyProfilePage = () => {
  const [profile, setProfile] = useState({
    company_name: "PIXANDCO Softwares Ltd",
    registration_number: "PV-83921",
    email: "support@pixandco.com",
    phone: "+94 11 234 5678",
    address: "Trace Expert City, Maradana, Colombo 10",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Owner company profile updated successfully (local configuration)");
  };

  return (
    <div className="space-y-6 font-sans max-w-xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Software Company Profile</h2>
        <p className="text-sm text-slate-400">Configure owner team legal profile, phone lines, and support emails.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-slate-950/40 p-6 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Legal Name</label>
          <input
            type="text"
            value={profile.company_name}
            onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Registration #</label>
            <input
              type="text"
              value={profile.registration_number}
              onChange={(e) => setProfile({ ...profile, registration_number: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Support Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Registered Address</label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-850">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm transition-all"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

// 2. BrandingSettingsPage
export const BrandingSettingsPage = () => {
  const [branding, setBranding] = useState({
    portal_name: "",
    logo_url: "",
    favicon_url: "",
    primary_color: "",
    dark_mode: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await getPlatformSettings();
        if (res.success && res.data.branding) {
          setBranding(res.data.branding);
        }
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBrandingSettings(branding);
      toast.success("White-label branding settings updated successfully");
    } catch (err) {
      toast.error("Failed to save branding settings");
    }
  };

  if (loading) return <div className="text-slate-500 text-center py-8">Loading branding details...</div>;

  return (
    <div className="space-y-6 font-sans max-w-xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">White-label Branding Settings</h2>
        <p className="text-sm text-slate-400">Configure portal name, corporate primary themes, and layout modes.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-slate-950/40 p-6 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Admin Portal Name</label>
          <input
            type="text"
            value={branding.portal_name}
            onChange={(e) => setBranding({ ...branding, portal_name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Primary Hex Color Code</label>
          <input
            type="text"
            value={branding.primary_color}
            onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            required
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-850">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm transition-all"
          >
            Save Branding
          </button>
        </div>
      </form>
    </div>
  );
};

// 3. EmailSettingsPage
export const EmailSettingsPage = () => {
  const [email, setEmail] = useState({
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    from_email: "",
    from_name: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await getPlatformSettings();
        if (res.success && res.data.email) {
          setEmail(res.data.email);
        }
      } catch (err) {
        toast.error("Failed to load SMTP configuration");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmailSettings(email);
      toast.success("SMTP email gateway parameters updated successfully");
    } catch (err) {
      toast.error("Failed to update SMTP parameters");
    }
  };

  if (loading) return <div className="text-slate-500 text-center py-8">Loading SMTP configurations...</div>;

  return (
    <div className="space-y-6 font-sans max-w-xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">SMTP Email Gateway Settings</h2>
        <p className="text-sm text-slate-400">Configure global mailer servers, ports, authentication credentials, and headers.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-slate-950/40 p-6 rounded-xl border border-slate-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">SMTP Host</label>
            <input
              type="text"
              value={email.smtp_host}
              onChange={(e) => setEmail({ ...email, smtp_host: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">SMTP Port</label>
            <input
              type="number"
              value={email.smtp_port}
              onChange={(e) => setEmail({ ...email, smtp_port: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">SMTP Username</label>
          <input
            type="text"
            value={email.smtp_username}
            onChange={(e) => setEmail({ ...email, smtp_username: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">From Sender Address</label>
            <input
              type="email"
              value={email.from_email}
              onChange={(e) => setEmail({ ...email, from_email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Sender Alias Name</label>
            <input
              type="text"
              value={email.from_name}
              onChange={(e) => setEmail({ ...email, from_name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-850">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm transition-all"
          >
            Save Gateway Config
          </button>
        </div>
      </form>
    </div>
  );
};

// 4. PaymentGatewaySettingsPage
export const PaymentGatewaySettingsPage = () => {
  const [gateway, setGateway] = useState({
    gateway_name: "",
    sandbox_mode: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await getPlatformSettings();
        if (res.success && res.data.payment_gateway) {
          setGateway(res.data.payment_gateway);
        }
      } catch (err) {
        toast.error("Failed to load gateway parameters");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGatewaySettings(gateway);
      toast.success("Merchant gateway details saved successfully");
    } catch (err) {
      toast.error("Failed to update gateway details");
    }
  };

  if (loading) return <div className="text-slate-500 text-center py-8">Loading merchant parameters...</div>;

  return (
    <div className="space-y-6 font-sans max-w-xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Payment Gateway Settings</h2>
        <p className="text-sm text-slate-400">Configure global merchant APIs, sandbox testing modes, and secret tokens.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-slate-950/40 p-6 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Gateway Provider Name</label>
          <input
            type="text"
            value={gateway.gateway_name}
            onChange={(e) => setGateway({ ...gateway, gateway_name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            required
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-850">
          <div>
            <h4 className="text-sm font-semibold text-white">Sandbox Sandbox/Testing Mode</h4>
            <p className="text-xs text-slate-500">Enable test payment processing hooks.</p>
          </div>
          <input
            type="checkbox"
            checked={gateway.sandbox_mode}
            onChange={(e) => setGateway({ ...gateway, sandbox_mode: e.target.checked })}
            className="h-4 w-4 bg-slate-950 border-slate-800 text-indigo-600 rounded"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-850">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm transition-all"
          >
            Save Gateway Credentials
          </button>
        </div>
      </form>
    </div>
  );
};

// 5. BackupSettingsPage
export const BackupSettingsPage = () => {
  const [backup, setBackup] = useState({
    backup_provider: "",
    backup_frequency: "daily",
    retention_days: 30,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await getPlatformSettings();
        if (res.success && res.data.backup) {
          setBackup(res.data.backup);
        }
      } catch (err) {
        toast.error("Failed to load backup parameters");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBackupSettings(backup);
      toast.success("Snapshot backups schedule updated successfully");
    } catch (err) {
      toast.error("Failed to update backup details");
    }
  };

  if (loading) return <div className="text-slate-500 text-center py-8">Loading backup properties...</div>;

  return (
    <div className="space-y-6 font-sans max-w-xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Automated Backup Settings</h2>
        <p className="text-sm text-slate-400">Configure MySQL database snapshot intervals, providers, and local file storage retention.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-slate-950/40 p-6 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Backup Provider / Target</label>
          <input
            type="text"
            value={backup.backup_provider}
            onChange={(e) => setBackup({ ...backup, backup_provider: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Backup Frequency</label>
            <select
              value={backup.backup_frequency}
              onChange={(e) => setBackup({ ...backup, backup_frequency: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Retention Policy (Days) *</label>
            <input
              type="number"
              value={backup.retention_days}
              onChange={(e) => setBackup({ ...backup, retention_days: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-850">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm transition-all"
          >
            Save Backup Policy
          </button>
        </div>
      </form>
    </div>
  );
};
