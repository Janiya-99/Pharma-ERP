import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, User, Building2, Shield, ChevronRight,
  Eye, EyeOff, Save, Lock, Unlock, Network, Key
} from "lucide-react";

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
  assignUserBranches, createUserOrganizationAssignment, assignUserAccessMatrix, getUserOrganizationAssignments,
  getUserBranches, getUserAccessMatrix
} from "../../../api/controlApi";

import { OrganizationAssignments, OrgAssignment } from "./components/OrganizationAssignments";
import { RoleAssignment } from "./components/RoleAssignment";
import { EffectiveAccessPreview } from "./components/EffectiveAccessPreview";
import MultiSelect from "@/components/common/MultiSelect";

interface FormData {
  first_name: string; last_name: string; display_name: string;
  employee_code: string; email: string; phone: string;
  status: string; login_enabled: boolean;
  password: string; confirm_password: string;
  force_password_change: boolean; two_factor_enabled: boolean;
  primary_branch_id: string; additional_branches: string[];
  assignments: OrgAssignment[];
  role_ids: string[];
}

const BLANK: FormData = {
  first_name: "", last_name: "", display_name: "", employee_code: "",
  email: "", phone: "", status: "active",
  login_enabled: true, password: "", confirm_password: "",
  force_password_change: true, two_factor_enabled: false,
  primary_branch_id: "", additional_branches: [],
  assignments: [], role_ids: []
};

const FieldWrap: React.FC<{
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}> = ({ label, required, error, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label className="text-[11px] font-bold text-[#052659] uppercase tracking-widest">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    {children}
    {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    {hint && !error && <span className="text-[11px] text-[#7DA0CA] leading-relaxed">{hint}</span>}
  </div>
);

const inp = (err?: string) =>
  `h-10 border bg-white/70 text-[#021024] placeholder:text-[#7DA0CA]/70 rounded-xl
   transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#5483B3]/40
   focus-visible:border-[#052659] ${err ? "border-red-400" : "border-[#7DA0CA]"}`;

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; step: number; color: string; }> = ({ icon, title, step, color }) => (
  <div className="flex items-center gap-3 -mx-6 px-6 py-4 mb-5 border-b border-[#C1E8FF]/60" style={{ background: `linear-gradient(135deg, ${color}12 0%, transparent 60%)` }}>
    <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-xs font-black shadow-lg" style={{ background: `linear-gradient(135deg, ${color} 0%, #021024 120%)` }}>
      {step}
    </div>
    <div className="flex items-center gap-2 flex-1">
      <span style={{ color }}>{icon}</span>
      <h3 className="text-sm font-bold text-[#021024] tracking-tight">{title}</h3>
    </div>
  </div>
);

const GlassCard: React.FC<{ children: React.ReactNode; accent?: string; }> = ({ children, accent = "#052659" }) => (
  <div className="relative rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-[#7DA0CA]/40 shadow-sm mb-6">
    <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl" style={{ background: `linear-gradient(180deg, ${accent} 0%, #7DA0CA 100%)` }} />
    <div className="pl-3">{children}</div>
  </div>
);

const BrandToggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; }> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 py-3.5 px-4">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-[#021024] leading-snug">{label}</p>
      {description && <p className="text-xs text-[#7DA0CA] mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative flex-shrink-0 inline-flex h-[26px] w-12 items-center rounded-full transition-all ${checked ? "bg-gradient-to-r from-[#052659] to-[#5483B3]" : "bg-[#C1E8FF]"}`}>
      <span className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform ${checked ? "translate-x-[26px]" : "translate-x-[4px]"}`} />
    </button>
  </div>
);

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
  const [saving, setSaving] = useState(false);
  
  const [showPwd, setShowPwd] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetPwd, setResetPwd] = useState({ new_password: "", confirm_password: "" });

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) fetchUser();
  }, [id]);

  const fetchDropdowns = async () => {
    const [dR, dsR, bR] = await Promise.all([
      getDepartments({ limit: 200 }).catch(() => ({ data: [] })),
      getDesignations({ limit: 200 }).catch(() => ({ data: [] })),
      getBranches({ limit: 200 }).catch(() => ({ data: [] }))
    ]);
    setDepartments(dR.data?.items || dR.data || dR || []);
    setDesignations(dsR.data?.items || dsR.data || dsR || []);
    setBranches(bR.data?.items || bR.data || bR || []);
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getUserById(id!);
      const u = res.data || res;
      
      const [brRes, orgRes, accRes] = await Promise.all([
        getUserBranches(id!).catch(() => ({ data: [] })),
        getUserOrganizationAssignments(id!).catch(() => ({ data: [] })),
        getUserAccessMatrix(id!).catch(() => ({ data: {} }))
      ]);

      const bData = brRes.data || brRes || [];
      const primaryBranch = bData.find((b: any) => b.is_primary)?.branch_id || u.default_branch_id || "";
      const addBranches = bData.filter((b: any) => !b.is_primary).map((b: any) => String(b.branch_id));

      const orgData = orgRes.data || orgRes || [];
      
      const roleData = accRes.data?.roles || [];

      const parts = (u.name || "").split(" ");
      setForm({
        ...BLANK,
        first_name: parts[0] || "", last_name: parts.slice(1).join(" ") || "",
        display_name: u.display_name || u.name || "",
        email: u.email || "", phone: u.phone || "", employee_code: u.employee_code || "",
        status: u.status || "active",
        login_enabled: u.login_enabled !== false,
        two_factor_enabled: u.two_factor_enabled || false,
        force_password_change: u.force_password_change || false,
        primary_branch_id: String(primaryBranch),
        additional_branches: addBranches,
        assignments: orgData,
        role_ids: roleData.map((r: any) => String(r.id))
      });
    } finally { 
      setLoading(false); 
    }
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
    if (!form.primary_branch_id) e.primary_branch_id = "Required";
    
    if (!isEdit && form.login_enabled) {
      if (!form.password) e.password = "Required";
      else if (form.password.length < 8) e.password = "Min 8 chars";
      if (form.password !== form.confirm_password) e.confirm_password = "Mismatch";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) toast.error("Please fix highlighted fields");
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const full = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();
      const payload = {
        name: full, display_name: form.display_name.trim() || full,
        employee_code: form.employee_code.trim(), email: form.email.trim(), phone: form.phone.trim(),
        status: form.status, login_enabled: form.login_enabled, 
        force_password_change: form.force_password_change, two_factor_enabled: form.two_factor_enabled,
        default_branch_id: +form.primary_branch_id,
        ...(!isEdit && { password: form.password, confirm_password: form.confirm_password })
      };

      const res = isEdit ? await updateUser(id!, payload) : await createUser(payload);
      const savedId = res.data?.id || res.id || id;

      if (!savedId) throw new Error("Failed to get saved user ID");

      // Save branch access
      await assignUserBranches(savedId, {
        branch_ids: [...form.additional_branches, form.primary_branch_id].map(Number),
        primary_branch_id: +form.primary_branch_id
      });

      // Save roles
      await assignUserAccessMatrix(savedId, {
        role_ids: form.role_ids.map(Number)
      });

      // Save Org assignments
      for (const a of form.assignments) {
        if (!a.branch_id || !a.department_id || !a.designation_id) continue;
        await createUserOrganizationAssignment(savedId, {
          branch_id: +a.branch_id,
          department_id: +a.department_id,
          designation_id: +a.designation_id,
          is_primary: a.is_primary,
          effective_from: a.effective_from,
          effective_to: a.effective_to,
          status: a.status
        });
      }

      toast.success(isEdit ? "User updated successfully!" : "User created successfully!");
      navigate("/control-center/users");
    } catch (e: any) { 
      toast.error(e?.response?.data?.message || "Failed to save user"); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return <div className="p-6"><Skeleton className="h-[500px] w-full rounded-2xl" /></div>;

  return (
    <div className="relative isolate min-h-screen bg-white">
      <div className="page-content pb-20 space-y-4">
        
        <nav className="flex items-center gap-1.5 text-xs text-[#5483B3]">
          <Link to="/control-center/users" className="hover:text-[#052659]">Users</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#052659] font-semibold">{isEdit ? "Edit User" : "Create User"}</span>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/control-center/users")} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-black text-[#021024]">{isEdit ? "Edit User Profile" : "Create New User"}</h1>
        </div>

        <GlassCard accent="#052659">
          <SectionHeader icon={<User className="h-4 w-4" />} title="1. Personal Information" step={1} color="#052659" />
          <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldWrap label="First Name" required error={errors.first_name}>
              <Input value={form.first_name} onChange={e => sf("first_name", e.target.value)} className={inp(errors.first_name)} />
            </FieldWrap>
            <FieldWrap label="Last Name" required error={errors.last_name}>
              <Input value={form.last_name} onChange={e => sf("last_name", e.target.value)} className={inp(errors.last_name)} />
            </FieldWrap>
            <FieldWrap label="Display Name">
              <Input value={form.display_name} onChange={e => sf("display_name", e.target.value)} className={inp()} />
            </FieldWrap>
            <FieldWrap label="Email Address" required error={errors.email}>
              <Input type="email" value={form.email} onChange={e => sf("email", e.target.value)} className={inp(errors.email)} />
            </FieldWrap>
            <FieldWrap label="Phone Number">
              <Input value={form.phone} onChange={e => sf("phone", e.target.value)} className={inp()} />
            </FieldWrap>
            <FieldWrap label="Employee Code">
              <Input value={form.employee_code} onChange={e => sf("employee_code", e.target.value)} className={inp()} />
            </FieldWrap>
            <FieldWrap label="Status">
              <Select value={form.status} onValueChange={v => sf("status", v)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </FieldWrap>
          </div>
        </GlassCard>

        <GlassCard accent="#5483B3">
          <SectionHeader icon={<Shield className="h-4 w-4" />} title="2. Login & Security" step={2} color="#5483B3" />
          <div className="px-6 pb-6 space-y-4">
            <BrandToggle checked={form.login_enabled} onChange={v => sf("login_enabled", v)} label="Enable Login Access" />
            
            {!isEdit && form.login_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrap label="Password" required error={errors.password}>
                  <Input type={showPwd ? "text" : "password"} value={form.password} onChange={e => sf("password", e.target.value)} className={inp()} />
                </FieldWrap>
                <FieldWrap label="Confirm Password" required error={errors.confirm_password}>
                  <Input type={showPwd ? "text" : "password"} value={form.confirm_password} onChange={e => sf("confirm_password", e.target.value)} className={inp()} />
                </FieldWrap>
              </div>
            )}
            
            <BrandToggle checked={form.force_password_change} onChange={v => sf("force_password_change", v)} label="Force Password Change" />
            <BrandToggle checked={form.two_factor_enabled} onChange={v => sf("two_factor_enabled", v)} label="Enable 2FA" />
          </div>
        </GlassCard>

        <GlassCard accent="#7DA0CA">
          <SectionHeader icon={<Building2 className="h-4 w-4" />} title="3. Branch Access" step={3} color="#7DA0CA" />
          <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldWrap label="Primary Branch" required error={errors.primary_branch_id}>
              <Select value={form.primary_branch_id} onValueChange={v => sf("primary_branch_id", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select primary branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.branch_name || b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldWrap>
            <FieldWrap label="Additional Branches">
              <MultiSelect 
                options={branches.filter(b => String(b.id) !== form.primary_branch_id)}
                selectedValues={branches.filter(b => form.additional_branches.includes(String(b.id)))}
                onChange={vals => sf("additional_branches", vals.map(v => String(v.id)))}
                placeholder="Select additional branches"
                displayKey="branch_name"
              />
            </FieldWrap>
          </div>
        </GlassCard>

        <GlassCard accent="#021024">
          <SectionHeader icon={<Network className="h-4 w-4" />} title="4. Organization Assignments" step={4} color="#021024" />
          <div className="px-6 pb-6">
            <OrganizationAssignments 
              assignments={form.assignments} 
              onChange={v => sf("assignments", v)}
              branches={branches}
              departments={departments}
              designations={designations}
            />
          </div>
        </GlassCard>

        <GlassCard accent="#052659">
          <SectionHeader icon={<Key className="h-4 w-4" />} title="5. Role Assignment" step={5} color="#052659" />
          <div className="px-6 pb-6">
            <RoleAssignment 
              selectedRoleIds={form.role_ids} 
              onChange={v => sf("role_ids", v)} 
            />
          </div>
        </GlassCard>

        <GlassCard accent="#5483B3">
          <SectionHeader icon={<Shield className="h-4 w-4" />} title="6. Effective Access Preview" step={6} color="#5483B3" />
          <div className="px-6 pb-6">
            {isEdit ? (
              <EffectiveAccessPreview userId={id} />
            ) : (
              <div className="text-center p-6 bg-gray-50 border rounded-xl text-sm text-gray-500">
                Effective access preview is available after the user is created and roles are assigned.
              </div>
            )}
          </div>
        </GlassCard>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto flex justify-end gap-3">
            <button onClick={() => navigate("/control-center/users")} className="px-6 py-2.5 rounded-xl border text-gray-600 hover:bg-gray-50 font-semibold text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-8 py-2.5 rounded-xl bg-[#052659] text-white font-bold text-sm shadow-md hover:bg-[#021024] disabled:opacity-50 flex items-center gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save User"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserCreatePage;
