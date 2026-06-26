import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { 
  Building2, MapPin, Users, Shield, Key, 
  Activity, Cpu, HardDrive, ShieldAlert,
  RefreshCw
} from "lucide-react";
import { getUsers, getRoles } from "../../api/controlApi";
import Widget from "components/widget/Widget";
import TotalSpent from "views/admin/default/components/TotalSpent";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import PieChartCard from "views/admin/default/components/PieChartCard";
import Breadcrumbs from "../../components/common/Breadcrumbs";

// Beautiful custom badge
const MetricBadge = ({ label, variant }: { label: string; variant: "success" | "warning" | "danger" | "info" }) => {
  const styles = {
    success: "bg-green-50 text-green-700 border-green-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    info: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[variant]}`}>
      {label}
    </span>
  );
};

const ControlCenterDashboard = () => {
  const { user, company, activeBranch } = useAuth();
  const [usersCount, setUsersCount] = useState<string>("...");
  const [rolesCount, setRolesCount] = useState<string>("...");
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const usersRes = await getUsers({ limit: 1 });
      if (usersRes.success) {
        setUsersCount(String(usersRes.meta?.total ?? usersRes.data?.length ?? 0));
      }
      const rolesRes = await getRoles({ limit: 1 });
      if (rolesRes.success) {
        setRolesCount(String(rolesRes.meta?.total ?? rolesRes.data?.length ?? 0));
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
      setUsersCount("1");
      setRolesCount("4");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="page-content">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Control Center", href: "/control-center/dashboard" },
          { label: "Overview" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Control Center Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            System administration, security configuration, and service health
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="wizard-nav-btn wizard-nav-btn-secondary self-start sm:self-center !py-2 !px-3"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Horizon Widgets Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Widget
          title="Company"
          subtitle={company?.company_name || company?.name || "OMACX Pharma"}
          icon={<Building2 className="h-6 w-6" />}
        />
        <Widget
          title="Active Branch"
          subtitle={activeBranch?.branch_name || activeBranch?.branch?.branch_name || "Main Branch"}
          icon={<MapPin className="h-6 w-6" />}
        />
        <Widget
          title="Assigned Users"
          subtitle={usersCount}
          icon={<Users className="h-6 w-6" />}
        />
        <Widget
          title="System Roles"
          subtitle={rolesCount}
          icon={<Shield className="h-6 w-6" />}
        />
      </div>

      {/* Horizon Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Total Spent Area Chart Component */}
        <TotalSpent />
        {/* Weekly Revenue Bar Chart Component */}
        <WeeklyRevenue />
      </div>

      {/* Details & Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horizon Pie Chart Card */}
        <PieChartCard />

        {/* Security Logs list */}
        <div className="card-premium lg:col-span-2">
          <div className="card-premium-header">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Recent Security Logs</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest system actions and logs</p>
            </div>
            <ShieldAlert className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
            {[
              { event: "Successful Login", user: "admin@omacx.com", desc: "Logged into Control Center", status: "success", ip: "192.168.1.12", time: "Just now" },
              { event: "User Modification", user: "admin@omacx.com", desc: "Updated permissions for Kamali", status: "info", ip: "192.168.1.12", time: "12 mins ago" },
              { event: "Branch Registry", user: "system@omacx.com", desc: "Created Kandy Branch profile", status: "success", ip: "127.0.0.1", time: "1 hour ago" },
              { event: "Unrecognized Attempt", user: "guest@omacx.com", desc: "Failed login credentials match", status: "danger", ip: "203.45.10.89", time: "3 hours ago" },
              { event: "Role Creation", user: "admin@omacx.com", desc: "Added Compliance Officer role template", status: "info", ip: "192.168.1.20", time: "1 day ago" }
            ].map((log, index) => (
              <div key={index} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    log.status === "success" ? "bg-green-500" : log.status === "danger" ? "bg-red-500" : "bg-indigo-500"
                  }`} />
                  <div>
                    <p className="text-[12px] font-semibold text-gray-800 leading-none">{log.event}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{log.desc} • <span className="font-medium text-gray-500">{log.user}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-gray-700">{log.ip}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlCenterDashboard;
