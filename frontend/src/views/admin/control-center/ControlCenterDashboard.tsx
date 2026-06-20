import React, { useEffect, useState } from "react";
import Widget from "components/widget/Widget";
import { MdOutlineAdminPanelSettings, MdPeople, MdSecurity, MdStore, MdCheckCircle } from "react-icons/md";
import api from "lib/api";
import Card from "components/card";
import MiniCalendar from "components/calendar/MiniCalendar";

export default function ControlCenterDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    roles: 0,
    branches: 0,
    companies: 0,
  });

  const fetchStats = async () => {
    try {
      const [users, roles, branches, companies] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/roles"),
        api.get("/admin/branches"),
        api.get("/admin/companies"),
      ]);

      setStats({
        users: users.data.data?.length || 0,
        roles: roles.data.data?.length || 0,
        branches: branches.data.data?.length || 0,
        companies: companies.data.data?.length || 0,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Realtime update (every 10 seconds)
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Control Center Dashboard</h1>
        <p className="text-sm text-gray-400">Realtime overview of system access and structure</p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
        <Widget
          icon={<MdPeople className="h-6 w-6 text-brand-500 dark:text-white" />}
          title="Total Users"
          subtitle={stats.users.toString()}
        />
        <Widget
          icon={<MdSecurity className="h-6 w-6 text-brand-500 dark:text-white" />}
          title="Total Roles"
          subtitle={stats.roles.toString()}
        />
        <Widget
          icon={<MdStore className="h-6 w-6 text-brand-500 dark:text-white" />}
          title="Active Branches"
          subtitle={stats.branches.toString()}
        />
        <Widget
          icon={<MdOutlineAdminPanelSettings className="h-6 w-6 text-brand-500 dark:text-white" />}
          title="Companies"
          subtitle={stats.companies.toString()}
        />
      </div>

      {/* Detailed Section */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card extra={"w-full h-full p-4 sm:p-6"}>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">Recent Admin Activity</h4>
            <button className="text-sm font-bold text-brand-500 hover:text-brand-400">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { text: "User Kamali Fernando was assigned 'System Admin' role", time: "2 mins ago" },
              { text: "New branch 'Kandy Central' was created", time: "1 hour ago" },
              { text: "Permissions updated for 'Warehouse Manager'", time: "3 hours ago" },
              { text: "Company settings modified by admin", time: "5 hours ago" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-navy-800 p-3 rounded-xl border border-gray-100 dark:border-navy-700">
                <div className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-400/10 flex items-center justify-center">
                  <MdCheckCircle className="h-4 w-4 text-brand-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-700 dark:text-white">{log.text}</p>
                  <p className="text-xs text-gray-500">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card extra={"w-full h-full p-4 sm:p-6"}>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">Active Users by Role</h4>
            <button className="text-sm font-bold text-brand-500 hover:text-brand-400">Details</button>
          </div>
          <div className="flex flex-col gap-4 mt-2">
            {[
              { role: "System Admin", count: 3, width: "10%" },
              { role: "Sales Manager", count: 12, width: "40%" },
              { role: "Warehouse Staff", count: 24, width: "80%" },
              { role: "Finance Officer", count: 5, width: "20%" },
            ].map((role, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-navy-700 dark:text-white">{role.role}</span>
                  <span className="text-sm font-bold text-navy-700 dark:text-white">{role.count}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-navy-700 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: role.width }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
        <MiniCalendar />
      </div>
    </div>
  );
}
