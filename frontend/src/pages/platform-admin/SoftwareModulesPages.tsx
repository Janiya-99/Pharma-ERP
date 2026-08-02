import React, { useState, useEffect } from "react";
import {
  getPlatformModules,
  getPlatformFeatures,
  getPlatformVersions,
  getPlatformFeatureFlags,
  createPlatformFeatureFlag,
} from "../../api/platformAdminApi";
import { toast } from "sonner";
import { Cpu, Layers, GitBranch, Shield, ToggleLeft, ToggleRight, Plus } from "lucide-react";

// 1. ERPModulesPage — master module logs
export const ERPModulesPage = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        const res = await getPlatformModules();
        if (res.success) {
          setModules(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load ERP modules list");
      } finally {
        setLoading(false);
      }
    };
    loadModules();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">ERP Software Modules</h2>
        <p className="text-sm text-slate-400">Master listing of core application modules enabled across the platform.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Fetching modules list...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((m) => (
            <div key={m.id} className="p-5 bg-slate-950/40 rounded-xl border border-slate-800 flex items-start gap-4">
              <div className="p-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                <Cpu className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">{m.module_name} ({m.module_code})</h3>
                <p className="text-xs text-slate-400">{m.description || "No description provided."}</p>
                <span className="inline-flex mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 2. ERPFeaturesPage
export const ERPFeaturesPage = () => {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setLoading(true);
        const res = await getPlatformFeatures();
        if (res.success) {
          setFeatures(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load software features");
      } finally {
        setLoading(false);
      }
    };
    loadFeatures();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Application Features</h2>
        <p className="text-sm text-slate-400">Detailed overview of system functions mapped under module controllers.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Fetching features index...</div>
      ) : features.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No specific features registered.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40 p-4">
                <th className="p-4">Feature Name</th>
                <th className="p-4">Feature Code</th>
                <th className="p-4">Parent Module</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {features.map((f) => (
                <tr key={f.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-semibold text-white">{f.feature_name}</td>
                  <td className="p-4 font-mono text-xs">{f.feature_code}</td>
                  <td className="p-4">{f.module_code}</td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 3. ERPVersionsPage
export const ERPVersionsPage = () => {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVersions = async () => {
      try {
        setLoading(true);
        const res = await getPlatformVersions();
        if (res.success) {
          setVersions(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load versions registry");
      } finally {
        setLoading(false);
      }
    };
    loadVersions();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Platform Versions & Releases</h2>
        <p className="text-sm text-slate-400">Release logs, version patches, and deployment dates of the ERP core.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Fetching versions...</div>
      ) : versions.length === 0 ? (
        <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center gap-3">
          <GitBranch className="h-5 w-5 text-indigo-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">v2.0.0 (Core Stable)</h4>
            <p className="text-xs text-slate-500">Default fallback production release deployed dynamically.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((v) => (
            <div key={v.id} className="p-5 bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{v.version_number}</span>
                <span className="text-xs text-slate-500">{new Date(v.release_date).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-400">{v.release_notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. FeatureFlagsPage
export const FeatureFlagsPage = () => {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    flag_code: "",
    flag_name: "",
    description: "",
    is_enabled: false,
  });

  const loadFlags = async () => {
    try {
      setLoading(true);
      const res = await getPlatformFeatureFlags();
      if (res.success) {
        setFlags(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load feature flags list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlatformFeatureFlag(form);
      toast.success("Feature flag registered successfully");
      setShowModal(false);
      loadFlags();
    } catch (err) {
      toast.error("Failed to create feature flag");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Global Feature Flags</h2>
          <p className="text-sm text-slate-400">Toggle experimental modules or beta features globally across client organizations.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="py-2 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Flag</span>
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Loading feature flags...</div>
      ) : flags.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No feature flags registered yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {flags.map((f) => (
            <div key={f.id} className="p-5 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{f.flag_name}</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{f.flag_code}</p>
                <p className="text-xs text-slate-400 mt-2">{f.description}</p>
              </div>
              <div>
                {f.is_enabled ? (
                  <ToggleRight className="h-8 w-8 text-emerald-400 cursor-pointer" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-600 cursor-pointer" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateFlag} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">Add Feature Flag</h3>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Flag Code *</label>
              <input
                type="text"
                value={form.flag_code}
                onChange={(e) => setForm({ ...form, flag_code: e.target.value.toUpperCase() })}
                placeholder="e.g. BETA_COMPLIANCE"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Flag Name *</label>
              <input
                type="text"
                value={form.flag_name}
                onChange={(e) => setForm({ ...form, flag_name: e.target.value })}
                placeholder="e.g. Beta Compliance Reporting"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm h-16 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm transition-all"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
