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
            "--sidebar-width": desktopExpanded ? "15rem" : "68px",
          } as CSSProperties
        }
      >
        <Sidebar />
        <div className="flex min-w-0 flex-col overflow-hidden">
          <Topbar />
          <main className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto scroll-smooth">
            <div className="page-content flex-grow space-y-8 pb-20 font-sans">
              <Outlet />
            </div>
            <footer className="sticky bottom-0 z-40 mt-auto h-14 shrink-0 border-t px-6 md:px-8 flex items-center shadow-[0_-1px_3px_rgba(0,0,0,0.02)]" style={{ borderColor: 'rgba(148, 163, 184, 0.15)', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)' }}>
              <div className="w-full flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
                <span>© {new Date().getFullYear()} Pharma ERP. All rights reserved.</span>
                <span>
                  Developed by{" "}
                  <span className="font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-default">PIXANDCO</span>
                </span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default AppLayout;
