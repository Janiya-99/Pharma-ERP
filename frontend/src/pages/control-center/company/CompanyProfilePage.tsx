import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompanyProfile, updateCompanyProfile } from "../../../api/controlApi";
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
  X
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
    <div className="h-4 w-24 bg-slate-100 rounded-md animate-pulse"></div>
    <div className="h-10 w-full bg-slate-50 border border-slate-100 rounded-xl animate-pulse"></div>
  </div>
);

const CompanyProfilePage = () => {
  const { hasPermission, user } = useAuth();
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

  const [originalData, setOriginalData] = useState<CompanyProfile>({ ...formData });
  const [lastSaved, setLastSaved] = useState<string>("Never");

  const { data: profile, isLoading, error: queryError } = useQuery<CompanyProfile>({
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
        setLastSaved(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }
  }, [profile]);

  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : "Failed to load company profile");
    }
  }, [queryError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Image size must be less than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        logo_url: reader.result as string
      }));
      toast.success("Logo loaded. Save changes to persist.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      logo_url: ""
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
        setLastSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        toast.success("Company profile updated successfully!");
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
    <div className="page-content space-y-8 font-sans pb-32">
      <div>
        <h1 className="text-3xl font-bold text-slate-950 tracking-tight">Company Profile</h1>
        <p className="text-slate-600 mt-1 max-w-3xl">
          Update your organization's legal information, contact details, and branding. These details will be reflected across your workspace and in all outgoing communications.
        </p>
      </div>

      <FormError message={error} />

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8 animate-pulse">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center">
              <div className="w-full h-5 bg-slate-100 rounded mb-4"></div>
              <div className="w-48 h-48 rounded-xl bg-slate-100 mb-4"></div>
              <div className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="w-32 h-5 bg-slate-100 rounded"></div>
              <div className="w-full h-10 bg-slate-100 rounded-lg"></div>
              <div className="w-full h-12 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="w-48 h-5 bg-slate-100 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <div className="md:col-span-2 space-y-2">
                <div className="h-4 w-24 bg-slate-100 rounded-md"></div>
                <div className="h-24 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Branding & Identifiers */}
          <div className="lg:col-span-1 space-y-8">
            {/* Branding Card */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <ImageIcon className="h-5 w-5 text-slate-500" />
                <h2 className="text-base font-bold text-slate-950">Company Branding</h2>
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
                className="w-48 h-48 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-center overflow-hidden mb-4 group relative cursor-pointer hover:border-blue-500/50 hover:bg-slate-100/50 transition-all duration-200"
              >
                {formData.logo_url ? (
                  <>
                    <img 
                      src={formData.logo_url} 
                      alt="Company Logo" 
                      className="max-w-full max-h-full object-contain p-2 transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <ImageIcon className="h-4 w-4" />
                      <span>Click to view</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center text-slate-500 transition-colors duration-200 group-hover:text-blue-600">
                      <Building2 className="h-12 w-12 stroke-[1.5]" />
                      <span className="text-xs font-semibold mt-2">No Logo Uploaded</span>
                    </div>
                    {canUpdate && (
                      <div className="absolute inset-0 bg-slate-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-slate-600 text-xs font-semibold gap-1.5">
                        <UploadIcon className="h-4 w-4" />
                        <span>Click to upload</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
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

              <div className="flex gap-4 w-full">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canUpdate}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-slate-950 font-semibold shadow-sm transition-all"
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
                    className="flex-1 text-rose-600 hover:text-rose-700 font-semibold hover:bg-rose-50/50 transition-all"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Identifiers Card */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-base font-bold text-slate-950">#</span>
                <h2 className="text-base font-bold text-slate-950">System Identifiers</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed -mt-2">
                Internal administrative metadata used for technical integration.
              </p>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-950">Company Code</label>
                  <span className="text-[9px] font-bold tracking-wider text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 uppercase">Read Only</span>
                </div>
                <input
                  type="text"
                  value={formData.company_code}
                  disabled
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/80 px-3 text-sm text-slate-600 font-mono shadow-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-950 mb-1.5">Account Status</label>
                <div className="flex items-center gap-2 p-3 bg-blue-50/30 border border-blue-100/60 rounded-xl text-blue-900 font-semibold text-sm">
                  <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>Premium Enterprise Plan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - General Info */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="h-5 w-5 text-slate-500" />
              <h2 className="text-base font-bold text-slate-950">General Information</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed -mt-4">
              Public-facing details used for billing, support, and legal registrations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Legal Name */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Legal Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  disabled={!canUpdate}
                  required
                  placeholder="e.g. Acme Corp Ltd"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all disabled:bg-slate-50"
                />
              </div>

              {/* Official Email Address */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/80 h-4 w-4 stroke-[1.5]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    required
                    placeholder="e.g. hq@company.com"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Primary Phone Number */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/80 h-4 w-4 stroke-[1.5]" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Business Registration Number */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Registration Number</label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  disabled={!canUpdate}
                  placeholder="e.g. REG-12345678"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all disabled:bg-slate-50"
                />
              </div>

              {/* Tax Identification Number */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tax Identification Number</label>
                <input
                  type="text"
                  name="tax_number"
                  value={formData.tax_number}
                  onChange={handleChange}
                  disabled={!canUpdate}
                  placeholder="e.g. TAX-98765432"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all disabled:bg-slate-50"
                />
              </div>

              {/* Corporate Website URL */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Corporate Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/80 h-4 w-4 stroke-[1.5]" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    placeholder="e.g. https://company.com"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Physical Headquarters Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Physical Headquarters Address</label>
                <textarea
                  name="address"
                  rows={4}
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!canUpdate}
                  placeholder="Street address, City, State, ZIP, Country"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Sticky Action Footer */}
          {isDirty && (
            <div className="col-span-full sticky bottom-4 z-40 bg-white border border-slate-200/80 rounded-2xl px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 shadow-lg animate-in slide-in-from-bottom duration-300">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="text-sm font-bold text-slate-800">Unsaved Changes</span>
                <span className="text-xs text-slate-400 mt-0.5">
                  Last saved {lastSaved} {user?.name ? `by ${user.name}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleDiscard}
                  className="flex-1 sm:flex-initial h-10 px-5 text-slate-700 font-semibold shadow-sm transition-all"
                >
                  Discard Changes
                </Button>
                <Button
                  type="submit"
                  isLoading={saving}
                  size="md"
                  className="flex-1 sm:flex-initial h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-base font-bold text-slate-950 mb-4 self-start">Company Logo Preview</h3>
            
            <div className="w-full h-[50vh] flex items-center justify-center overflow-hidden bg-slate-50 border border-slate-100 rounded-xl p-6">
              <img 
                src={formData.logo_url} 
                alt="Full Company Logo" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            <div className="mt-6 flex justify-end w-full">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-sm"
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
