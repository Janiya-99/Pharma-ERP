import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, User, Building2, Shield, ChevronRight,
  Eye, EyeOff, Settings, Info, AlertCircle, Lock, Unlock,
  Save, PlusCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import {
  createUser, updateUser, getUserById,
  getDepartments, getDesignations, getBranches, resetUserPassword,
} from "../../../api/controlApi";

/* ─────────────────────────────────────────────────────────────
   Brand palette
   #021024  bb-900  darkest navy
   #052659  bb-700  dark navy
   #5483B3  bb-500  medium blue
   #7DA0CA  bb-300  light blue
   #C1E8FF  bb-100  ice blue
   #FFFFFF          white (cards)
───────────────────────────────────────────────────────────── */

interface FormData {
  first_name: string; last_name: string; display_name: string;
  employee_code: string; email: string; phone: string;
  department_id: string; designation_id: string; default_branch_id: string;
  user_type: string; status: string; login_enabled: boolean;
  password: string; confirm_password: string;
  force_password_change: boolean; two_factor_enabled: boolean;
}

const BLANK: FormData = {
  first_name: "", last_name: "", display_name: "", employee_code: "",
  email: "", phone: "", department_id: "", designation_id: "",
  default_branch_id: "", user_type: "company_user", status: "active",
  login_enabled: true, password: "", confirm_password: "",
  force_password_change: true, two_factor_enabled: false,
};

const listFromResponse = (res: any) => {
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const labelFor = (item: any, keys: string[]) =>
  keys.map((key) => item?.[key]).find(Boolean) || "Unnamed";

/* ── Reusable mini components ─────────────────────────────── */

const FieldWrap: React.FC<{
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}> = ({ label, required, error, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label className="text-[11px] font-bold text-[#052659] uppercase tracking-widest">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    {children}
    {error && (
      <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />{error}
      </span>
    )}
    {hint && !error && <span className="text-[11px] text-[#7DA0CA] leading-relaxed">{hint}</span>}
  </div>
);

const inp = (err?: string) =>
  `h-10 border bg-white/70 text-[#021024] placeholder:text-[#7DA0CA]/70 rounded-xl
   transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#5483B3]/40
   focus-visible:border-[#052659] ${err ? "border-red-400" : "border-[#7DA0CA]"}`;

const selectTrigCls =
  `h-10 w-full min-w-0 rounded-xl border-[#7DA0CA] bg-white px-3
   text-sm font-medium text-[#021024] shadow-[0_1px_2px_rgba(5,38,89,0.06)]
   transition-all duration-200 hover:border-[#5483B3] hover:bg-[#f8fbff]
   focus:ring-2 focus:ring-[#5483B3]/30 focus:border-[#052659]
   data-placeholder:text-[#7DA0CA]`;

const selectContentCls =
  `z-[100] max-h-72 w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]
   overflow-y-auto rounded-xl border border-[#7DA0CA]/35 bg-white p-1.5
   shadow-[0_18px_48px_rgba(5,38,89,0.18)]`;

const selectItemCls =
  `rounded-lg px-2.5 py-2 text-sm text-[#052659]
   focus:bg-[#C1E8FF]/45 focus:text-[#021024]`;

const BrandToggle: React.FC<{
  id: string; checked: boolean; onChange: (v: boolean) => void;
  label: string; description?: string;
}> = ({ id, checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 py-3.5 px-4">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-[#021024] leading-snug">{label}</p>
      {description && <p className="text-xs text-[#7DA0CA] mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <button
      id={id} type="button" role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative flex-shrink-0 inline-flex h-[26px] w-12 items-center rounded-full
        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5483B3]/50 focus:ring-offset-1
        ${checked ? "bg-gradient-to-r from-[#052659] to-[#5483B3] shadow-md" : "bg-[#C1E8FF] border border-[#7DA0CA]"}`}
    >
      <span className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-md
        transition-transform duration-300 ${checked ? "translate-x-[26px]" : "translate-x-[4px]"}`} />
    </button>
  </div>
);

/* ── Section header strip ─────────────────────────────────── */
const SectionHeader: React.FC<{
  icon: React.ReactNode; title: string; step: number; color: string;
}> = ({ icon, title, step, color }) => (
  <div
    className="flex items-center gap-3 -mx-6 px-6 py-4 mb-5 border-b border-[#C1E8FF]/60"
    style={{ background: `linear-gradient(135deg, ${color}12 0%, transparent 60%)` }}
  >
    <div
      className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-xs font-black shadow-lg flex-shrink-0"
      style={{ background: `linear-gradient(135deg, ${color} 0%, #021024 120%)` }}
    >
      {step}
    </div>
    <div className="flex items-center gap-2 flex-1">
      <span style={{ color }}>{icon}</span>
      <h3 className="text-sm font-bold text-[#021024] tracking-tight">{title}</h3>
    </div>
  </div>
);

/* ── Glass card wrapper ───────────────────────────────────── */
const GlassCard: React.FC<{
  children: React.ReactNode; className?: string; accent?: string;
}> = ({ children, className = "", accent = "#052659" }) => (
  <div
    className={`relative rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm
      border border-[#7DA0CA]/40 shadow-[0_4px_32px_rgba(5,38,89,0.10)] 
      hover:shadow-[0_8px_40px_rgba(5,38,89,0.16)] transition-shadow duration-300 ${className}`}
  >
    <div
      className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl"
      style={{ background: `linear-gradient(180deg, ${accent} 0%, #7DA0CA 100%)` }}
    />
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════════ */
const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>({ ...BLANK });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetPwd, setResetPwd] = useState({ new_password: "", confirm_password: "" });
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDropdowns = async () => {
    const [dR, dsR, bR] = await Promise.allSettled([
      getDepartments({ limit: 200 }),
      getDesignations({ limit: 200 }),
      getBranches({ limit: 200 }),
    ]);

    if (dR.status === "fulfilled") setDepartments(listFromResponse(dR.value));
    else console.error("Department dropdown error:", dR.reason);

    if (dsR.status === "fulfilled") setDesignations(listFromResponse(dsR.value));
    else console.error("Designation dropdown error:", dsR.reason);

    if (bR.status === "fulfilled") setBranches(listFromResponse(bR.value));
    else console.error("Branch dropdown error:", bR.reason);
  };

  const fetchUser = async () => {
    try {
      setLoading(true); setLoadError(false);
      const res = await getUserById(id!);
      if (!res.success) throw new Error();
      const u = res.data;
      const parts = (u.name || "").split(" ");
      setForm(p => ({
        ...p,
        first_name: parts[0] || "", last_name: parts.slice(1).join(" ") || "",
        display_name: u.display_name || u.name || "",
        email: u.email || "", phone: u.phone || "", employee_code: u.employee_code || "",
        department_id: u.department_id ? String(u.department_id) : "",
        designation_id: u.designation_id ? String(u.designation_id) : "",
        default_branch_id: u.default_branch_id ? String(u.default_branch_id) : "",
        user_type: u.user_type || "company_user", status: u.status || "active",
        login_enabled: u.login_enabled !== false,
        two_factor_enabled: u.two_factor_enabled || false,
        force_password_change: u.force_password_change || false,
      }));
    } catch { setLoadError(true); } finally { setLoading(false); }
  };

  const sf = (k: keyof FormData, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = "Required";
    if (!form.last_name.trim()) e.last_name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (!form.status) e.status = "Required";
    if (!isEdit && form.login_enabled) {
      if (!form.password) e.password = "Required";
      else if (form.password.length < 8) e.password = "Minimum 8 characters";
      if (!form.confirm_password) e.confirm_password = "Required";
      else if (form.password !== form.confirm_password) e.confirm_password = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const payload = () => {
    const full = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();
    return {
      name: full, full_name: full,
      display_name: form.display_name.trim() || full,
      employee_code: form.employee_code.trim(), email: form.email.trim(), phone: form.phone.trim(),
      department_id: form.department_id ? +form.department_id : 0,
      designation_id: form.designation_id ? +form.designation_id : 0,
      default_branch_id: form.default_branch_id ? +form.default_branch_id : 0,
      user_type: form.user_type || "company_user", status: form.status,
      login_enabled: form.login_enabled, force_password_change: form.force_password_change,
      two_factor_enabled: form.two_factor_enabled,
      ...(!isEdit && { password: form.password, confirm_password: form.confirm_password }),
    };
  };

  const handleSave = async (another = false) => {
    if (!validate()) { toast.error("Please fix the highlighted fields"); return; }
    setSaving(true);
    try {
      const res = isEdit ? await updateUser(id!, payload()) : await createUser(payload());
      if (!res.success) { toast.error(res.message || "Failed"); return; }
      toast.success(isEdit ? "User updated!" : "User created!");
      if (another) { setForm({ ...BLANK }); setErrors({}); window.scrollTo(0, 0); }
      else navigate("/control-center/users");
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleResetPwd = async () => {
    if (resetPwd.new_password.length < 8) { toast.error("Min 8 chars"); return; }
    if (resetPwd.new_password !== resetPwd.confirm_password) { toast.error("Passwords don't match"); return; }
    setResetting(true);
    try {
      const res = await resetUserPassword(id!, resetPwd);
      if (res.success) { toast.success("Password reset!"); setShowResetForm(false); setResetPwd({ new_password: "", confirm_password: "" }); }
      else toast.error(res.message || "Failed");
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setResetting(false); }
  };

  /* ── status badge ── */
  const statusMap: Record<string, [string, string]> = {
    active:    ["#dcfce7", "#15803d"],
    inactive:  ["#f1f5f9", "#475569"],
    suspended: ["#fef3c7", "#b45309"],
    locked:    ["#fee2e2", "#b91c1c"],
  };
  const [sBg, sTxt] = statusMap[form.status] || statusMap.inactive;

  /* ── loading ── */
  if (loading) return (
    <div className="relative isolate min-h-screen bg-white">
      <div className="page-content space-y-6">
        {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl bg-white/50" />)}
      </div>
    </div>
  );

  if (loadError) return (
    <div className="relative isolate min-h-screen bg-white">
      <div className="page-content">
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load user. <button className="underline font-semibold" onClick={fetchUser}>Retry</button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  return (
    <div className="relative isolate min-h-screen bg-white">
      <div className="page-content pb-10 space-y-6">

        {/* ── breadcrumbs ── */}
        <nav className="flex items-center gap-1.5 text-xs text-[#5483B3]">
          <Link to="/control-center" className="hover:text-[#052659] transition-colors">Control Center</Link>
          <ChevronRight className="h-3 w-3 text-[#7DA0CA]" />
          <Link to="/control-center/users" className="hover:text-[#052659] transition-colors">Users</Link>
          <ChevronRight className="h-3 w-3 text-[#7DA0CA]" />
          <span className="text-[#052659] font-semibold">{isEdit ? "Edit User" : "Create User"}</span>
        </nav>

        {/* ── page title ── */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/control-center/users")}
            className="mt-0.5 p-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-[#7DA0CA]/50
              hover:bg-white hover:shadow-md text-[#052659] shadow-sm transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-[#021024] tracking-tight">
                {isEdit ? "Edit User" : "Create New User"}
              </h1>
              {isEdit && form.status && (
                <span className="px-3 py-1 rounded-full text-xs font-bold capitalize"
                  style={{ background: sBg, color: sTxt }}>
                  {form.status}
                </span>
              )}
            </div>
            <p className="text-sm text-[#5483B3] mt-1">
              {isEdit
                ? "Update the user's profile and security settings."
                : "Set up a new user profile and login credentials."}
            </p>
          </div>
        </div>

        {/* ══════════════════ LAYOUT ══════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* ═══ LEFT: form cards ═══ */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── Card 1: Basic Details ── */}
            <GlassCard accent="#052659">
              <div className="pl-3">
                <SectionHeader icon={<User className="h-4 w-4" />} title="Basic Details" step={1} color="#052659" />
                <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrap label="First Name" required error={errors.first_name}>
                    <Input value={form.first_name} onChange={e => sf("first_name", e.target.value)}
                      placeholder="e.g. Janith" className={inp(errors.first_name)} />
                  </FieldWrap>
                  <FieldWrap label="Last Name" required error={errors.last_name}>
                    <Input value={form.last_name} onChange={e => sf("last_name", e.target.value)}
                      placeholder="e.g. Perera" className={inp(errors.last_name)} />
                  </FieldWrap>
                  <FieldWrap label="Display Name" hint="Shown throughout the app">
                    <Input value={form.display_name} onChange={e => sf("display_name", e.target.value)}
                      placeholder="e.g. J. Perera" className={inp()} />
                  </FieldWrap>
                  <FieldWrap label="Employee Code">
                    <Input value={form.employee_code} onChange={e => sf("employee_code", e.target.value)}
                      placeholder="e.g. EMP-001" className={inp()} />
                  </FieldWrap>
                  <FieldWrap label="Email Address" required error={errors.email}>
                    <Input type="email" value={form.email} onChange={e => sf("email", e.target.value)}
                      placeholder="user@company.com" className={inp(errors.email)} />
                  </FieldWrap>
                  <FieldWrap label="Phone Number">
                    <Input type="tel" value={form.phone} onChange={e => sf("phone", e.target.value)}
                      placeholder="+94 77 123 4567" className={inp()} />
                  </FieldWrap>
                </div>
              </div>
            </GlassCard>

            {/* ── Card 2: Work Details ── */}
            <GlassCard accent="#5483B3">
              <div className="pl-3">
                <SectionHeader icon={<Building2 className="h-4 w-4" />} title="Work Details" step={2} color="#5483B3" />
                <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrap label="Department">
                    <Select value={form.department_id || "__none__"}
                      onValueChange={v => sf("department_id", v === "__none__" ? "" : v)}>
                      <SelectTrigger className={selectTrigCls}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent align="start" className={selectContentCls}>
                        <SelectItem value="__none__" className={selectItemCls}>— No department —</SelectItem>
                        {departments.map((d: any) => (
                          <SelectItem key={d.id} value={String(d.id)} className={selectItemCls}>
                            {labelFor(d, ["department_name", "name"])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrap>

                  <FieldWrap label="Designation">
                    <Select value={form.designation_id || "__none__"}
                      onValueChange={v => sf("designation_id", v === "__none__" ? "" : v)}>
                      <SelectTrigger className={selectTrigCls}>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent align="start" className={selectContentCls}>
                        <SelectItem value="__none__" className={selectItemCls}>— No designation —</SelectItem>
                        {designations.map((d: any) => (
                          <SelectItem key={d.id} value={String(d.id)} className={selectItemCls}>
                            {labelFor(d, ["designation_name", "name"])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrap>

                  <FieldWrap label="Default Branch" hint="Home branch — full access set in Access Management">
                    <Select value={form.default_branch_id || "__none__"}
                      onValueChange={v => sf("default_branch_id", v === "__none__" ? "" : v)}>
                      <SelectTrigger className={selectTrigCls}>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent align="start" className={selectContentCls}>
                        <SelectItem value="__none__" className={selectItemCls}>— No branch —</SelectItem>
                        {branches.map((b: any) => (
                          <SelectItem key={b.id} value={String(b.id)} className={selectItemCls}>
                            {labelFor(b, ["branch_name", "name"])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrap>

                  <FieldWrap label="Status" required error={errors.status}>
                    <Select value={form.status} onValueChange={v => sf("status", v)}>
                      <SelectTrigger className={`${selectTrigCls} ${errors.status ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent align="start" className={selectContentCls}>
                        <SelectItem value="active" className={selectItemCls}>✅ Active</SelectItem>
                        <SelectItem value="inactive" className={selectItemCls}>⚪ Inactive</SelectItem>
                        <SelectItem value="suspended" className={selectItemCls}>⚠️ Suspended</SelectItem>
                        <SelectItem value="locked" className={selectItemCls}>🔒 Locked</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldWrap>
                </div>
              </div>
            </GlassCard>

            {/* ── Card 3: Login & Security ── */}
            <GlassCard accent="#7DA0CA">
              <div className="pl-3">
                <SectionHeader icon={<Shield className="h-4 w-4" />} title="Login & Security" step={3} color="#7DA0CA" />
                <div className="px-6 pb-6 space-y-5">

                  {/* Enable login row */}
                  <div className="flex items-center justify-between p-4 rounded-2xl
                    bg-gradient-to-r from-[#052659]/8 to-[#C1E8FF]/40
                    border border-[#7DA0CA]/40 backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-bold text-[#021024]">Enable Login Access</p>
                      <p className="text-xs text-[#5483B3] mt-0.5">Allow this user to sign in</p>
                    </div>
                    <button type="button" role="switch" aria-checked={form.login_enabled}
                      onClick={() => sf("login_enabled", !form.login_enabled)}
                      className={`relative inline-flex h-[26px] w-12 items-center rounded-full
                        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5483B3]/50
                        ${form.login_enabled
                          ? "bg-gradient-to-r from-[#052659] to-[#5483B3] shadow-md"
                          : "bg-[#C1E8FF] border border-[#7DA0CA]"}`}>
                      <span className={`h-[18px] w-[18px] transform rounded-full bg-white shadow-md
                        transition-transform duration-300 inline-block
                        ${form.login_enabled ? "translate-x-[26px]" : "translate-x-[4px]"}`} />
                    </button>
                  </div>

                  {/* Create: password fields */}
                  {!isEdit && form.login_enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl
                      bg-[#C1E8FF]/30 border border-[#7DA0CA]/40">
                      <FieldWrap label="Temporary Password" required error={errors.password}>
                        <div className="relative">
                          <Input type={showPwd ? "text" : "password"} value={form.password}
                            onChange={e => sf("password", e.target.value)}
                            placeholder="Min. 8 characters" className={`pr-10 ${inp(errors.password)}`} />
                          <button type="button" onClick={() => setShowPwd(!showPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7DA0CA] hover:text-[#052659] transition-colors">
                            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FieldWrap>
                      <FieldWrap label="Confirm Password" required error={errors.confirm_password}>
                        <div className="relative">
                          <Input type={showConfirm ? "text" : "password"} value={form.confirm_password}
                            onChange={e => sf("confirm_password", e.target.value)}
                            placeholder="Re-enter password" className={`pr-10 ${inp(errors.confirm_password)}`} />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7DA0CA] hover:text-[#052659] transition-colors">
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FieldWrap>
                    </div>
                  )}

                  {/* Edit: reset password */}
                  {isEdit && (
                    <div>
                      {!showResetForm ? (
                        <button type="button" onClick={() => setShowResetForm(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold
                            text-[#052659] border border-[#7DA0CA] rounded-xl bg-white/60
                            hover:bg-[#C1E8FF]/60 hover:shadow-sm transition-all">
                          <Lock className="h-3.5 w-3.5" /> Reset Password
                        </button>
                      ) : (
                        <div className="rounded-2xl border border-[#7DA0CA]/50 bg-[#C1E8FF]/30 p-4 space-y-4">
                          <div className="flex items-center gap-2">
                            <Unlock className="h-4 w-4 text-[#052659]" />
                            <p className="text-sm font-bold text-[#021024]">Set New Password</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FieldWrap label="New Password" required>
                              <div className="relative">
                                <Input type={showPwd ? "text" : "password"} value={resetPwd.new_password}
                                  onChange={e => setResetPwd(p => ({ ...p, new_password: e.target.value }))}
                                  placeholder="Min. 8 characters" className={`pr-10 ${inp()}`} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7DA0CA] hover:text-[#052659]">
                                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FieldWrap>
                            <FieldWrap label="Confirm Password" required>
                              <Input type="password" value={resetPwd.confirm_password}
                                onChange={e => setResetPwd(p => ({ ...p, confirm_password: e.target.value }))}
                                placeholder="Re-enter password" className={inp()} />
                            </FieldWrap>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button type="button" disabled={resetting} onClick={handleResetPwd}
                              className="px-5 py-2 text-sm font-bold text-white rounded-xl
                                bg-gradient-to-r from-[#052659] to-[#5483B3] shadow-sm
                                hover:shadow-md transition-all disabled:opacity-60">
                              {resetting ? "Resetting…" : "Confirm Reset"}
                            </button>
                            <button type="button"
                              onClick={() => { setShowResetForm(false); setResetPwd({ new_password: "", confirm_password: "" }); }}
                              className="px-4 py-2 text-sm font-medium text-[#5483B3] hover:text-[#052659] rounded-xl transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Security toggles */}
                  <div className="rounded-2xl border border-[#C1E8FF] bg-white/50 divide-y divide-[#C1E8FF] overflow-hidden">
                    <BrandToggle id="force_pwd" checked={form.force_password_change}
                      onChange={v => sf("force_password_change", v)}
                      label="Force Password Change on First Login"
                      description="User must change their password on first sign-in" />
                    <BrandToggle id="two_fa" checked={form.two_factor_enabled}
                      onChange={v => sf("two_factor_enabled", v)}
                      label="Enable Two-Factor Authentication"
                      description="Require a verification code on every sign-in" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* ═══ RIGHT: helper cards ═══ */}
          <div className="space-y-4">

            {/* How-to steps */}
            <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#7DA0CA]/40
              shadow-[0_4px_24px_rgba(5,38,89,0.08)] overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-[#C1E8FF]">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#C1E8FF] flex items-center justify-center">
                    <Info className="h-4 w-4 text-[#052659]" />
                  </div>
                  <p className="text-sm font-bold text-[#021024]">Getting Started</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { n: 1, c: "#052659", t: "Fill in name, email & contact" },
                  { n: 2, c: "#5483B3", t: "Set department, designation & branch" },
                  { n: 3, c: "#7DA0CA", t: "Enable login & set password" },
                  { n: 4, c: "#021024", t: "Save the user profile" },
                  { n: 5, c: "#052659", t: "Assign access in Access Management" },
                ].map(({ n, c, t }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5"
                      style={{ background: c }}>
                      {n}
                    </div>
                    <p className="text-xs text-[#5483B3] leading-relaxed pt-0.5">{t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Access management card */}
            <div className="rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(5,38,89,0.14)]">
              <div className="p-5" style={{
                background: "linear-gradient(135deg, #021024 0%, #052659 60%, #5483B3 120%)"
              }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Settings className="h-4 w-4 text-[#C1E8FF]" />
                  </div>
                  <p className="text-sm font-bold text-white">Access is managed separately</p>
                </div>
                <p className="text-xs text-[#7DA0CA] leading-relaxed">
                  After saving the user, assign branches, software modules, roles, and permissions from Access Management.
                </p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-5 py-3.5">
                <button type="button" onClick={() => navigate("/control-center/user-branch-access")}
                  className="w-full py-2.5 text-sm font-bold text-[#052659] rounded-xl
                    border-2 border-[#052659]/20 bg-[#C1E8FF]/50
                    hover:bg-[#C1E8FF] hover:border-[#052659]/40 transition-all duration-200">
                  Open Access Management →
                </button>
              </div>
            </div>

            {/* Status legend */}
            <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#7DA0CA]/40
              shadow-[0_4px_24px_rgba(5,38,89,0.08)] p-5">
              <p className="text-sm font-bold text-[#021024] mb-4">Status Guide</p>
              <div className="space-y-3">
                {[
                  { l: "Active",    c: "#22c55e", desc: "Can log in normally" },
                  { l: "Inactive",  c: "#7DA0CA", desc: "Account disabled" },
                  { l: "Suspended", c: "#f59e0b", desc: "Temporarily blocked" },
                  { l: "Locked",    c: "#ef4444", desc: "Locked by system" },
                ].map(({ l, c, desc }) => (
                  <div key={l} className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: c }} />
                    <span className="text-xs font-bold text-[#052659] w-16">{l}</span>
                    <span className="text-xs text-[#7DA0CA]">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4
          shadow-[0_18px_48px_rgba(15,23,42,0.10)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" disabled={saving}
              onClick={() => navigate("/control-center/users")}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
                text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900
                transition-all disabled:cursor-not-allowed disabled:opacity-60">
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {!isEdit && (
                <button type="button" disabled={saving} onClick={() => handleSave(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#7DA0CA]/70
                    bg-white px-5 py-2.5 text-sm font-bold text-[#052659] shadow-sm
                    hover:-translate-y-0.5 hover:border-[#5483B3] hover:bg-[#f7fbff]
                    hover:shadow-md transition-all disabled:translate-y-0 disabled:cursor-not-allowed
                    disabled:opacity-60">
                  <PlusCircle className="h-4 w-4" />
                  {saving ? "Saving…" : "Save & Add Another"}
                </button>
              )}
              <button type="button" disabled={saving} onClick={() => handleSave(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#052659]
                  px-7 py-2.5 text-sm font-black text-white shadow-lg shadow-[#052659]/25
                  hover:-translate-y-0.5 hover:bg-[#021024] hover:shadow-xl hover:shadow-[#052659]/30
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5483B3]/45
                  focus-visible:ring-offset-2 active:translate-y-0 transition-all duration-200
                  disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : isEdit ? "Update User" : "Save User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreatePage;
