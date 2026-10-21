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
        permission: "control.company.view",
      },
      {
        label: "Branches",
        route: "/control-center/branches",
        permission: "control.branch.view",
      },
      {
        label: "Departments",
        route: "/control-center/departments",
        permission: "control.department.view",
      },
      {
        label: "Designations",
        route: "/control-center/designations",
        permission: "control.designation.view",
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
        permission: "control.user.view",
      },
      {
        label: "Roles",
        route: "/control-center/roles",
        permission: "control.role.view",
      },
      {
        label: "Permission Catalogue",
        route: "/control-center/permissions",
        permission: "control.permission.view",
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
        permission: "control.access.software.view",
      },
      {
        label: "Approval Settings",
        route: "/control-center/approval-settings",
        permission: "control.approval_workflow.view",
      },
      {
        label: "Document Numbering",
        route: "/control-center/document-numbering",
        permission: "control.document_numbering.view",
      },
      {
        label: "General Settings",
        route: "/control-center/settings",
        permission: "control.settings.view",
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
        permission: "control.audit.view",
      },
      {
        label: "Access Audit",
        route: "/control-center/access-audit",
        permission: "control.audit.view",
      },
      {
        label: "Login History",
        route: "/control-center/login-history",
        permission: "control.login_logs.view",
      },
      {
        label: "Security Settings",
        route: "/control-center/security-settings",
        permission: "control.security_settings.view",
      },
    ],
  },
];
