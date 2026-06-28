import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Building2, MapPin, Briefcase, Award } from "lucide-react";
import Breadcrumbs from "../../../components/common/Breadcrumbs";

// Import the actual page components from components folder
import CompanyPage from "./components/CompanyPage";
import BranchPage from "./components/BranchPage";
import DesignationsPage from "./components/DesignationsPage";

// Import from pages folder for departments
import DepartmentsPage from "../departments/DepartmentsPage";

const TABS = [
  { key: "company", label: "Company", icon: <Building2 className="h-4 w-4" /> },
  { key: "branches", label: "Branches", icon: <MapPin className="h-4 w-4" /> },
  {
    key: "departments",
    label: "Departments",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    key: "designations",
    label: "Designations",
    icon: <Award className="h-4 w-4" />,
  },
];

const OrganizationSetupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from pathname
  const getActiveTabFromPath = (pathname: string) => {
    if (pathname.includes("branches")) return "branches";
    if (pathname.includes("departments")) return "departments";
    if (pathname.includes("designations")) return "designations";
    return "company";
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  const setActiveTab = (tabKey: string) => {
    navigate(`/admin/control-center/${tabKey}`);
  };

  return (
    <div className="page-content">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Control Center", href: "/admin/control-center/company" },
          { label: "Organization Setup" },
        ]}
      />

      {/* Header */}
      <div className="mb-6 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Organization Setup
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your company profile, branches, departments, and designations
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card-premium mb-6">
        <div className="flex items-center gap-1 overflow-x-auto p-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-premium flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? "tab-premium-active"
                  : "tab-premium-default"
              }`}
            >
              <span
                className={
                  activeTab === tab.key ? "text-indigo-600" : "text-gray-400"
                }
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content — each page component is self-contained */}
      <div>
        {activeTab === "company" && <CompanyPage />}
        {activeTab === "branches" && <BranchPage />}
        {activeTab === "departments" && <DepartmentsPage />}
        {activeTab === "designations" && <DesignationsPage />}
      </div>
    </div>
  );
};

export default OrganizationSetupPage;
