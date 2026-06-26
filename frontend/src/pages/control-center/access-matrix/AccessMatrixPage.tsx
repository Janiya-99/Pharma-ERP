import React, { useState } from "react";
import { Grid3X3, Users, MapPin, Boxes, ShieldCheck } from "lucide-react";
import Breadcrumbs from "../../../components/common/Breadcrumbs";

// Import existing page
import UserAccessMatrixPage from "../user-access-matrix/UserAccessMatrixPage";

const TABS = [
  { key: "user", label: "User Access Matrix", icon: <Users className="h-4 w-4" /> },
  { key: "branch", label: "Branch Access Matrix", icon: <MapPin className="h-4 w-4" /> },
  { key: "software", label: "Software Access Matrix", icon: <Boxes className="h-4 w-4" /> },
  { key: "role", label: "Role Access Matrix", icon: <ShieldCheck className="h-4 w-4" /> },
];

/** Placeholder skeleton for matrix tabs not yet implemented */
const MatrixPlaceholder = ({ title, description }: { title: string; description: string }) => (
  <div className="card-premium">
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100">
        <Grid3X3 className="h-6 w-6 text-gray-300" />
      </div>
      <div className="text-center max-w-sm">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
      <span className="badge-status badge-inactive mt-2">Coming Soon</span>
    </div>
  </div>
);

const AccessMatrixPage = () => {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className="page-content">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Control Center", href: "/admin/control-center/users" },
          { label: "Access Matrix" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Access Matrix</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage access permissions across users, branches, software modules, and roles
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

      {/* Tab Content */}
      <div>
        {activeTab === "user" && <UserAccessMatrixPage />}
        {activeTab === "branch" && (
          <MatrixPlaceholder
            title="Branch Access Matrix"
            description="Cross-reference view of which users have access to each branch. This matrix will be available in a future update."
          />
        )}
        {activeTab === "software" && (
          <MatrixPlaceholder
            title="Software Access Matrix"
            description="Cross-reference view of which users have access to each software module. This matrix will be available in a future update."
          />
        )}
        {activeTab === "role" && (
          <MatrixPlaceholder
            title="Role Access Matrix"
            description="Cross-reference view of role assignments across users and modules. This matrix will be available in a future update."
          />
        )}
      </div>
    </div>
  );
};

export default AccessMatrixPage;
