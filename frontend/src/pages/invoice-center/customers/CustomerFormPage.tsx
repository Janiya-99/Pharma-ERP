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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldValue = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

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
      <div className="m-6 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center font-medium text-rose-600   ">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!formData.customer_code.trim()) {
      nextErrors.customer_code = "Customer code is required.";
    }
    if (!formData.customer_name.trim()) {
      nextErrors.customer_name = "Customer name is required.";
    }
    if (!formData.category_id) {
      nextErrors.category_id = "Customer category is required.";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (formData.website) {
      try {
        new URL(formData.website);
      } catch {
        nextErrors.website = "Enter a valid website URL.";
      }
    }
    if (Number(formData.credit_limit || 0) < 0) {
      nextErrors.credit_limit = "Credit limit cannot be negative.";
    }
    if (Number(formData.credit_days || 0) < 0) {
      nextErrors.credit_days = "Credit days cannot be negative.";
    }
    if (
      Number(formData.discount_percentage || 0) < 0 ||
      Number(formData.discount_percentage || 0) > 100
    ) {
      nextErrors.discount_percentage = "Discount must be between 0 and 100.";
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setError("Please fix the highlighted fields.");
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
    <div className="page-content mx-auto flex w-full max-w-6xl flex-col gap-4 pb-12">
      {/* Header */}
      <div className="sticky top-14 z-30 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 bg-white p-2 text-[#334155] transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
              {isEdit
                ? `Edit Customer (${formData.customer_code})`
                : "Create New Customer"}
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Configure master profile and trading terms
            </p>
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-xs font-semibold uppercase text-[#64748B]">
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
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Section 1: Basic Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="border-b border-slate-100 pb-3 text-lg font-semibold text-[#111827]">
            1. Basic Information
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Customer Code *
              </label>
              <input
                type="text"
                disabled={isEdit}
                value={formData.customer_code}
                onChange={(e) => setFieldValue("customer_code", e.target.value)}
                placeholder="e.g. CUST-0001"
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10 disabled:bg-slate-100 disabled:opacity-70 ${
                  fieldErrors.customer_code
                    ? "border-red-500"
                    : "border-slate-200"
                }`}
              />
              <ValidationMessage message={fieldErrors.customer_code} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFieldValue("customer_name", e.target.value)}
                placeholder="e.g. HealthCare Pharmacy Ltd"
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10 ${
                  fieldErrors.customer_name
                    ? "border-red-500"
                    : "border-slate-200"
                }`}
              />
              <ValidationMessage message={fieldErrors.customer_name} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Trade Name
              </label>
              <input
                type="text"
                value={formData.trade_name}
                onChange={(e) => setFieldValue("trade_name", e.target.value)}
                placeholder="e.g. HealthCare Plus"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Customer Type *
              </label>
              <Select
                value={formData.customer_type}
                onValueChange={(value) => setFieldValue("customer_type", value)}
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
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Customer Category *
              </label>
              <CustomerCategorySelect
                value={formData.category_id}
                onChange={(val) => setFieldValue("category_id", String(val))}
              />
              <ValidationMessage message={fieldErrors.category_id} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Currency
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFieldValue("currency", e.target.value)}
                placeholder="LKR"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Tax ID / VAT No
              </label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => setFieldValue("tax_id", e.target.value)}
                placeholder="e.g. 102938475V"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Registration No
              </label>
              <input
                type="text"
                value={formData.registration_no}
                onChange={(e) =>
                  setFieldValue("registration_no", e.target.value)
                }
                placeholder="e.g. PV-99281"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Communication */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="border-b border-slate-100 pb-3 text-lg font-semibold text-[#111827]">
            2. Contact & Communication
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFieldValue("email", e.target.value)}
                placeholder="contact@company.com"
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10 ${
                  fieldErrors.email ? "border-red-500" : "border-slate-200"
                }`}
              />
              <ValidationMessage message={fieldErrors.email} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFieldValue("website", e.target.value)}
                placeholder="https://company.com"
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10 ${
                  fieldErrors.website ? "border-red-500" : "border-slate-200"
                }`}
              />
              <ValidationMessage message={fieldErrors.website} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFieldValue("phone", e.target.value)}
                placeholder="+94 11 234 5678"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Mobile Number
              </label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFieldValue("mobile", e.target.value)}
                placeholder="+94 77 123 4567"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Credit & Financial Terms */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="border-b border-slate-100 pb-3 text-lg font-semibold text-[#111827]">
            3. Credit & Financial Terms
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Credit Limit (LKR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.credit_limit}
                onChange={(e) => setFieldValue("credit_limit", e.target.value)}
                placeholder="0.00"
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10 ${
                  fieldErrors.credit_limit
                    ? "border-red-500"
                    : "border-slate-200"
                }`}
              />
              <ValidationMessage message={fieldErrors.credit_limit} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Credit Days
              </label>
              <input
                type="number"
                min="0"
                value={formData.credit_days}
                onChange={(e) => setFieldValue("credit_days", e.target.value)}
                placeholder="30"
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10 ${
                  fieldErrors.credit_days
                    ? "border-red-500"
                    : "border-slate-200"
                }`}
              />
              <ValidationMessage message={fieldErrors.credit_days} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) =>
                  setFieldValue("discount_percentage", e.target.value)
                }
                placeholder="0.0"
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10 ${
                  fieldErrors.discount_percentage
                    ? "border-red-500"
                    : "border-slate-200"
                }`}
              />
              <ValidationMessage message={fieldErrors.discount_percentage} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Payment Terms
              </label>
              <input
                type="text"
                value={formData.payment_terms}
                onChange={(e) => setFieldValue("payment_terms", e.target.value)}
                placeholder="Net 30 / EOM"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Billing & Legal Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="border-b border-slate-100 pb-3 text-lg font-semibold text-[#111827]">
            4. Billing & Legal Details
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Default Billing Address
              </label>
              <textarea
                rows={3}
                value={formData.billing_address}
                onChange={(e) =>
                  setFieldValue("billing_address", e.target.value)
                }
                placeholder="Street address, city, postal code..."
                className="min-h-[86px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Default Shipping Address
              </label>
              <textarea
                rows={3}
                value={formData.shipping_address}
                onChange={(e) =>
                  setFieldValue("shipping_address", e.target.value)
                }
                placeholder="Delivery street address, city..."
                className="min-h-[86px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-[#334155]">
              Internal Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFieldValue("notes", e.target.value)}
              placeholder="Special instructions or background notes..."
              className="min-h-[72px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#002137] focus:ring-2 focus:ring-[#002137]/10"
            />
          </div>
        </div>

        {/* Section 5: Status & Controls (only on edit) */}
        {isEdit && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="border-b border-slate-100 pb-3 text-lg font-semibold text-[#111827]">
              5. Status & Controls
            </h3>
            <div className="mt-4 max-w-xs">
              <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                Account Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFieldValue("status", value)}
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
        <div className="flex flex-col-reverse gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[#334155] hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#002137] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#003452] disabled:opacity-50"
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

const ValidationMessage = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1 text-xs font-medium text-red-500">{message}</p>
  ) : null;

export default CustomerFormPage;
