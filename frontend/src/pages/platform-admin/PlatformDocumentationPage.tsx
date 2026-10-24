import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  BookOpen,
  Shield,
  Key,
  Server,
  Activity,
  Layers,
  CheckCircle,
  Copy,
  Clock,
  Sparkles,
  ArrowDownToLine,
  FileCheck,
  Eye,
  X,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import BalanceSheetAuditDocModal from "../../components/finance/reports/BalanceSheetAuditDocModal";

interface DocItem {
  id: string;
  title: string;
  category:
    | "Credentials & Access"
    | "Master Volume"
    | "Setup & Administration"
    | "Compliance & Regulations"
    | "Architecture & API"
    | "Operations & Workflows"
    | "Audit & Reports";
  description: string;
  pdfFilename: string;
  mdFilename?: string;
  sizeBytes: string;
  pageCount: string;
  badge?: string;
  featured?: boolean;
  highlights: string[];
  lastUpdated: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const DOCUMENTS_CATALOG: DocItem[] = [
  {
    id: "credentials-directory",
    title: "Final Login Credentials & Access Directory",
    category: "Credentials & Access",
    description:
      "Production-ready authentication directory containing Platform Owner portal logins, 1,000+ record company (Ceylon Medical Supplies) administrative & staff credentials, database access, and SSH hosts.",
    pdfFilename: "FINAL_LOGIN_CREDENTIALS_AND_ACCESS_DIRECTORY.pdf",
    mdFilename: "FINAL_LOGIN_CREDENTIALS_AND_ACCESS_DIRECTORY.md",
    sizeBytes: "13.4 KB",
    pageCount: "2 Pages",
    badge: "PRIMARY ACCESS KEY",
    featured: true,
    highlights: [
      "Platform Owner Login (/platform-admin/login)",
      "Ceylon Medical Supplies Logins (/login)",
      "Database & SSH Production Host Credentials",
    ],
    lastUpdated: "October 17, 2026",
    icon: Key,
    accentColor: "from-amber-500 to-orange-500",
  },
  {
    id: "combined-master-volume",
    title: "Complete ERP Master Volume (All Guides Combined)",
    category: "Master Volume",
    description:
      "All-in-one monolithic publication compiling all 12 operational manuals, technical architecture blueprints, compliance standards, and administration setup guides into a single publication.",
    pdfFilename: "ERP_ALL_DOCUMENTS_COMBINED_VOLUME.pdf",
    sizeBytes: "3.66 MB",
    pageCount: "128 Pages",
    badge: "UNIFIED MASTER ARCHIVE",
    featured: true,
    highlights: [
      "All 12 ERP Manuals in 1 Unified PDF",
      "Comprehensive Table of Contents & Cross-References",
      "Complete Architecture, SOP, and Regulatory Standard",
    ],
    lastUpdated: "October 2026",
    icon: BookOpen,
    accentColor: "from-indigo-500 to-violet-600",
  },
  {
    id: "users-roles-permissions",
    title: "Enterprise Users, Roles & Permissions Directory",
    category: "Credentials & Access",
    description:
      "Granular authorization matrix defining all 383 system permissions, role tier assignments (Owner, Admin, Manager, Cashier, Auditor), and multi-branch access control rules.",
    pdfFilename: "ENTERPRISE_USERS_ROLES_AND_PERMISSIONS_REPORT.pdf",
    mdFilename: "ENTERPRISE_USERS_ROLES_AND_PERMISSIONS_MANUAL.md",
    sizeBytes: "10.7 KB",
    pageCount: "3 Pages",
    badge: "SECURITY & RBAC",
    highlights: [
      "383 Granular System Permissions",
      "5 Operational Role Tiers",
      "Branch-Scoped Access Matrix",
    ],
    lastUpdated: "October 2026",
    icon: Shield,
    accentColor: "from-purple-500 to-pink-500",
  },
  {
    id: "performance-benchmark",
    title: "Enterprise Performance & Query Benchmark Audit",
    category: "Audit & Reports",
    description:
      "End-to-end benchmark analysis across 1,000+ transactional records, indexing efficiency, 5-module latency profiles, and production query execution times.",
    pdfFilename: "ENTERPRISE_PERFORMANCE_AND_QUERY_BENCHMARK_REPORT.pdf",
    sizeBytes: "12.5 KB",
    pageCount: "3 Pages",
    badge: "PERFORMANCE BENCHMARK",
    highlights: [
      "1,000+ Record Database Stress Tests",
      "Sub-20ms Indexed Query Latencies",
      "Module-By-Module Throughput Telemetry",
    ],
    lastUpdated: "October 2026",
    icon: Activity,
    accentColor: "from-emerald-500 to-teal-500",
  },
  {
    id: "admin-setup-guide",
    title: "Platform & Enterprise Administrator Setup Guide",
    category: "Setup & Administration",
    description:
      "Step-by-step administrator guide for tenant company onboarding, isolated database provisioning, SMTP gateway configuration, and branch initialization.",
    pdfFilename: "ERP_ADMIN_SETUP_GUIDE.pdf",
    mdFilename: "ERP_ADMIN_SETUP_GUIDE.md",
    sizeBytes: "645 KB",
    pageCount: "16 Pages",
    highlights: [
      "Multi-Tenant Company Provisioning Protocol",
      "Automated MySQL Database Provisioning",
      "SMTP Gateway & Payment Config",
    ],
    lastUpdated: "October 2026",
    icon: Server,
    accentColor: "from-blue-500 to-indigo-500",
  },
  {
    id: "pharma-distribution-guide",
    title: "Pharmaceutical Distribution & Regulatory Master Guide",
    category: "Compliance & Regulations",
    description:
      "Sri Lankan NMRA statutory regulations, batch tracking protocols, FEFO inventory allocation guidelines, and Gazette 2481/22 & 2500/106 VAT/SSCL compliance.",
    pdfFilename: "PHARMACY_DISTRIBUTION_ERP_MASTER_GUIDE.pdf",
    mdFilename: "PHARMACY_DISTRIBUTION_ERP_MASTER_GUIDE.md",
    sizeBytes: "1.65 MB",
    pageCount: "34 Pages",
    badge: "STATUTORY COMPLIANCE",
    highlights: [
      "NMRA Regulatory Compliance Framework",
      "FEFO Batch Expiry & Cold Chain Rules",
      "Gazette 2481/22 & 2500/106 Tax Standards",
    ],
    lastUpdated: "October 2026",
    icon: FileCheck,
    accentColor: "from-rose-500 to-red-600",
  },
  {
    id: "technical-architecture",
    title: "Complete Technical Architecture & System Reference",
    category: "Architecture & API",
    description:
      "Full stack engineering specification detailing Go Gin architecture, Redis caching layer, multi-tenant MySQL schemas, and Docker orchestration.",
    pdfFilename: "ERP_COMPLETE_TECHNICAL_DOCUMENTATION.pdf",
    mdFilename: "ERP_COMPLETE_TECHNICAL_DOCUMENTATION.md",
    sizeBytes: "1.24 MB",
    pageCount: "28 Pages",
    highlights: [
      "Go Gin REST Microservices Architecture",
      "Redis 7 Distributed Session Storage",
      "Docker Compose & Reverse Proxy Spec",
    ],
    lastUpdated: "October 2026",
    icon: Layers,
    accentColor: "from-cyan-500 to-blue-600",
  },
  {
    id: "business-workflows",
    title: "Operational Business Workflows & SOP Manual",
    category: "Operations & Workflows",
    description:
      "Standard Operating Procedures covering Order-to-Cash, Procure-to-Pay, Batch Holds & Recalls, Inter-Warehouse Transfers, and Financial Year Closing.",
    pdfFilename: "ERP_BUSINESS_WORKFLOWS.pdf",
    mdFilename: "ERP_BUSINESS_WORKFLOWS.md",
    sizeBytes: "723 KB",
    pageCount: "18 Pages",
    highlights: [
      "Order-to-Cash End-to-End SOP",
      "Batch Hold, Quarantine & Recall Protocol",
      "Financial Year Closing Procedures",
    ],
    lastUpdated: "October 2026",
    icon: FileText,
    accentColor: "from-emerald-600 to-green-500",
  },
  {
    id: "database-api-reference",
    title: "Database Schema & REST API Technical Reference",
    category: "Architecture & API",
    description:
      "129 database tables relational map, foreign key hierarchies, indexing strategies, and comprehensive REST API endpoint documentation.",
    pdfFilename: "ERP_DATABASE_API_REFERENCE.pdf",
    mdFilename: "ERP_DATABASE_API_REFERENCE.md",
    sizeBytes: "595 KB",
    pageCount: "22 Pages",
    highlights: [
      "129 Database Tables Relational Map",
      "Full REST API Endpoints Specification",
      "Foreign Key Constraints & Triggers",
    ],
    lastUpdated: "October 2026",
    icon: Server,
    accentColor: "from-violet-500 to-purple-600",
  },
  {
    id: "user-manual",
    title: "End-User Operational Manual & Desk Reference",
    category: "Operations & Workflows",
    description:
      "Field operational manual for pharmacy branch managers, billing operators, and inventory warehouse clerks navigating day-to-day transactions.",
    pdfFilename: "ERP_USER_MANUAL.pdf",
    mdFilename: "ERP_USER_MANUAL.md",
    sizeBytes: "588 KB",
    pageCount: "14 Pages",
    highlights: [
      "Cashier POS & Sales Invoicing Guide",
      "Inventory Receiving & GRN Workflows",
      "Branch Switching & User Settings",
    ],
    lastUpdated: "October 2026",
    icon: BookOpen,
    accentColor: "from-teal-500 to-emerald-600",
  },
  {
    id: "discovery-report",
    title: "System Discovery & Environment Audit Report",
    category: "Audit & Reports",
    description:
      "Discovery baseline cataloging server infrastructure, database instances, network perimeter settings, and pre-flight configuration audits.",
    pdfFilename: "ERP_DISCOVERY_REPORT.pdf",
    mdFilename: "ERP_DISCOVERY_REPORT.md",
    sizeBytes: "274 KB",
    pageCount: "10 Pages",
    highlights: [
      "Production Host Server Inventory",
      "Database Baseline Verification",
      "Container Architecture Verification",
    ],
    lastUpdated: "October 2026",
    icon: Activity,
    accentColor: "from-indigo-400 to-sky-500",
  },
  {
    id: "known-gaps",
    title: "System Gap Analysis & Roadmap Register",
    category: "Audit & Reports",
    description:
      "Audit of closed gaps, enterprise security hardenings, edge-case validations, and scheduled future roadmap enhancements.",
    pdfFilename: "ERP_KNOWN_GAPS.pdf",
    mdFilename: "ERP_KNOWN_GAPS.md",
    sizeBytes: "143 KB",
    pageCount: "6 Pages",
    highlights: [
      "Closed Gaps & Verification History",
      "Security Hardening Manifest",
      "Future Enterprise Roadmap",
    ],
    lastUpdated: "October 2026",
    icon: CheckCircle,
    accentColor: "from-amber-600 to-yellow-500",
  },
  {
    id: "balance-sheet-statutory-audit",
    title: "FY2026/2027 Balance Sheet Statutory Audit & Bug Resolution",
    category: "Audit & Reports",
    description:
      "Statutory financial audit, root cause analysis (RCA), and production engineering resolutions for FY2026/2027 Balance Sheet zero asset bug, account misclassification, and double-entry equilibrium.",
    pdfFilename: "BALANCE_SHEET_FIX_AUDIT_REPORT.md",
    mdFilename: "BALANCE_SHEET_FIX_AUDIT_REPORT.md",
    sizeBytes: "12.4 KB",
    pageCount: "6 Sections",
    badge: "CRITICAL AUDIT & FIX",
    featured: true,
    highlights: [
      "Total Assets LKR 190,565,999.44 Ledger Equilibrium Restored",
      "Corrected Trade Debtors, Inventory & Bank Misclassification",
      "Dynamic LKAS/SLFRS KPI Ribbon & Financial Liquidity Ratios",
    ],
    lastUpdated: "October 2026",
    icon: FileCheck,
    accentColor: "from-emerald-500 to-teal-600",
  },
  {
    id: "bank-cash-book-reconciliation-audit",
    title: "FIN-02: Bank Book and Cash Book Reconciliation & Running Balances",
    category: "Audit & Reports",
    description:
      "Statutory treasury audit resolving column dashes, sign convention inversion (-88.1M bank & -5M cash), chronological running balance calculation, and ledger reconciliation.",
    pdfFilename: "FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md",
    mdFilename: "FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md",
    sizeBytes: "8.5 KB",
    pageCount: "5 Sections",
    badge: "FIN-02 AUDIT SIGN-OFF",
    featured: true,
    highlights: [
      "Bank Account +88,107,675.10 LKR Reconciled (100% Ledger Match)",
      "Cash in Hand +5,000,000.00 LKR Reconciled (100% Ledger Match)",
      "Nonzero Debit/Credit Dash Fix & Chronological Forward Running Balance",
    ],
    lastUpdated: "October 2026",
    icon: FileCheck,
    accentColor: "from-blue-600 to-cyan-600",
  },
  {
    id: "fin-03-04-dashboard-kpis-tax-formatting",
    title: "FIN-03 & FIN-04: Finance Dashboard KPIs & Tax Settings Formatting",
    category: "Audit & Reports",
    description:
      "Statutory audit and engineering resolutions for Cash/AR alert discrepancies, live general ledger metric lineage, and percentage formatting for tax rates and zero-rated settings.",
    pdfFilename: "FIN_03_AND_04_AUDIT_REPORT.md",
    mdFilename: "FIN_03_AND_04_AUDIT_REPORT.md",
    sizeBytes: "7.2 KB",
    pageCount: "4 Sections",
    badge: "FIN-03 & FIN-04 AUDIT",
    featured: true,
    highlights: [
      "Eliminated 32.4M & 11.95M hardcoded mock alerts with live GL balances",
      "Reconciled Cash in Hand (5.0M) & Commercial Bank (88.1M) with ledgers",
      "Standardized 18% / 2.5% percentages & Zero-Rated badges instead of dashes",
    ],
    lastUpdated: "October 2026",
    icon: FileCheck,
    accentColor: "from-purple-600 to-indigo-600",
  },
];

const CATEGORIES = [
  "All Documents",
  "Credentials & Access",
  "Master Volume",
  "Setup & Administration",
  "Compliance & Regulations",
  "Architecture & API",
  "Operations & Workflows",
  "Audit & Reports",
] as const;

export const PlatformDocumentationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "All Documents"
  );
  const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  const filteredDocs = useMemo(() => {
    return DOCUMENTS_CATALOG.filter((doc) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All Documents" ||
        doc.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === "credentials" && doc.category === "Credentials & Access") ||
        (selectedCategory === "manuals" && (doc.category === "Master Volume" || doc.category === "Operations & Workflows"));

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleDownload = (filename: string, title: string) => {
    const link = document.createElement("a");
    link.href = `/docs/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${title}`, {
      description: `Saved as ${filename}`,
    });
  };

  const handleOpenPdf = (filename: string) => {
    window.open(`/docs/${filename}`, "_blank");
  };

  const handleCopyLink = (filename: string) => {
    const url = `${window.location.origin}/docs/${filename}`;
    navigator.clipboard.writeText(url);
    toast.success("Document link copied to clipboard", {
      description: url,
    });
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Publications & Download Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Documentation & Manuals
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Download publication-ready operational manuals, system architecture diagrams, user guides,
              and critical login directories for all platform owners and enterprise tenant companies.
            </p>
          </div>

          {/* Quick Download Header Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() =>
                handleDownload(
                  "FINAL_LOGIN_CREDENTIALS_AND_ACCESS_DIRECTORY.pdf",
                  "Final Login Credentials Directory"
                )
              }
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Key className="w-4 h-4" />
              <span>Credentials (PDF)</span>
            </button>

            <button
              onClick={() =>
                handleDownload(
                  "ERP_ALL_DOCUMENTS_COMBINED_VOLUME.pdf",
                  "Complete Master Volume"
                )
              }
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Master Volume (3.6MB)</span>
            </button>

            <a
              href="/control-center/system-fixes-audit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
            >
              <FileCheck className="w-4 h-4" />
              <span>Statutory Audit & Fixes</span>
            </a>
          </div>
        </div>
      </div>

      {/* Featured Highlighted Cards (Top 2: Credentials & Master Volume) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Credentials Directory */}
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 p-6 flex flex-col justify-between shadow-lg shadow-amber-500/5 group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              CRITICAL ACCESS MANIFEST
            </span>
          </div>

          <div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 mb-4 shadow-md">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Final Login Credentials & Access Directory
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Complete verified authentication directory containing Platform Owner portal login, Ceylon Medical
              Supplies (1,000+ data) company admin and staff logins, MySQL database connections, and SSH access.
            </p>

            <div className="space-y-1.5 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Platform Owner Login: <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">https://erp.pixandco.lk/platform-admin/login</code></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Company Staff Login: <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">https://erp.pixandco.lk/login</code></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Production Server: <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">50.6.230.198</code></span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>PDF: 13.4 KB</span>
              <span>&bull;</span>
              <span>2 Pages</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenPdf("FINAL_LOGIN_CREDENTIALS_AND_ACCESS_DIRECTORY.pdf")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() =>
                  handleDownload(
                    "FINAL_LOGIN_CREDENTIALS_AND_ACCESS_DIRECTORY.pdf",
                    "Final Login Credentials & Access Directory"
                  )
                }
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Combined Master Volume */}
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-500/30 p-6 flex flex-col justify-between shadow-lg shadow-indigo-500/5 group hover:border-indigo-500/50 transition-all">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              ALL-IN-ONE PUBLICATION
            </span>
          </div>

          <div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white mb-4 shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Complete ERP Master Volume (All Guides)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Consolidated single-volume publication comprising all 12 platform guides: Administrator Setup,
              Pharmaceutical Compliance, Technical Architecture, Business Workflows, and User Manuals.
            </p>

            <div className="space-y-1.5 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Includes Full Architecture Blueprint & Database ER Diagrams</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Standard Operating Procedures for Procurement, Billing & Inventory</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Statutory Sri Lanka NMRA Compliance & Tax Specifications</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>PDF: 3.66 MB</span>
              <span>&bull;</span>
              <span>128 Pages</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenPdf("ERP_ALL_DOCUMENTS_COMBINED_VOLUME.pdf")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() =>
                  handleDownload(
                    "ERP_ALL_DOCUMENTS_COMBINED_VOLUME.pdf",
                    "Complete ERP Master Volume"
                  )
                }
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides, manuals, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Document Count */}
          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{filteredDocs.length}</span> of{" "}
            {DOCUMENTS_CATALOG.length} publications
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchParams(cat === "All Documents" ? {} : { category: cat });
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Complete Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => {
          const IconComp = doc.icon;
          return (
            <div
              key={doc.id}
              className="rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Header with Icon & Category */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${doc.accentColor} flex items-center justify-center text-white shrink-0 shadow-sm`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {doc.category}
                  </span>
                </div>

                {/* Title & Description */}
                <h4 className="text-base font-bold text-white mb-1.5 group-hover:text-indigo-400 transition-colors">
                  {doc.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {doc.description}
                </p>

                {/* Highlight Bullets */}
                <div className="space-y-1 mb-5">
                  {doc.highlights.map((hl, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                      <span className="truncate">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer Info & Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500 font-mono">
                  <span>{doc.sizeBytes}</span>
                  <span className="mx-1">&bull;</span>
                  <span>{doc.pageCount}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {doc.id === "balance-sheet-statutory-audit" && (
                    <button
                      onClick={() => setAuditModalOpen(true)}
                      title="Open Interactive Audit Report Viewer"
                      className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  )}

                  {doc.mdFilename && (
                    <button
                      onClick={() => handleDownload(doc.mdFilename!, `${doc.title} (Markdown)`)}
                      title="Download Markdown Version"
                      className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-semibold transition-all border border-slate-800"
                    >
                      MD
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenPdf(doc.pdfFilename)}
                    title="Open in new tab"
                    className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all border border-slate-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDownload(doc.pdfFilename, doc.title)}
                    className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw Markdown Guides Directory Section */}
      <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Technical Architecture, Audits & Schema Files (Markdown)</h3>
          </div>
          <span className="text-xs text-slate-500">Source Markdown Files</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: "BALANCE_SHEET_FIX_AUDIT_REPORT.md", title: "Balance Sheet Audit & Fix Report", size: "12.4 KB" },
            { name: "RECONCILIATION_PROOF.md", title: "Double-Entry Reconciliation Proof", size: "4.6 KB" },
            { name: "SYSTEM_CHANGELOG.md", title: "Engineering System Changelog", size: "5.8 KB" },
            { name: "ARCHITECTURE_GUIDE.md", title: "Complete Architecture Guide", size: "14 KB" },
            { name: "DATABASE_SCHEMA.md", title: "Database Schema Reference", size: "12 KB" },
            { name: "SETUP_GUIDE.md", title: "Server Setup & Runbook", size: "5.4 KB" },
            { name: "FINAL_LOGIN_CREDENTIALS_AND_ACCESS_DIRECTORY.md", title: "Final Credentials Markdown", size: "8.2 KB" },
            { name: "ENTERPRISE_USERS_ROLES_AND_PERMISSIONS_MANUAL.md", title: "Users & Roles Manual", size: "11.5 KB" },
            { name: "PHARMACY_DISTRIBUTION_ERP_MASTER_GUIDE.md", title: "Pharmacy Master Guide Source", size: "16 KB" },
          ].map((md) => (
            <div
              key={md.name}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{md.title}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{md.name} &bull; {md.size}</p>
              </div>
              <button
                onClick={() => handleDownload(md.name, md.title)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shrink-0"
                title={`Download ${md.name}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* In-App Interactive Audit Modal */}
      <BalanceSheetAuditDocModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
    </div>
  );
};

export default PlatformDocumentationPage;
