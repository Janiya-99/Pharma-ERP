import React from "react";
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Settings,
  ClipboardCheck,
} from "lucide-react";

export interface ControlCenterNavigationItem {
  label: string;
  route: string;
  permission?: string;
  disabled?: boolean;
}

export interface ControlCenterNavigationGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ControlCenterNavigationItem[];
}

export const controlCenterNavigation: ControlCenterNavigationGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        label: "Dashboard",
        route: "/control-center/dashboard",
        permission: "control_center.dashboard.view",
      },
    ],
  },
  {
    label: "Organization",
    icon: Building2,
    items: [
      {
        label: "Company Profile",
        route: "/control-center/company",
        permission: "control_center.company.view",
      },
      {
        label: "Branches",
        route: "/control-center/branches",
        permission: "control_center.branch.view",
      },
      {
        label: "Departments",
        route: "/control-center/departments",
        permission: "control_center.department.view",
      },
      {
        label: "Designations",
        route: "/control-center/designations",
        permission: "control_center.designation.view",
      },
    ],
  },
  {
    label: "People & Access",
    icon: ShieldCheck,
    items: [
      {
        label: "Users",
        route: "/control-center/users",
        permission: "control_center.user.view",
      },
      {
        label: "Roles",
        route: "/control-center/roles",
        permission: "control_center.role.view",
      },
      {
        label: "Permission Catalogue",
        route: "/control-center/permissions",
        permission: "control_center.permission.view",
      },
      {
        label: "User Assignments",
        route: "/control-center/user-assignments",
        permission: "control_center.user_assignment.view",
      },
      {
        label: "Effective Access",
        route: "/control-center/effective-access",
        permission: "control_center.effective_access.view",
      },
    ],
  },
  {
    label: "System Settings",
    icon: Settings,
    items: [
      {
        label: "Software Modules",
        route: "/control-center/software-modules",
        permission: "control_center.software_module.view",
      },
      {
        label: "Approval Settings",
        route: "/control-center/approval-settings",
        permission: "control_center.approval_setting.view",
      },
      {
        label: "Document Numbering",
        route: "/control-center/document-numbering",
        permission: "control_center.document_numbering.view",
      },
      {
        label: "General Settings",
        route: "/control-center/settings",
        permission: "control_center.settings.view",
      },
    ],
  },
  {
    label: "Audit & Security",
    icon: ClipboardCheck,
    items: [
      {
        label: "Audit Logs",
        route: "/control-center/audit-logs",
        permission: "control_center.audit_log.view",
      },
      {
        label: "Access Audit",
        route: "/control-center/access-audit",
        permission: "control_center.access_audit.view",
      },
      {
        label: "Login History",
        route: "/control-center/login-history",
        permission: "control_center.login_history.view",
      },
      {
        label: "Security Settings",
        route: "/control-center/security-settings",
        permission: "control_center.security_settings.view",
      },
    ],
  },
];
