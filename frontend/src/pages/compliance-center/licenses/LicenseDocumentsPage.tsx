import React, { useState, useMemo } from "react";
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
} from "lucide-react";

interface LicenseDoc {
  id: string;
  licenseNumber: string;
  title: string;
  authority: string;
  facility: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "RENEWAL_PENDING";
  category: "NMRA" | "IRAS" | "HEALTH_MUNICIPAL" | "DANGEROUS_DRUGS";
}

const initialLicenses: LicenseDoc[] = [
  {
    id: "lic-101",
    licenseNumber: "WHL-4402/2026",
    title: "NMRA Wholesale Pharmaceutical Import & Distribution License",
    authority: "National Medicines Regulatory Authority (NMRA)",
    facility: "Colombo Central Warehouse (HQ)",
    issueDate: "2025-07-01",
    expiryDate: "2026-06-30",
    daysRemaining: 361,
    status: "ACTIVE",
    category: "NMRA",
  },
  {
    id: "lic-102",
    licenseNumber: "RET-8812/2025",
    title: "NMRA Retail Pharmacy Operating License",
    authority: "National Medicines Regulatory Authority (NMRA)",
    facility: "Union Place Branch",
    issueDate: "2024-08-15",
    expiryDate: "2026-07-25",
    daysRemaining: 21,
    status: "EXPIRING_SOON",
    category: "NMRA",
  },
  {
    id: "lic-103",
    licenseNumber: "DDB-9021/2026",
    title: "Dangerous Drugs & Controlled Substances Permit (Schedule III)",
    authority: "National Dangerous Drugs Control Board (NDDCB)",
    facility: "Cold Storage Depot (Kelaniya)",
    issueDate: "2025-01-10",
    expiryDate: "2026-01-09",
    daysRemaining: -176,
    status: "EXPIRED",
    category: "DANGEROUS_DRUGS",
  },
  {
    id: "lic-104",
    licenseNumber: "IRAS-VAT-0092",
    title: "Inland Revenue VAT & TIN Registration Certificate",
    authority: "Inland Revenue Department (IRAS / IRD)",
    facility: "Corporate HQ",
    issueDate: "2022-04-01",
    expiryDate: "2028-03-31",
    daysRemaining: 635,
    status: "ACTIVE",
    category: "IRAS",
  },
  {
    id: "lic-105",
    licenseNumber: "MOH-SAN-7741",
    title: "Municipal Sanitary & Health Inspection Certificate",
    authority: "Colombo Municipal Council (CMC Health Dept)",
    facility: "Colombo Central Warehouse (HQ)",
    issueDate: "2025-06-01",
    expiryDate: "2026-05-31",
    daysRemaining: 330,
    status: "ACTIVE",
    category: "HEALTH_MUNICIPAL",
  },
  {
    id: "lic-106",
    licenseNumber: "WHL-4489/2025",
    title: "NMRA Storage & Quality Assurance Facility License",
    authority: "National Medicines Regulatory Authority (NMRA)",
    facility: "Regional Distribution Center (NY)",
    issueDate: "2024-07-10",
    expiryDate: "2026-07-15",
    daysRemaining: 11,
    status: "RENEWAL_PENDING",
    category: "NMRA",
  },
];

const LicenseDocumentsPage = () => {
  const [data, setData] = useState<LicenseDoc[]>(initialLicenses);
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
        header: "Status",
        cell: ({ row }) => {
          const st = row.original.status;
          if (st === "ACTIVE") {
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700   border border-emerald-200/60  px-2.5 py-0.5 text-[11px] font-bold">
                <CheckCircle2 className="h-3 w-3" /> ACTIVE
              </span>
            );
          }
          if (st === "EXPIRING_SOON") {
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700   border border-amber-200/60  px-2.5 py-0.5 text-[11px] font-bold animate-pulse">
                <AlertTriangle className="h-3 w-3" /> EXPIRING SOON
              </span>
            );
          }
          if (st === "RENEWAL_PENDING") {
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700   border border-indigo-200/60  px-2.5 py-0.5 text-[11px] font-bold">
                <RefreshCw className="h-3 w-3 animate-spin" /> RENEWAL IN PROGRESS
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700   border border-rose-200/60  px-2.5 py-0.5 text-[11px] font-bold">
              <XCircle className="h-3 w-3" /> EXPIRED
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="text-right block pr-4">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2 pr-4">
            <button className="rounded-lg border border-slate-200  p-1.5 text-slate-600  hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Download Certificate PDF">
              <Download className="h-4 w-4" />
            </button>
            <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs">
              Renew License
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleRegisterLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newNumber) return;
    const expStr = selectedDate ? selectedDate.toISOString().split("T")[0] : "2027-06-30";
    const newDoc: LicenseDoc = {
      id: `lic-${Date.now()}`,
      licenseNumber: newNumber,
      title: newTitle,
      authority: newAuthority,
      facility: newFacility,
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: expStr,
      daysRemaining: 365,
      status: "ACTIVE",
      category: newCategory as any,
    };
    setData([newDoc, ...data]);
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
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
          <span className="text-xs text-indigo-600 font-semibold mt-1 block">Across 4 facility locations</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active & Compliant</span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 ">
            {data.filter((l) => l.status === "ACTIVE").length}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Good standing</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiring / Renewal Needed</span>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 ">
            {data.filter((l) => l.status === "EXPIRING_SOON" || l.status === "RENEWAL_PENDING").length}
          </p>
          <span className="text-xs text-amber-600 font-semibold mt-1 block">Action required &lt; 30 days</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expired / Lapsed</span>
          <p className="mt-2 text-3xl font-extrabold text-rose-600 ">
            {data.filter((l) => l.status === "EXPIRED").length}
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
              {table.getRowModel().rows.length === 0 ? (
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
        <div className="flex items-center justify-between border-t border-slate-200  px-5 py-4 text-xs">
          <span className="text-slate-500  font-medium">
            Showing {table.getRowModel().rows.length} of {filteredData.length} licenses
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-slate-200  px-3 py-1.5 font-semibold text-slate-600  hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-slate-200  px-3 py-1.5 font-semibold text-slate-600  hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
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
    </div>
  );
};

export default LicenseDocumentsPage;
