import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  LayoutGrid,
  Package,
  Landmark,
  Receipt,
  ShieldCheck,
  LogOut,
  Bell,
  HelpCircle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";

interface ModuleConfig {
  code: string;
  name: string;
  icon: React.ElementType;
  desc: string;
  badgeBg: string;
  badgeText: string;
  ctaBg: string;
  ctaHoverBg: string;
  ctaText: string;
  ringColor: string;
  illustration: React.ReactNode;
}

// 3D Glassmorphic Vector Illustrations mirroring the user's design reference
const ControlCenterIllustration = () => (
  <div className="absolute right-1 top-6 w-32 h-32 pointer-events-none opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500">
    <svg viewBox="0 0 160 160" fill="none" className="w-full h-full drop-shadow-md">
      {/* Back Layer Window */}
      <rect x="25" y="20" width="115" height="95" rx="14" fill="#EEF2FF" stroke="#E0E7FF" strokeWidth="1.5" />
      <circle cx="38" cy="32" r="3" fill="#C7D2FE" />
      <circle cx="48" cy="32" r="3" fill="#C7D2FE" />
      <circle cx="58" cy="32" r="3" fill="#C7D2FE" />
      
      {/* Analytics Bars */}
      <rect x="36" y="75" width="14" height="28" rx="4" fill="#818CF8" />
      <rect x="58" y="55" width="14" height="48" rx="4" fill="#6366F1" />
      <rect x="80" y="42" width="14" height="61" rx="4" fill="#4F46E5" />
      <rect x="102" y="60" width="14" height="43" rx="4" fill="#A5B4FC" />
      
      {/* Floating 3D Metric Card */}
      <rect x="55" y="65" width="85" height="55" rx="12" fill="white" fillOpacity="0.9" stroke="#E0E7FF" strokeWidth="1.5" filter="drop-shadow(0 8px 16px rgba(79, 70, 229, 0.12))" />
      <path d="M68 95 L84 83 L100 89 L122 75" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="122" cy="75" r="4" fill="#4F46E5" />
    </svg>
  </div>
);

const FinanceIllustration = () => (
  <div className="absolute right-1 top-6 w-32 h-32 pointer-events-none opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500">
    <svg viewBox="0 0 160 160" fill="none" className="w-full h-full drop-shadow-md">
      {/* Ambient Glow */}
      <circle cx="95" cy="80" r="45" fill="#ECFDF5" />
      
      {/* Background Chart Panel */}
      <rect x="30" y="25" width="105" height="85" rx="14" fill="#F0FDF4" stroke="#DCFCE7" strokeWidth="1.5" />
      <circle cx="42" cy="36" r="3" fill="#BBF7D0" />
      <circle cx="52" cy="36" r="3" fill="#BBF7D0" />
      
      {/* Upward Growth Curve */}
      <path d="M42 85 Q 65 80, 80 65 T 120 40" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <polygon points="120,40 112,40 120,48" fill="#10B981" />
      
      {/* 3D Mint/Green Coin Stacks */}
      <g transform="translate(42, 60)">
        <ellipse cx="20" cy="48" rx="16" ry="6" fill="#059669" />
        <path d="M4 48 v6 c0 3.3 7.2 6 16 6 s16 -2.7 16 -6 v-6" fill="#10B981" />
        <ellipse cx="20" cy="42" rx="16" ry="6" fill="#34D399" />
        <path d="M4 42 v6 c0 3.3 7.2 6 16 6 s16 -2.7 16 -6 v-6" fill="#10B981" />
        <ellipse cx="20" cy="36" rx="16" ry="6" fill="#6EE7B7" />
        <ellipse cx="20" cy="30" rx="16" ry="6" fill="#A7F3D0" />
      </g>
      <g transform="translate(68, 48)">
        <ellipse cx="20" cy="56" rx="15" ry="5.5" fill="#047857" />
        <path d="M5 56 v6 c0 3 6.7 5.5 15 5.5 s15 -2.5 15 -5.5 v-6" fill="#059669" />
        <ellipse cx="20" cy="50" rx="15" ry="5.5" fill="#10B981" />
        <path d="M5 50 v6 c0 3 6.7 5.5 15 5.5 s15 -2.5 15 -5.5 v-6" fill="#059669" />
        <ellipse cx="20" cy="44" rx="15" ry="5.5" fill="#34D399" />
        <ellipse cx="20" cy="38" rx="15" ry="5.5" fill="#6EE7B7" />
      </g>
    </svg>
  </div>
);

const InventoryIllustration = () => (
  <div className="absolute right-1 top-6 w-32 h-32 pointer-events-none opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500">
    <svg viewBox="0 0 160 160" fill="none" className="w-full h-full drop-shadow-md">
      {/* Background Soft Sky Blue Panel */}
      <rect x="25" y="25" width="110" height="95" rx="14" fill="#F0F9FF" stroke="#E0F2FE" strokeWidth="1.5" />
      
      {/* 3D Warehouse Metal Shelving Unit */}
      <path d="M45 35 L45 110 M115 35 L115 110" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M42 55 L118 55 M42 85 L118 85 M42 110 L118 110" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
      
      {/* Layered Warehouse Boxes */}
      {/* Shelf 1 Box */}
      <rect x="52" y="38" width="22" height="17" rx="3" fill="#BAE6FD" stroke="#38BDF8" strokeWidth="1.5" />
      <rect x="78" y="38" width="26" height="17" rx="3" fill="#38BDF8" />
      
      {/* Shelf 2 Boxes (Wood / Cardboard tone) */}
      <rect x="50" y="66" width="30" height="19" rx="3" fill="#D97706" />
      <rect x="52" y="67" width="26" height="8" fill="#F59E0B" rx="2" />
      <rect x="84" y="66" width="28" height="19" rx="3" fill="#B45309" />
      <rect x="86" y="67" width="24" height="8" fill="#D97706" rx="2" />
      
      {/* Shelf 3 Boxes */}
      <rect x="50" y="91" width="30" height="19" rx="3" fill="#B45309" />
      <rect x="84" y="91" width="28" height="19" rx="3" fill="#D97706" />
    </svg>
  </div>
);

const InvoiceCenterIllustration = () => (
  <div className="absolute right-1 top-6 w-32 h-32 pointer-events-none opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500">
    <svg viewBox="0 0 160 160" fill="none" className="w-full h-full drop-shadow-md">
      {/* Background Panel */}
      <rect x="35" y="25" width="95" height="95" rx="14" fill="#FFFBEB" stroke="#FEF3C7" strokeWidth="1.5" />
      
      {/* 3D Invoice / Receipt Document */}
      <g transform="translate(48, 30)">
        <path d="M10 5 L55 5 L65 15 L65 78 L55 75 L45 78 L35 75 L25 78 L15 75 L5 78 L5 10 C5 7.2 7.2 5 10 5 Z" fill="white" stroke="#FDE68A" strokeWidth="1.5" filter="drop-shadow(0 6px 12px rgba(217, 119, 6, 0.15))" />
        {/* Document Folded Corner */}
        <polygon points="55,5 65,15 55,15" fill="#FDE68A" />
        
        {/* Document Content Lines */}
        <rect x="14" y="16" width="22" height="4" rx="2" fill="#F59E0B" />
        <rect x="14" y="26" width="36" height="3" rx="1.5" fill="#E5E7EB" />
        <rect x="14" y="34" width="30" height="3" rx="1.5" fill="#E5E7EB" />
        <rect x="14" y="42" width="36" height="3" rx="1.5" fill="#E5E7EB" />
        
        {/* Dollar Badge / Amount */}
        <text x="14" y="62" fill="#D97706" fontSize="13" fontWeight="bold" fontFamily="sans-serif">$</text>
        <rect x="26" y="54" width="24" height="7" rx="2" fill="#FCD34D" />
      </g>
      
      {/* 3D Floating Orange Coin */}
      <g transform="translate(92, 70)">
        <ellipse cx="14" cy="14" rx="12" ry="12" fill="#F59E0B" />
        <ellipse cx="14" cy="13" rx="10" ry="10" fill="#FBBF24" />
        <text x="10.5" y="17" fill="#B45309" fontSize="11" fontWeight="bold" fontFamily="sans-serif">$</text>
      </g>
    </svg>
  </div>
);

const ComplianceCenterIllustration = () => (
  <div className="absolute right-1 top-6 w-32 h-32 pointer-events-none opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500">
    <svg viewBox="0 0 160 160" fill="none" className="w-full h-full drop-shadow-md">
      {/* Ambient Purple Glow */}
      <circle cx="95" cy="80" r="45" fill="#FAF5FF" />
      
      {/* Background Soft Verification Panel */}
      <rect x="30" y="25" width="105" height="90" rx="14" fill="#F3E8FF" fillOpacity="0.6" stroke="#E9D5FF" strokeWidth="1.5" />
      
      {/* 3D Purple Shield */}
      <g transform="translate(68, 42)">
        <path d="M28 4 L52 14 C52 35 38 52 28 58 C18 52 4 35 4 14 Z" fill="#9333EA" filter="drop-shadow(0 8px 16px rgba(147, 51, 234, 0.25))" />
        <path d="M28 7 L49 16 C49 34 37 49 28 54 C19 49 7 34 7 16 Z" fill="#A855F7" />
        {/* Checkmark inside Shield */}
        <path d="M19 28 L25 34 L38 21" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      
      {/* Layered Document Card */}
      <g transform="translate(38, 48)">
        <rect x="0" y="0" width="38" height="48" rx="8" fill="white" fillOpacity="0.9" stroke="#E9D5FF" strokeWidth="1.5" />
        <rect x="8" y="12" width="22" height="3" rx="1.5" fill="#C084FC" />
        <rect x="8" y="20" width="16" height="3" rx="1.5" fill="#E5E7EB" />
        <rect x="8" y="28" width="20" height="3" rx="1.5" fill="#E5E7EB" />
        <circle cx="28" cy="38" r="4" fill="#10B981" />
      </g>
    </svg>
  </div>
);

const MODULE_DEFINITIONS: Record<string, ModuleConfig> = {
  CONTROL_CENTER: {
    code: "CONTROL_CENTER",
    name: "Control Center",
    icon: LayoutGrid,
    desc: "Centralized command for enterprise configuration. Manage organizational hierarchies, roles, and more.",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-600",
    ctaBg: "bg-indigo-50/80",
    ctaHoverBg: "hover:bg-indigo-100",
    ctaText: "text-indigo-600",
    ringColor: "hover:ring-indigo-200",
    illustration: <ControlCenterIllustration />,
  },
  FINANCE: {
    code: "FINANCE",
    name: "Finance",
    icon: Landmark,
    desc: "Access general ledgers, reconcile accounts, and generate high-level financial forecasts.",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-600",
    ctaBg: "bg-emerald-50/80",
    ctaHoverBg: "hover:bg-emerald-100",
    ctaText: "text-emerald-600",
    ringColor: "hover:ring-emerald-200",
    illustration: <FinanceIllustration />,
  },
  INVENTORY: {
    code: "INVENTORY",
    name: "Inventory",
    icon: Package,
    desc: "Track stock levels, manage multi-warehouse logistics, and automate replenishment workflows.",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-600",
    ctaBg: "bg-sky-50/80",
    ctaHoverBg: "hover:bg-sky-100",
    ctaText: "text-sky-600",
    ringColor: "hover:ring-sky-200",
    illustration: <InventoryIllustration />,
  },
  INVOICE_CENTER: {
    code: "INVOICE_CENTER",
    name: "Invoice Center",
    icon: Receipt,
    desc: "Process AP/AR documentation, manage vendor billing cycles, and automate payments.",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-600",
    ctaBg: "bg-amber-50/80",
    ctaHoverBg: "hover:bg-amber-100",
    ctaText: "text-amber-600",
    ringColor: "hover:ring-amber-200",
    illustration: <InvoiceCenterIllustration />,
  },
  COMPLIANCE_CENTER: {
    code: "COMPLIANCE_CENTER",
    name: "Compliance Center",
    icon: ShieldCheck,
    desc: "Enter this module to manage related operations and settings.",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-600",
    ctaBg: "bg-purple-50/80",
    ctaHoverBg: "hover:bg-purple-100",
    ctaText: "text-purple-600",
    ringColor: "hover:ring-purple-200",
    illustration: <ComplianceCenterIllustration />,
  },
};

export const ModuleSelectionPage = () => {
  const { user, company, softwareModules, logoutUser, switchActiveSoftware } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<string | null>(null);

  const handleModuleClick = async (moduleCode: string) => {
    setSwitching(moduleCode);
    const success = await switchActiveSoftware(moduleCode);
    if (success) {
      navigate(`/${moduleCode.toLowerCase().replace(/_/g, "-")}/dashboard`);
    } else {
      setSwitching(null);
    }
  };

  // User initials for the top right circular badge
  const userName = user?.full_name || user?.name || "Dr. Kalinga Silva";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "KS";

  // Build the list of active modules
  const displayModules: ModuleConfig[] = (softwareModules && softwareModules.length > 0)
    ? softwareModules.map((mod: any) => {
        const fallback = MODULE_DEFINITIONS[mod.software_code] || {
          code: mod.software_code,
          name: mod.software_name || mod.software_code,
          icon: LayoutGrid,
          desc: mod.description || "Enter this module to manage related operations and settings.",
          badgeBg: "bg-indigo-50",
          badgeText: "text-indigo-600",
          ctaBg: "bg-indigo-50/80",
          ctaHoverBg: "hover:bg-indigo-100",
          ctaText: "text-indigo-600",
          ringColor: "hover:ring-indigo-200",
          illustration: <ControlCenterIllustration />,
        };
        return {
          ...fallback,
          name: mod.software_name || fallback.name,
          desc: fallback.desc,
        };
      })
    : [
        MODULE_DEFINITIONS.CONTROL_CENTER,
        MODULE_DEFINITIONS.FINANCE,
        MODULE_DEFINITIONS.INVENTORY,
        MODULE_DEFINITIONS.INVOICE_CENTER,
        MODULE_DEFINITIONS.COMPLIANCE_CENTER,
      ];

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-md px-6 sm:px-10 lg:px-16 shadow-2xs">
        {/* Left: Brand Icon, Name, and Welcome */}
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <LayoutGrid className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {company?.name || "Company"}
              </h1>
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
                Welcome back,{" "}
                <span className="text-indigo-600 font-bold">{userName}</span>
              </span>
            </div>
            <p className="sm:hidden text-xs text-slate-400 font-medium">
              Welcome back, <span className="text-indigo-600 font-bold">{userName}</span>
            </p>
          </div>
        </div>

        {/* Right: Notification, Help, Avatar, Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification with dot badge */}
          <button
            type="button"
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-50"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Help Circle */}
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-50"
            title="Help & Documentation"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          {/* Avatar Initials Badge */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs tracking-wider">
            {userInitials}
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={logoutUser}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-400" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 flex flex-col justify-between">
        {/* Hero Banner Section */}
        <div className="relative mb-8 overflow-hidden rounded-[32px] border border-slate-100 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/25 p-8 sm:p-12 shadow-xs">
          {/* Ambient organic blobs in background */}
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-20 h-80 w-80 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left Content */}
            <div className="max-w-2xl">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 border border-indigo-100/70 text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-700 mb-4 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                ENTERPRISE HUB
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">
                Select a Workspace
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-xl">
                Choose a software module to enter its specialized environment.
                <br className="hidden sm:inline" /> Your permissions and access may vary per module.
              </p>
            </div>

            {/* Right Hero Graphic: 3D Workspace Scene with Streamline Script */}
            <div className="relative flex items-center justify-center lg:justify-end shrink-0 pr-4">
              {/* Handwritten script watermark on the side */}
              <div className="hidden xl:flex flex-col items-center justify-center mr-6 select-none opacity-40 hover:opacity-70 transition-opacity">
                <span className="font-serif italic text-2xl text-slate-500 tracking-wider -rotate-6">
                  Streamline
                </span>
                <span className="font-serif italic text-2xl text-slate-500 tracking-wider -rotate-6 ml-3">
                  Manage
                </span>
                <span className="font-serif italic text-3xl font-light text-indigo-700 tracking-wider -rotate-6 ml-6">
                  Grow
                </span>
              </div>

              {/* 3D Glass Layered Window Graphic */}
              <div className="relative w-64 sm:w-80 h-44 sm:h-52 select-none">
                {/* Back Soft Layer */}
                <div className="absolute inset-0 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-xl shadow-slate-200/50 p-4 transform rotate-1 transition-transform hover:rotate-0 duration-500">
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="h-3 w-3/4 rounded-full bg-slate-100" />
                    <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                    <div className="h-8 w-full rounded-xl bg-indigo-50/50 mt-4 border border-indigo-100/40" />
                  </div>
                </div>

                {/* 3D Floating Central Purple Tile Icon */}
                <div className="absolute top-6 left-16 sm:left-24 h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-4 text-white shadow-2xl shadow-indigo-600/40 border border-white/40 transform -rotate-6 hover:scale-105 transition-transform duration-300 flex items-center justify-center z-20">
                  <LayoutGrid className="h-8 w-8 sm:h-10 sm:w-10 stroke-[2.2]" />
                </div>

                {/* Floating User Pill */}
                <div className="absolute -top-3 right-4 h-9 w-9 rounded-full bg-indigo-100 border-2 border-white shadow-md flex items-center justify-center text-indigo-700 font-bold text-xs z-30">
                  {userInitials}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Cards Row Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 w-full mb-10">
          {displayModules.map((mod, idx) => {
            const Icon = mod.icon;
            const isSwitching = switching === mod.code;

            return (
              <div
                key={mod.code}
                onClick={() => !isSwitching && handleModuleClick(mod.code)}
                className={`group relative flex flex-col justify-between rounded-[28px] border border-slate-100 bg-white p-6 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden min-h-[340px] ring-1 ring-slate-900/5 ${mod.ringColor}`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* 3D Ambient Visual Illustration */}
                {mod.illustration}

                {/* Top Section: Icon Tile + Title + Description */}
                <div className="relative z-10 flex-1">
                  {/* Icon Tile */}
                  <div
                    className={`h-12 w-12 rounded-2xl ${mod.badgeBg} ${mod.badgeText} flex items-center justify-center shadow-xs border border-slate-100/60 mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-6 w-6 stroke-[2.2]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-[19px] font-bold text-slate-900 tracking-tight mb-2">
                    {mod.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] font-medium text-slate-500 leading-relaxed pr-2">
                    {mod.desc}
                  </p>
                </div>

                {/* Bottom CTA Pill */}
                <div className="relative z-10 mt-8">
                  <div
                    className={`w-full ${mod.ctaBg} ${mod.ctaHoverBg} ${mod.ctaText} font-bold text-xs py-2.5 px-4 rounded-full flex items-center justify-between transition-colors shadow-2xs`}
                  >
                    <span className="font-semibold tracking-wide">Launch Workspace</span>
                    <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-xs group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* Switching Loading Overlay */}
                {isSwitching && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-[28px] bg-white/85 backdrop-blur-xs">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-200 border-t-indigo-600 mb-2" />
                    <span className="text-xs font-bold text-slate-700">Entering...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-slate-100/80">
          <p className="text-xs font-medium text-slate-400">
            Engineered by <span className="font-bold text-slate-700">Pixand Co</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default ModuleSelectionPage;
