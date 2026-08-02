import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import {
  getPlatformPlans,
  createPlatformCompany,
} from "../../api/platformAdminApi";
import { toast } from "sonner";
import { Building, Receipt, Users, Database, ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";

const createCompanySchema = z.object({
  company_code: z.string().min(2, "Company code must be at least 2 chars").toUpperCase(),
  company_name: z.string().min(2, "Company name is required"),
  legal_name: z.string().optional(),
  registration_number: z.string().optional(),
  tax_number: z.string().optional(),
  industry: z.string().optional(),
  company_email: z.string().email("Invalid company email"),
  company_phone: z.string().optional(),
  country: z.string().default("Sri Lanka"),
  timezone: z.string().default("Asia/Colombo"),
  subscription_plan_id: z.coerce.number().min(1, "Subscription plan is required"),
  modules: z.array(z.string()).min(1, "Select at least one software module"),
  first_user: z.object({
    name: z.string().min(2, "Admin name is required"),
    email: z.string().email("Invalid admin email"),
    phone: z.string().optional(),
    temporary_password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  billing_profile: z.object({
    billing_name: z.string().optional(),
    billing_email: z.string().email("Invalid billing email"),
    billing_phone: z.string().optional(),
    billing_address: z.string().optional(),
    billing_city: z.string().optional(),
    billing_country: z.string().default("Sri Lanka"),
    tax_number: z.string().optional(),
    payment_terms: z.string().optional(),
    currency: z.string().default("LKR"),
  }),
});

type FormValues = z.infer<typeof createCompanySchema>;

const CompanyCreatePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [plans, setPlans] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await getPlatformPlans();
        if (res.success) {
          setPlans(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load subscription plans");
      }
    };
    loadPlans();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    setError,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      country: "Sri Lanka",
      timezone: "Asia/Colombo",
      modules: ["CONTROL_CENTER"],
      first_user: {
        name: "Company Admin",
        temporary_password: "Admin@12345",
      },
      billing_profile: {
        billing_country: "Sri Lanka",
        currency: "LKR",
      },
    },
  });

  const selectedPlanId = watch("subscription_plan_id");
  const selectedModules = watch("modules") || [];

  const handleModuleToggle = (code: string) => {
    const current = [...selectedModules];
    const index = current.indexOf(code);
    if (index > -1) {
      if (code !== "CONTROL_CENTER") {
        current.splice(index, 1);
      }
    } else {
      current.push(code);
    }
    setValue("modules", current);
  };

  const steps = [
    { id: 1, name: "Company Profile", icon: Building },
    { id: 2, name: "Subscription Plan", icon: ShieldAlert },
    { id: 3, name: "Module Access", icon: Database },
    { id: 4, name: "Billing Profile", icon: Receipt },
    { id: 5, name: "First Admin User", icon: Users },
    { id: 6, name: "Database Setup", icon: Database },
    { id: 7, name: "Review & Create", icon: Building },
  ];

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      const res = await createPlatformCompany(values);
      if (res.success) {
        toast.success("Tenant company created and database provisioned successfully!");
        navigate("/platform-admin/companies");
      } else {
        toast.error(res.message || "Failed to create company");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "";
      if (errMsg.toLowerCase().includes("company code") || errMsg.toLowerCase().includes("database name")) {
        setError("company_code", { type: "manual", message: errMsg });
        setCurrentStep(1);
      } else if (errMsg.toLowerCase().includes("company name")) {
        setError("company_name", { type: "manual", message: errMsg });
        setCurrentStep(1);
      } else if (errMsg.toLowerCase().includes("company email")) {
        setError("company_email", { type: "manual", message: errMsg });
        setCurrentStep(1);
      } else if (errMsg.toLowerCase().includes("first user email") || errMsg.toLowerCase().includes("admin email")) {
        setError("first_user.email", { type: "manual", message: errMsg });
        setCurrentStep(5);
      } else {
        toast.error(errMsg || "An error occurred during database creation");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["company_code", "company_name", "company_email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["subscription_plan_id"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["modules"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["billing_profile.billing_email"];
    } else if (currentStep === 5) {
      fieldsToValidate = ["first_user.name", "first_user.email", "first_user.temporary_password"];
    }

    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const availableModules = [
    { code: "CONTROL_CENTER", name: "Control Center", desc: "Access matrix, user access matrix, configuration and audit logs." },
    { code: "FINANCE", name: "Finance & GL", desc: "General ledger, trial balance, opening balances, depreciation runs." },
    { code: "INVENTORY", name: "Inventory Management", desc: "Batch numbers, warehouses, sales returns, suppliers ledger, GRN." },
    { code: "INVOICE_CENTER", name: "Invoice Center", desc: "Customer profiles, print formats, credit notes, sales invoicing." },
  ];

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Create New Tenant Company</h2>
        <p className="text-sm text-slate-400">
          Provision a brand new tenant node, configure company database instance, and map software licenses.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                      isActive
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        : isCompleted
                        ? "bg-indigo-950 border-indigo-700 text-indigo-400"
                        : "bg-slate-950 border-slate-800 text-slate-500"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 hidden md:block">
                    {step.name}
                  </span>
                </div>
                {step.id < steps.length && (
                  <div className="w-8 md:w-16 h-[2px] bg-slate-800 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-slate-950/40 p-6 rounded-xl border border-slate-800 shadow-2xl">
        {/* STEP 1: Company Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Company Identity Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Code *</label>
                <input
                  type="text"
                  {...register("company_code")}
                  placeholder="e.g. OMACX"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.company_code && <p className="text-xs text-red-400 mt-1">{errors.company_code.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  {...register("company_name")}
                  placeholder="e.g. OMACX Pharmaceuticals"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.company_name && <p className="text-xs text-red-400 mt-1">{errors.company_name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Legal Name</label>
                <input
                  type="text"
                  {...register("legal_name")}
                  placeholder="e.g. OMACX Pvt Ltd"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.legal_name && <p className="text-xs text-red-400 mt-1">{errors.legal_name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email address *</label>
                <input
                  type="email"
                  {...register("company_email")}
                  placeholder="admin@omacx.com"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.company_email && <p className="text-xs text-red-400 mt-1">{errors.company_email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Phone</label>
                <input
                  type="text"
                  {...register("company_phone")}
                  placeholder="e.g. 0770000000"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.company_phone && <p className="text-xs text-red-400 mt-1">{errors.company_phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Industry</label>
                <input
                  type="text"
                  {...register("industry")}
                  placeholder="e.g. Pharmaceuticals"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.industry && <p className="text-xs text-red-400 mt-1">{errors.industry.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Subscription Plan */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Select License Subscription Tier *</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setValue("subscription_plan_id", p.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPlanId === p.id
                      ? "bg-indigo-950/20 border-indigo-500 shadow-md shadow-indigo-550/10"
                      : "bg-slate-950 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-white text-base">{p.plan_name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                  </div>
                  <div className="mt-5 border-t border-slate-800/50 pt-4 space-y-1">
                    <p className="text-xs text-slate-400">
                      Price: <span className="font-bold text-white">{p.monthly_price} LKR</span> / mo
                    </p>
                    <p className="text-[10px] text-slate-500">Max Branches: {p.max_branches}</p>
                    <p className="text-[10px] text-slate-500">Max Users: {p.max_users}</p>
                  </div>
                </div>
              ))}
            </div>
            {errors.subscription_plan_id && (
              <p className="text-xs text-red-400">{errors.subscription_plan_id.message}</p>
            )}
          </div>
        )}

        {/* STEP 3: Module Access */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Enable Software Modules *</h3>
            <p className="text-xs text-slate-500">Selected modules will be mapped and visible to the client user role permissions setup.</p>
            <div className="space-y-3">
              {availableModules.map((m) => {
                const isSelected = selectedModules.includes(m.code);
                return (
                  <div
                    key={m.code}
                    onClick={() => handleModuleToggle(m.code)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-950/20 border-indigo-500"
                        : "bg-slate-950 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{m.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                    </div>
                    <div className="h-5 w-5 rounded border border-slate-700 flex items-center justify-center">
                      {isSelected && <div className="h-3 w-3 bg-indigo-500 rounded-sm" />}
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.modules && <p className="text-xs text-red-400">{errors.modules.message}</p>}
          </div>
        )}

        {/* STEP 4: Billing Profile */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Billing Profile Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Billing Name</label>
                <input
                  type="text"
                  {...register("billing_profile.billing_name")}
                  placeholder="e.g. OMACX Financials"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                />
                {errors.billing_profile?.billing_name && (
                  <p className="text-xs text-red-400 mt-1">{errors.billing_profile.billing_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Billing Email *</label>
                <input
                  type="email"
                  {...register("billing_profile.billing_email")}
                  placeholder="finance@omacx.com"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                />
                {errors.billing_profile?.billing_email && (
                  <p className="text-xs text-red-400 mt-1">{errors.billing_profile.billing_email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Address</label>
                <input
                  type="text"
                  {...register("billing_profile.billing_address")}
                  placeholder="Colombo, Sri Lanka"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                />
                {errors.billing_profile?.billing_address && (
                  <p className="text-xs text-red-400 mt-1">{errors.billing_profile.billing_address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Billing Currency</label>
                <select
                  {...register("billing_profile.currency")}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
                {errors.billing_profile?.currency && (
                  <p className="text-xs text-red-400 mt-1">{errors.billing_profile.currency.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: First Admin User */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Company Admin Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">First User Name *</label>
                <input
                  type="text"
                  {...register("first_user.name")}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                />
                {errors.first_user?.name && <p className="text-xs text-red-400 mt-1">{errors.first_user.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">First User Email *</label>
                <input
                  type="email"
                  {...register("first_user.email")}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                />
                {errors.first_user?.email && <p className="text-xs text-red-400 mt-1">{errors.first_user.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Temporary Password *</label>
                <input
                  type="text"
                  {...register("first_user.temporary_password")}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                />
                {errors.first_user?.temporary_password && (
                  <p className="text-xs text-red-400 mt-1">{errors.first_user.temporary_password.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Database Setup */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Multi-Tenant Database Provisioning</h3>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-xs text-slate-400">
              <p>
                Database Name: <span className="font-bold text-white">erp_{watch("company_code") ? watch("company_code").toLowerCase() : "code"}</span>
              </p>
              <p>Database Host: <span className="font-bold text-slate-200">127.0.0.1 (Local MySQL Pool)</span></p>
              <p>Credential Store: <span className="font-bold text-emerald-400">Encrypted (AES-GCM Key Scheme)</span></p>
              <p className="text-[10px] text-indigo-400">Platform controller will auto-execute structural GORM tables creation and database seeders upon creation approval.</p>
            </div>
          </div>
        )}

        {/* STEP 7: Review & Create */}
        {currentStep === 7 && (
          <div className="space-y-4 font-sans text-sm text-slate-300">
            <h3 className="text-base font-semibold text-white">Review Registration Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-slate-800 p-5 rounded-lg bg-slate-900/40">
              <div className="space-y-1">
                <span className="text-xs uppercase text-slate-500 block">Company Code</span>
                <span className="font-bold text-white text-base">{watch("company_code")}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase text-slate-500 block">Company Name</span>
                <span className="font-bold text-slate-200">{watch("company_name")}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase text-slate-500 block">Modules Enabled</span>
                <span className="font-semibold text-indigo-400">{selectedModules.join(", ")}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase text-slate-500 block">First Administrator</span>
                <span className="font-semibold text-slate-200">{watch("first_user.name")} ({watch("first_user.email")})</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between border-t border-slate-850 pt-5">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-1 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-6 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/10 transition-all disabled:opacity-50"
            >
              {submitting ? "Provisioning Tenant Node..." : "Provision Database & Register Company"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CompanyCreatePage;
