import React, { useState, useEffect } from "react";
import { getPlatformCompanies, getPlatformSubscriptions, getPlatformInvoices } from "../../api/platformAdminApi";
import { Building2, Landmark, ShieldCheck, Activity, Users, Ticket, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const PlatformAdminDashboardPage = () => {
  const [metrics, setMetrics] = useState({
    totalCompanies: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    pendingTickets: 3, // Mocked support ticket alerts
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const compRes = await getPlatformCompanies();
        const subRes = await getPlatformSubscriptions();
        const invRes = await getPlatformInvoices();

        const activeCount = compRes.data?.filter((c: any) => c.status === "active").length || 0;
        
        let revenue = 0;
        invRes.data?.forEach((i: any) => {
          if (i.invoice_status === "paid") {
            revenue += i.total_amount;
          }
        });

        setMetrics({
          totalCompanies: compRes.data?.length || 0,
          activeSubscribers: activeCount,
          totalRevenue: revenue,
          pendingTickets: 3,
        });

        setCompanies(compRes.data?.slice(0, 5) || []);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const cards = [
    { name: "Total Tenants", value: metrics.totalCompanies, icon: Building2, color: "text-indigo-600 bg-indigo-50" },
    { name: "Active Licenses", value: metrics.activeSubscribers, icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
    { name: "SaaS Revenue (LKR)", value: metrics.totalRevenue.toLocaleString(), icon: Landmark, color: "text-indigo-600 bg-indigo-50" },
    { name: "Pending Tickets", value: metrics.pendingTickets, icon: Ticket, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Administration Dashboard</h2>
        <p className="text-sm text-slate-500">
          Real-time summary of SaaS operations, subscription fees, and system databases.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.name}
            className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ring-inset ring-slate-50 hover:ring-indigo-50"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {card.name}
              </span>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900 block">
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry charts / Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Companies */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-100 bg-white shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Client Registrations</h3>
            <Link
              to="/platform-admin/companies"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-sm">Querying database registry...</div>
          ) : companies.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">No companies registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">License Expiry</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-3.5 font-bold text-slate-900">{company.company_code}</td>
                      <td className="py-3.5 text-slate-700">{company.company_name}</td>
                      <td className="py-3.5">{company.company_email}</td>
                      <td className="py-3.5">
                        {company.license_end_date
                          ? new Date(company.license_end_date).toLocaleDateString()
                          : "Lifetime"}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            company.status === "active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-amber-50 text-amber-600 border border-amber-200"
                          }`}
                        >
                          {company.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System telemetry */}
        <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">System Databases</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Healthy</span>
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Central database</p>
                <p className="text-sm font-bold text-slate-700 mt-1">erp_platform</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50">
                <Activity className="h-4 w-4 text-indigo-600" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SaaS Version</p>
                <p className="text-sm font-bold text-slate-700 mt-1">v2.0.0 (Stable)</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Redis Session Pool</p>
                <p className="text-sm font-bold text-slate-700 mt-1">Connected (Port 6379)</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50">
                <Activity className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAdminDashboardPage;
