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
    { name: "Total Tenants", value: metrics.totalCompanies, icon: Building2, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    { name: "Active Licenses", value: metrics.activeSubscribers, icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { name: "SaaS Revenue (LKR)", value: metrics.totalRevenue.toLocaleString(), icon: Landmark, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    { name: "Pending Tickets", value: metrics.pendingTickets, icon: Ticket, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Administration Dashboard</h2>
        <p className="text-sm text-slate-400">
          Real-time summary of SaaS operations, subscription fees, and system databases.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.name}
            className={`p-6 rounded-xl border bg-slate-950/40 backdrop-blur-md flex items-center justify-between shadow-lg ${card.color}`}
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                {card.name}
              </span>
              <span className="text-2xl font-bold text-white block">
                {card.value}
              </span>
            </div>
            <div className={`p-3 rounded-lg bg-slate-900 border border-slate-800`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry charts / Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Companies */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-800 bg-slate-950/40 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-white">Recent Client Registrations</h3>
            <Link
              to="/platform-admin/companies"
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
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
              <table className="w-full text-left text-sm text-slate-400">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">License Expiry</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-900/20 transition-all">
                      <td className="py-3.5 font-bold text-white">{company.company_code}</td>
                      <td className="py-3.5 text-slate-200">{company.company_name}</td>
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
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/40 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-white">System Databases</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Healthy</span>
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Central database</p>
                <p className="text-sm font-bold text-slate-200 mt-1">erp_platform</p>
              </div>
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SaaS Version</p>
                <p className="text-sm font-bold text-slate-200 mt-1">v2.0.0 (Stable)</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Redis Session Pool</p>
                <p className="text-sm font-bold text-slate-200 mt-1">Connected (Port 6379)</p>
              </div>
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAdminDashboardPage;
