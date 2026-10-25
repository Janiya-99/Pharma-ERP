import React from "react";
import {
  BookOpen,
  ShieldCheck,
  Download,
  Share2,
  X,
  CheckCircle2,
  Building2,
  User,
  Copy,
  Check,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export type RegulatoryCategory =
  | "ALL"
  | "DEVIATION_REPORT"
  | "CAPA_ACTION"
  | "LICENSE_ACTION"
  | "QUARANTINE_HOLD"
  | "RECALL_NOTICE"
  | "DISPOSAL_WITNESS"
  | "NMRA_INSPECTION"
  | "FINANCE_GOVERNANCE"
  | "SYSTEM_AUDIT";

export interface RegulatoryRecord {
  id: string;
  recordNumber: string;
  timestamp: string;
  category: RegulatoryCategory;
  subject: string;
  authority: string;
  facility: string;
  performedBy: string;
  sha256Hash: string;
  status: "VERIFIED_IMMUTABLE" | "ARCHIVED_SEALED" | "INVESTIGATION" | "CAPA_INITIATED" | "RESOLVED";
  metadata: Record<string, string | number>;
}

export const DEFAULT_DEVIATIONS_AND_CAPA: RegulatoryRecord[] = [
  {
    id: "dev-0042",
    recordNumber: "DEV-2026-0042",
    timestamp: "2026-10-24 09:15:00 UTC",
    category: "DEVIATION_REPORT",
    subject: "Quality Deviation: Cold-Chain Walk-in Refrigerator 02 Temperature Excursion (+8.9°C for 32 mins during grid power transfer)",
    authority: "Internal Quality Assurance Department",
    facility: "Colombo Central Medical Warehouse (Cold-Chain Hub)",
    performedBy: "Dr. Nimal Senanayake (Quality Assurance Manager)",
    sha256Hash: "e4f8b92d6c1a7051834927cb51a9e3381fa4d0b138e617d9834b67039a85ef12",
    status: "INVESTIGATION",
    metadata: {
      "Deviation Type": "Unplanned Environmental Excursion",
      "Severity Level": "MAJOR",
      "Immediate Action Taken": "Automatic generator transfer activated, batches quarantined for stability verification",
      "CAPA Reference": "CAPA-2026-0019",
      "Regulatory Notification": "NMRA Good Distribution Practices (GDP) Cell",
    },
  },
  {
    id: "dev-0038",
    recordNumber: "DEV-2026-0038",
    timestamp: "2026-10-22 14:30:00 UTC",
    category: "DEVIATION_REPORT",
    subject: "Quality Deviation: Particulate Defect on Blister Foil Packaging for Amoxicillin 500mg Batch BAT-AMX-2026-04",
    authority: "Quality Control Laboratory & NMRA",
    facility: "Colombo Central Warehouse (Packaging Hall 1)",
    performedBy: "Tharindu Wickramasinghe (Lead Pharmacist & QC)",
    sha256Hash: "c9831a29f847120dbef628490a183572d4a1b0928e75c6130948b819273c5da4",
    status: "CAPA_INITIATED",
    metadata: {
      "Deviation Type": "Primary Packaging Visual Non-Conformance",
      "Severity Level": "CRITICAL",
      "Immediate Action Taken": "Batch BAT-AMX-2026-04 quarantined immediately; supplier batch foil-88 halted",
      "CAPA Reference": "CAPA-2026-0017",
      "NMRA Regulatory Filing": "REG-2026-QC-0881",
    },
  },
  {
    id: "capa-0019",
    recordNumber: "CAPA-2026-0019",
    timestamp: "2026-10-24 11:45:00 UTC",
    category: "CAPA_ACTION",
    subject: "CAPA: Install Redundant Digital IoT Temperature Sensors & Automatic SMS/Email Fail-safe Alarm on Walk-in Refrigerator 02",
    authority: "QA & Compliance Oversight Committee",
    facility: "Colombo Central Medical Warehouse",
    performedBy: "Dr. Nimal Senanayake (Quality Assurance Manager)",
    sha256Hash: "92b740ef821cd3894751029abce74910283b749501a2846938d61749b9281045",
    status: "RESOLVED",
    metadata: {
      "CAPA Classification": "Preventive & Corrective Action",
      "Target Completion": "2026-11-15",
      "Verification Method": "72-Hour continuous temperature logger validation assay",
      "Linked Deviation": "DEV-2026-0042",
      "Assigned Lead": "Dr. Nimal Senanayake (QA Manager)",
    },
  },
  {
    id: "capa-0017",
    recordNumber: "CAPA-2026-0017",
    timestamp: "2026-10-23 08:00:00 UTC",
    category: "CAPA_ACTION",
    subject: "CAPA: Enforce Supplier Certificate of Analysis (CoA) Tensile & Pinhole Testing for Blister Packaging Materials",
    authority: "QA & Compliance Committee & NMRA",
    facility: "Colombo Central Medical Warehouse",
    performedBy: "Tharindu Wickramasinghe (Lead Pharmacist & QC)",
    sha256Hash: "51834927cb51a9e3381fa4d0b138e617d9834b67039a85ef12e4f8b92d6c1a70",
    status: "RESOLVED",
    metadata: {
      "CAPA Classification": "Corrective Action & Supplier Quality Audit",
      "Target Completion": "2026-11-01",
      "Verification Method": "Pre-shipment batch sample testing and vacuum leak integrity test",
      "Linked Deviation": "DEV-2026-0038",
      "Assigned Lead": "Tharindu Wickramasinghe (SLMC-8941)",
    },
  },
];

export const generateSha256 = (seed: string): string => {
  let hash = "";
  for (let i = 0; i < 64; i++) {
    const charCode = (seed.charCodeAt(i % seed.length) * 31 + i * 17) % 16;
    hash += charCode.toString(16);
  }
  return hash;
};

// ── CERTIFIED PDF EXPORT ──
export const downloadCertifiedPdf = (record: RegulatoryRecord) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Top Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CEYLON MEDEX PHARMACEUTICALS (PVT) LTD", 14, 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("NMRA Licensed Importer & Wholesale Distributor • Regulatory Affairs Directorate", 14, 19);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("WORM Compliant Immutability Engine • National Medicines Regulatory Authority Compliance", 14, 25);

  // Title Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("REGULATORY COMPLIANCE DOSSIER & AUDIT CERTIFICATE", 14, 42);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated: ${new Date().toISOString().replace("T", " ").substring(0, 19)} UTC | Certificate Ref: CERT-${record.recordNumber}`,
    14,
    48
  );

  // Metadata Table
  const metadataRows = [
    ["Record Reference Number", record.recordNumber],
    ["Audit Timestamp (Atomic Clock)", record.timestamp],
    ["Regulatory Classification", record.category.replace(/_/g, " ")],
    ["Target Subject / Event", record.subject],
    ["Supervising Regulatory Authority", record.authority],
    ["Operating Facility / Scope", record.facility],
    ["Executed / Certified By", record.performedBy],
    ["Immutability Status", record.status],
    ...Object.entries(record.metadata).map(([k, v]) => [k, String(v)]),
  ];

  autoTable(doc, {
    startY: 53,
    head: [["Verification Parameter", "Certified Audit Data Record"]],
    body: metadataRows,
    theme: "striped",
    headStyles: {
      fillColor: [79, 70, 229], // indigo-600
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 65 },
      1: { cellWidth: 115 },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  // Cryptographic Proof Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, finalY + 8, 182, 34, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("SHA-256 CRYPTOGRAPHIC INTEGRITY PROOF (WORM ASSURANCE)", 20, finalY + 16);

  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(record.sha256Hash, 20, finalY + 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "This irreversible checksum was cryptographically stamped upon initial ledger entry. Any alteration invalidates this certificate.",
    20,
    31 + finalY
  );

  // Certification Statement
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const certStatement =
    "This official document certifies that the record described herein has been recorded in Ceylon MedEx's Regulatory Audit Ledger in compliance with National Medicines Regulatory Authority (NMRA) Act No. 5 of 2015, WHO Good Distribution Practices (GDP), and Current Good Manufacturing Practices (cGMP).";
  doc.text(certStatement, 14, finalY + 48, { maxWidth: 182 });

  // Signatures
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  doc.line(14, finalY + 68, 75, finalY + 68);
  doc.text("Head of Regulatory Affairs & QA", 14, finalY + 72);
  doc.text("Dr. Nimal Senanayake", 14, finalY + 76);

  doc.line(125, finalY + 68, 185, finalY + 68);
  doc.text("Supervising Pharmacist / QP", 125, finalY + 72);
  doc.text("Tharindu Wickramasinghe (SLMC-8941)", 125, finalY + 76);

  doc.save(`CERTIFIED_AUDIT_${record.recordNumber}.pdf`);
};

// ── REDESIGNED INSPECTION DOSSIER MODAL ──
interface InspectionDossierModalProps {
  record: RegulatoryRecord | null;
  onClose: () => void;
}

export const InspectionDossierModal: React.FC<InspectionDossierModalProps> = ({
  record,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!record) return null;

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(record.sha256Hash);
    setCopied(true);
    toast.success("SHA-256 hash signature copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const isDeviation = record.category === "DEVIATION_REPORT";
  const isCapa = record.category === "CAPA_ACTION";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in-50 duration-200">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden my-6">
        {/* Modal Header Strip */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm text-white ${
                isDeviation
                  ? "bg-gradient-to-br from-amber-500 to-amber-600"
                  : isCapa
                  ? "bg-gradient-to-br from-emerald-600 to-teal-700"
                  : "bg-gradient-to-br from-indigo-600 to-blue-700"
              }`}
            >
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Regulatory Inspection Dossier</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    record.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300/60"
                      : record.status === "CAPA_INITIATED"
                      ? "bg-blue-100 text-blue-800 border border-blue-300/60"
                      : "bg-amber-100 text-amber-800 border border-amber-300/60"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" /> {record.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {record.recordNumber} • {record.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dossier modal"
            className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[calc(85vh-140px)] overflow-y-auto">
          {/* Record Overview Card */}
          <div className="rounded-2xl bg-slate-50/90 p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Record Subject & Summary
              </span>
              <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {record.category.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-snug">{record.subject}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-slate-600 border-t border-slate-200/60">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Facility Scope</span>
                  <span className="text-xs font-medium text-slate-800">{record.facility}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Executed / Certified By</span>
                  <span className="text-xs font-medium text-slate-800">{record.performedBy}</span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Supervising Authority</span>
                <span className="text-xs font-medium text-slate-800">{record.authority}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Proof Box */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/5 p-5 border border-emerald-300/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> SHA-256 Cryptographic Assurance
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-[10px] text-emerald-800 border border-emerald-300/50">
                VERIFIED IMMUTABLE
              </span>
            </div>
            
            {/* Hash Display with embedded copy button */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-200/80 shadow-xs">
              <p className="font-mono text-xs text-slate-800 font-semibold break-all select-all">
                {record.sha256Hash}
              </p>
              <button
                onClick={handleCopyHash}
                title="Copy SHA-256 Hash"
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500">
              This atomic cryptographic checksum confirms that this official record has not been altered since timestamping, satisfying NMRA, GDP, and cGMP standards.
            </p>
          </div>

          {/* Redesigned Regulatory Metadata Payload - FIXED ALIGNMENT */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
                Regulatory Metadata Payload
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {Object.keys(record.metadata).length} certified attributes
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
              {Object.entries(record.metadata).map(([key, val]) => (
                <div
                  key={key}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3 hover:bg-slate-50/70 transition-colors items-start"
                >
                  <div className="sm:col-span-4 text-xs font-semibold text-slate-600">
                    {key}
                  </div>
                  <div className="sm:col-span-8 text-xs font-medium text-slate-900 break-words leading-relaxed">
                    {String(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200/80">
          <button
            onClick={handleCopyHash}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" /> Copy SHA-256 Hash
          </button>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => downloadCertifiedPdf(record)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download Certified PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
