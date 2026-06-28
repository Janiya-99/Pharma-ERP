import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { CreditStatusBadge, CustomerCategorySelect } from "../../../components/invoice-center";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

const CustomerFormPage: React.FC = () => {
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    customer_code: "",
    customer_name: "",
    trade_name: "",
    customer_type: "pharmacy",
    category_id: "",
    currency: "LKR",
    tax_id: "",
    registration_no: "",
    email: "",
    phone: "",
    mobile: "",
    website: "",
    credit_limit: "",
    credit_days: "",
    payment_terms: "",
    price_list_id: "",
    discount_percentage: "",
    billing_address: "",
    shipping_address: "",
    notes: "",
    status: "active",
  });

  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id && activeSoftware?.software_code === "INVOICE_CENTER") {
      const loadCustomer = async () => {
        setFetching(true);
        try {
          const res = await invoiceCenterApi.getCustomerById(id);
          if (res.data?.success) {
            const c = res.data.data;
            setFormData({
              customer_code: c.customer_code || "",
              customer_name: c.customer_name || "",
              trade_name: c.trade_name || "",
              customer_type: c.customer_type || "pharmacy",
              category_id: c.category_id ? String(c.category_id) : "",
              currency: c.currency || "LKR",
              tax_id: c.tax_id || "",
              registration_no: c.registration_no || "",
              email: c.email || "",
              phone: c.phone || "",
              mobile: c.mobile || "",
              website: c.website || "",
              credit_limit: c.credit_limit !== undefined ? String(c.credit_limit) : "",
              credit_days: c.credit_days !== undefined ? String(c.credit_days) : "",
              payment_terms: c.payment_terms || "",
              price_list_id: c.price_list_id ? String(c.price_list_id) : "",
              discount_percentage: c.discount_percentage !== undefined ? String(c.discount_percentage) : "",
              billing_address: c.billing_address || "",
              shipping_address: c.shipping_address || "",
              notes: c.notes || "",
              status: c.status || "active",
            });
            setCurrentBalance(c.current_balance || 0);
          }
        } catch (err) {
          console.error("Load customer error:", err);
          setError("Failed to load customer details.");
        } finally {
          setFetching(false);
        }
      };
      loadCustomer();
    }
  }, [id, isEdit, activeSoftware]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-medium border border-rose-200 dark:border-rose-800 m-6">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_code.trim() || !formData.customer_name.trim() || !formData.category_id) {
      setError("Customer Code, Name, and Category are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      category_id: Number(formData.category_id),
      credit_limit: Number(formData.credit_limit) || 0,
      credit_days: Number(formData.credit_days) || 0,
      price_list_id: formData.price_list_id ? Number(formData.price_list_id) : 0,
      discount_percentage: Number(formData.discount_percentage) || 0,
    };

    try {
      if (isEdit && id) {
        await invoiceCenterApi.updateCustomer(id, payload);
      } else {
        await invoiceCenterApi.createCustomer(payload);
      }
      navigate("/invoice-center/customers");
    } catch (err: any) {
      console.error("Save customer error:", err);
      setError(err.response?.data?.message || "Failed to save customer. Code or Tax ID might already exist.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading customer form...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-navy-700 dark:hover:bg-navy-600 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
              {isEdit ? `Edit Customer (${formData.customer_code})` : "Create New Customer"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure master profile and trading terms</p>
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-navy-700 px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-600">
            <span className="text-xs font-bold uppercase text-gray-400">Credit Status:</span>
            <CreditStatusBadge creditLimit={formData.credit_limit} currentBalance={currentBalance} />
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 space-y-4">
          <h3 className="text-base font-bold text-navy-900 dark:text-white pb-3 border-b border-gray-100 dark:border-navy-700">
            1. Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Customer Code *</label>
              <input
                type="text"
                required
                disabled={isEdit}
                value={formData.customer_code}
                onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                placeholder="e.g. CUST-0001"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none disabled:bg-gray-100 disabled:opacity-70"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="e.g. HealthCare Pharmacy Ltd"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Trade Name</label>
              <input
                type="text"
                value={formData.trade_name}
                onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                placeholder="e.g. HealthCare Plus"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Customer Type *</label>
              <select
                value={formData.customer_type}
                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              >
                <option value="pharmacy">Pharmacy</option>
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
                <option value="doctor">Doctor</option>
                <option value="distributor">Distributor</option>
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="individual">Individual</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Customer Category *</label>
              <CustomerCategorySelect
                value={formData.category_id}
                onChange={(val) => setFormData({ ...formData, category_id: String(val) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="LKR"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tax ID / VAT No</label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                placeholder="e.g. 102938475V"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Registration No</label>
              <input
                type="text"
                value={formData.registration_no}
                onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
                placeholder="e.g. PV-99281"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Communication */}
        <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 space-y-4">
          <h3 className="text-base font-bold text-navy-900 dark:text-white pb-3 border-b border-gray-100 dark:border-navy-700">
            2. Contact & Communication
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://company.com"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+94 11 234 5678"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mobile Number</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+94 77 123 4567"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Credit & Financial Terms */}
        <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 space-y-4">
          <h3 className="text-base font-bold text-navy-900 dark:text-white pb-3 border-b border-gray-100 dark:border-navy-700">
            3. Credit & Financial Terms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Credit Limit (LKR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Credit Days</label>
              <input
                type="number"
                min="0"
                value={formData.credit_days}
                onChange={(e) => setFormData({ ...formData, credit_days: e.target.value })}
                placeholder="30"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Discount (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Payment Terms</label>
              <input
                type="text"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                placeholder="Net 30 / EOM"
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Billing & Legal Details */}
        <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 space-y-4">
          <h3 className="text-base font-bold text-navy-900 dark:text-white pb-3 border-b border-gray-100 dark:border-navy-700">
            4. Billing & Legal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Default Billing Address</label>
              <textarea
                rows={3}
                value={formData.billing_address}
                onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                placeholder="Street address, city, postal code..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Default Shipping Address</label>
              <textarea
                rows={3}
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                placeholder="Delivery street address, city..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special instructions or background notes..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>
        </div>

        {/* Section 5: Status & Controls (only on edit) */}
        {isEdit && (
          <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 space-y-4">
            <h3 className="text-base font-bold text-navy-900 dark:text-white pb-3 border-b border-gray-100 dark:border-navy-700">
              5. Status & Controls
            </h3>
            <div className="max-w-xs">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex justify-end gap-4 p-4 bg-white dark:bg-navy-800 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-navy-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : isEdit ? "Update Customer" : "Create Customer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerFormPage;
