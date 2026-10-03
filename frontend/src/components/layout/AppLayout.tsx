import { Outlet } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import type { CSSProperties } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

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
  const [desktopExpanded, setDesktopExpanded] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ mobileOpen, setMobileOpen, desktopExpanded, setDesktopExpanded }}
    >
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
          <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth bg-slate-50">
            <div className="flex flex-col min-h-full w-full">
              <div className="page-content flex-grow space-y-8 pb-20 font-sans">
                <Outlet />
              </div>
              <footer className="mt-auto h-14 shrink-0 border-t px-6 md:px-8 flex items-center shadow-[0_-1px_3px_rgba(0,0,0,0.02)] relative z-10" style={{ borderColor: 'rgba(148, 163, 184, 0.15)', background: '#ffffff' }}>
                <div className="w-full flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
                  <span>© {new Date().getFullYear()} Pharma ERP. All rights reserved.</span>
                  <span>
                    Developed by{" "}
                    <span className="font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-default">PIXANDCO</span>
                  </span>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default AppLayout;
