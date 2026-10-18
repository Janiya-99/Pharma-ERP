import { Outlet, useLocation } from "react-router-dom";
import { useState, createContext, useContext, useEffect, Suspense } from "react";
import type { CSSProperties } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import LoadingScreen from "../common/LoadingScreen";
import RouteProgressBar from "../common/RouteProgressBar";
import { AiCopilotProvider } from "../../context/AiCopilotContext";
import { GlobalAiCopilot } from "../common/GlobalAiCopilot";
import { useAuth } from "../../auth/AuthContext";

// ── Sidebar State Context ──
interface SidebarContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  desktopExpanded: boolean;
  setDesktopExpanded: (expanded: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  mobileOpen: false,
  setMobileOpen: () => {},
  desktopExpanded: false,
  setDesktopExpanded: () => {},
});

export const useSidebarState = () => useContext(SidebarContext);

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(() => {
    try {
      return localStorage.getItem("erp_sidebar_pinned") !== "false";
    } catch {
      return true;
    }
  });
  const location = useLocation();
  const { activeSoftware, switchActiveSoftware } = useAuth();

  // Automatically keep activeSoftware in sync with the current URL workspace route
  useEffect(() => {
    const path = location.pathname;
    let targetCode: string | null = null;
    if (path.startsWith("/control-center")) targetCode = "CONTROL_CENTER";
    else if (path.startsWith("/finance")) targetCode = "FINANCE";
    else if (path.startsWith("/inventory")) targetCode = "INVENTORY";
    else if (path.startsWith("/invoice-center")) targetCode = "INVOICE_CENTER";
    else if (path.startsWith("/compliance-center")) targetCode = "COMPLIANCE_CENTER";

    if (targetCode && activeSoftware?.software_code !== targetCode && switchActiveSoftware) {
      switchActiveSoftware(targetCode);
    }
    // Auto-dismiss mobile sidebar when navigating to new page for instant smooth mobile experience
    setMobileOpen(false);
  }, [location.pathname, activeSoftware?.software_code, switchActiveSoftware]);

  return (
    <SidebarContext.Provider
      value={{ mobileOpen, setMobileOpen, desktopExpanded, setDesktopExpanded }}
    >
      <AiCopilotProvider>
        <RouteProgressBar />
        <div
          className="grid h-screen grid-cols-[0_1fr] gap-0 overflow-hidden font-sans text-[#1F2937] transition-[grid-template-columns] duration-300 lg:grid-cols-[var(--sidebar-width)_1fr]"
          style={
            {
              "--sidebar-width": desktopExpanded ? "260px" : "72px",
            } as CSSProperties
          }
        >
          <Sidebar />
          <div className="flex min-w-0 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth bg-slate-50 flex flex-col">
              <div className="flex flex-col min-h-full flex-1 w-full">
                <div className="page-content flex-1 space-y-8 pb-8 font-sans">
                  <Suspense fallback={<LoadingScreen mode="page" />}>
                    <Outlet />
                  </Suspense>
                </div>
                <footer className="mt-auto h-14 shrink-0 border-t px-6 md:px-8 flex items-center shadow-[0_-1px_3px_rgba(0,0,0,0.02)] relative z-10 bg-white" style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}>
                  <div className="w-full flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row pr-4 sm:pr-24 lg:pr-28">
                    <span>© {new Date().getFullYear()} Ceylon Med Global ERP. All rights reserved.</span>
                    <span className="flex items-center gap-2">
                      <span>
                        Developed by{" "}
                        <span className="font-bold text-slate-800 hover:text-indigo-600 transition-colors cursor-default">PIXANDCO</span>
                      </span>
                    </span>
                  </div>
                </footer>
              </div>
            </main>
          </div>
        </div>
        <GlobalAiCopilot />
      </AiCopilotProvider>
    </SidebarContext.Provider>
  );
};

export default AppLayout;
