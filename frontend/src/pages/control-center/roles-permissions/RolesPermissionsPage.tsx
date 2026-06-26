import React, { useState } from "react";
import { ShieldCheck, Key, Grid3X3 } from "lucide-react";
import Breadcrumbs from "../../../components/common/Breadcrumbs";

// Import existing page content from pages directory
import RolesPage from "../roles/RolesPage";
import PermissionsPage from "../permissions/PermissionsPage";
import RolePermissionMatrixPage from "../role-permission-matrix/RolePermissionMatrixPage";

const TABS = [
  { key: "roles", label: "Roles", icon: <ShieldCheck className="h-4 w-4" /> },
  { key: "permissions", label: "Permissions", icon: <Key className="h-4 w-4" /> },
  { key: "matrix", label: "Role Permission Matrix", icon: <Grid3X3 className="h-4 w-4" /> },
];

const RolesPermissionsPage = () => {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <div className="page-content">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Control Center", href: "/admin/control-center/users" },
          { label: "Roles & Permissions" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Define roles, manage permissions, and configure the role-permission matrix
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card-premium mb-6">
        <div className="flex items-center gap-1 p-1.5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-premium flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.key ? "tab-premium-active" : "tab-premium-default"
              }`}
            >
              <span className={activeTab === tab.key ? "text-indigo-600" : "text-gray-400"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content — each page is self-contained */}
      <div>
        {activeTab === "roles" && <RolesPage />}
        {activeTab === "permissions" && <PermissionsPage />}
        {activeTab === "matrix" && <RolePermissionMatrixPage />}
      </div>
    </div>
  );
};

export default RolesPermissionsPage;
