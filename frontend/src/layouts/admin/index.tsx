import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import routes from "routes";
import type { ERPRoute } from "routes";

function PageLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function AdminLayout(props: { [x: string]: any }) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const handleResize = () => setOpen(window.innerWidth >= 1200);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Find active route name for breadcrumb/topbar
  const currentRoute = React.useMemo(() => {
    for (const route of routes) {
      if (route.layout !== "/admin") continue;
      if (route.children) {
        const child = route.children.find((c) => location.pathname.includes(c.path));
        if (child) return `${route.name} / ${child.name}`;
      } else if (location.pathname.includes(route.path)) {
        return route.name;
      }
    }
    return "Dashboard";
  }, [location.pathname]);

  // Flatten all admin routes for rendering
  const renderRoutes = (routes: ERPRoute[]) => {
    const result: JSX.Element[] = [];
    routes.forEach((route, i) => {
      if (route.layout !== "/admin") return;
      if (route.component) {
        result.push(
          <Route key={i} path={`/${route.path}`} element={route.component} />
        );
      }
      if (route.children) {
        route.children.forEach((child, j) => {
          result.push(
            <Route key={`${i}-${j}`} path={`/${child.path}`} element={child.component} />
          );
        });
      }
    });
    return result;
  };

  document.documentElement.dir = "ltr";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:!bg-navy-900">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Main Content */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-200 ${
          open ? "xl:ml-[260px]" : ""
        }`}
      >
        <Navbar
          onOpenSidenav={() => setOpen(true)}
          brandText={currentRoute}
          secondary={false}
          {...rest}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 pb-6 pt-2">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {renderRoutes(routes)}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
