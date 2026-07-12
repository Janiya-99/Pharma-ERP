import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Download,
  Calendar,
  Eye,
  Lock,
  Building2,
  User,
  Hash,
  Share2,
} from "lucide-react";

interface RegulatoryRecord {
  id: string;
  recordNumber: string;
  timestamp: string;
  category: "LICENSE_ACTION" | "QUARANTINE_HOLD" | "RECALL_NOTICE" | "DISPOSAL_WITNESS" | "NMRA_INSPECTION";
  subject: string;
  authority: string;
  facility: string;
  performedBy: string;
  sha256Hash: string;
  status: "VERIFIED_IMMUTABLE" | "ARCHIVED_SEALED";
  metadata: Record<string, string | number>;
}

const initialRecords: RegulatoryRecord[] = [
  {
    id: "rec-log-010",
    recordNumber: "REG-LOG-2026-8901",
    timestamp: "2026-07-04 14:32:10 UTC",
    category: "QUARANTINE_HOLD",
    subject: "Batch Quarantine Hold Triggered: Amoxicillin 500mg (Batch #AMX-9021)",
    authority: "Internal Quality Control Laboratory",
    facility: "Colombo Central Warehouse (HQ)",
    performedBy: "Dr. K. Silva (Head of QC)",
    sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    status: "VERIFIED_IMMUTABLE",
    metadata: {
      "Hold Reason": "Dissolution rate 78% (Spec min 80%)",
      "Stock Value Frozen": "2,100,000 LKR",
      "Affected Quantity": "5,000 Blister Packs",
      "Action Code": "QC_HOLD_09",
    },
  },
  {
    id: "rec-log-009",
    recordNumber: "REG-LOG-2026-8900",
    timestamp: "2026-07-03 11:15:44 UTC",
    category: "LICENSE_ACTION",
    subject: "NMRA Wholesale Pharmaceutical Import License #WHL-4402 Renewed",
    authority: "National Medicines Regulatory Authority (NMRA Sri Lanka)",
    facility: "Corporate HQ & Colombo Warehouse",
    performedBy: "NMRA Licensing Division",
    sha256Hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    status: "VERIFIED_IMMUTABLE",
    metadata: {
      "License Number": "WHL-4402/2026",
      "Valid Until": "2027-06-30",
      "Fee Paid (LKR)": "150,000",
      "Sign-off Officer": "Dr. A. Jayasinghe (NMRA Registrar)",
    },
  },
  {
    id: "rec-log-008",
    recordNumber: "REG-LOG-2026-8899",
    timestamp: "2026-07-01 16:20:02 UTC",
    category: "RECALL_NOTICE",
    subject: "Class II Voluntary Recall Broadcast: Paracetamol Syrup #PCM-1102",
    authority: "Manufacturer Safety Alert & NMRA Pharmacovigilance",
    facility: "Regional Distribution Network",
    performedBy: "S. Perera (Regulatory Affairs Lead)",
    sha256Hash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    status: "VERIFIED_IMMUTABLE",
    metadata: {
      "Recall Class": "Class II (Reversible Hazard)",
      "Total Distributed": "5,000 Bottles",
      "Notified Customers": "48 / 50 Pharmacies",
      "Broadcast ID": "ALT-2026-04",
    },
  },
  {
    id: "rec-log-007",
    recordNumber: "REG-LOG-2026-8898",
    timestamp: "2026-06-28 09:45:12 UTC",
    category: "DISPOSAL_WITNESS",
    subject: "Biomedical Incineration Witnessed: Expired Ceftriaxone Vials (850 units)",
    authority: "NMRA & Public Health Inspector (PHI)",
    facility: "Western Province Biomedical Incinerator",
    performedBy: "S. Gunawardena (PHI Officer)",
    sha256Hash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    status: "ARCHIVED_SEALED",
    metadata: {
      "Certificate ID": "CERT-DEST-8809",
      "Write-off Value": "807,500 LKR",
      "Witness Signature": "Verified Biometric / Bi-Partite Seal",
      "Method": "High-Temperature Incineration (>1100°C)",
    },
  },
  {
    id: "rec-log-006",
    recordNumber: "REG-LOG-2026-8897",
    timestamp: "2026-06-15 14:00:00 UTC",
    category: "NMRA_INSPECTION",
    subject: "Annual NMRA GMP & Good Storage Practice (GSP) Audit Inspection",
    authority: "National Medicines Regulatory Authority (Inspection Directorate)",
    facility: "Cold Storage Depot (Kelaniya)",
    performedBy: "Lead Inspector M. Fernando",
    sha256Hash: "68e656b251e67e8358bef8483ab0d51c6619f3e7a1a9f0e75838d41ff368f728",
    status: "ARCHIVED_SEALED",
    metadata: {
      "Inspection Score": "98.5% (Grade A - Excellent)",
      "Minor Findings": "1 (Thermography calibration tag updated)",
      "Audit Duration": "6.5 Hours",
      "Next Audit Due": "June 2027",
    },
  },
];

const RegulatoryRecordsPage = () => {
  const [data] = useState<RegulatoryRecord[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedRecord, setSelectedRecord] = useState<RegulatoryRecord | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesSearch =
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sha256Hash.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [data, selectedCategory, searchQuery]);

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80  pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 ">
                Compliance Center • Legal Archives & Audits
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900  sm:text-3xl">
                Regulatory Records & Inspection Archives
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500  pl-12">
            Cryptographically timestamped, tamper-proof repository of NMRA licenses, quality holds, recalls, and inspection dossiers
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          <button className="flex h-10 items-center gap-2 rounded-xl border border-slate-200  bg-white  px-4 text-sm font-semibold text-slate-700  hover:bg-slate-50 transition-all shadow-xs">
            <Download className="h-4 w-4 text-indigo-600" />
            Export Regulatory Dossier (PDF/JSON)
          </button>
        </div>
      </div>

      {/* ── Cryptographic Assurance Banner ── */}
      <div className="rounded-2xl border border-indigo-200/80  bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-600 text-white p-3 shadow-md">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900  flex items-center gap-2">
                Immutable Regulatory Audit Engine (OMACX PLC v2.4)
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100  px-2.5 py-0.5 text-[11px] font-bold text-emerald-800  border border-emerald-300/50 ">
                  <ShieldCheck className="h-3 w-3" /> WORM COMPLIANT (Write Once, Read Many)
                </span>
              </h3>
              <p className="text-xs text-slate-600  mt-1 max-w-3xl">
                All records logged in this register generate an irreversible SHA-256 cryptographic hash timestamped against global atomic clocks. This satisfies NMRA, Ministry of Health, and international GMP/GDP electronic archiving requirements.
              </p>
            </div>
          </div>
          <div className="text-right sm:border-l sm:border-indigo-200  sm:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Verified Records</span>
            <p className="text-2xl font-black text-indigo-600 ">{data.length}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">100% Hash Integrity Valid</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200  bg-white  p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search subject, record #, authority, or SHA-256 hash..."
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
            <option value="LICENSE_ACTION">License & Registration Actions</option>
            <option value="QUARANTINE_HOLD">Batch Quarantine & Quality Holds</option>
            <option value="RECALL_NOTICE">Product Recalls & Alerts</option>
            <option value="DISPOSAL_WITNESS">Witnessed Expiry Disposals</option>
            <option value="NMRA_INSPECTION">NMRA / MOH Audits & Inspections</option>
          </select>
        </div>
      </div>

      {/* ── Records Table ── */}
      <div className="rounded-xl border border-slate-200  bg-white  shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200  bg-slate-50/50  text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Record ID & Timestamp</th>
                <th className="px-5 py-3.5">Category & Scope</th>
                <th className="px-5 py-3.5">Subject & Authority</th>
                <th className="px-5 py-3.5">SHA-256 Cryptographic Hash</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 ">
                    No regulatory records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50  transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-xs text-indigo-600 ">{row.recordNumber}</p>
                      <span className="text-[11px] text-slate-400 font-medium">{row.timestamp}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100  px-2.5 py-0.5 text-xs font-bold text-slate-700 ">
                        {row.category.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <Building2 className="h-3 w-3" /> {row.facility}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-md">
                      <p className="font-bold text-slate-800  text-xs">{row.subject}</p>
                      <span className="text-[11px] text-slate-500  block mt-0.5">
                        Authority: <b>{row.authority}</b> • By: {row.performedBy}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500  bg-slate-50  px-2.5 py-1 rounded-md border border-slate-200/60  max-w-xs truncate">
                        <Hash className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate" title={row.sha256Hash}>{row.sha256Hash}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(row)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200  px-3 py-1.5 text-xs font-semibold text-slate-700  hover:bg-indigo-50 hover:text-indigo-600  transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Inspect Dossier & Metadata ── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200  bg-white  p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100  pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-indigo-50  p-2 text-indigo-600 ">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 ">Regulatory Inspection Dossier</h3>
                  <p className="text-xs text-slate-400">{selectedRecord.recordNumber} • {selectedRecord.timestamp}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50  p-4 border border-slate-100  space-y-2">
                <h4 className="font-bold text-slate-900  uppercase tracking-wider text-[11px] text-indigo-600 ">
                  Record Overview
                </h4>
                <p className="text-sm font-bold text-slate-800 ">{selectedRecord.subject}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-slate-600 ">
                  <p><b>Category:</b> {selectedRecord.category}</p>
                  <p><b>Facility Scope:</b> {selectedRecord.facility}</p>
                  <p><b>Authority:</b> {selectedRecord.authority}</p>
                  <p><b>Executed By:</b> {selectedRecord.performedBy}</p>
                </div>
              </div>

              {/* Cryptographic Proof */}
              <div className="rounded-xl bg-emerald-50/50  p-4 border border-emerald-200/60  space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800  uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> SHA-256 Cryptographic Assurance
                  </span>
                  <span className="rounded-full bg-emerald-100  px-2 py-0.5 font-bold text-[10px] text-emerald-800 ">
                    VERIFIED IMMUTABLE
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate-700  break-all bg-white  p-2.5 rounded-lg border border-emerald-200/40 ">
                  {selectedRecord.sha256Hash}
                </p>
                <p className="text-[11px] text-slate-500">
                  This hash signature confirms that this regulatory record has not been altered since timestamping.
                </p>
              </div>

              {/* Metadata Payload */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
                  Regulatory Metadata Payload
                </h4>
                <div className="rounded-xl border border-slate-200  bg-white  divide-y divide-slate-100  overflow-hidden">
                  {Object.entries(selectedRecord.metadata).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between px-4 py-2.5">
                      <span className="font-semibold text-slate-600 ">{key}</span>
                      <span className="font-bold text-slate-900  font-mono">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 ">
              <button
                onClick={() => alert(`Copied dossier SHA-256 to clipboard: ${selectedRecord.sha256Hash}`)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200  px-4 py-2 text-xs font-semibold text-slate-700  hover:bg-slate-50"
              >
                <Share2 className="h-3.5 w-3.5" /> Copy SHA-256 Hash
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-xl bg-slate-100  px-5 py-2 text-xs font-semibold text-slate-700  hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={() => alert("Downloading certified audit PDF...")}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Download Certified PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryRecordsPage;
