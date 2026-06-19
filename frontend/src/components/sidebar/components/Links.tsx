/* eslint-disable */
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import type { ERPRoute } from "routes";

export const SidebarLinks = ({ routes }: { routes: ERPRoute[] }): JSX.Element => {
  const location = useLocation();
  const [openModule, setOpenModule] = useState<string | null>(() => {
    // Auto-open the module matching current path
    const match = routes.find(
      (r) => r.children && r.children.some((c) => location.pathname.includes(c.path))
    );
    return match?.path ?? null;
  });

  const isActive = (path: string) => location.pathname.includes(path);
  const isModuleActive = (route: ERPRoute) => {
    if (route.children) return route.children.some((c) => isActive(c.path));
    return isActive(route.path);
  };

  const adminRoutes = routes.filter((r) => r.layout === "/admin");

  return (
    <ul className="flex flex-col gap-0.5 px-3">
      {adminRoutes.map((route) => {
        const active = isModuleActive(route);

        // Flat route (e.g. Dashboard)
        if (!route.children) {
          return (
            <li key={route.path}>
              <Link
                to={`${route.layout}/${route.path}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? "bg-brand-50 text-brand-600 dark:bg-navy-700 dark:text-white font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-navy-700 dark:text-gray-400"
                  }`}
              >
                <span className={`${active ? "text-brand-600 dark:text-white" : "text-gray-400"}`}>
                  {route.icon}
                </span>
                {route.name}
                {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
              </Link>
            </li>
          );
        }

        // Module with sub-menu
        const isOpen = openModule === route.path;
        return (
          <li key={route.path}>
            <button
              onClick={() => setOpenModule(isOpen ? null : route.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active
                  ? "text-brand-600 dark:text-white font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-navy-700 dark:text-gray-400"
                }`}
            >
              <span className={`${active ? "text-brand-600 dark:text-white" : "text-gray-400"}`}>
                {route.icon}
              </span>
              <span className="flex-1 text-left">{route.name}</span>
              <MdChevronRight
                className={`h-4 w-4 transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-90" : ""}`}
              />
            </button>

            {/* Sub-menu accordion */}
            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="ml-8 mt-0.5 flex flex-col gap-0.5 border-l border-gray-100 dark:border-navy-600 pl-3">
                {route.children.map((child) => (
                  <li key={child.path}>
                    <Link
                      to={`/admin/${child.path}`}
                      className={`block py-2 px-2 rounded-md text-[13px] font-medium transition-colors
                        ${isActive(child.path)
                          ? "text-brand-600 dark:text-white font-semibold"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                        }`}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarLinks;
