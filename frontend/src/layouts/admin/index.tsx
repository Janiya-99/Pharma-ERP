import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import routes from "routes";
import type { ERPRoute } from "routes";

function PageLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="border-slate-100 absolute inset-0 animate-spin rounded-full border-[3.5px] border-r-indigo-600 border-t-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]" />
          <div className="border-slate-50 absolute inset-2 animate-[spin_2s_linear_infinite_reverse] rounded-full border-[2.5px] border-b-blue-500 border-l-indigo-500" />
        </div>
        <p className="text-slate-500 animate-pulse text-sm font-semibold tracking-wide">
          Loading workspace...
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout(props: { [x: string]: any }) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);

  // Landing page renders full-screen without sidebar/topbar
  const isLandingPage = location.pathname === "/admin/home";

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
        const child = route.children.find((c: unknown) =>
          location.pathname.includes(c.path)
        );
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
    routes.forEach((route: unknown, i: unknown) => {
      if (route.layout !== "/admin") return;
      if (route.component) {
        result.push(
          <Route key={i} path={route.path} element={route.component} />
        );
      }
      if (route.children) {
        route.children.forEach((child: unknown, j: unknown) => {
          result.push(
            <Route
              key={`${i}-${j}`}
              path={child.path}
              element={child.component}
            />
          );
        });
      }
    });
    return result;
  };

  document.documentElement.dir = "ltr";

  // Full-screen layout for landing page (no sidebar/topbar)
  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full bg-[#0b1437]">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {renderRoutes(routes)}
            <Route path="/" element={<Navigate to="/admin/home" replace />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  // Standard admin layout with sidebar + topbar
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-gray-50 dark:!bg-navy-900">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Floating Sidebar Toggle Button (Desktop only) */}
      <button
        onClick={() => setOpen(!open)}
        className={`absolute top-20 z-50 flex hidden h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:text-gray-700 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700 dark:hover:text-white xl:flex ${
          open ? "left-[246px]" : "left-4"
        }`}
      >
        {open ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
      </button>

      {/* Main Content */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-200 ${
          open ? "xl:ml-[260px]" : ""
        }`}
      >
        <Navbar
          onOpenSidenav={() => setOpen(!open)}
          brandText={currentRoute}
          secondary={false}
          {...rest}
        />

        <main className="flex h-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-2 md:px-6">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {renderRoutes(routes)}
              <Route path="/" element={<Navigate to="/admin/home" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
