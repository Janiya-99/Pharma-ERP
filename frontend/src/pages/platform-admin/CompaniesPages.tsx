import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getPlatformCompanies,
  getPlatformCompany,
  updatePlatformCompany,
  suspendPlatformCompany,
  activatePlatformCompany,
  getPlatformDatabases,
} from "../../api/platformAdminApi";
import { toast } from "sonner";
import { Building, ShieldCheck, Database, Pencil, Trash, FileText, Activity } from "lucide-react";

// 1. CompaniesPage — Lists all tenant companies
export const CompaniesPage = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await getPlatformCompanies();
      if (res.success) {
        setCompanies(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load company registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleToggleStatus = async (company: any) => {
    try {
      if (company.status === "active") {
        await suspendPlatformCompany(company.id);
        toast.warning(`Suspended company code: ${company.company_code}`);
      } else {
        await activatePlatformCompany(company.id);
        toast.success(`Activated company code: ${company.company_code}`);
      }
      loadCompanies();
    } catch (err) {
      toast.error("Status toggle request failed");
    }
  };

  const filtered = companies.filter((c) => {
    if (filter === "active") return c.status === "active";
    if (filter === "suspended") return c.status === "suspended";
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Client Tenant Registry</h2>
          <p className="text-sm text-slate-400">View and manage registered clients, license statuses, and database nodes.</p>
        </div>
        <Link
          to="/platform-admin/companies/create"
          className="py-2 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm shadow-md transition-all"
        >
          Create New Tenant
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {["all", "active", "suspended"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
              filter === tab ? "bg-slate-850 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8 text-sm">Querying database registry...</div>
      ) : filtered.length === 0 ? (
        <div className="text-slate-500 text-center py-8 text-sm">No companies match this filter.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40">
                <th className="p-4">Company Code</th>
                <th className="p-4">Company Name</th>
                <th className="p-4">Database Node</th>
                <th className="p-4">Owner Email</th>
                <th className="p-4">Active Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-bold text-white tracking-wide">
                    <Link to={`/platform-admin/companies/${c.id}`} className="hover:text-indigo-400">
                      {c.company_code}
                    </Link>
                  </td>
                  <td className="p-4 text-slate-200">{c.company_name}</td>
                  <td className="p-4 font-mono text-xs">{c.database_name}</td>
                  <td className="p-4">{c.company_email}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        c.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      to={`/platform-admin/companies/${c.id}`}
                      className="inline-flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      title="Company Details"
                    >
                      <FileText className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/platform-admin/companies/${c.id}/edit`}
                      className="inline-flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      title="Edit Profile"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(c)}
                      className={`inline-flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white ${
                        c.status === "active" ? "hover:text-red-400" : "hover:text-emerald-400"
                      }`}
                      title={c.status === "active" ? "Suspend License" : "Activate License"}
                    >
                      <Activity className="h-4 w-4" />
                    </button>
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

// 2. CompanyDetailsPage — Detailed overview of subscription mapping & modules
export const CompanyDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        const res = await getPlatformCompany(id);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        toast.error("Failed to load company details");
      } finally {
        setLoading(false);
      }
    };
    loadCompany();
  }, [id]);

  if (loading) return <div className="text-slate-500 text-center py-8">Querying database catalog...</div>;
  if (!data) return <div className="text-red-400 text-center py-8">Company profile not found</div>;

  const { company, billing_profile, subscription, modules, database: dbDetails } = data;

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <div className="flex items-center justify-between border-b border-slate-850 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-indigo-650/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{company.company_name} ({company.company_code})</h2>
            <p className="text-sm text-slate-400">Created: {new Date(company.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
            company.status === "active"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {company.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Identity */}
        <div className="p-5 rounded-xl border border-slate-850 bg-slate-950/40 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">Identity Details</h3>
          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Legal Name</span>
            <span className="text-slate-200">{company.legal_name || "N/A"}</span>

            <span className="text-slate-500 font-semibold uppercase">Registration #</span>
            <span className="text-slate-200">{company.registration_number || "N/A"}</span>

            <span className="text-slate-500 font-semibold uppercase">Tax Registry Number</span>
            <span className="text-slate-200">{company.tax_number || "N/A"}</span>

            <span className="text-slate-500 font-semibold uppercase">Industry Sector</span>
            <span className="text-slate-200">{company.industry || "N/A"}</span>
          </div>
        </div>

        {/* Database Properties */}
        <div className="p-5 rounded-xl border border-slate-850 bg-slate-950/40 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">Database Node</h3>
          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Database Name</span>
            <span className="text-slate-200 font-mono">{dbDetails?.database_name || "N/A"}</span>

            <span className="text-slate-500 font-semibold uppercase">Database Host</span>
            <span className="text-slate-200 font-mono">{dbDetails?.database_host || "N/A"}</span>

            <span className="text-slate-500 font-semibold uppercase">Database Username</span>
            <span className="text-slate-200 font-mono">{dbDetails?.database_username || "N/A"}</span>

            <span className="text-slate-500 font-semibold uppercase">Provision Status</span>
            <span className="text-emerald-400 font-bold uppercase">{dbDetails?.database_status || "created"}</span>
          </div>
        </div>

        {/* Subscriptions & Modules */}
        <div className="p-5 rounded-xl border border-slate-850 bg-slate-950/40 space-y-4 md:col-span-2">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">Active Modules & Subscriptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-xs">
              <p className="text-slate-500 font-semibold uppercase">License Start</p>
              <p className="text-slate-200 font-bold">{company.license_start_date ? new Date(company.license_start_date).toLocaleDateString() : "N/A"}</p>
              <p className="text-slate-500 font-semibold uppercase mt-2">License Expiry</p>
              <p className="text-indigo-400 font-bold">{company.license_end_date ? new Date(company.license_end_date).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase block mb-1">Module Mapping</span>
              <div className="flex flex-wrap gap-2">
                {modules.map((m: any) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-850 rounded-lg text-xs font-semibold text-slate-300"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{m.module_code}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. CompanyEditPage — Modify company fields
export const CompanyEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [company, setCompany] = useState<any>({
    company_name: "",
    company_email: "",
    company_phone: "",
    status: "active",
  });

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        const res = await getPlatformCompany(id);
        if (res.success) {
          setCompany(res.data.company);
        }
      } catch (err) {
        toast.error("Failed to load company details");
      } finally {
        setLoading(false);
      }
    };
    loadCompany();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updatePlatformCompany(id, company);
      toast.success("Company profile updated successfully");
      navigate(`/platform-admin/companies/${id}`);
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-slate-500 text-center py-8">Querying database catalog...</div>;

  return (
    <div className="space-y-6 font-sans max-w-xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Edit Company Profile</h2>
        <p className="text-sm text-slate-400">Modify contact information and core system activation status.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-slate-950/40 p-6 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Name</label>
          <input
            type="text"
            value={company.company_name}
            onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Owner Email</label>
          <input
            type="email"
            value={company.company_email}
            onChange={(e) => setCompany({ ...company, company_email: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Phone</label>
          <input
            type="text"
            value={company.company_phone}
            onChange={(e) => setCompany({ ...company, company_phone: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Status</label>
          <select
            value={company.status}
            onChange={(e) => setCompany({ ...company, status: e.target.value })}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

// 4. CompanyDatabasePage — View databases and migration status
export const CompanyDatabasePage = () => {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDbs = async () => {
      try {
        setLoading(true);
        const res = await getPlatformDatabases();
        if (res.success) {
          setDatabases(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load databases list");
      } finally {
        setLoading(false);
      }
    };
    loadDbs();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Database Catalog Overview</h2>
        <p className="text-sm text-slate-400">Monitor multi-tenant GORM schema migration progress, server targets, and connection statuses.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Fetching database schema...</div>
      ) : databases.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No databases provisioned yet.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40 p-4">
                <th className="p-4">Database Name</th>
                <th className="p-4">Database Host</th>
                <th className="p-4">Status</th>
                <th className="p-4">Schema Migrations</th>
                <th className="p-4">Last Migrated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {databases.map((db) => (
                <tr key={db.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-mono font-bold text-white text-xs">{db.database_name}</td>
                  <td className="p-4 font-mono text-xs">{db.database_host}</td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {db.database_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {db.migration_status || "completed"}
                    </span>
                  </td>
                  <td className="p-4 text-xs">
                    {db.last_migrated_at ? new Date(db.last_migrated_at).toLocaleString() : "N/A"}
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
