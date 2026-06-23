import React, { useState, useEffect } from "react";
import { getCompanyProfile, updateCompanyProfile } from "../../../api/controlApi";
import { useAuth } from "../../../auth/AuthContext";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FormError from "../../../components/common/FormError";
import Badge from "../../../components/common/Badge";
import PermissionGuard from "../../../auth/PermissionGuard";
import { Save } from "lucide-react";

const CompanyProfilePage = () => {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("control.company.update");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    company_code: "",
    registration_number: "",
    tax_number: "",
    phone: "",
    email: "",
    address: "",
    logo_url: "",
    status: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getCompanyProfile();
      if (res.success) {
        setFormData(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load company profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const payload = {
        company_name: formData.company_name,
        registration_number: formData.registration_number,
        tax_number: formData.tax_number,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        logo_url: formData.logo_url,
      };
      
      const res = await updateCompanyProfile(payload);
      if (res.success) {
        setSuccess(true);
        setFormData(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Company Profile"
        description="Manage your company's core information and identity."
      />

      <FormError message={error} />
      
      {success && (
        <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
          <p className="text-sm font-medium text-green-800">Company profile updated successfully.</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading profile data...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-medium text-gray-900">System Identifiers</h3>
                <p className="text-sm text-gray-500">Read-only system information.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Company Code"
                name="company_code"
                value={formData.company_code}
                disabled
                className="bg-gray-50"
              />
              <div className="flex flex-col justify-center">
                <span className="block text-sm font-medium text-gray-700 mb-1">Status</span>
                <div>
                  <Badge variant={formData.status === "active" ? "success" : "default"}>
                    {formData.status?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-8 mb-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-medium text-gray-900">General Information</h3>
                <p className="text-sm text-gray-500">Update the company contact details and registrations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Company Name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                disabled={!canUpdate}
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!canUpdate}
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!canUpdate}
              />
              <Input
                label="Registration Number"
                name="registration_number"
                value={formData.registration_number || ""}
                onChange={handleChange}
                disabled={!canUpdate}
              />
              <Input
                label="Tax Number"
                name="tax_number"
                value={formData.tax_number || ""}
                onChange={handleChange}
                disabled={!canUpdate}
              />
              <Input
                label="Logo URL"
                name="logo_url"
                value={formData.logo_url || ""}
                onChange={handleChange}
                disabled={!canUpdate}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  rows={3}
                  value={formData.address || ""}
                  onChange={handleChange}
                  disabled={!canUpdate}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
          
          <PermissionGuard permission="control.company.update">
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <Button type="submit" isLoading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </PermissionGuard>
        </form>
      </div>
      )}
    </div>
  );
};

export default CompanyProfilePage;
