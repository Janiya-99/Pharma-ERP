import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  FileCheck,
  Search,
  Filter,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ExternalLink,
  RefreshCw,
  Building2,
  Shield,
  FileText,
  Clock,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import { TablePagination } from "../../../components/common/TablePagination";
import { exportToCsv, exportToPdf } from "../../../utils/reportExportUtils";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

interface LicenseDoc {
  id: string;
  licenseNumber: string;
  title: string;
  authority: string;
  facility: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  adminStatus: "ACTIVE" | "SUSPENDED" | "RENEWAL_PENDING" | "REVOKED";
  validityStatus: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "RENEWAL_PENDING";
  category: "NMRA" | "IRAS" | "HEALTH_MUNICIPAL" | "DANGEROUS_DRUGS";
}

const STATUTORY_PREMISES_LICENSES: Array<Omit<LicenseDoc, "daysRemaining" | "validityStatus" | "status">> = [
  {
    id: "lic-whl-4402",
    licenseNumber: "WHL-4402/2026",
    title: "NMRA Wholesale Dealer Operating License (Central Hub)",
    authority: "National Medicines Regulatory Authority (NMRA)",
    facility: "Colombo Central Medical Warehouse (WH_COL_MAIN)",
    issueDate: "2025-07-01",
    expiryDate: "2026-06-30", // Expired on 30 June 2026
    adminStatus: "ACTIVE",
    category: "NMRA",
  },
  {
    id: "lic-whl-kdy-1092",
    licenseNumber: "WHL-KDY-1092/2026",
    title: "Kandy Regional Distribution Facility — Wholesale Operating License",
    authority: "National Medicines Regulatory Authority (NMRA)",
    facility: "Kandy Central Distribution Warehouse",
    issueDate: "2026-04-15",
    expiryDate: "2027-04-15",
    adminStatus: "ACTIVE",
    category: "NMRA",
  },
  {
    id: "lic-whl-biy-7731",
    licenseNumber: "WHL-BIY-7731/2026",
    title: "Biyagama Cold Chain Vaccines Facility — Specialized Storage Permit",
    authority: "National Medicines Regulatory Authority (NMRA)",
    facility: "Biyagama Cold Chain Vaccines Facility",
    issueDate: "2025-09-01",
    expiryDate: "2027-08-30",
    adminStatus: "ACTIVE",
    category: "NMRA",
  },
  {
    id: "lic-iras-col-89",
    licenseNumber: "IRAS-COL-2026/89",
    title: "Corporate Tax Clearance & Fiscal Compliance Certificate",
    authority: "Inland Revenue Department (IRD / IRAS)",
    facility: "Ceylon MedEx Corporate Headquarters (Colombo 03)",
    issueDate: "2026-01-01",
    expiryDate: "2026-12-31",
    adminStatus: "ACTIVE",
    category: "IRAS",
  },
  {
    id: "lic-mnc-cmb-8820",
    licenseNumber: "MNC-CMB-8820",
    title: "Municipal Dangerous Goods & Flammables Storage Permit",
    authority: "Colombo Municipal Council Health & Fire Dept",
    facility: "Central Quality Control & Quarantine Holding",
    issueDate: "2025-11-15",
    expiryDate: "2026-11-15", // Approaching expiry (< 30 days relative to Oct 25)
    adminStatus: "ACTIVE",
    category: "HEALTH_MUNICIPAL",
  },
];

export const calculateLicenseValidity = (expiryDateStr: string, adminStatus: string = "ACTIVE") => {
  const now = new Date();
  const expDate = new Date(expiryDateStr);

  // Use calendar day boundary calculation
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const expUtc = Date.UTC(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
  const diffDays = Math.round((expUtc - nowUtc) / (1000 * 60 * 60 * 24));

  let validityStatus: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" = "ACTIVE";
  if (diffDays < 0) {
    validityStatus = "EXPIRED";
  } else if (diffDays <= 30) {
    validityStatus = "EXPIRING_SOON";
  }

  let status: LicenseDoc["status"] = validityStatus;
  if (adminStatus === "RENEWAL_PENDING" || adminStatus === "RENEWAL_SUBMITTED") {
    status = "RENEWAL_PENDING";
  }

  return { daysRemaining: diffDays, validityStatus, status };
};

const LicenseDocumentsPage = () => {
  const [data, setData] = useState<LicenseDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modal & DatePicker State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newNumber, setNewNumber] = useState<string>("");
  const [newAuthority, setNewAuthority] = useState<string>("National Medicines Regulatory Authority (NMRA)");
  const [newFacility, setNewFacility] = useState<string>("Colombo Central Warehouse (HQ)");
  const [newCategory, setNewCategory] = useState<string>("NMRA");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getProducts({ page: 1, limit: 100 });
      const rawProducts = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);

      // 1. Process statutory premises & facility licenses
      const mappedPremises: LicenseDoc[] = STATUTORY_PREMISES_LICENSES.map((lic) => {
        const { daysRemaining, validityStatus, status } = calculateLicenseValidity(lic.expiryDate, lic.adminStatus);
        return {
          ...lic,
          daysRemaining,
          validityStatus,
          status,
        };
      });

      // 2. Process product formulations licenses
      const mappedProducts: LicenseDoc[] = rawProducts.map((p: any) => {
        const licNo = p.nmra_registration_number || `REG-${p.product_code || p.id}`;
        const expDateStr = p.nmra_expiry_date
          ? new Date(p.nmra_expiry_date).toISOString().split("T")[0]
          : "2028-12-31";
        const { daysRemaining, validityStatus, status } = calculateLicenseValidity(expDateStr, "ACTIVE");

        return {
          id: String(p.id),
          licenseNumber: licNo,
          title: `${p.product_name || "Pharmaceutical Item"} - NMRA Registration Certificate`,
          authority: "National Medicines Regulatory Authority (NMRA)",
          facility: p.manufacturer?.name || "Colombo Central Warehouse (HQ)",
          issueDate: p.created_at ? new Date(p.created_at).toISOString().split("T")[0] : "2025-01-01",
          expiryDate: expDateStr,
          daysRemaining,
          adminStatus: "ACTIVE",
          validityStatus,
          status,
          category: "NMRA",
        };
      });

      // 3. Load locally registered licenses if any
      let localSaved: LicenseDoc[] = [];
      try {
        const savedStr = localStorage.getItem("ceylonmed_registered_licenses");
        if (savedStr) {
          const parsed = JSON.parse(savedStr);
          if (Array.isArray(parsed)) {
            localSaved = parsed.map((item: any) => {
              const { daysRemaining, validityStatus, status } = calculateLicenseValidity(item.expiryDate, item.adminStatus || "ACTIVE");
              return {
                ...item,
                daysRemaining,
                validityStatus,
                status,
              };
            });
          }
        }
      } catch {
        // ignore
      }

      setData([...localSaved, ...mappedPremises, ...mappedProducts]);
    } catch {
      // Fallback to premises licenses if products API fails
      const fallbackPremises: LicenseDoc[] = STATUTORY_PREMISES_LICENSES.map((lic) => {
        const { daysRemaining, validityStatus, status } = calculateLicenseValidity(lic.expiryDate, lic.adminStatus);
        return {
          ...lic,
          daysRemaining,
          validityStatus,
          status,
        };
      });
      setData(fallbackPremises);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
      const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authority.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [data, selectedStatus, selectedCategory, searchQuery]);

  // Renewal Modal State
  const [renewTarget, setRenewTarget] = useState<LicenseDoc | null>(null);
  const [renewYears, setRenewYears] = useState<number>(1);
  const [renewNotes, setRenewNotes] = useState<string>("");

  const handleOpenRenewModal = useCallback((lic: LicenseDoc) => {
    setRenewTarget(lic);
    setRenewYears(1);
    setRenewNotes("");
  }, []);

  const handleConfirmRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewTarget) return;

    const currentExp = new Date(renewTarget.expiryDate);
    const newExp = new Date(currentExp);
    newExp.setFullYear(newExp.getFullYear() + renewYears);
    const newExpStr = newExp.toISOString().split("T")[0];
    const { daysRemaining, validityStatus, status } = calculateLicenseValidity(newExpStr, "ACTIVE");

    const updatedDoc: LicenseDoc = {
      ...renewTarget,
      expiryDate: newExpStr,
      daysRemaining,
      validityStatus,
      status,
      adminStatus: "ACTIVE",
    };

    const updated = data.map((item) => (item.id === renewTarget.id ? updatedDoc : item));
    setData(updated);

    try {
      const existingStr = localStorage.getItem("ceylonmed_registered_licenses");
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const filteredExisting = existing.filter((item: any) => item.id !== renewTarget.id);
      localStorage.setItem("ceylonmed_registered_licenses", JSON.stringify([updatedDoc, ...filteredExisting]));
    } catch {
      // ignore
    }

    setRenewTarget(null);
    toast.success(`License ${renewTarget.licenseNumber} successfully renewed until ${newExpStr}!`);
  };

  const handleDownloadCertificate = useCallback((lic: LicenseDoc) => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Outer Decorative Border
      doc.setDrawColor(72, 84, 204);
      doc.setLineWidth(1.5);
      doc.rect(10, 10, pageWidth - 20, 277);

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.rect(12, 12, pageWidth - 24, 273);

      // Header Band
      doc.setFillColor(30, 27, 75);
      doc.rect(12, 12, pageWidth - 24, 38, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("CEYLON MEDEX PHARMACEUTICALS", pageWidth / 2, 23, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(199, 210, 254);
      doc.text("REGULATORY COMPLIANCE & STATUTORY AUTHORIZATION CERTIFICATE", pageWidth / 2, 31, { align: "center" });

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Democratic Socialist Republic of Sri Lanka • National Health & Drug Regulatory Framework", pageWidth / 2, 39, { align: "center" });

      // Certificate Title & License Pill
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("CERTIFICATE OF STATUTORY REGISTRATION", pageWidth / 2, 59, { align: "center" });

      doc.setFillColor(238, 242, 255);
      doc.roundedRect(pageWidth / 2 - 45, 65, 90, 11, 3, 3, "F");
      doc.setTextColor(72, 84, 204);
      doc.setFontSize(11);
      doc.text(lic.licenseNumber, pageWidth / 2, 72.5, { align: "center" });

      // Scope & Description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const splitTitle = doc.splitTextToSize(lic.title, 160);
      doc.text(splitTitle, pageWidth / 2, 85, { align: "center" });

      // Table Details
      const standing =
        lic.validityStatus === "ACTIVE"
          ? "ACTIVE & FULLY COMPLIANT"
          : lic.validityStatus === "EXPIRING_SOON"
          ? "EXPIRING SOON"
          : "EXPIRED / RENEWAL REQUIRED";

      const details = [
        ["Issuing Authority", lic.authority],
        ["Registered Facility", lic.facility],
        ["Regulatory Category", lic.category],
        ["Date of Issue", lic.issueDate],
        ["Date of Expiration", lic.expiryDate],
        ["Current Compliance Standing", standing],
        ["Administrative Status", lic.adminStatus || "ACTIVE ON FILE"],
        ["Days Remaining", `${lic.daysRemaining} calendar day(s)`],
      ];

      autoTable(doc, {
        startY: 100,
        margin: { left: 20, right: 20 },
        body: details,
        theme: "striped",
        styles: { fontSize: 9.5, cellPadding: 3.8, textColor: [30, 41, 59] },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, textColor: [51, 65, 85] },
          1: { cellWidth: "auto" },
        },
        headStyles: { fillColor: [72, 84, 204] },
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 175;

      // Declaration
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("STATUTORY DECLARATION & AUDIT VERIFICATION", 20, finalY + 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(
        "This official electronic certificate verifies that the establishment and operational scope detailed above holds authorized statutory standing under the regulations of the National Medicines Regulatory Authority (NMRA). Issued by Ceylon MedEx Global ERP Compliance Center.",
        20,
        finalY + 25,
        { maxWidth: pageWidth - 40 }
      );

      // Signature lines
      const sigY = finalY + 46;
      doc.setDrawColor(203, 213, 225);
      doc.line(25, sigY, 75, sigY);
      doc.line(pageWidth - 75, sigY, pageWidth - 25, sigY);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text("Dr. Kalinga Silva", 50, sigY + 5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Managing Director / Authorized Signatory", 50, sigY + 10, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text("Regulatory Affairs Director", pageWidth - 50, sigY + 5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Statutory Compliance Division", pageWidth - 50, sigY + 10, { align: "center" });

      // Footer stamp
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      const stamp = `VERIFIED CERTIFICATE • ID: ${lic.id.toUpperCase()} • ISSUED: ${new Date().toISOString()} • CEYLON MEDEX ERP`;
      doc.text(stamp, pageWidth / 2, 280, { align: "center" });

      doc.save(`License-Certificate-${lic.licenseNumber.replace(/[\/\\]/g, "_")}.pdf`);
      toast.success(`Official certificate downloaded for ${lic.licenseNumber}`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate license certificate PDF");
    }
  }, []);

  const columns = useMemo<ColumnDef<LicenseDoc>[]>(
    () => [
      {
        accessorKey: "licenseNumber",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold uppercase tracking-wider hover:text-indigo-600 transition-colors"
          >
            License Number <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-mono font-bold text-xs text-indigo-600 ">
              {row.getValue("licenseNumber")}
            </p>
            <span className="text-[11px] font-semibold text-slate-800  line-clamp-1 mt-0.5">
              {row.original.title}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "authority",
        header: "Issuing Authority & Scope",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-800  text-xs">{row.original.authority}</p>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Building2 className="h-3 w-3" /> {row.original.facility}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100  px-2 py-0.5 text-xs font-bold text-slate-700 ">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "expiryDate",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold uppercase tracking-wider hover:text-indigo-600 transition-colors"
          >
            Expiration & Timeline <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const days = row.original.daysRemaining;
          return (
            <div>
              <p className="font-mono text-xs font-medium text-slate-700 ">
                Expires: {row.original.expiryDate}
              </p>
              {days < 0 ? (
                <span className="text-[11px] font-bold text-rose-600  flex items-center gap-1 mt-0.5">
                  <XCircle className="h-3 w-3" /> Expired {Math.abs(days)} days ago
                </span>
              ) : days <= 30 ? (
                <span className="text-[11px] font-bold text-amber-600  flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3" /> Expiring in {days} days!
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-600  flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" /> {days} days remaining
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status & Validity",
        cell: ({ row }) => {
          const st = row.original.status;
          const adminSt = row.original.adminStatus;
          const isExpired = row.original.daysRemaining < 0;

          if (isExpired) {
            return (
              <div className="flex flex-col gap-1 items-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-0.5 text-[11px] font-bold">
                  <XCircle className="h-3 w-3" /> EXPIRED
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  Admin: {adminSt || "Active on File"}
                </span>
              </div>
            );
          }
          if (st === "EXPIRING_SOON") {
            return (
              <div className="flex flex-col gap-1 items-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 text-[11px] font-bold animate-pulse">
                  <AlertTriangle className="h-3 w-3" /> EXPIRING SOON
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  Admin: {adminSt || "Active"}
                </span>
              </div>
            );
          }
          if (st === "RENEWAL_PENDING") {
            return (
              <div className="flex flex-col gap-1 items-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 text-[11px] font-bold">
                  <RefreshCw className="h-3 w-3 animate-spin" /> RENEWAL IN PROGRESS
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  Admin: {adminSt || "Renewal Submitted"}
                </span>
              </div>
            );
          }
          return (
            <div className="flex flex-col gap-1 items-start">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-bold">
                <CheckCircle2 className="h-3 w-3" /> ACTIVE
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Admin: {adminSt || "Active"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="text-right block pr-4">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2 pr-4">
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleDownloadCertificate(row.original)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs"
                  aria-label="Download Certificate PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white shadow-xl">
                Download Official Certificate PDF
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleOpenRenewModal(row.original)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  Renew License
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white shadow-xl">
                Submit Renewal & Extension
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [handleDownloadCertificate, handleOpenRenewModal]
  );

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchQuery, selectedCategory, selectedStatus]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  });

  const handleExportCsv = () => {
    const headers = [
      "License #",
      "Title",
      "Category",
      "Authority",
      "Facility",
      "Issue Date",
      "Expiry Date",
      "Days Left",
      "Validity",
      "Status",
    ];
    const rows = filteredData.map((d) => [
      d.licenseNumber,
      d.title,
      d.category,
      d.authority,
      d.facility,
      d.issueDate,
      d.expiryDate,
      d.daysRemaining,
      d.validityStatus,
      d.status,
    ]);
    exportToCsv("licenses-regulatory-permits", headers, rows);
    toast.success("Excel report exported successfully");
  };

  const handleExportPdf = () => {
    const headers = [
      "License #",
      "Title",
      "Category",
      "Authority",
      "Facility",
      "Expiry Date",
      "Days Left",
      "Validity",
    ];
    const rows = filteredData.map((d) => [
      d.licenseNumber,
      d.title,
      d.category,
      d.authority,
      d.facility,
      d.expiryDate,
      String(d.daysRemaining),
      d.validityStatus,
    ]);
    exportToPdf({
      title: "License Documents & Regulatory Permits",
      filename: "licenses-regulatory-permits",
      headers,
      rows,
      orientation: "landscape",
    });
    toast.success("PDF report generated successfully");
  };

  const handleRegisterLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newNumber) return;
    const expStr = selectedDate ? selectedDate.toISOString().split("T")[0] : "2027-06-30";
    const { daysRemaining, validityStatus, status } = calculateLicenseValidity(expStr, "ACTIVE");
    const newDoc: LicenseDoc = {
      id: `lic-${Date.now()}`,
      licenseNumber: newNumber,
      title: newTitle,
      authority: newAuthority,
      facility: newFacility,
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: expStr,
      daysRemaining,
      adminStatus: "ACTIVE",
      validityStatus,
      status,
      category: newCategory as any,
    };
    const updated = [newDoc, ...data];
    setData(updated);
    try {
      const existingStr = localStorage.getItem("ceylonmed_registered_licenses");
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem("ceylonmed_registered_licenses", JSON.stringify([newDoc, ...existing]));
    } catch {
      // ignore
    }
    setIsModalOpen(false);
    setNewTitle("");
    setNewNumber("");
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80  pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 ">
                Compliance Center • Legal & Authorization
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900  sm:text-3xl">
                License Documents & Regulatory Permits
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500  pl-12">
            Centralized archive of NMRA drug licenses, IRAS tax certificates, municipal health permits, and renewal tracking
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredData.length === 0}
                className="flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Export Excel
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white shadow-xl">
              Download CSV/Excel Spreadsheet
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={filteredData.length === 0}
                className="flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-rose-600" />
                Export PDF
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white shadow-xl">
              Export Regulatory Register Report (PDF)
            </TooltipContent>
          </Tooltip>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Register New License
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Registered Permits</span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">{data.length}</p>
          <span className="text-xs text-indigo-600 font-semibold mt-1 block">
            Across {new Set(data.map((d) => d.facility)).size} facility location{new Set(data.map((d) => d.facility)).size === 1 ? "" : "s"}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active & Compliant</span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 ">
            {data.filter((l) => l.validityStatus === "ACTIVE").length}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Good standing</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiring / Renewal Needed</span>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 ">
            {data.filter((l) => l.validityStatus === "EXPIRING_SOON" || l.status === "RENEWAL_PENDING").length}
          </p>
          <span className="text-xs text-amber-600 font-semibold mt-1 block">Action required &lt; 30 days</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expired / Lapsed</span>
          <p className="mt-2 text-3xl font-extrabold text-rose-600 ">
            {data.filter((l) => l.validityStatus === "EXPIRED").length}
          </p>
          <span className="text-xs text-rose-600 font-semibold mt-1 block">Requires immediate reinstatement</span>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200  bg-white  p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by license #, title, or issuing authority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200  bg-slate-50/50  pl-10 pr-4 text-sm text-slate-900  placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3.5 text-xs font-semibold text-slate-700  focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="NMRA">NMRA Pharmaceutical</option>
            <option value="IRAS">Inland Revenue / Tax</option>
            <option value="HEALTH_MUNICIPAL">Municipal Health</option>
            <option value="DANGEROUS_DRUGS">Dangerous Drugs Board</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3.5 text-xs font-semibold text-slate-700  focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active & Compliant</option>
            <option value="EXPIRING_SOON">Expiring Soon (&lt; 30D)</option>
            <option value="RENEWAL_PENDING">Renewal Pending</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* ── TanStack Table ── */}
      <div className="rounded-xl border border-slate-200  bg-white  shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-200  bg-slate-50/50  text-xs font-bold uppercase tracking-wider text-slate-400">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-5 py-3.5">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-2" />
                    <p className="text-sm font-medium">Loading registered licenses...</p>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-500 ">
                    No license documents match your search criteria.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50  transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <TablePagination
          pageIndex={table.getState().pagination.pageIndex}
          pageSize={table.getState().pagination.pageSize}
          totalItems={filteredData.length}
          pageCount={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </div>

      {/* ── Modal: Register New License ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200  bg-white  p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100  pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-indigo-50  p-2 text-indigo-600 ">
                  <FileCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 ">Register New Regulatory License</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterLicense} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">License Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NMRA Controlled Substance Operating License"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200  bg-slate-50  px-3.5 text-sm font-semibold text-slate-900  focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">License Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WHL-9901/2026"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200  bg-slate-50  px-3.5 text-sm font-mono font-bold text-indigo-600  focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200  bg-white  px-3 text-xs font-semibold text-slate-900  focus:outline-none"
                  >
                    <option value="NMRA">NMRA Pharmaceutical</option>
                    <option value="IRAS">Inland Revenue / Tax</option>
                    <option value="HEALTH_MUNICIPAL">Municipal Health</option>
                    <option value="DANGEROUS_DRUGS">Dangerous Drugs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Issuing Authority</label>
                <input
                  type="text"
                  value={newAuthority}
                  onChange={(e) => setNewAuthority(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200  bg-slate-50  px-3.5 text-xs text-slate-900  focus:outline-none"
                />
              </div>

              {/* React DayPicker Expiration Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Expiration Date (Selected: {selectedDate ? selectedDate.toLocaleDateString() : "None"})
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200  bg-slate-50  px-3.5 text-xs font-semibold text-slate-800 "
                  >
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-indigo-600" />
                      {selectedDate ? selectedDate.toDateString() : "Select Expiration Date"}
                    </span>
                    <span className="text-indigo-600 font-bold">Change Date</span>
                  </button>

                  {showDatePicker && (
                    <div className="absolute z-50 mt-2 rounded-2xl border border-slate-200  bg-white  p-4 shadow-2xl">
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setShowDatePicker(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 ">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-slate-100  px-5 py-2 text-xs font-semibold text-slate-700  hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Register License
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Renew License ── */}
      {renewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 border border-indigo-100">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Renew Regulatory License</h3>
                  <p className="text-xs text-indigo-600 font-mono font-bold mt-0.5">{renewTarget.licenseNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRenewTarget(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRenewal} className="space-y-4 text-sm">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-1.5">
                <p className="text-xs font-semibold text-slate-800">{renewTarget.title}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                  <span>Authority: <strong className="text-slate-700">{renewTarget.authority}</strong></span>
                  <span>Current Expiry: <strong className="text-slate-700">{renewTarget.expiryDate}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Extension Period
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((yrs) => (
                    <button
                      key={yrs}
                      type="button"
                      onClick={() => setRenewYears(yrs)}
                      className={`h-10 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        renewYears === yrs
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      +{yrs} Year{yrs > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Renewal Application / Gazette Tracking Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. NMRA/REN-2026/0891 or IRD-EXT-442"
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRenewTarget(null)}
                  className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
                >
                  Confirm & Renew License
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseDocumentsPage;
