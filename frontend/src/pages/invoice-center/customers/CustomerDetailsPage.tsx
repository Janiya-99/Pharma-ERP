import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import {
  CustomerStatusBadge,
  CustomerTypeBadge,
  CustomerCreditSummary,
} from "../../../components/invoice-center";
import CustomerAddressInlineTable from "./CustomerAddressInlineTable";
import CustomerContactInlineTable from "./CustomerContactInlineTable";
import ChangeCustomerStatusModal from "./ChangeCustomerStatusModal";
import PermissionGuard from "../../../auth/PermissionGuard";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, ShieldAlert, Building2, Globe, Phone, Mail, FileText, CreditCard } from "lucide-react";

interface Category {
  id: number;
  category_name: string;
}

interface Customer {
  id: number;
  customer_code: string;
  customer_name: string;
  trade_name?: string;
  customer_type: string;
  category?: Category;
  currency: string;
  tax_id?: string;
  registration_no?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  credit_limit: number;
  credit_days: number;
  payment_terms?: string;
  discount_percentage?: number;
  billing_address?: string;
  shipping_address?: string;
  notes?: string;
  status: string;
  current_balance: number;
}

const CustomerDetailsPage: React.FC = () => {
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "addresses" | "contacts" | "terms">("overview");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [custRes, addrRes, contRes] = await Promise.all([
        invoiceCenterApi.getCustomerById(id),
        invoiceCenterApi.getCustomerAddresses(id),
        invoiceCenterApi.getCustomerContacts(id),
      ]);

      if (custRes.data?.success) setCustomer(custRes.data.data);
      if (addrRes.data?.success) setAddresses(addrRes.data.data || []);
      if (contRes.data?.success) setContacts(contRes.data.data || []);
    } catch (err) {
      console.error("Fetch customer details error:", err);
      setError("Failed to load customer profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "INVOICE_CENTER") {
      fetchCustomerData();
    }
  }, [id, activeSoftware]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-medium border border-rose-200 dark:border-rose-800 m-6">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  if (loading) {
    return <div className="p-12 text-center text-gray-400 animate-pulse font-medium">Loading customer master...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-navy-800 text-gray-500 dark:text-gray-400 rounded-2xl font-medium m-6">
        {error || "Customer record not found."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate("/invoice-center/customers")}
            className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-navy-700 dark:hover:bg-navy-600 text-gray-600 dark:text-gray-300 transition-colors mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">{customer.customer_name}</h1>
              <span className="font-mono text-sm px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-navy-700 font-bold text-gray-700 dark:text-gray-300">
                {customer.customer_code}
              </span>
              <CustomerTypeBadge type={customer.customer_type} />
              <CustomerStatusBadge status={customer.status} />
            </div>
            {customer.trade_name && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Trading as: {customer.trade_name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <PermissionGuard permission="invoice_center.customer.update">
            <button
              onClick={() => setStatusModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-semibold transition-all"
            >
              <ShieldAlert className="w-4 h-4" /> Change Status
            </button>
            <button
              onClick={() => navigate(`/invoice-center/customers/${customer.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md transition-all"
            >
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Credit Summary Card */}
      <CustomerCreditSummary
        creditLimit={customer.credit_limit}
        currentBalance={customer.current_balance}
        creditDays={customer.credit_days}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-navy-700 pb-1 overflow-x-auto">
        {[
          { key: "overview", label: "Overview", icon: Building2 },
          { key: "addresses", label: `Addresses (${addresses.length})`, icon: Globe },
          { key: "contacts", label: `Contacts (${contacts.length})`, icon: Phone },
          { key: "terms", label: "Credit & Financial Terms", icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? "bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-sm border-t-2 border-brand-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-brand-500" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 space-y-4">
            <h3 className="text-base font-bold text-navy-900 dark:text-white pb-3 border-b border-gray-100 dark:border-navy-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-500" /> Basic & Legal Profile
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-navy-700/50">
                <span className="text-gray-500 dark:text-gray-400">Category</span>
                <span className="font-semibold text-navy-900 dark:text-white">{customer.category?.category_name || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-navy-700/50">
                <span className="text-gray-500 dark:text-gray-400">Currency</span>
                <span className="font-semibold text-navy-900 dark:text-white">{customer.currency || "LKR"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-navy-700/50">
                <span className="text-gray-500 dark:text-gray-400">Tax ID / VAT No</span>
                <span className="font-mono font-medium text-navy-900 dark:text-white">{customer.tax_id || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500 dark:text-gray-400">Company Registration No</span>
                <span className="font-mono font-medium text-navy-900 dark:text-white">{customer.registration_no || "—"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 space-y-4">
            <h3 className="text-base font-bold text-navy-900 dark:text-white pb-3 border-b border-gray-100 dark:border-navy-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" /> Primary Contact Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-navy-700/50">
                <span className="text-gray-500 dark:text-gray-400">Email Address</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{customer.email || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-navy-700/50">
                <span className="text-gray-500 dark:text-gray-400">Phone Number</span>
                <span className="font-medium text-navy-900 dark:text-white">{customer.phone || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-navy-700/50">
                <span className="text-gray-500 dark:text-gray-400">Mobile Number</span>
                <span className="font-medium text-navy-900 dark:text-white">{customer.mobile || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500 dark:text-gray-400">Website</span>
                <span className="font-medium text-navy-900 dark:text-white">{customer.website || "—"}</span>
              </div>
            </div>
          </div>

          {(customer.billing_address || customer.shipping_address || customer.notes) && (
            <div className="md:col-span-2 bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 space-y-4">
              <h3 className="text-base font-bold text-navy-900 dark:text-white pb-3 border-b border-gray-100 dark:border-navy-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> Default Addresses & Notes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Default Billing Address</span>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{customer.billing_address || "—"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Default Shipping Address</span>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{customer.shipping_address || "—"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Internal Notes</span>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line italic">{customer.notes || "No special instructions recorded."}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "addresses" && (
        <CustomerAddressInlineTable
          customerId={customer.id}
          addresses={addresses}
          onRefresh={fetchCustomerData}
        />
      )}

      {activeTab === "contacts" && (
        <CustomerContactInlineTable
          customerId={customer.id}
          contacts={contacts}
          onRefresh={fetchCustomerData}
        />
      )}

      {activeTab === "terms" && (
        <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700 space-y-6">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white pb-4 border-b border-gray-100 dark:border-navy-700">
            Credit & Financial Policies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-navy-700 rounded-2xl">
              <span className="text-xs font-bold text-gray-400 uppercase block">Credit Limit</span>
              <span className="text-xl font-extrabold text-navy-900 dark:text-white mt-1 block">
                LKR {Number(customer.credit_limit || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-navy-700 rounded-2xl">
              <span className="text-xs font-bold text-gray-400 uppercase block">Credit Period</span>
              <span className="text-xl font-extrabold text-navy-900 dark:text-white mt-1 block">
                {customer.credit_days || 0} Days
              </span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-navy-700 rounded-2xl">
              <span className="text-xs font-bold text-gray-400 uppercase block">Fixed Discount</span>
              <span className="text-xl font-extrabold text-navy-900 dark:text-white mt-1 block">
                {customer.discount_percentage || 0}%
              </span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-navy-700 rounded-2xl">
              <span className="text-xs font-bold text-gray-400 uppercase block">Payment Terms</span>
              <span className="text-xl font-extrabold text-navy-900 dark:text-white mt-1 block">
                {customer.payment_terms || "Standard EOM"}
              </span>
            </div>
          </div>
        </div>
      )}

      <ChangeCustomerStatusModal
        isOpen={statusModalOpen}
        customer={customer}
        onClose={() => setStatusModalOpen(false)}
        onSuccess={fetchCustomerData}
      />
    </div>
  );
};

export default CustomerDetailsPage;
