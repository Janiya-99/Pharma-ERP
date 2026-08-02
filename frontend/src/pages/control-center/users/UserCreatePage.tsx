import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, User, Building2, Shield,
  Save, Key, Camera, Clock, Lock, Eye, EyeOff
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import {
  createUser, updateUser, getUserById,
  getDepartments, getDesignations, getBranches,
  assignUserBranches, createUserOrganizationAssignment, assignUserAccessMatrix, getUserOrganizationAssignments,
  getUserBranches, getUserAccessMatrix
} from "../../../api/controlApi";

import { RoleAssignment } from "./components/RoleAssignment";
import { EffectiveAccessPreview } from "./components/EffectiveAccessPreview";

interface FormData {
  first_name: string; last_name: string; display_name: string;
  employee_code: string; email: string; phone: string;
  status: string; login_enabled: boolean;
  password: string; confirm_password: string;
  force_password_change: boolean; two_factor_enabled: boolean;
  primary_branch_id: string; department_id: string; designation_id: string; additional_branches: string[];
  role_ids: string[];
  avatar_url?: string;
}

const BLANK: FormData = {
  first_name: "", last_name: "", display_name: "", employee_code: "",
  email: "", phone: "", status: "active",
  login_enabled: true, password: "", confirm_password: "",
  force_password_change: true, two_factor_enabled: false,
  primary_branch_id: "", department_id: "", designation_id: "", additional_branches: [],
  role_ids: [], avatar_url: ""
};

const FieldWrap: React.FC<{
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    {children}
    {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
  </div>
);

const inp = (err?: string) =>
  `h-10 border bg-white text-slate-900 placeholder:text-slate-400 rounded-lg shadow-sm
   transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-500/40
   focus-visible:border-brand-500 ${err ? "border-red-400" : "border-slate-200"}`;

const BrandToggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; }> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-all ${checked ? "bg-[#7C3AED]" : "bg-slate-200"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
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
  const [branches, setBranches] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) fetchUser();
  }, [id]);

  const fetchDropdowns = async () => {
    const [dR, bR, desR] = await Promise.all([
      getDepartments({ limit: 200 }).catch(() => ({ data: [] as any[] })),
      getBranches({ limit: 200 }).catch(() => ({ data: [] as any[] })),
      getDesignations({ limit: 200 }).catch(() => ({ data: [] as any[] }))
    ]);
    setDepartments(dR.data?.items || dR.data || dR || []);
    setBranches(bR.data?.items || bR.data || bR || []);
    setDesignations(desR.data?.items || desR.data || desR || []);
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getUserById(id!);
      const u = res.data || res;
      
      const [brRes, orgRes, accRes] = await Promise.all([
        getUserBranches(id!).catch(() => ({ data: [] as any[] })),
        getUserOrganizationAssignments(id!).catch(() => ({ data: [] as any[] })),
        getUserAccessMatrix(id!).catch(() => ({ data: {} }))
      ]);

      const bData = brRes.data || brRes || [];
      const primaryBranch = bData.find((b: any) => b.is_primary)?.branch_id || u.default_branch_id || "";
      const addBranches = bData.filter((b: any) => !b.is_primary).map((b: any) => String(b.branch_id));

      const orgData = orgRes.data || orgRes || [];
      const primaryOrg = orgData.find((o: any) => o.is_primary) || orgData[0] || {};
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
        department_id: String(primaryOrg.department_id || u.department_id || ""),
        designation_id: String(u.designation_id || ""),
        additional_branches: addBranches,
        role_ids: roleData.map((r: any) => String(r.id)),
        avatar_url: u.avatar_url || ""
      });
    } finally { 
      setLoading(false); 
    }
  };

  const sf = (k: keyof FormData, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      sf("avatar_url", ev.target?.result as string);
    };
    reader.readAsDataURL(file);
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
        department_id: form.department_id ? +form.department_id : 0,
        designation_id: form.designation_id ? +form.designation_id : 0,
        user_type: "company_user",
        avatar_url: form.avatar_url,
        ...(!isEdit && { password: form.password, confirm_password: form.password }) // sync passwords based on UI
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

      // Save single primary department assignment if selected
      if (form.department_id) {
         await createUserOrganizationAssignment(savedId, {
            branch_id: +form.primary_branch_id,
            department_id: +form.department_id,
            is_primary: true,
            status: "active"
         });
      }

      toast.success(isEdit ? "User updated successfully!" : "User created successfully!");
      navigate("/control-center/users");
    } catch (e: any) { 
      const msg = (e?.response?.data?.message || e?.message || "").toLowerCase();
      if (msg.includes("email already exists") || msg.includes("email")) {
        setErrors((prev) => ({ ...prev, email: e?.response?.data?.message || "Email address is already registered" }));
        toast.error("Please fix highlighted fields");
      } else if (msg.includes("employee code already exists") || msg.includes("employee code") || msg.includes("employee id")) {
        setErrors((prev) => ({ ...prev, employee_code: e?.response?.data?.message || "Employee code already exists" }));
        toast.error("Please fix highlighted fields");
      } else if (e?.response?.status === 422 && e?.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        for (const [key, val] of Object.entries(e.response.data.errors)) {
          validationErrors[key] = Array.isArray(val) ? val[0] : String(val);
        }
        setErrors(validationErrors);
        toast.error("Please fix highlighted fields");
      } else {
        toast.error(e?.response?.data?.message || "Failed to save user"); 
      }
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return <div><Skeleton className="h-[500px] w-full rounded-2xl" /></div>;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 py-2 pb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/control-center/users")} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? "Edit User Profile" : "Create New User"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/control-center/users")} className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm bg-white hidden sm:block">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-lg bg-[#002137] text-white font-medium text-sm shadow-sm hover:bg-[#001726] disabled:opacity-50 flex items-center gap-2 transition-colors hidden sm:flex">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Section 1: Personal Information */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600 border border-slate-200">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                <p className="text-sm text-slate-500">Enter the core identity details for the new user account.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Uploader */}
              <div className="flex flex-col items-center shrink-0 w-36">
                <div className="h-32 w-32 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 relative overflow-hidden group cursor-pointer hover:bg-slate-50 transition-colors mb-3">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-slate-400 group-hover:text-slate-500 transition-colors" />
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} title="Upload Profile Picture" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Profile Photo</h4>
                <p className="text-[10px] text-slate-400 text-center mt-1 uppercase tracking-wider font-semibold">Max 2MB. JPG, PNG or WEBP recommended.</p>
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                <FieldWrap label="First Name" required error={errors.first_name}>
                  <Input value={form.first_name} onChange={e => sf("first_name", e.target.value)} className={inp(errors.first_name)} placeholder="e.g. Jonathan" />
                </FieldWrap>
                <FieldWrap label="Last Name" required error={errors.last_name}>
                  <Input value={form.last_name} onChange={e => sf("last_name", e.target.value)} className={inp(errors.last_name)} placeholder="e.g. Wick" />
                </FieldWrap>
                <FieldWrap label="Display Name">
                  <Input value={form.display_name} onChange={e => sf("display_name", e.target.value)} className={inp()} placeholder="e.g. John Wick" />
                </FieldWrap>
                <FieldWrap label="Email Address" required error={errors.email}>
                  <Input type="email" value={form.email} onChange={e => sf("email", e.target.value)} className={inp(errors.email)} placeholder="j.wick@continental.com" />
                </FieldWrap>
                <FieldWrap label="Phone Number">
                  <Input value={form.phone} onChange={e => sf("phone", e.target.value)} className={inp()} placeholder="+1 (555) 000-0000" />
                </FieldWrap>
                <FieldWrap label="Employee ID / Code" error={errors.employee_code}>
                  <Input value={form.employee_code} onChange={e => sf("employee_code", e.target.value)} className={inp(errors.employee_code)} placeholder="EMP-2024-001" />
                </FieldWrap>
              </div>
            </div>
          </section>

          {/* Section 2: Organization & Role */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600 border border-slate-200">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Organization & Role</h2>
                <p className="text-sm text-slate-500">Assign the user to their primary work location, functional department, and job title.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <FieldWrap label="Primary Branch" required error={errors.primary_branch_id}>
                <Select value={form.primary_branch_id} onValueChange={v => sf("primary_branch_id", v)}>
                  <SelectTrigger className="h-10 border-slate-200 bg-white shadow-sm rounded-lg"><SelectValue placeholder="Select Branch Location..." /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.branch_name || b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldWrap>
              <FieldWrap label="Department / Group">
                <Select value={form.department_id} onValueChange={v => sf("department_id", v)}>
                  <SelectTrigger className="h-10 border-slate-200 bg-white shadow-sm rounded-lg"><SelectValue placeholder="Select Department..." /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.department_name || d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldWrap>
              <FieldWrap label="Designation / Title">
                <Select value={form.designation_id} onValueChange={v => sf("designation_id", v)}>
                  <SelectTrigger className="h-10 border-slate-200 bg-white shadow-sm rounded-lg"><SelectValue placeholder="Select Designation..." /></SelectTrigger>
                  <SelectContent>
                    {designations.map(des => <SelectItem key={des.id} value={String(des.id)}>{des.designation_name || des.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldWrap>
            </div>

            <div className="mt-2">
               <RoleAssignment
                 selectedRoleIds={form.role_ids}
                 onChange={v => sf("role_ids", v)}
                 designationId={form.designation_id || undefined}
                 branchName={branches.find(b => String(b.id) === form.primary_branch_id)?.branch_name || branches.find(b => String(b.id) === form.primary_branch_id)?.name || "Main Branch"}
               />
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Account Status Box */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900">Account Status</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                {form.status === 'active' ? 'Active' : 'Pending Activation'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" /> Auto-Activate Date
              </div>
              <span className="text-xs text-slate-400 font-medium">Immediate</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Lock className="h-4 w-4" /> Login Access
              </div>
              <button type="button" role="switch" aria-checked={form.login_enabled} onClick={() => sf("login_enabled", !form.login_enabled)}
                className={`relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-all ${form.login_enabled ? "bg-[#7C3AED]" : "bg-slate-200"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.login_enabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Login & Security Box */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Login & Security</h3>
            </div>
            
            {!isEdit && form.login_enabled && (
              <div className="mb-6">
                <FieldWrap label="Temporary Password" required error={errors.password}>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input type={showPwd ? "text" : "password"} value={form.password} onChange={e => sf("password", e.target.value)} className="pl-9 pr-10 bg-white border-slate-200 rounded-lg shadow-sm" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FieldWrap>
              </div>
            )}

            <BrandToggle checked={form.force_password_change} onChange={v => sf("force_password_change", v)} label="Force Password Change" description="Requires user to reset upon first login" />
            <BrandToggle checked={form.two_factor_enabled} onChange={v => sf("two_factor_enabled", v)} label="Enable MFA/2FA" description="Secondary authentication challenge" />
          </div>

          {/* Access Preview Box */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <EffectiveAccessPreview
              userId={isEdit ? id : undefined}
              roleIds={form.role_ids}
              branchName={branches.find(b => String(b.id) === form.primary_branch_id)?.branch_name || branches.find(b => String(b.id) === form.primary_branch_id)?.name || "Main Branch"}
            />
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default UserCreatePage;
