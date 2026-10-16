import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

export type CopilotTab = "chat" | "summary" | "docs";

export interface PageContextState {
  pageTitle: string;
  route?: string;
  activeData?: any;
  count?: number;
  moduleName?: string;
}

interface AiCopilotContextType {
  isOpen: boolean;
  activeTab: CopilotTab;
  pageContext: PageContextState;
  initialPrompt: string;
  openCopilot: (tab?: CopilotTab, prompt?: string) => void;
  closeCopilot: () => void;
  toggleCopilot: () => void;
  setPageContext: (ctx: Partial<PageContextState>) => void;
}

const defaultContext: PageContextState = {
  pageTitle: "Enterprise ERP",
  route: "/",
  moduleName: "Ceylon Med ERP",
};

const AiCopilotContext = createContext<AiCopilotContextType>({
  isOpen: false,
  activeTab: "chat",
  pageContext: defaultContext,
  initialPrompt: "",
  openCopilot: () => {},
  closeCopilot: () => {},
  toggleCopilot: () => {},
  setPageContext: () => {},
});

export const useAiCopilot = () => useContext(AiCopilotContext);

// Auto-derive reasonable title/module from current pathname
function deriveContextFromPath(pathname: string): PageContextState {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) {
    return { pageTitle: "Control Center Dashboard", route: pathname, moduleName: "Control Center" };
  }

  const moduleSlug = parts[0];
  let moduleName = "Enterprise ERP";
  if (moduleSlug === "finance") moduleName = "Financial Operations";
  else if (moduleSlug === "inventory") moduleName = "Inventory & Warehousing";
  else if (moduleSlug === "invoice-center") moduleName = "Invoice Center";
  else if (moduleSlug === "compliance-center") moduleName = "Compliance Center";
  else if (moduleSlug === "control-center") moduleName = "Control Center";

  let pageTitle = parts[parts.length - 1]
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  if (pathname.includes("dashboard")) {
    pageTitle = `${moduleName} Dashboard`;
  }

  return {
    pageTitle,
    route: pathname,
    moduleName,
  };
}

export const AiCopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CopilotTab>("chat");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [customPageContext, setCustomPageContext] = useState<Partial<PageContextState>>({});

  const derivedContext = useMemo(() => {
    return deriveContextFromPath(location.pathname);
  }, [location.pathname]);

  const pageContext: PageContextState = useMemo(() => {
    return {
      ...derivedContext,
      ...customPageContext,
      route: location.pathname,
    };
  }, [derivedContext, customPageContext, location.pathname]);

  const openCopilot = useCallback((tab: CopilotTab = "chat", prompt: string = "") => {
    setActiveTab(tab);
    if (prompt) setInitialPrompt(prompt);
    setIsOpen(true);
  }, []);

  const closeCopilot = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCopilot = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const setPageContext = useCallback((ctx: Partial<PageContextState>) => {
    setCustomPageContext((prev) => ({ ...prev, ...ctx }));
  }, []);

  return (
    <AiCopilotContext.Provider
      value={{
        isOpen,
        activeTab,
        pageContext,
        initialPrompt,
        openCopilot,
        closeCopilot,
        toggleCopilot,
        setPageContext,
      }}
    >
      {children}
    </AiCopilotContext.Provider>
  );
};
