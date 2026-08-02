import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCompanyProfile,
  updateCompanyProfile,
} from "../../../api/controlApi";
import { useAuth } from "../../../auth/AuthContext";
import Button from "../../../components/common/Button";
import FormError from "../../../components/common/FormError";
import { toast } from "sonner";
import {
  Save,
  Upload as UploadIcon,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Image as ImageIcon,
  Building2,
  X,
} from "lucide-react";

// Interface for strictly typed company profile response data
interface CompanyProfile {
  id?: number;
  company_name: string;
  company_code: string;
  registration_number: string;
  tax_number: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  logo_url: string;
  status: string;
  updated_at?: string;
}

const SkeletonField = () => (
  <div className="space-y-2">
    <div className="bg-slate-100 h-4 w-24 animate-pulse rounded-md"></div>
    <div className="bg-slate-50 border-slate-100 h-10 w-full animate-pulse rounded-xl border"></div>
  </div>
);

const CompanyProfilePage = () => {
  const { hasPermission, user, refreshContext } = useAuth();
  const canUpdate = hasPermission("control.company.update");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [formData, setFormData] = useState<CompanyProfile>({
    company_name: "",
    company_code: "",
    registration_number: "",
    tax_number: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    logo_url: "",
    status: "",
  });

  const [originalData, setOriginalData] = useState<CompanyProfile>({
    ...formData,
  });
  const [lastSaved, setLastSaved] = useState<string>("Never");

  const {
    data: profile,
    isLoading,
    error: queryError,
  } = useQuery<CompanyProfile>({
    queryKey: ["companyProfile"],
    queryFn: async () => {
      const res = await getCompanyProfile();
      const data = res.data || res;
      if (res.success === false || !data || !data.company_code) {
        throw new Error(res.message || "Failed to load company profile data");
      }
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      const mapped = {
        company_name: profile.company_name || "",
        company_code: profile.company_code || "",
        registration_number: profile.registration_number || "",
        tax_number: profile.tax_number || "",
        phone: profile.phone || "",
        email: profile.email || "",
        website: profile.website || "",
        address: profile.address || "",
        logo_url: profile.logo_url || "",
        status: profile.status || "",
      };
      setFormData(mapped);
      setOriginalData(mapped);
      if (profile.updated_at) {
        const date = new Date(profile.updated_at);
        setLastSaved(
          date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      }
    }
  }, [profile]);

  useEffect(() => {
    if (queryError) {
      setError(
        queryError instanceof Error
          ? queryError.message
          : "Failed to load company profile"
      );
    }
  }, [queryError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        logo_url: reader.result as string,
      }));
      toast.success("Logo loaded. Save changes to persist.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      logo_url: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Logo removed. Save changes to persist.");
  };

  const handleDiscard = () => {
    setFormData({ ...originalData });
    setError(null);
    toast.info("Changes discarded");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        company_name: formData.company_name,
        registration_number: formData.registration_number,
        tax_number: formData.tax_number,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        address: formData.address,
        logo_url: formData.logo_url,
      };

      const res = await updateCompanyProfile(payload);
      if (res.success) {
        setFormData(res.data);
        setOriginalData(res.data);
        const now = new Date();
        setLastSaved(
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
        toast.success("Company profile updated successfully!");
        await refreshContext();
      } else {
        setError(res.message);
        toast.error("Failed to update profile: " + res.message);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to update profile";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // Compare if any field has changed
  const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);

  return (
    <div className="page-content space-y-8 pb-32 font-sans">
      <div>
        <h1 className="text-slate-950 text-3xl font-bold tracking-tight">
          Company Profile
        </h1>
        <p className="text-slate-600 mt-1 max-w-3xl">
          Update your organization's legal information, contact details, and
          branding. These details will be reflected across your workspace and in
          all outgoing communications.
        </p>
      </div>

      <FormError message={error} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="animate-pulse space-y-8 lg:col-span-1">
            <div className="border-slate-200/80 flex flex-col items-center rounded-2xl border bg-white p-6 shadow-sm">
              <div className="bg-slate-100 mb-4 h-5 w-full rounded"></div>
              <div className="bg-slate-100 mb-4 h-48 w-48 rounded-xl"></div>
              <div className="bg-slate-50 border-slate-100 h-10 w-full rounded-xl border"></div>
            </div>
            <div className="border-slate-200/80 space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
              <div className="bg-slate-100 h-5 w-32 rounded"></div>
              <div className="bg-slate-100 h-10 w-full rounded-lg"></div>
              <div className="bg-slate-100 h-12 w-full rounded-lg"></div>
            </div>
          </div>
          <div className="border-slate-200/80 space-y-6 rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
            <div className="bg-slate-100 mb-4 h-5 w-48 rounded"></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <div className="space-y-2 md:col-span-2">
                <div className="bg-slate-100 h-4 w-24 rounded-md"></div>
                <div className="bg-slate-50 border-slate-100 h-24 w-full rounded-xl border"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {/* Left Column - Branding & Identifiers */}
          <div className="space-y-8 lg:col-span-1">
            {/* Branding Card */}
            <div className="border-slate-200/80 flex flex-col items-center rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur-md">
              <div className="border-slate-100 mb-4 flex w-full items-center gap-2 border-b pb-2">
                <ImageIcon className="text-slate-500 h-5 w-5" />
                <h2 className="text-slate-950 text-base font-bold">
                  Company Branding
                </h2>
              </div>

              {/* Logo Preview */}
              <div
                onClick={() => {
                  if (formData.logo_url) {
                    setShowPreviewModal(true);
                  } else if (canUpdate) {
                    fileInputRef.current?.click();
                  }
                }}
                className="border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 group relative mb-4 flex h-48 w-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition-all duration-200 hover:border-indigo-500/50"
              >
                {formData.logo_url ? (
                  <>
                    <img
                      src={formData.logo_url}
                      alt="Company Logo"
                      className="max-h-full max-w-full object-contain p-2 transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="bg-slate-950/40 absolute inset-0 flex items-center justify-center gap-1.5 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <ImageIcon className="h-4 w-4" />
                      <span>Click to view</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-slate-500 flex flex-col items-center transition-colors duration-200 group-hover:text-indigo-600">
                      <Building2 className="h-12 w-12 stroke-[1.5]" />
                      <span className="mt-2 text-xs font-semibold">
                        No Logo Uploaded
                      </span>
                    </div>
                    {canUpdate && (
                      <div className="bg-slate-950/5 text-slate-600 absolute inset-0 flex items-center justify-center gap-1.5 text-xs font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <UploadIcon className="h-4 w-4" />
                        <span>Click to upload</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <p className="text-slate-500 mb-6 text-center text-xs leading-relaxed">
                Recommended size: 512x512px. Supported formats: PNG, JPG, SVG.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                disabled={!canUpdate}
              />

              <div className="flex w-full gap-4">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canUpdate}
                  variant="outline"
                  size="sm"
                  className="text-slate-950 flex-1 font-semibold shadow-sm transition-all"
                >
                  Change Image
                </Button>
                {formData.logo_url && (
                  <Button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={!canUpdate}
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 flex-1 font-semibold transition-all"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Identifiers Card */}
            <div className="border-slate-200/80 space-y-5 rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur-md">
              <div className="border-slate-100 flex items-center gap-2 border-b pb-2">
                <span className="text-slate-950 text-base font-bold">#</span>
                <h2 className="text-slate-950 text-base font-bold">
                  System Identifiers
                </h2>
              </div>
              <p className="text-slate-600 -mt-2 text-xs leading-relaxed">
                Internal administrative metadata used for technical integration.
              </p>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-slate-950 text-xs font-bold">
                    Company Code
                  </label>
                  <span className="text-slate-600 bg-slate-100 border-slate-200/50 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    Read Only
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.company_code}
                  disabled
                  className="border-slate-200 bg-slate-50/80 text-slate-600 h-10 w-full cursor-not-allowed rounded-lg border px-3 font-mono text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="text-slate-950 mb-1.5 block text-xs font-bold">
                  Account Status
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-indigo-100/60 bg-indigo-50/30 p-3 text-sm font-semibold text-indigo-900">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-600" />
                  <span>Premium Enterprise Plan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - General Info */}
          <div className="border-slate-200/80 space-y-6 rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur-md lg:col-span-2">
            <div className="border-slate-100 flex items-center gap-2 border-b pb-2">
              <Building2 className="text-slate-500 h-5 w-5" />
              <h2 className="text-slate-950 text-base font-bold">
                General Information
              </h2>
            </div>
            <p className="text-slate-600 -mt-4 text-xs leading-relaxed">
              Public-facing details used for billing, support, and legal
              registrations.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Company Legal Name */}
              <div className="md:col-span-1">
                <label className="text-slate-700 mb-1.5 block text-xs font-semibold">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  disabled={!canUpdate}
                  required
                  placeholder="e.g. Acme Corp Ltd"
                  className="border-slate-200 text-slate-700 placeholder-slate-400 disabled:bg-slate-50 h-10 w-full rounded-lg border bg-white px-3 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Official Email Address */}
              <div className="md:col-span-1">
                <label className="text-slate-700 mb-1.5 block text-xs font-semibold">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="text-slate-400/80 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[1.5]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    required
                    placeholder="e.g. hq@company.com"
                    className="border-slate-200 text-slate-700 placeholder-slate-400 disabled:bg-slate-50 h-10 w-full rounded-lg border bg-white pl-10 pr-3 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Primary Phone Number */}
              <div className="md:col-span-1">
                <label className="text-slate-700 mb-1.5 block text-xs font-semibold">
                  Primary Phone Number
                </label>
                <div className="relative">
                  <Phone className="text-slate-400/80 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[1.5]" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="border-slate-200 text-slate-700 placeholder-slate-400 disabled:bg-slate-50 h-10 w-full rounded-lg border bg-white pl-10 pr-3 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Business Registration Number */}
              <div className="md:col-span-1">
                <label className="text-slate-700 mb-1.5 block text-xs font-semibold">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  disabled={!canUpdate}
                  placeholder="e.g. REG-12345678"
                  className="border-slate-200 text-slate-700 placeholder-slate-400 disabled:bg-slate-50 h-10 w-full rounded-lg border bg-white px-3 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Tax Identification Number */}
              <div className="md:col-span-1">
                <label className="text-slate-700 mb-1.5 block text-xs font-semibold">
                  Tax Identification Number
                </label>
                <input
                  type="text"
                  name="tax_number"
                  value={formData.tax_number}
                  onChange={handleChange}
                  disabled={!canUpdate}
                  placeholder="e.g. TAX-98765432"
                  className="border-slate-200 text-slate-700 placeholder-slate-400 disabled:bg-slate-50 h-10 w-full rounded-lg border bg-white px-3 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Corporate Website URL */}
              <div className="md:col-span-1">
                <label className="text-slate-700 mb-1.5 block text-xs font-semibold">
                  Corporate Website URL
                </label>
                <div className="relative">
                  <Globe className="text-slate-400/80 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[1.5]" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    placeholder="e.g. https://company.com"
                    className="border-slate-200 text-slate-700 placeholder-slate-400 disabled:bg-slate-50 h-10 w-full rounded-lg border bg-white pl-10 pr-3 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Physical Headquarters Address */}
              <div className="md:col-span-2">
                <label className="text-slate-700 mb-1.5 block text-xs font-semibold">
                  Physical Headquarters Address
                </label>
                <textarea
                  name="address"
                  rows={4}
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!canUpdate}
                  placeholder="Street address, City, State, ZIP, Country"
                  className="border-slate-200 text-slate-700 placeholder-slate-400 disabled:bg-slate-50 w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Sticky Action Footer */}
          {isDirty && (
            <div className="border-slate-200/80 sticky bottom-4 z-40 col-span-full mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white px-8 py-4 shadow-lg duration-300 animate-in slide-in-from-bottom sm:flex-row">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="text-slate-800 text-sm font-bold">
                  Unsaved Changes
                </span>
                <span className="text-slate-400 mt-0.5 text-xs">
                  Last saved {lastSaved} {user?.name ? `by ${user.name}` : ""}
                </span>
              </div>
              <div className="flex w-full items-center gap-4 sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleDiscard}
                  className="text-slate-700 h-10 flex-1 px-5 font-semibold shadow-sm transition-all sm:flex-initial"
                >
                  Discard Changes
                </Button>
                <Button
                  type="submit"
                  isLoading={saving}
                  size="md"
                  className="bg-slate-900 hover:bg-slate-800 flex h-10 flex-1 items-center justify-center gap-2 px-5 font-semibold text-white shadow-sm transition-all sm:flex-initial"
                >
                  {!saving && <Save className="h-4 w-4 stroke-[1.75]" />}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </form>
      )}
      {/* Logo Fullscreen Preview Modal */}
      {showPreviewModal && formData.logo_url && (
        <div className="bg-slate-950/60 fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm duration-200 animate-in fade-in">
          <div className="relative flex w-full max-w-2xl flex-col items-center rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 absolute right-4 top-4 rounded-xl p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-slate-950 mb-4 self-start text-base font-bold">
              Company Logo Preview
            </h3>

            <div className="bg-slate-50 border-slate-100 flex h-[50vh] w-full items-center justify-center overflow-hidden rounded-xl border p-6">
              <img
                src={formData.logo_url}
                alt="Full Company Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="mt-6 flex w-full justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg border bg-white px-4 py-2 text-sm font-semibold shadow-sm transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfilePage;
