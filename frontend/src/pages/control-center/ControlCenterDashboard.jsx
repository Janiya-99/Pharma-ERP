import React from "react";
import { useAuth } from "../../auth/AuthContext";
import { Building2, MapPin, Users, Shield, Key } from "lucide-react";

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
    <div className="p-3 rounded-md bg-blue-50">
      <Icon className="h-6 w-6 text-blue-900" />
    </div>
    <div className="ml-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  </div>
);

const ControlCenterDashboard = () => {
  const { user, company, activeBranch, activeSoftware } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control Center Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Company" value={company?.company_name || "-"} icon={Building2} />
        <StatCard title="Active Branch" value={activeBranch?.branch_name || activeBranch?.branch?.branch_name || "-"} icon={MapPin} />
        <StatCard title="Users" value="..." icon={Users} />
        <StatCard title="Roles" value="..." icon={Shield} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Current Session Context</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Active Software</h3>
            <p className="font-semibold text-gray-900 flex items-center">
              {activeSoftware?.software?.software_name || "Platform Base"}
            </p>
          </div>
          <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Access Level</h3>
            <p className="font-semibold text-gray-900 flex items-center">
              <Key className="w-4 h-4 mr-2 text-blue-900" />
              {user?.user_type === "super_admin" ? "Super Administrator" : "Company User"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlCenterDashboard;
