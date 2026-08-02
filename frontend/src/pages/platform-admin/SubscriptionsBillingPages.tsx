import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getPlatformPlans,
  createPlatformPlan,
  updatePlatformPlan,
  getPlatformSubscriptions,
  getPlatformInvoices,
  createPlatformInvoice,
  getPlatformPayments,
  createPlatformPayment,
  getPlatformCompanies,
} from "../../api/platformAdminApi";
import { toast } from "sonner";
import { CreditCard, DollarSign, FileCheck, Landmark, List, Plus, ShieldCheck } from "lucide-react";

// 1. SubscriptionPlansPage
export const SubscriptionPlansPage = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const res = await getPlatformPlans();
        if (res.success) {
          setPlans(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Subscription Plans</h2>
          <p className="text-sm text-slate-400">Configure pricing tiers, monthly limits, and branch capacities.</p>
        </div>
        <LinkToCreatePlan />
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Querying plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div key={p.id} className="p-6 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col justify-between shadow-lg">
              <div>
                <h3 className="font-bold text-white text-base">{p.plan_name}</h3>
                <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                <div className="mt-4 border-t border-slate-850 pt-4 space-y-2 text-xs text-slate-400">
                  <p>Max Branches: <span className="text-white font-semibold">{p.max_branches}</span></p>
                  <p>Max User Seats: <span className="text-white font-semibold">{p.max_users}</span></p>
                  <p>Billing Cycle: <span className="text-indigo-400 font-semibold capitalize">{p.billing_cycle}</span></p>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-850 pt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-white">{p.monthly_price} LKR</span>
                <span className="text-xs text-slate-500">monthly</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LinkToCreatePlan = () => (
  <a
    href="/platform-admin/subscriptions/plans/create"
    className="py-2 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm shadow-md transition-all"
  >
    Create New Plan
  </a>
);

// 2. SubscriptionPlanFormPage
export const SubscriptionPlanFormPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    plan_name: "",
    plan_code: "",
    description: "",
    billing_cycle: "monthly",
    monthly_price: 0,
    annual_price: 0,
    max_users: 10,
    max_branches: 2,
    currency: "LKR",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createPlatformPlan(form);
      toast.success("Pricing plan configured successfully");
      navigate("/platform-admin/subscriptions/plans");
    } catch (err) {
      toast.error("Failed to create subscription plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Configure New Subscription Plan</h2>
        <p className="text-sm text-slate-400">Establish pricing guidelines, resource quotas, and billing cycle rates.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-950/40 p-6 rounded-xl border border-slate-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Plan Name *</label>
            <input
              type="text"
              value={form.plan_name}
              onChange={(e) => setForm({ ...form, plan_name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Plan Code *</label>
            <input
              type="text"
              value={form.plan_code}
              onChange={(e) => setForm({ ...form, plan_code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none h-20 resize-none"
           placeholder="Enter text..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Monthly Price (LKR) *</label>
            <input
              type="number"
              value={form.monthly_price}
              onChange={(e) => setForm({ ...form, monthly_price: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Annual Price (LKR) *</label>
            <input
              type="number"
              value={form.annual_price}
              onChange={(e) => setForm({ ...form, annual_price: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Max Users *</label>
            <input
              type="number"
              value={form.max_users}
              onChange={(e) => setForm({ ...form, max_users: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Max Branches *</label>
            <input
              type="number"
              value={form.max_branches}
              onChange={(e) => setForm({ ...form, max_branches: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm transition-all"
          >
            {submitting ? "Saving..." : "Configure Plan"}
          </button>
        </div>
      </form>
    </div>
  );
};

// 3. CompanyLicensesPage
export const CompanyLicensesPage = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubs = async () => {
      try {
        setLoading(true);
        const res = await getPlatformSubscriptions();
        if (res.success) {
          setSubscriptions(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load active licenses");
      } finally {
        setLoading(false);
      }
    };
    loadSubs();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Active License Agreements</h2>
        <p className="text-sm text-slate-400">Validate subscription status logs, start times, and upcoming expiry terms.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Fetching active contracts...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No licenses active currently.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40 p-4">
                <th className="p-4">Subscription Number</th>
                <th className="p-4">Tenant Company ID</th>
                <th className="p-4">Billing Cycle</th>
                <th className="p-4">SaaS Price (LKR)</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Renewal Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-mono font-bold text-white text-xs">{sub.subscription_number}</td>
                  <td className="p-4 text-slate-200">Company ID: {sub.tenant_company_id}</td>
                  <td className="p-4 uppercase text-xs">{sub.billing_cycle}</td>
                  <td className="p-4">{sub.price.toLocaleString()} LKR</td>
                  <td className="p-4 text-xs font-semibold text-indigo-400">
                    {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 4. SubscriptionInvoicesPage
export const SubscriptionInvoicesPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    tenant_company_id: 0,
    subscription_id: 0,
    total_amount: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const invRes = await getPlatformInvoices();
      const compRes = await getPlatformCompanies();
      setInvoices(invRes.data || []);
      setCompanies(compRes.data || []);
    } catch (err) {
      toast.error("Failed to load invoice logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlatformInvoice(form);
      toast.success("SaaS invoice generated successfully");
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error("Failed to generate invoice");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">SaaS Invoice Ledger</h2>
          <p className="text-sm text-slate-400">Generate and review invoices for software subscription fees.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="py-2 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Invoice</span>
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No billing records found.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40 p-4">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Company ID</th>
                <th className="p-4">Invoice Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Total Amount (LKR)</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Outstanding Balance</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-mono font-bold text-white text-xs">{inv.invoice_number}</td>
                  <td className="p-4 text-slate-200">Company ID: {inv.tenant_company_id}</td>
                  <td className="p-4 text-xs">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                  <td className="p-4 text-xs">{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-200">{inv.total_amount.toLocaleString()} LKR</td>
                  <td className="p-4">{inv.paid_amount.toLocaleString()} LKR</td>
                  <td className="p-4 text-xs font-semibold text-indigo-400">{(inv.total_amount - inv.paid_amount).toLocaleString()} LKR</td>
                  <td className="p-4 text-right">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                        inv.invoice_status === "paid"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {inv.invoice_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateInvoice} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">Generate Billing Invoice</h3>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Select Client Tenant *</label>
              <select
                onChange={(e) => setForm({ ...form, tenant_company_id: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                required
              >
                <option value="">-- Choose Tenant --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} ({c.company_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Invoice Total Amount (LKR) *</label>
              <input
                type="number"
                value={form.total_amount}
                onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm transition-all"
              >
                Generate
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// 5. SubscriptionPaymentsPage
export const SubscriptionPaymentsPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    subscription_invoice_id: 0,
    tenant_company_id: 0,
    amount: 0,
    payment_method: "bank_transfer",
    reference_number: "",
    remarks: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const payRes = await getPlatformPayments();
      const invRes = await getPlatformInvoices();
      setPayments(payRes.data || []);
      setInvoices(invRes.data?.filter((i: any) => i.invoice_status !== "paid") || []);
    } catch (err) {
      toast.error("Failed to load payments history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find selected invoice to get tenant company ID
      const inv = invoices.find((i) => i.id === form.subscription_invoice_id);
      const tenantId = inv ? inv.tenant_company_id : 0;
      await createPlatformPayment({ ...form, tenant_company_id: tenantId });
      toast.success("SaaS payment recorded successfully");
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error("Failed to record payment");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Payments Registry</h2>
          <p className="text-sm text-slate-400">Record and monitor client subscription payments.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="py-2 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Loading payments registry...</div>
      ) : payments.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No payment receipts found.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40 p-4">
                <th className="p-4">Payment ID</th>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Company ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Method</th>
                <th className="p-4">Ref Number</th>
                <th className="p-4">Amount (LKR)</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-mono font-bold text-white text-xs">PAY-{p.id}</td>
                  <td className="p-4 text-slate-300">Invoice ID: {p.subscription_invoice_id}</td>
                  <td className="p-4">Company ID: {p.tenant_company_id}</td>
                  <td className="p-4 text-xs">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="p-4 capitalize text-xs">{p.payment_method}</td>
                  <td className="p-4 font-mono text-xs">{p.reference_number || "N/A"}</td>
                  <td className="p-4 font-bold text-slate-200">{p.amount.toLocaleString()} LKR</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {p.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleRecordPayment} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">Record Client Payment</h3>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Select Outstanding Invoice *</label>
              <select
                onChange={(e) => setForm({ ...form, subscription_invoice_id: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                required
              >
                <option value="">-- Choose Invoice --</option>
                {invoices.map((i) => (
                  <option key={i.id} value={i.id}>
                    Invoice #{i.invoice_number} (Outstanding: {i.total_amount - i.paid_amount} LKR)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Payment Method *</label>
                <select
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card Payment</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online gateway</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Reference Number *</label>
                <input
                  type="text"
                  value={form.reference_number}
                  onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Payment Amount (LKR) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none text-sm"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm transition-all"
              >
                Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// 6. OutstandingBalancesPage
export const OutstandingBalancesPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const res = await getPlatformInvoices();
        if (res.success) {
          // Filter to only those with a balance
          const outstanding = res.data?.filter((i: any) => i.total_amount - i.paid_amount > 0) || [];
          setInvoices(outstanding);
        }
      } catch (err) {
        toast.error("Failed to load outstanding invoice logs");
      } finally {
        setLoading(false);
      }
    };
    loadInvoices();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Outstanding Balances Summary</h2>
        <p className="text-sm text-slate-400">Review unresolved invoice metrics, debt accounts, and late payment notifications.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Fetching outstanding accounts...</div>
      ) : invoices.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No outstanding balances found! All paid.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40 p-4">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Company ID</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Total Amount (LKR)</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4 text-right">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-mono font-bold text-white text-xs">{inv.invoice_number}</td>
                  <td className="p-4 text-slate-300">Company ID: {inv.tenant_company_id}</td>
                  <td className="p-4 text-xs text-amber-400 font-semibold">{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td className="p-4">{inv.total_amount.toLocaleString()} LKR</td>
                  <td className="p-4">{inv.paid_amount.toLocaleString()} LKR</td>
                  <td className="p-4 text-right font-bold text-red-400">{(inv.total_amount - inv.paid_amount).toLocaleString()} LKR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
