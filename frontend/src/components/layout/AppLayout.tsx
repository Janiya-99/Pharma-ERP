import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, createContext, useContext, useEffect, Suspense } from "react";
import type { CSSProperties } from "react";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import LoadingScreen from "../common/LoadingScreen";
import RouteProgressBar from "../common/RouteProgressBar";
import { AiCopilotProvider } from "../../context/AiCopilotContext";
import { GlobalAiCopilot } from "../common/GlobalAiCopilot";
import { TooltipProvider } from "../ui/tooltip";
import { useAuth } from "../../auth/AuthContext";

// ── Sidebar State Context ──
interface SidebarContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  desktopExpanded: boolean;
  setDesktopExpanded: (expanded: boolean) => void;
  desktopHovered: boolean;
  setDesktopHovered: (hovered: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  mobileOpen: false,
  setMobileOpen: () => {},
  desktopExpanded: false,
  setDesktopExpanded: () => {},
  desktopHovered: false,
  setDesktopHovered: () => {},
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
  const [desktopHovered, setDesktopHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, softwareModules, activeSoftware, switchActiveSoftware } = useAuth();

  const isEffectiveExpanded = desktopExpanded || desktopHovered;

  // Automatically keep activeSoftware in sync with the current URL workspace route
  useEffect(() => {
    const path = location.pathname;
    let targetCode: string | null = null;
    if (path.startsWith("/control-center")) targetCode = "CONTROL_CENTER";
    else if (path.startsWith("/finance")) targetCode = "FINANCE";
    else if (path.startsWith("/inventory")) targetCode = "INVENTORY";
    else if (path.startsWith("/invoice-center")) targetCode = "INVOICE_CENTER";
    else if (path.startsWith("/compliance-center") || path.startsWith("/compliance")) targetCode = "COMPLIANCE_CENTER";

    if (
      targetCode &&
      user &&
      user.user_type !== "super_admin" &&
      softwareModules &&
      softwareModules.length > 0
    ) {
      const hasAccess = softwareModules.some((sm: any) => {
        const c = sm.software_code || sm.code;
        return (
          c === targetCode ||
          (targetCode === "COMPLIANCE_CENTER" && (c === "COMPLIANCE" || c === "COMPLIANCE_CENTER"))
        );
      });
      if (!hasAccess) {
        toast.error(`You do not have permission to access the ${targetCode.replace("_", " ")} module.`);
        navigate("/modules", { replace: true });
        return;
      }
    }

    const currentCode = activeSoftware?.software_code || activeSoftware?.code;
    const isMatching =
      currentCode === targetCode ||
      (targetCode === "COMPLIANCE_CENTER" && (currentCode === "COMPLIANCE" || currentCode === "COMPLIANCE_CENTER"));

    if (targetCode && !isMatching && switchActiveSoftware) {
      switchActiveSoftware(targetCode);
    }
    // Auto-dismiss mobile sidebar and desktop hover when navigating to new page
    setMobileOpen(false);
    setDesktopHovered(false);
  }, [location.pathname, activeSoftware?.software_code, switchActiveSoftware, softwareModules, user, navigate]);

  return (
    <SidebarContext.Provider
      value={{
        mobileOpen,
        setMobileOpen,
        desktopExpanded,
        setDesktopExpanded,
        desktopHovered,
        setDesktopHovered,
      }}
    >
      <AiCopilotProvider>
        <TooltipProvider delayDuration={150}>
          <RouteProgressBar />
          <div
            className="grid h-screen grid-cols-[0_1fr] gap-0 overflow-hidden font-sans text-[#1F2937] transition-[grid-template-columns] duration-200 ease-out lg:grid-cols-[var(--sidebar-width)_1fr]"
            style={
              {
                "--sidebar-width": isEffectiveExpanded ? "260px" : "72px",
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
        </TooltipProvider>
      </AiCopilotProvider>
    </SidebarContext.Provider>
  );
};

export default AppLayout;
