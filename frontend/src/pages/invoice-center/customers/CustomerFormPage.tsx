import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import {
  CreditStatusBadge,
  CustomerCategorySelect,
} from "../../../components/invoice-center";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

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
              credit_limit:
                c.credit_limit !== undefined ? String(c.credit_limit) : "",
              credit_days:
                c.credit_days !== undefined ? String(c.credit_days) : "",
              payment_terms: c.payment_terms || "",
              price_list_id: c.price_list_id ? String(c.price_list_id) : "",
              discount_percentage:
                c.discount_percentage !== undefined
                  ? String(c.discount_percentage)
                  : "",
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
      <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 m-6 rounded-2xl border p-8 text-center font-medium">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.customer_code.trim() ||
      !formData.customer_name.trim() ||
      !formData.category_id
    ) {
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
      price_list_id: formData.price_list_id
        ? Number(formData.price_list_id)
        : 0,
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
      setError(
        err.response?.data?.message ||
          "Failed to save customer. Code or Tax ID might already exist."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="animate-pulse p-12 text-center font-medium text-gray-500">
        Loading customer form...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl bg-gray-50 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
              {isEdit
                ? `Edit Customer (${formData.customer_code})`
                : "Create New Customer"}
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Configure master profile and trading terms
            </p>
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 dark:border-navy-600 dark:bg-navy-700">
            <span className="text-xs font-bold uppercase text-gray-400">
              Credit Status:
            </span>
            <CreditStatusBadge
              creditLimit={formData.credit_limit}
              currentBalance={currentBalance}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border-rose-200 text-rose-700 flex items-center gap-2 rounded-xl border p-4 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h3 className="border-b border-gray-100 pb-3 text-base font-bold text-navy-900 dark:border-navy-700 dark:text-white">
            1. Basic Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Customer Code *
              </label>
              <input
                type="text"
                required
                disabled={isEdit}
                value={formData.customer_code}
                onChange={(e) =>
                  setFormData({ ...formData, customer_code: e.target.value })
                }
                placeholder="e.g. CUST-0001"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 disabled:bg-gray-100 disabled:opacity-70 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                placeholder="e.g. HealthCare Pharmacy Ltd"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Trade Name
              </label>
              <input
                type="text"
                value={formData.trade_name}
                onChange={(e) =>
                  setFormData({ ...formData, trade_name: e.target.value })
                }
                placeholder="e.g. HealthCare Plus"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Customer Type *
              </label>
              <Select
                value={formData.customer_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, customer_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="retailer">Retailer</SelectItem>
                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Customer Category *
              </label>
              <CustomerCategorySelect
                value={formData.category_id}
                onChange={(val) =>
                  setFormData({ ...formData, category_id: String(val) })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Currency
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                placeholder="LKR"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Tax ID / VAT No
              </label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) =>
                  setFormData({ ...formData, tax_id: e.target.value })
                }
                placeholder="e.g. 102938475V"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Registration No
              </label>
              <input
                type="text"
                value={formData.registration_no}
                onChange={(e) =>
                  setFormData({ ...formData, registration_no: e.target.value })
                }
                placeholder="e.g. PV-99281"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Communication */}
        <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h3 className="border-b border-gray-100 pb-3 text-base font-bold text-navy-900 dark:border-navy-700 dark:text-white">
            2. Contact & Communication
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="contact@company.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://company.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+94 11 234 5678"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Mobile Number
              </label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                placeholder="+94 77 123 4567"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Credit & Financial Terms */}
        <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h3 className="border-b border-gray-100 pb-3 text-base font-bold text-navy-900 dark:border-navy-700 dark:text-white">
            3. Credit & Financial Terms
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Credit Limit (LKR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.credit_limit}
                onChange={(e) =>
                  setFormData({ ...formData, credit_limit: e.target.value })
                }
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Credit Days
              </label>
              <input
                type="number"
                min="0"
                value={formData.credit_days}
                onChange={(e) =>
                  setFormData({ ...formData, credit_days: e.target.value })
                }
                placeholder="30"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_percentage: e.target.value,
                  })
                }
                placeholder="0.0"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Payment Terms
              </label>
              <input
                type="text"
                value={formData.payment_terms}
                onChange={(e) =>
                  setFormData({ ...formData, payment_terms: e.target.value })
                }
                placeholder="Net 30 / EOM"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Billing & Legal Details */}
        <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <h3 className="border-b border-gray-100 pb-3 text-base font-bold text-navy-900 dark:border-navy-700 dark:text-white">
            4. Billing & Legal Details
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Default Billing Address
              </label>
              <textarea
                rows={3}
                value={formData.billing_address}
                onChange={(e) =>
                  setFormData({ ...formData, billing_address: e.target.value })
                }
                placeholder="Street address, city, postal code..."
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Default Shipping Address
              </label>
              <textarea
                rows={3}
                value={formData.shipping_address}
                onChange={(e) =>
                  setFormData({ ...formData, shipping_address: e.target.value })
                }
                placeholder="Delivery street address, city..."
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Special instructions or background notes..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
            />
          </div>
        </div>

        {/* Section 5: Status & Controls (only on edit) */}
        {isEdit && (
          <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="border-b border-gray-100 pb-3 text-base font-bold text-navy-900 dark:border-navy-700 dark:text-white">
              5. Status & Controls
            </h3>
            <div className="max-w-xs">
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                Account Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex justify-end gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-navy-600 dark:text-gray-300 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Customer"
              : "Create Customer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerFormPage;
