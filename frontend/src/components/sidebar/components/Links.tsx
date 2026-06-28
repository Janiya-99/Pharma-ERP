/* eslint-disable */
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import {
  Building2,
  Users,
  ShieldCheck,
  Grid3X3,
  Boxes,
  Settings,
  FileSearch,
  LogIn,
} from "lucide-react";
import type { ERPRoute, SubRoute } from "routes";

// Map child names to icons for the Control Center sidebar
const CHILD_ICONS: Record<string, React.ReactNode> = {
  "Organization Setup": <Building2 className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  "Roles & Permissions": <ShieldCheck className="h-4 w-4" />,
  "User Access": <Grid3X3 className="h-4 w-4" />,
  "Software Modules": <Boxes className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
  "Audit Logs": <FileSearch className="h-4 w-4" />,
  "Login Logs": <LogIn className="h-4 w-4" />,
};

export const SidebarLinks = ({
  routes,
}: {
  routes: ERPRoute[];
}): JSX.Element => {
  const location = useLocation();
  const [openModule, setOpenModule] = useState<string | null>(() => {
    // Auto-open the module matching current path
    const match = routes.find(
      (r: any) =>
        r.children &&
        r.children.some((c: any) => location.pathname.includes(c.path))
    );
    return match?.path ?? null;
  });

  const isActive = (path: string) => location.pathname.includes(path);
  const isModuleActive = (route: ERPRoute) => {
    if (route.children)
      return route.children.some((c: any) => isActive(c.path));
    return isActive(route.path);
  };

  const adminRoutes = routes.filter(
    (r: any) => r.layout === "/admin" && !r.secondary
  );

  // Group children by section for rendering section headers
  const groupChildrenBySections = (children: SubRoute[]) => {
    const groups: { section: string | null; items: SubRoute[] }[] = [];
    let currentSection: string | null = null;

    children.forEach((child: any) => {
      if (child.hide) return; // Skip hidden routes

      if (child.section && child.section !== currentSection) {
        currentSection = child.section;
        groups.push({ section: currentSection, items: [child] });
      } else {
        if (groups.length === 0) {
          groups.push({ section: null, items: [child] });
        } else {
          groups[groups.length - 1].items.push(child);
        }
      }
    });

    return groups;
  };

  return (
    <ul className="flex flex-col gap-0.5 px-3">
      {adminRoutes.map((route: any) => {
        const active = isModuleActive(route);

        // Flat route (e.g. Dashboard)
        if (!route.children) {
          return (
            <li key={route.path}>
              <Link
                to={`${route.layout}/${route.path}`}
                className={`sidebar-item ${
                  active ? "sidebar-item-active" : "sidebar-item-default"
                }`}
              >
                <span
                  className={`${active ? "text-indigo-600" : "text-gray-400"}`}
                >
                  {route.icon}
                </span>
                {route.name}
                {active && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                )}
              </Link>
            </li>
          );
        }

        // Module with sub-menu (grouped sections)
        const isOpen = openModule === route.path;
        const sectionGroups = groupChildrenBySections(route.children);

        return (
          <li key={route.path}>
            <button
              onClick={() => setOpenModule(isOpen ? null : route.path)}
              className={`sidebar-item w-full ${
                active
                  ? "font-semibold text-indigo-700"
                  : "sidebar-item-default"
              }`}
            >
              <span
                className={`${active ? "text-indigo-600" : "text-gray-400"}`}
              >
                {route.icon}
              </span>
              <span className="flex-1 text-left">{route.name}</span>
              <MdChevronRight
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* Sub-menu accordion */}
            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="ml-3 mt-0.5 border-l border-gray-100 pl-2 dark:border-navy-600">
                {sectionGroups.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    {/* Section header */}
                    {group.section && (
                      <div className="sidebar-section-label">
                        {group.section}
                      </div>
                    )}

                    {/* Section items */}
                    <ul className="flex flex-col gap-0.5">
                      {group.items.map((child: any) => {
                        const childIcon = CHILD_ICONS[child.name];
                        const childActive = isActive(child.path);

                        return (
                          <li key={child.path}>
                            <Link
                              to={`/admin/${child.path}`}
                              className={`sidebar-item ${
                                childActive
                                  ? "sidebar-item-active"
                                  : "sidebar-item-default"
                              }`}
                            >
                              {childIcon && (
                                <span
                                  className={
                                    childActive
                                      ? "text-indigo-600"
                                      : "text-gray-400"
                                  }
                                >
                                  {childIcon}
                                </span>
                              )}
                              <span>{child.name}</span>
                              {childActive && (
                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarLinks;
