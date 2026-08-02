import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Users, MapPin, LayoutDashboard, Shield, Trash2,
  ChevronRight, CheckCircle2, Star, UserCheck, Search,
  RefreshCw, Plus, X,
} from "lucide-react";

import {
  getBranches, getUserBranches, assignUserBranches, removeUserBranch,
  updateUser, getSoftwareModules, getUserSoftware, assignUserSoftware, removeUserSoftware,
  getRoles, getUsers,
} from "../../../api/controlApi";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

/* ── palette ────────────────────────────────────────────────── */
// #021024 #052659 #5483B3 #7DA0CA #C1E8FF + white

/* ═══════════════════════════════════════════════════════════════
   INLINE USER SELECTOR (no external component dependency)
═══════════════════════════════════════════════════════════════ */
const UserSelector: React.FC<{
  selected: any; onSelect: (u: any) => void;
}> = ({ selected, onSelect }) => {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) { setUsers([]); return; }
    setLoading(true);
    try {
      const res = await getUsers({ search: query, limit: 10 });
      const data = res.data?.items || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(q), 350);
    return () => clearTimeout(t);
  }, [q, search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7DA0CA]" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-[#7DA0CA] bg-white/70
            text-[#021024] placeholder:text-[#7DA0CA] focus:outline-none focus:border-[#052659]
            focus:ring-2 focus:ring-[#5483B3]/30 transition-all"
        />
        {loading && (
          <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7DA0CA] animate-spin" />
        )}
      </div>

      {users.length > 0 && !selected && (
        <div className="rounded-xl border border-[#C1E8FF] bg-white shadow-sm overflow-hidden">
          {users.map((u: any) => (
            <button key={u.id} type="button"
              onClick={() => { onSelect(u); setQ(""); setUsers([]); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#C1E8FF]/40 transition-colors border-b border-[#C1E8FF]/60 last:border-0">
              <div className="h-8 w-8 rounded-full bg-[#052659] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {(u.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#021024] truncate">{u.name}</p>
                <p className="text-xs text-[#7DA0CA] truncate">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#C1E8FF]/40 border border-[#7DA0CA]/50">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#052659] to-[#5483B3]
            flex items-center justify-center text-white font-bold flex-shrink-0">
            {(selected.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#021024] truncate">{selected.name}</p>
            <p className="text-xs text-[#5483B3] truncate">{selected.email}</p>
            {selected.employee_code && (
              <p className="text-[10px] text-[#7DA0CA] font-mono mt-0.5">{selected.employee_code}</p>
            )}
          </div>
          <button type="button" onClick={() => onSelect(null)}
            className="h-6 w-6 rounded-full bg-white border border-[#7DA0CA] flex items-center justify-center
              hover:bg-red-50 hover:border-red-300 text-[#7DA0CA] hover:text-red-500 transition-all flex-shrink-0">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION CARD
═══════════════════════════════════════════════════════════════ */
const SectionCard: React.FC<{
  icon: React.ReactNode; title: string; accent: string;
  badge?: React.ReactNode; children: React.ReactNode;
}> = ({ icon, title, accent, badge, children }) => (
  <div className="rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-[#7DA0CA]/40
    shadow-[0_4px_24px_rgba(5,38,89,0.08)] hover:shadow-[0_8px_32px_rgba(5,38,89,0.12)] transition-shadow">
    <div className="px-5 py-4 border-b border-[#C1E8FF]/80 flex items-center justify-between gap-3"
      style={{ background: `linear-gradient(135deg, ${accent}10 0%, transparent 60%)` }}>
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent} 0%, #021024 140%)` }}>
          {icon}
        </div>
        <h3 className="text-sm font-bold text-[#021024]">{title}</h3>
      </div>
      {badge}
    </div>
    <div>{children}</div>
  </div>
);

/* ── Count badge ─────────────────────────────────────────────── */
const CountBadge: React.FC<{ n: number; color: string }> = ({ n, color }) => (
  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
    style={{ background: color }}>
    {n}
  </span>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const UserAccessManagementPage: React.FC = () => {

  const [selectedUser, setSelectedUser] = useState<any>(null);

  /* branch state */
  const [allBranches, setAllBranches] = useState<any[]>([]);
  const [assignedBranches, setAssignedBranches] = useState<any[]>([]);
  const [branchesToAssign, setBranchesToAssign] = useState<any[]>([]);
  const [assigningBranch, setAssigningBranch] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  /* software state */
  const [allSoftware, setAllSoftware] = useState<any[]>([]);
  const [assignedSoftware, setAssignedSoftware] = useState<any[]>([]);
  const [softwareToAssign, setSoftwareToAssign] = useState<any[]>([]);
  const [assigningSoftware, setAssigningSoftware] = useState(false);
  const [loadingSoftware, setLoadingSoftware] = useState(false);

  /* roles state */
  const [allRoles, setAllRoles] = useState<any[]>([]);

  /* remove dialogs */
  const [removeBranchDialog, setRemoveBranchDialog] = useState<any>(null);
  const [removeSoftwareDialog, setRemoveSoftwareDialog] = useState<any>(null);
  const [removing, setRemoving] = useState(false);

  /* ── fetch master data on mount ──────────────────────────── */
  useEffect(() => {
    Promise.all([
      getBranches({ limit: 200, status: "active" }),
      getSoftwareModules(),
      getRoles({ limit: 200 }),
    ]).then(([bR, sR, rR]) => {
      const branches = bR.data; setAllBranches(Array.isArray(branches) ? branches : branches?.items || []);
      const sw = sR.data; setAllSoftware(Array.isArray(sw) ? sw : sw?.items || []);
      const roles = rR.data; setAllRoles(Array.isArray(roles) ? roles : roles?.items || []);
    }).catch(console.error);
  }, []);

  /* ── fetch user-specific data when user changes ──────────── */
  useEffect(() => {
    if (!selectedUser) {
      setAssignedBranches([]);
      setAssignedSoftware([]);
      setBranchesToAssign([]);
      setSoftwareToAssign([]);
      return;
    }
    fetchUserBranches();
    fetchUserSoftware();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const fetchUserBranches = async () => {
    if (!selectedUser) return;
    setLoadingBranches(true);
    try {
      const res = await getUserBranches(selectedUser.id);
      // try res.data.branches → res.data (array) → []
      const d = res.data;
      const list = d?.branches || (Array.isArray(d) ? d : []);
      setAssignedBranches(list);
    } catch (e) { console.error(e); toast.error("Failed to load branch access"); }
    finally { setLoadingBranches(false); }
  };

  const fetchUserSoftware = async () => {
    if (!selectedUser) return;
    setLoadingSoftware(true);
    try {
      const res = await getUserSoftware(selectedUser.id);
      const d = res.data;
      const list = d?.software_modules || (Array.isArray(d) ? d : []);
      setAssignedSoftware(list);
    } catch (e) { console.error(e); toast.error("Failed to load software access"); }
    finally { setLoadingSoftware(false); }
  };

  /* ── Assign branches ─────────────────────────────────────── */
  const handleAssignBranches = async () => {
    if (!selectedUser || branchesToAssign.length === 0) return;
    setAssigningBranch(true);
    try {
      const res = await assignUserBranches(selectedUser.id, {
        branches: branchesToAssign.map((b: any) => ({ branch_id: b.id, is_default: false })),
      });
      if (res.success) {
        toast.success(`${branchesToAssign.length} branch(es) assigned`);
        setBranchesToAssign([]);
        fetchUserBranches();
      } else toast.error(res.message || "Failed");
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setAssigningBranch(false); }
  };

  /* ── Assign software ─────────────────────────────────────── */
  const handleAssignSoftware = async () => {
    if (!selectedUser || softwareToAssign.length === 0) return;
    setAssigningSoftware(true);
    try {
      const res = await assignUserSoftware(selectedUser.id, {
        software_modules: softwareToAssign.map((s: any) => ({ software_id: s.id, can_access: true })),
      });
      if (res.success) {
        toast.success(`${softwareToAssign.length} module(s) assigned`);
        setSoftwareToAssign([]);
        fetchUserSoftware();
      } else toast.error(res.message || "Failed");
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setAssigningSoftware(false); }
  };

  /* ── Remove branch ───────────────────────────────────────── */
  const handleRemoveBranch = async () => {
    if (!removeBranchDialog) return;
    setRemoving(true);
    try {
      const res = await removeUserBranch(selectedUser.id, removeBranchDialog.id);
      if (res.success) { toast.success("Branch removed"); setRemoveBranchDialog(null); fetchUserBranches(); }
      else toast.error(res.message || "Failed");
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setRemoving(false); }
  };

  /* ── Remove software ─────────────────────────────────────── */
  const handleRemoveSoftware = async () => {
    if (!removeSoftwareDialog) return;
    setRemoving(true);
    try {
      const res = await removeUserSoftware(selectedUser.id, removeSoftwareDialog.id);
      if (res.success) { toast.success("Software removed"); setRemoveSoftwareDialog(null); fetchUserSoftware(); }
      else toast.error(res.message || "Failed");
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setRemoving(false); }
  };

  /* ── Set default branch ──────────────────────────────────── */
  const setDefault = async (branchId: number) => {
    try {
      const u = selectedUser;
      const res = await updateUser(u.id, {
        name: u.name, email: u.email, phone: u.phone || "",
        employee_code: u.employee_code || "", user_type: u.user_type, status: u.status,
        department_id: u.department_id || 0, designation_id: u.designation_id || 0,
        default_branch_id: branchId,
      });
      if (res.success) {
        setSelectedUser({ ...u, default_branch_id: branchId });
        toast.success("Default branch updated");
      } else toast.error(res.message || "Failed");
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  /* available (not yet assigned) items */
  const availBranches = allBranches.filter(
    b => !assignedBranches.some((ab: any) => ab.id === b.id) && !branchesToAssign.some((tb: any) => tb.id === b.id)
  );
  const availSoftware = allSoftware.filter(
    s => !assignedSoftware.some((as: any) => as.id === s.id) && !softwareToAssign.some((ts: any) => ts.id === s.id)
  );

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#C1E8FF 0%,#daeeff 30%,#eef6ff 60%,#f5faff 100%)" }}>
      <div className="page-content space-y-6">

        {/* breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-[#5483B3]">
          <Link to="/control-center" className="hover:text-[#052659] transition-colors">Control Center</Link>
          <ChevronRight className="h-3 w-3 text-[#7DA0CA]" />
          <span className="text-[#052659] font-semibold">Access Management</span>
        </nav>

        {/* page title */}
        <div>
          <h1 className="text-2xl font-black text-[#021024] tracking-tight">Access Management</h1>
          <p className="text-sm text-[#5483B3] mt-1">
            Assign branch access, software modules, and roles to users from one place.
          </p>
        </div>

        {/* ══ layout ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">

          {/* ═══ LEFT: user selector ═══ */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-[#7DA0CA]/40
              shadow-[0_4px_24px_rgba(5,38,89,0.08)] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#052659] flex items-center justify-center flex-shrink-0">
                  <Users className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-sm font-bold text-[#021024]">Select User</h2>
              </div>
              <UserSelector selected={selectedUser} onSelect={setSelectedUser} />

              {selectedUser && (
                <div className="mt-4 pt-4 border-t border-[#C1E8FF] space-y-2">
                  <p className="text-[10px] font-bold text-[#7DA0CA] uppercase tracking-widest">Summary</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5483B3]">Branches</span>
                    <span className="text-xs font-bold text-[#052659]">{assignedBranches.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5483B3]">Software</span>
                    <span className="text-xs font-bold text-[#052659]">{assignedSoftware.length}</span>
                  </div>
                  <div className="mt-3">
                    <Link to={`/control-center/users/${selectedUser.id}/edit`}
                      className="block text-center py-2 text-xs font-semibold text-[#052659]
                        border border-[#7DA0CA] rounded-xl hover:bg-[#C1E8FF]/50 transition-colors">
                      Edit Profile →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT: access panels ═══ */}
          <div className="lg:col-span-3 space-y-5">

            {!selectedUser ? (
              <div className="rounded-2xl bg-white/60 border border-[#C1E8FF] p-16 text-center">
                <div className="h-14 w-14 rounded-2xl bg-[#C1E8FF] flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-7 w-7 text-[#052659]" />
                </div>
                <p className="text-base font-bold text-[#021024]">Select a user to manage access</p>
                <p className="text-sm text-[#7DA0CA] mt-1">
                  Search and pick a user on the left to assign branches, software, and roles.
                </p>
              </div>
            ) : (
              <>
                {/* ── Branch Access ── */}
                <SectionCard
                  icon={<MapPin className="h-4 w-4" />}
                  title="Branch Access"
                  accent="#052659"
                  badge={<CountBadge n={assignedBranches.length} color="#052659" />}
                >
                  {/* assign row */}
                  <div className="p-5 border-b border-[#C1E8FF]/60">
                    <p className="text-xs font-bold text-[#052659] uppercase tracking-widest mb-3">
                      Assign Branches
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <select multiple
                          className="w-full h-28 rounded-xl border border-[#7DA0CA] bg-white/70 text-sm text-[#021024]
                            focus:outline-none focus:border-[#052659] focus:ring-2 focus:ring-[#5483B3]/30 p-2"
                          onChange={e => {
                            const sel = Array.from(e.target.selectedOptions).map(o => availBranches.find((b:any) => String(b.id) === o.value));
                            setBranchesToAssign(sel.filter(Boolean) as any[]);
                          }}
                        >
                          {availBranches.length === 0
                            ? <option disabled>All branches assigned</option>
                            : availBranches.map((b: any) => (
                                <option key={b.id} value={b.id}>{b.branch_name || b.name}</option>
                              ))}
                        </select>
                        {availBranches.length > 0 && (
                          <p className="text-[11px] text-[#7DA0CA] mt-1">
                            Hold Ctrl/Cmd to select multiple
                          </p>
                        )}
                      </div>
                      <button type="button" disabled={branchesToAssign.length === 0 || assigningBranch}
                        onClick={handleAssignBranches}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl
                          bg-gradient-to-r from-[#052659] to-[#5483B3]
                          shadow-sm hover:shadow-md disabled:opacity-50 transition-all self-start sm:self-end">
                        <Plus className="h-4 w-4" />
                        {assigningBranch ? "Assigning…" : "Assign"}
                      </button>
                    </div>
                  </div>

                  {/* assigned list */}
                  <div>
                    {loadingBranches ? (
                      <div className="p-8 text-center text-sm text-[#7DA0CA]">Loading…</div>
                    ) : assignedBranches.length === 0 ? (
                      <div className="p-8 text-center text-sm text-[#7DA0CA]">No branches assigned yet.</div>
                    ) : (
                      <ul className="divide-y divide-[#C1E8FF]/60">
                        {assignedBranches.map((b: any) => (
                          <li key={b.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#C1E8FF]/20 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-[#C1E8FF] flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-4 w-4 text-[#052659]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#021024] flex items-center gap-2 flex-wrap">
                                  {b.branch_name || b.name}
                                  {selectedUser.default_branch_id === b.id && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C1E8FF] text-[#052659]">
                                      Default
                                    </span>
                                  )}
                                </p>
                                {b.branch_code && (
                                  <p className="text-xs text-[#7DA0CA] font-mono">{b.branch_code}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {selectedUser.default_branch_id !== b.id && (
                                <button type="button" onClick={() => setDefault(b.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                                    text-[#052659] border border-[#7DA0CA] rounded-lg hover:bg-[#C1E8FF]/50 transition-colors">
                                  <Star className="h-3 w-3" /> Set Default
                                </button>
                              )}
                              <button type="button" onClick={() => setRemoveBranchDialog(b)}
                                className="p-2 text-[#7DA0CA] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </SectionCard>

                {/* ── Software Access ── */}
                <SectionCard
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  title="Software Module Access"
                  accent="#5483B3"
                  badge={<CountBadge n={assignedSoftware.length} color="#5483B3" />}
                >
                  {/* assign row */}
                  <div className="p-5 border-b border-[#C1E8FF]/60">
                    <p className="text-xs font-bold text-[#5483B3] uppercase tracking-widest mb-3">
                      Assign Modules
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <select multiple
                          className="w-full h-28 rounded-xl border border-[#7DA0CA] bg-white/70 text-sm text-[#021024]
                            focus:outline-none focus:border-[#052659] focus:ring-2 focus:ring-[#5483B3]/30 p-2"
                          onChange={e => {
                            const sel = Array.from(e.target.selectedOptions).map(o => availSoftware.find((s:any) => String(s.id) === o.value));
                            setSoftwareToAssign(sel.filter(Boolean) as any[]);
                          }}
                        >
                          {availSoftware.length === 0
                            ? <option disabled>All modules assigned</option>
                            : availSoftware.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.software_name || s.name}</option>
                              ))}
                        </select>
                        {availSoftware.length > 0 && (
                          <p className="text-[11px] text-[#7DA0CA] mt-1">Hold Ctrl/Cmd to select multiple</p>
                        )}
                      </div>
                      <button type="button" disabled={softwareToAssign.length === 0 || assigningSoftware}
                        onClick={handleAssignSoftware}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl
                          bg-gradient-to-r from-[#5483B3] to-[#7DA0CA]
                          shadow-sm hover:shadow-md disabled:opacity-50 transition-all self-start sm:self-end">
                        <Plus className="h-4 w-4" />
                        {assigningSoftware ? "Assigning…" : "Assign"}
                      </button>
                    </div>
                  </div>

                  {/* assigned list */}
                  <div>
                    {loadingSoftware ? (
                      <div className="p-8 text-center text-sm text-[#7DA0CA]">Loading…</div>
                    ) : assignedSoftware.length === 0 ? (
                      <div className="p-8 text-center text-sm text-[#7DA0CA]">No software modules assigned yet.</div>
                    ) : (
                      <ul className="divide-y divide-[#C1E8FF]/60">
                        {assignedSoftware.map((s: any) => (
                          <li key={s.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#C1E8FF]/20 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-[#C1E8FF] flex items-center justify-center flex-shrink-0">
                                <LayoutDashboard className="h-4 w-4 text-[#5483B3]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#021024]">{s.software_name || s.name}</p>
                                {s.software_code && (
                                  <p className="text-xs text-[#7DA0CA] font-mono">{s.software_code}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {s.can_access !== false && (
                                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                  <CheckCircle2 className="h-3 w-3" /> Active
                                </span>
                              )}
                              <button type="button" onClick={() => setRemoveSoftwareDialog(s)}
                                className="p-2 text-[#7DA0CA] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </SectionCard>

                {/* ── Roles (info panel) ── */}
                <SectionCard
                  icon={<Shield className="h-4 w-4" />}
                  title="Roles & Permissions"
                  accent="#7DA0CA"
                  badge={
                    <Link to="/control-center/roles-permissions"
                      className="text-xs font-semibold text-[#052659] hover:underline">
                      Manage Roles →
                    </Link>
                  }
                >
                  <div className="p-5">
                    <div className="rounded-xl bg-[#C1E8FF]/40 border border-[#7DA0CA]/40 p-4 text-sm text-[#5483B3]">
                      <p className="font-semibold text-[#021024] mb-1">Role assignment</p>
                      <p className="text-xs leading-relaxed">
                        Roles and permissions are managed from the{" "}
                        <Link to="/control-center/roles-permissions"
                          className="font-semibold text-[#052659] hover:underline">
                          Roles & Permissions
                        </Link>{" "}
                        section. Once a role is created, assign it to this user there.
                      </p>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm dialogs ── */}
      <ConfirmDialog
        isOpen={!!removeBranchDialog}
        onClose={() => setRemoveBranchDialog(null)}
        onConfirm={handleRemoveBranch}
        title="Remove Branch Access"
        message={`Remove access to "${removeBranchDialog?.branch_name || removeBranchDialog?.name}" for ${selectedUser?.name}?`}
        confirmText="Remove"
        isConfirming={removing}
      />
      <ConfirmDialog
        isOpen={!!removeSoftwareDialog}
        onClose={() => setRemoveSoftwareDialog(null)}
        onConfirm={handleRemoveSoftware}
        title="Remove Software Access"
        message={`Remove access to "${removeSoftwareDialog?.software_name || removeSoftwareDialog?.name}" for ${selectedUser?.name}?`}
        confirmText="Remove"
        isConfirming={removing}
      />
    </div>
  );
};

export default UserAccessManagementPage;
