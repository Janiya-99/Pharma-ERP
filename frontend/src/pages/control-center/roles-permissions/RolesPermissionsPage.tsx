import Breadcrumbs from "../../../components/common/Breadcrumbs";

// Import existing page content from pages directory
import RolesPage from "../roles/RolesPage";

const RolesPermissionsPage = () => {
  return (
    <div className="page-content">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Control Center", href: "/admin/control-center/users" },
          { label: "Roles" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Roles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Define and manage roles for the system
          </p>
        </div>
      </div>

      <div>
        <RolesPage />
      </div>
    </div>
  );
};

export default RolesPermissionsPage;
