import React, { useState, useEffect } from "react";
import {
  getPlatformUsers,
  createPlatformUser,
  getPlatformRoles,
  getPlatformPermissions,
} from "../../api/platformAdminApi";
import { toast } from "sonner";
import { UserCheck, Shield, Key, Plus } from "lucide-react";

// 1. PlatformUsersPage
export const PlatformUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getPlatformUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load platform admin users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlatformUser(form);
      toast.success("Platform admin user created successfully");
      setShowModal(false);
      loadUsers();
    } catch (err) {
      toast.error("Failed to create admin user");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Platform Admin Users</h2>
          <p className="text-sm text-slate-400">Manage administrator user profiles for the SaaS owner team.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="py-2 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New User</span>
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Loading users list...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {users.map((u) => (
            <div key={u.id} className="p-5 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{u.username}</h3>
                <p className="text-xs text-slate-500">{u.email}</p>
                <span className="inline-flex mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {u.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateUser} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">Add Admin User</h3>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Username *</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                required
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

// 2. PlatformRolesPage
export const PlatformRolesPage = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const res = await getPlatformRoles();
        if (res.success) {
          setRoles(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load roles list");
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Platform Roles Matrix</h2>
        <p className="text-sm text-slate-400">Review white-label support levels, technical staff permissions, and management roles.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Loading roles matrix...</div>
      ) : roles.length === 0 ? (
        <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center gap-3">
          <Shield className="h-5 w-5 text-indigo-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Super Administrator</h4>
            <p className="text-xs text-slate-500">Unrestricted root developer role matching owner authority.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((r) => (
            <div key={r.id} className="p-5 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1">
              <h4 className="font-bold text-white text-sm">{r.name}</h4>
              <p className="text-xs text-slate-400">{r.description || "No description configured."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 3. PlatformPermissionsPage
export const PlatformPermissionsPage = () => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerms = async () => {
      try {
        setLoading(true);
        const res = await getPlatformPermissions();
        if (res.success) {
          setPermissions(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load permissions catalog");
      } finally {
        setLoading(false);
      }
    };
    loadPerms();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Platform Admin Permissions</h2>
        <p className="text-sm text-slate-400">Detailed overview of low-level authorization permissions inside owner modules.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Loading permissions catalog...</div>
      ) : permissions.length === 0 ? (
        <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center gap-3">
          <Key className="h-5 w-5 text-indigo-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Owner Administration Policies</h4>
            <p className="text-xs text-slate-500">Unrestricted read and write policies to system settings, billing and tickets.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40 p-4">
                <th className="p-4">Policy Name</th>
                <th className="p-4">Policy Code</th>
                <th className="p-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {permissions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-semibold text-white">{p.name}</td>
                  <td className="p-4 font-mono text-xs text-indigo-400">{p.code}</td>
                  <td className="p-4 text-xs">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
