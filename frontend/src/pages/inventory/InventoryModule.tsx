import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CalendarClock,
  ClipboardList,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Package,
  Plus,
  Repeat,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Truck,
  Warehouse,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";
type DrawerMode = "create" | "edit" | "view";

type Product = {
  code: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: string;
  unit: string;
  manufacturer: string;
  stockStatus: string;
  status: string;
};

type ProductBatch = {
  product: string;
  batchNo: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  warehouse: string;
  status: string;
};

type WarehouseRecord = {
  code: string;
  name: string;
  branch: string;
  type: string;
  address: string;
  responsiblePerson: string;
  status: string;
};

type WarehouseLocationRecord = {
  code: string;
  name: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  status: string;
};

type Supplier = {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  paymentTerms: string;
  status: string;
};

type TableColumn<T> = {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

const toneClasses: Record<StatusTone, string> = {
  success: "border-green-100 bg-green-50 text-green-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  danger: "border-red-100 bg-red-50 text-red-700",
  info: "border-blue-100 bg-blue-50 text-blue-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

const products: Product[] = [
  {
    code: "MED-PARA-500",
    name: "Paracetamol 500mg Tablet",
    genericName: "Paracetamol",
    category: "Analgesics",
    dosageForm: "Tablet",
    unit: "Strip",
    manufacturer: "Ceymed Pharma",
    stockStatus: "Healthy",
    status: "Active",
  },
  {
    code: "MED-AMOX-250",
    name: "Amoxicillin 250mg Capsule",
    genericName: "Amoxicillin",
    category: "Antibiotics",
    dosageForm: "Capsule",
    unit: "Box",
    manufacturer: "Nova Labs",
    stockStatus: "Low Stock",
    status: "Active",
  },
  {
    code: "MED-METF-500",
    name: "Metformin 500mg Tablet",
    genericName: "Metformin",
    category: "Diabetes Care",
    dosageForm: "Tablet",
    unit: "Bottle",
    manufacturer: "Healthway",
    stockStatus: "Out of Stock",
    status: "Inactive",
  },
];

const batches: ProductBatch[] = [
  {
    product: "Paracetamol 500mg Tablet",
    batchNo: "B-PAR-2406",
    manufactureDate: "2025-01-15",
    expiryDate: "2027-01-15",
    quantity: 4200,
    warehouse: "Main Warehouse",
    status: "Active",
  },
  {
    product: "Amoxicillin 250mg Capsule",
    batchNo: "B-AMX-2502",
    manufactureDate: "2024-10-10",
    expiryDate: "2026-07-20",
    quantity: 480,
    warehouse: "Cold Room",
    status: "On Hold",
  },
  {
    product: "Cetrizine 10mg Tablet",
    batchNo: "B-CET-2309",
    manufactureDate: "2023-09-01",
    expiryDate: "2026-06-10",
    quantity: 0,
    warehouse: "Main Warehouse",
    status: "Expired",
  },
];

const warehouses: WarehouseRecord[] = [
  {
    code: "WH-HO-01",
    name: "Main Warehouse",
    branch: "Head Office",
    type: "Primary",
    address: "45 Galle Road, Colombo 03",
    responsiblePerson: "Nimal Silva",
    status: "Active",
  },
  {
    code: "WH-CLD-01",
    name: "Cold Room",
    branch: "Head Office",
    type: "Cold Storage",
    address: "45 Galle Road, Colombo 03",
    responsiblePerson: "Anusha Perera",
    status: "Active",
  },
  {
    code: "WH-KDY-01",
    name: "Kandy Warehouse",
    branch: "Kandy",
    type: "Branch",
    address: "12 Peradeniya Road, Kandy",
    responsiblePerson: "Ruwan Jayasena",
    status: "Active",
  },
];

const warehouseLocations: WarehouseLocationRecord[] = [
  { code: "A-01", name: "Fast Moving Rack", zone: "Zone A", rack: "R1", shelf: "S1", bin: "B01", status: "Active" },
  { code: "B-03", name: "Antibiotics Shelf", zone: "Zone B", rack: "R3", shelf: "S2", bin: "B08", status: "Active" },
  { code: "Q-01", name: "Quarantine Bin", zone: "QA", rack: "R1", shelf: "S1", bin: "HOLD", status: "Active" },
];

const suppliers: Supplier[] = [
  {
    code: "SUP-001",
    name: "Lanka Pharma Distributors",
    contactPerson: "Kasun Fernando",
    phone: "+94 77 112 3344",
    email: "orders@lankapharma.lk",
    paymentTerms: "30 days",
    status: "Active",
  },
  {
    code: "SUP-002",
    name: "MediSource Imports",
    contactPerson: "Ishara Gunasekara",
    phone: "+94 76 552 1010",
    email: "supply@medisource.lk",
    paymentTerms: "45 days",
    status: "Active",
  },
];

const lowStockProducts = [
  { product: "Amoxicillin 250mg Capsule", sku: "MED-AMOX-250", currentStock: 480, reorderLevel: 600, warehouse: "Cold Room", status: "Low Stock" },
  { product: "Metformin 500mg Tablet", sku: "MED-METF-500", currentStock: 0, reorderLevel: 300, warehouse: "Kandy Warehouse", status: "Out of Stock" },
  { product: "Vitamin C 1000mg Tablet", sku: "MED-VITC-1000", currentStock: 120, reorderLevel: 250, warehouse: "Main Warehouse", status: "Low Stock" },
];

const expiringBatches = [
  { product: "Amoxicillin 250mg Capsule", batchNo: "B-AMX-2502", expiryDate: "2026-07-20", quantity: 480, warehouse: "Cold Room", daysLeft: 23, status: "Expiring Soon" },
  { product: "Cetrizine 10mg Tablet", batchNo: "B-CET-2309", expiryDate: "2026-06-10", quantity: 0, warehouse: "Main Warehouse", daysLeft: -17, status: "Expired" },
  { product: "Omeprazole 20mg Capsule", batchNo: "B-OME-2411", expiryDate: "2026-08-14", quantity: 310, warehouse: "Main Warehouse", daysLeft: 48, status: "Monitor" },
];

const stockMovements = [
  { date: "2026-06-27", movementType: "GRN", product: "Paracetamol 500mg Tablet", batchNo: "B-PAR-2406", quantity: "+1,200", warehouse: "Main Warehouse", createdBy: "Nimal Silva" },
  { date: "2026-06-26", movementType: "Transfer", product: "Metformin 500mg Tablet", batchNo: "B-MET-2409", quantity: "-240", warehouse: "Kandy Warehouse", createdBy: "Anusha Perera" },
  { date: "2026-06-25", movementType: "Adjustment", product: "Cetrizine 10mg Tablet", batchNo: "B-CET-2309", quantity: "-36", warehouse: "Main Warehouse", createdBy: "Ruwan Jayasena" },
];

const warehouseSummary = [
  { warehouse: "Main Warehouse", totalProducts: 284, stockValue: "Rs. 18.4M", lowStockItems: 8, expiringBatches: 11 },
  { warehouse: "Cold Room", totalProducts: 64, stockValue: "Rs. 6.1M", lowStockItems: 3, expiringBatches: 4 },
  { warehouse: "Kandy Warehouse", totalProducts: 129, stockValue: "Rs. 7.8M", lowStockItems: 5, expiringBatches: 2 },
];

const topMovingProducts = [
  { product: "Paracetamol 500mg Tablet", quantityIn: 5200, quantityOut: 4100, currentStock: 4200 },
  { product: "Amoxicillin 250mg Capsule", quantityIn: 1800, quantityOut: 1320, currentStock: 480 },
  { product: "ORS Sachet", quantityIn: 3600, quantityOut: 2990, currentStock: 910 },
];

const setupTables = {
  categories: {
    title: "Categories",
    addLabel: "Add Category",
    columns: ["Category Code", "Category Name", "Description", "Status"],
    rows: [
      ["CAT-ANA", "Analgesics", "Pain and fever management", "Active"],
      ["CAT-ANT", "Antibiotics", "Antibacterial products", "Active"],
      ["CAT-DIA", "Diabetes Care", "Blood sugar management", "Active"],
    ],
  },
  units: {
    title: "Units",
    addLabel: "Add Unit",
    columns: ["Unit Code", "Unit Name", "Short Name", "Description", "Status"],
    rows: [
      ["UNT-STR", "Strip", "STR", "Tablet strip pack", "Active"],
      ["UNT-BOX", "Box", "BOX", "Box pack", "Active"],
      ["UNT-BTL", "Bottle", "BTL", "Bottle pack", "Active"],
    ],
  },
  dosageForms: {
    title: "Dosage Forms",
    addLabel: "Add Dosage Form",
    columns: ["Dosage Form Name", "Description", "Status"],
    rows: [
      ["Tablet", "Solid oral tablet", "Active"],
      ["Capsule", "Solid oral capsule", "Active"],
      ["Syrup", "Liquid oral dose", "Active"],
    ],
  },
  genericNames: {
    title: "Generic Names",
    addLabel: "Add Generic Name",
    columns: ["Generic Name", "Description", "Status"],
    rows: [
      ["Paracetamol", "Analgesic and antipyretic", "Active"],
      ["Amoxicillin", "Beta-lactam antibiotic", "Active"],
      ["Metformin", "Antidiabetic medicine", "Active"],
    ],
  },
  manufacturers: {
    title: "Manufacturers",
    addLabel: "Add Manufacturer",
    columns: ["Manufacturer Name", "Country", "Contact Number", "Email", "Status"],
    rows: [
      ["Ceymed Pharma", "Sri Lanka", "+94 11 245 8899", "quality@ceymed.lk", "Active"],
      ["Nova Labs", "India", "+91 44 2211 3020", "exports@novalabs.in", "Active"],
      ["Healthway", "Sri Lanka", "+94 11 702 3400", "support@healthway.lk", "Active"],
    ],
  },
};

const reportRows = {
  stockBalance: [
    ["Paracetamol 500mg Tablet", "B-PAR-2406", "Main Warehouse", "4,200", "3,950", "250", "Rs. 546,000"],
    ["Amoxicillin 250mg Capsule", "B-AMX-2502", "Cold Room", "480", "420", "60", "Rs. 326,400"],
    ["Metformin 500mg Tablet", "B-MET-2409", "Kandy Warehouse", "0", "0", "0", "Rs. 0"],
  ],
  stockLedger: [
    ["2026-06-27", "Paracetamol 500mg Tablet", "B-PAR-2406", "GRN", "GRN-0261", "1,200", "0", "4,200"],
    ["2026-06-26", "Metformin 500mg Tablet", "B-MET-2409", "Transfer", "TRF-0088", "0", "240", "0"],
    ["2026-06-25", "Cetrizine 10mg Tablet", "B-CET-2309", "Adjustment", "ADJ-0044", "0", "36", "0"],
  ],
  expiry: [
    ["Amoxicillin 250mg Capsule", "B-AMX-2502", "2026-07-20", "480", "23", "Cold Room", "Expiring Soon"],
    ["Cetrizine 10mg Tablet", "B-CET-2309", "2026-06-10", "0", "-17", "Main Warehouse", "Expired"],
    ["Omeprazole 20mg Capsule", "B-OME-2411", "2026-08-14", "310", "48", "Main Warehouse", "Monitor"],
  ],
  batch: [
    ["Paracetamol 500mg Tablet", "B-PAR-2406", "2025-01-15", "2027-01-15", "5,200", "1,000", "4,200", "Active"],
    ["Amoxicillin 250mg Capsule", "B-AMX-2502", "2024-10-10", "2026-07-20", "1,800", "1,320", "480", "On Hold"],
    ["Cetrizine 10mg Tablet", "B-CET-2309", "2023-09-01", "2026-06-10", "900", "864", "0", "Expired"],
  ],
};

function statusTone(status: string): StatusTone {
  const normalized = status.toLowerCase();
  if (["active", "healthy", "posted", "good"].some((word) => normalized.includes(word))) return "success";
  if (["low", "soon", "pending", "monitor", "hold", "draft"].some((word) => normalized.includes(word))) return "warning";
  if (["out", "expired", "inactive", "damage", "reject"].some((word) => normalized.includes(word))) return "danger";
  if (["transfer", "grn", "open"].some((word) => normalized.includes(word))) return "info";
  return "neutral";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={toneClasses[statusTone(status)]}>
      {status}
    </Badge>
  );
}

function InventoryPage({
  title,
  description,
  icon: Icon,
  actions,
  children,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[#F8FAFC] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {Icon ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
            ) : null}
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
              <p className="mt-1 max-w-3xl text-sm tracking-normal text-slate-500">{description}</p>
            </div>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function SearchToolbar({
  search,
  setSearch,
  children,
}: {
  search: string;
  setSearch: (value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          className="h-9 rounded-lg border-slate-200 bg-white pl-9 tracking-normal"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function DataGrid<T extends object>({ columns, data }: { columns: TableColumn<T>[]; data: T[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            {columns.map((column) => (
              <TableHead key={column.header} className="px-4 text-xs font-semibold uppercase tracking-normal text-slate-500">
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className="hover:bg-blue-50/30">
              {columns.map((column) => (
                <TableCell key={column.header} className={`px-4 py-3 text-sm tracking-normal text-slate-700 ${column.className || ""}`}>
                  {column.render ? column.render(row) : column.accessor ? String(row[column.accessor] ?? "") : null}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SimpleTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            {columns.map((column) => (
              <TableHead key={column} className="px-4 text-xs font-semibold uppercase tracking-normal text-slate-500">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} className="hover:bg-blue-50/30">
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="px-4 py-3 text-sm tracking-normal text-slate-700">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ActionMenu({ onView, onEdit, extra }: { onView?: () => void; onEdit?: () => void; extra?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="More actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {onView ? (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        ) : null}
        {onEdit ? (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem>{extra || "Deactivate"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InventoryDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  primaryLabel = "Save",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  primaryLabel?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-slate-200 bg-white p-0 sm:max-w-xl lg:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 px-6 py-5">
          <SheetTitle className="text-lg font-semibold tracking-normal text-slate-950">{title}</SheetTitle>
          <SheetDescription className="tracking-normal text-slate-500">{description}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-6 py-5">{children}</div>
        <SheetFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">{primaryLabel}</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold tracking-normal text-slate-950">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium tracking-normal text-slate-600">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </Label>
      <Input type={type} placeholder={placeholder || label} className="h-9 rounded-lg border-slate-200 tracking-normal" />
    </div>
  );
}

function SelectField({ label, values, required = false }: { label: string; values: string[]; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium tracking-normal text-slate-600">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </Label>
      <Select>
        <SelectTrigger className="h-9 w-full rounded-lg border-slate-200 tracking-normal">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {values.map((value) => (
            <SelectItem key={value} value={value.toLowerCase().replace(/\s+/g, "-")}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SwitchField({ label }: { label: string }) {
  return (
    <div className="flex min-h-9 items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
      <Label className="text-xs font-medium tracking-normal text-slate-600">{label}</Label>
      <Switch />
    </div>
  );
}

function ProductForm({ mode }: { mode: DrawerMode }) {
  const disabled = mode === "view";
  return (
    <fieldset disabled={disabled} className="space-y-5 disabled:opacity-90">
      <FormSection title="Basic Details">
        <Field label="Product Code" required />
        <Field label="Product Name" required />
        <SelectField label="Generic Name" values={["Paracetamol", "Amoxicillin", "Metformin"]} />
        <SelectField label="Category" values={["Analgesics", "Antibiotics", "Diabetes Care"]} required />
        <SelectField label="Dosage Form" values={["Tablet", "Capsule", "Syrup"]} />
        <SelectField label="Unit" values={["Strip", "Box", "Bottle"]} required />
        <SelectField label="Manufacturer" values={["Ceymed Pharma", "Nova Labs", "Healthway"]} />
        <SelectField label="Supplier" values={suppliers.map((supplier) => supplier.name)} />
        <Field label="Barcode" />
        <SelectField label="Status" values={["Active", "Inactive"]} required />
      </FormSection>
      <FormSection title="Pharma Details">
        <Field label="Strength" placeholder="500mg" />
        <Field label="Pack Size" placeholder="10 x 10" />
        <SwitchField label="Batch Tracking Required" />
        <SwitchField label="Expiry Tracking Required" />
        <SwitchField label="Prescription Required" />
      </FormSection>
      <FormSection title="Stock Rules">
        <Field label="Reorder Level" type="number" />
        <Field label="Minimum Stock" type="number" />
        <Field label="Maximum Stock" type="number" />
        <SelectField label="Default Warehouse" values={warehouses.map((warehouse) => warehouse.name)} />
      </FormSection>
      <FormSection title="Pricing">
        <Field label="Purchase Price" type="number" />
        <Field label="Selling Price" type="number" />
        <Field label="Tax Rate" type="number" />
      </FormSection>
      <FormSection title="Description">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium tracking-normal text-slate-600">Product Description</Label>
          <Textarea className="min-h-24 rounded-lg border-slate-200 tracking-normal" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium tracking-normal text-slate-600">Notes</Label>
          <Textarea className="min-h-20 rounded-lg border-slate-200 tracking-normal" />
        </div>
      </FormSection>
    </fieldset>
  );
}

function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  tone = "info",
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: StatusTone;
}) {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium tracking-normal text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{value}</p>
          <p className="mt-1 text-xs tracking-normal text-slate-500">{subtext}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCard({ title, value, tone }: { title: string; value: string; tone: StatusTone }) {
  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-sm font-semibold tracking-normal">{title}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-normal">{value}</p>
    </div>
  );
}

export function InventoryDashboardPage() {
  const [loading] = useState(false);

  return (
    <InventoryPage
      title="Inventory Dashboard"
      description="Monitor stock levels, batches, expiry risks, warehouse activity, and inventory movements."
      icon={LayoutDashboardIcon}
      actions={
        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-40 rounded-lg border-slate-200 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            <SelectItem value="main">Main Warehouse</SelectItem>
            <SelectItem value="cold">Cold Room</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)
        ) : (
          <>
            <KpiCard title="Total Products" value="477" subtext="421 active SKUs" icon={Package} tone="info" />
            <KpiCard title="Total Stock Value" value="Rs. 32.3M" subtext="Across 3 warehouses" icon={BarChart3} tone="success" />
            <KpiCard title="Low Stock Items" value="16" subtext="Below reorder level" icon={AlertTriangle} tone="warning" />
            <KpiCard title="Out of Stock Items" value="4" subtext="Requires replenishment" icon={Boxes} tone="danger" />
            <KpiCard title="Expiring Soon" value="17" subtext="Within 60 days" icon={CalendarClock} tone="warning" />
            <KpiCard title="Active Batches" value="1,238" subtext="Available for issue" icon={ClipboardList} tone="neutral" />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <AlertCard title="Expired Batches" value="2" tone="danger" />
        <AlertCard title="Expiring in 30 Days" value="7" tone="warning" />
        <AlertCard title="Products Below Reorder Level" value="16" tone="warning" />
        <AlertCard title="Stock Adjustment Pending Review" value="5" tone="info" />
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-normal text-slate-950">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Add Product", "/inventory/products", Package],
            ["Create GRN", "/inventory/grn", Truck],
            ["Transfer Stock", "/inventory/stock/transfers", Repeat],
            ["Adjust Stock", "/inventory/stock/adjustments", SlidersHorizontal],
            ["View Expiry Report", "/inventory/reports/expiry-report", CalendarClock],
          ].map(([label, href, Icon]) => {
            const QuickIcon = Icon as React.ComponentType<{ className?: string }>;
            return (
              <Button key={String(label)} asChild variant="outline" className="h-10 justify-start rounded-lg border-slate-200">
                <Link to={String(href)}>
                  <QuickIcon className="h-4 w-4 text-blue-600" />
                  {label}
                </Link>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Tabs defaultValue="low-stock" className="gap-4">
        <TabsList className="bg-white shadow-sm">
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="expiry">Expiring Batches</TabsTrigger>
          <TabsTrigger value="movements">Recent Movements</TabsTrigger>
        </TabsList>
        <TabsContent value="low-stock">
          <DataGrid
            columns={[
              { header: "Product", accessor: "product" },
              { header: "SKU / Code", accessor: "sku" },
              { header: "Current Stock", accessor: "currentStock" },
              { header: "Reorder Level", accessor: "reorderLevel" },
              { header: "Warehouse", accessor: "warehouse" },
              { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            ]}
            data={lowStockProducts}
          />
        </TabsContent>
        <TabsContent value="expiry">
          <DataGrid
            columns={[
              { header: "Product", accessor: "product" },
              { header: "Batch No", accessor: "batchNo" },
              { header: "Expiry Date", accessor: "expiryDate" },
              { header: "Quantity", accessor: "quantity" },
              { header: "Warehouse", accessor: "warehouse" },
              { header: "Days Left", accessor: "daysLeft" },
              { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            ]}
            data={expiringBatches}
          />
        </TabsContent>
        <TabsContent value="movements">
          <DataGrid
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Movement Type", accessor: "movementType" },
              { header: "Product", accessor: "product" },
              { header: "Batch No", accessor: "batchNo" },
              { header: "Quantity", accessor: "quantity" },
              { header: "Warehouse", accessor: "warehouse" },
              { header: "Created By", accessor: "createdBy" },
            ]}
            data={stockMovements}
          />
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-normal text-slate-950">Warehouse Stock Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {warehouseSummary.map((item) => (
              <div key={item.warehouse} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold tracking-normal text-slate-950">{item.warehouse}</p>
                  <Badge variant="outline" className="border-blue-100 bg-blue-50 text-blue-700">
                    {item.totalProducts} products
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm tracking-normal">
                  <div>
                    <p className="text-slate-500">Stock Value</p>
                    <p className="font-semibold text-slate-950">{item.stockValue}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Low Stock</p>
                    <p className="font-semibold text-slate-950">{item.lowStockItems}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Expiring</p>
                    <p className="font-semibold text-slate-950">{item.expiringBatches}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-normal text-slate-950">Top Moving Products</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              columns={[
                { header: "Product", accessor: "product" },
                { header: "Quantity In", accessor: "quantityIn" },
                { header: "Quantity Out", accessor: "quantityOut" },
                { header: "Current Stock", accessor: "currentStock" },
              ]}
              data={topMovingProducts}
            />
          </CardContent>
        </Card>
      </div>
    </InventoryPage>
  );
}

function LayoutDashboardIcon({ className }: { className?: string }) {
  return <BarChart3 className={className} />;
}

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<{ open: boolean; mode: DrawerMode; product?: Product }>({ open: false, mode: "create" });
  const filtered = useMemo(
    () => products.filter((product) => `${product.code} ${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <InventoryPage
      title="Products"
      description="Manage product master records, pharma details, stock rules, and pricing."
      icon={Package}
    >
      <SearchToolbar search={search} setSearch={setSearch}>
        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-40 rounded-lg border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="analgesics">Analgesics</SelectItem>
            <SelectItem value="antibiotics">Antibiotics</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="active">
          <SelectTrigger className="h-9 w-36 rounded-lg border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="all">All Status</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="rounded-lg border-slate-200">Import Products</Button>
        <Button variant="outline" className="rounded-lg border-slate-200">Export</Button>
        <Button onClick={() => setDrawer({ open: true, mode: "create" })} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </SearchToolbar>

      <DataGrid
        columns={[
          { header: "Product Code", accessor: "code" },
          { header: "Product Name", accessor: "name" },
          { header: "Generic Name", accessor: "genericName" },
          { header: "Category", accessor: "category" },
          { header: "Dosage Form", accessor: "dosageForm" },
          { header: "Unit", accessor: "unit" },
          { header: "Manufacturer", accessor: "manufacturer" },
          { header: "Stock Status", render: (row) => <StatusBadge status={row.stockStatus} /> },
          { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          {
            header: "Actions",
            render: (row) => (
              <ActionMenu
                onView={() => setDrawer({ open: true, mode: "view", product: row })}
                onEdit={() => setDrawer({ open: true, mode: "edit", product: row })}
                extra="View Batches"
              />
            ),
          },
        ]}
        data={filtered}
      />

      <InventoryDrawer
        open={drawer.open}
        onOpenChange={(open) => setDrawer((current) => ({ ...current, open }))}
        title={drawer.mode === "create" ? "Add Product" : drawer.mode === "edit" ? "Edit Product" : drawer.product?.name || "Product Details"}
        description="Use setup values for generic names, categories, dosage forms, units, and manufacturers."
        primaryLabel={drawer.mode === "view" ? "Done" : "Save Product"}
      >
        <ProductForm mode={drawer.mode} />
      </InventoryDrawer>
    </InventoryPage>
  );
}

export function ProductSetupPage() {
  const [search, setSearch] = useState("");
  const [drawerTitle, setDrawerTitle] = useState("Add Category");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <InventoryPage
      title="Product Setup"
      description="Manage categories, units, dosage forms, generic names, and manufacturers in one place."
      icon={Settings}
    >
      <SearchToolbar search={search} setSearch={setSearch} />
      <Tabs defaultValue="categories" className="gap-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start bg-white p-1 shadow-sm">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="dosageForms">Dosage Forms</TabsTrigger>
          <TabsTrigger value="genericNames">Generic Names</TabsTrigger>
          <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
        </TabsList>
        {(Object.keys(setupTables) as Array<keyof typeof setupTables>).map((key) => {
          const setup = setupTables[key];
          return (
            <TabsContent key={key} value={key} className="space-y-3">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setDrawerTitle(setup.addLabel);
                    setDrawerOpen(true);
                  }}
                  className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  {setup.addLabel}
                </Button>
              </div>
              <SimpleTable
                columns={[...setup.columns, "Actions"]}
                rows={setup.rows
                  .filter((row) => row.join(" ").toLowerCase().includes(search.toLowerCase()))
                  .map((row) => [
                    ...row.slice(0, -1),
                    <StatusBadge key="status" status={row[row.length - 1]} />,
                    <ActionMenu
                      key="actions"
                      onEdit={() => {
                        setDrawerTitle(`Edit ${setup.title.slice(0, -1)}`);
                        setDrawerOpen(true);
                      }}
                    />,
                  ])}
              />
            </TabsContent>
          );
        })}
      </Tabs>
      <InventoryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={drawerTitle}
        description="Setup records are used by Product Master forms and inventory reports."
        primaryLabel="Save Setup"
      >
        <FormSection title="Setup Details">
          <Field label="Code or Name" required />
          <Field label="Description" />
          <SelectField label="Status" values={["Active", "Inactive"]} required />
          <Field label="Contact Number" />
          <Field label="Email" />
          <Field label="Country" />
        </FormSection>
      </InventoryDrawer>
    </InventoryPage>
  );
}

export function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filtered = suppliers.filter((supplier) => `${supplier.code} ${supplier.name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <InventoryPage title="Suppliers" description="Create and manage suppliers." icon={Truck}>
      <SearchToolbar search={search} setSearch={setSearch}>
        <Button onClick={() => setDrawerOpen(true)} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </SearchToolbar>
      <DataGrid
        columns={[
          { header: "Supplier Code", accessor: "code" },
          { header: "Supplier Name", accessor: "name" },
          { header: "Contact Person", accessor: "contactPerson" },
          { header: "Phone", accessor: "phone" },
          { header: "Email", accessor: "email" },
          { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { header: "Actions", render: () => <ActionMenu onEdit={() => setDrawerOpen(true)} /> },
        ]}
        data={filtered}
      />
      <InventoryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Supplier" description="Supplier records feed GRNs and purchase returns." primaryLabel="Save Supplier">
        <FormSection title="Supplier Details">
          <Field label="Supplier Code" required />
          <Field label="Supplier Name" required />
          <Field label="Contact Person" />
          <Field label="Phone" />
          <Field label="Email" type="email" />
          <Field label="Payment Terms" />
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium tracking-normal text-slate-600">Address</Label>
            <Textarea className="min-h-24 rounded-lg border-slate-200 tracking-normal" />
          </div>
          <SelectField label="Status" values={["Active", "Inactive"]} required />
        </FormSection>
      </InventoryDrawer>
    </InventoryPage>
  );
}

export function WarehousesAndLocationsPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]);
  const [drawer, setDrawer] = useState<"warehouse" | "location" | null>(null);

  return (
    <InventoryPage
      title="Warehouses & Locations"
      description="Manage warehouses, branch stock locations, racks, shelves, and bins."
      icon={Warehouse}
      actions={
        <Button onClick={() => setDrawer("warehouse")} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-normal text-slate-950">Warehouse List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {warehouses.map((warehouse) => (
              <button
                key={warehouse.code}
                onClick={() => setSelectedWarehouse(warehouse)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selectedWarehouse.code === warehouse.code ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold tracking-normal text-slate-950">{warehouse.name}</p>
                    <p className="mt-1 text-xs tracking-normal text-slate-500">{warehouse.code} | {warehouse.branch}</p>
                  </div>
                  <StatusBadge status={warehouse.status} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-normal text-slate-950">{selectedWarehouse.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Warehouse Code", selectedWarehouse.code],
                ["Branch", selectedWarehouse.branch],
                ["Warehouse Type", selectedWarehouse.type],
                ["Address", selectedWarehouse.address],
                ["Responsible Person", selectedWarehouse.responsiblePerson],
                ["Status", <StatusBadge key="status" status={selectedWarehouse.status} />],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-medium tracking-normal text-slate-500">{label}</p>
                  <div className="mt-1 text-sm font-semibold tracking-normal text-slate-950">{value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-normal text-slate-950">Internal Locations</h2>
            <Button onClick={() => setDrawer("location")} variant="outline" className="rounded-lg border-slate-200">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>
          <DataGrid
            columns={[
              { header: "Location Code", accessor: "code" },
              { header: "Location Name", accessor: "name" },
              { header: "Zone", accessor: "zone" },
              { header: "Rack", accessor: "rack" },
              { header: "Shelf", accessor: "shelf" },
              { header: "Bin", accessor: "bin" },
              { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            ]}
            data={warehouseLocations}
          />
        </div>
      </div>
      <InventoryDrawer
        open={drawer !== null}
        onOpenChange={(open) => setDrawer(open ? drawer : null)}
        title={drawer === "location" ? "Warehouse Location" : "Warehouse"}
        description={drawer === "location" ? "Create zones, racks, shelves, and bins inside the selected warehouse." : "Create or edit warehouse master details."}
        primaryLabel="Save"
      >
        {drawer === "location" ? (
          <FormSection title="Warehouse Location">
            <Field label="Location Code" required />
            <Field label="Location Name" required />
            <Field label="Zone" />
            <Field label="Rack" />
            <Field label="Shelf" />
            <Field label="Bin" />
            <SelectField label="Status" values={["Active", "Inactive"]} required />
          </FormSection>
        ) : (
          <FormSection title="Warehouse Details">
            <Field label="Warehouse Code" required />
            <Field label="Warehouse Name" required />
            <SelectField label="Branch" values={["Head Office", "Kandy", "Galle"]} required />
            <SelectField label="Warehouse Type" values={["Primary", "Branch", "Cold Storage", "Quarantine"]} />
            <Field label="Address" />
            <Field label="Responsible Person" />
            <SelectField label="Status" values={["Active", "Inactive"]} required />
          </FormSection>
        )}
      </InventoryDrawer>
    </InventoryPage>
  );
}

export function GRNPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <InventoryPage
      title="GRN / Goods Receipt"
      description="Receive supplier stock, record batch numbers, expiry dates, and update warehouse inventory."
      icon={ClipboardList}
      actions={
        <>
          <Button variant="outline" className="rounded-lg border-slate-200">Save Draft</Button>
          <Button className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">Post GRN</Button>
        </>
      }
    >
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-normal text-slate-950">GRN Header</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="GRN Number" required />
            <Field label="GRN Date" type="date" required />
            <SelectField label="Supplier" values={suppliers.map((supplier) => supplier.name)} required />
            <Field label="Purchase Order Number" />
            <SelectField label="Warehouse" values={warehouses.map((warehouse) => warehouse.name)} required />
            <Field label="Received By" />
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-xs font-medium tracking-normal text-slate-600">Notes</Label>
              <Textarea className="min-h-20 rounded-lg border-slate-200 tracking-normal" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-normal text-slate-950">Line Items</h2>
        <Button onClick={() => setDrawerOpen(true)} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Line
        </Button>
      </div>
      <SimpleTable
        columns={["Product", "Batch Number", "Manufacture Date", "Expiry Date", "Quantity", "Free Qty", "Purchase Price", "Selling Price", "Tax", "Total"]}
        rows={[
          ["Paracetamol 500mg Tablet", "B-PAR-2406", "2025-01-15", "2027-01-15", "1,200", "60", "Rs. 95", "Rs. 130", "8%", "Rs. 123,120"],
          ["Amoxicillin 250mg Capsule", "B-AMX-2502", "2024-10-10", "2026-07-20", "480", "24", "Rs. 560", "Rs. 680", "8%", "Rs. 290,304"],
        ]}
      />
      <InventoryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title="GRN Line Item" description="Batch and expiry fields are required when tracking is enabled." primaryLabel="Add Line">
        <FormSection title="Line Item">
          <SelectField label="Product" values={products.map((product) => product.name)} required />
          <Field label="Batch Number" required />
          <Field label="Manufacture Date" type="date" />
          <Field label="Expiry Date" type="date" required />
          <Field label="Quantity" type="number" required />
          <Field label="Free Quantity" type="number" />
          <Field label="Purchase Price" type="number" />
          <Field label="Selling Price" type="number" />
          <Field label="Tax" type="number" />
          <Field label="Total" type="number" />
        </FormSection>
      </InventoryDrawer>
    </InventoryPage>
  );
}

export function ProductBatchesPage() {
  const [drawer, setDrawer] = useState<{ open: boolean; batch?: ProductBatch }>({ open: false });
  return (
    <InventoryPage
      title="Product Batches"
      description="View and manage product batch records. Most batches are created automatically from GRNs."
      icon={Boxes}
    >
      <DataGrid
        columns={[
          { header: "Product", accessor: "product" },
          { header: "Batch Number", accessor: "batchNo" },
          { header: "Manufacture Date", accessor: "manufactureDate" },
          { header: "Expiry Date", accessor: "expiryDate" },
          { header: "Quantity", accessor: "quantity" },
          { header: "Warehouse", accessor: "warehouse" },
          { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          {
            header: "Actions",
            render: (row) => <ActionMenu onView={() => setDrawer({ open: true, batch: row })} onEdit={() => setDrawer({ open: true, batch: row })} extra={row.status === "On Hold" ? "Release Batch" : "Hold Batch"} />,
          },
        ]}
        data={batches}
      />
      <InventoryDrawer open={drawer.open} onOpenChange={(open) => setDrawer((current) => ({ ...current, open }))} title="Batch Details" description="Only limited batch details should be edited after receipt." primaryLabel="Save Batch">
        <FormSection title="Batch">
          <SelectField label="Product" values={products.map((product) => product.name)} required />
          <Field label="Batch Number" required />
          <Field label="Manufacture Date" type="date" />
          <Field label="Expiry Date" type="date" />
          <SelectField label="Warehouse" values={warehouses.map((warehouse) => warehouse.name)} />
          <SelectField label="Status" values={["Active", "On Hold", "Expired", "Sold Out"]} />
        </FormSection>
      </InventoryDrawer>
    </InventoryPage>
  );
}

function MovementPage({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type: "opening" | "transfer" | "adjustment";
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const icon = type === "transfer" ? Repeat : type === "adjustment" ? SlidersHorizontal : FileText;
  return (
    <InventoryPage title={title} description={description} icon={icon}>
      <SearchToolbar search="" setSearch={() => undefined}>
        <Button onClick={() => setDrawerOpen(true)} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New {title}
        </Button>
      </SearchToolbar>
      <SimpleTable
        columns={type === "transfer" ? ["Transfer Number", "Transfer Date", "From Warehouse", "To Warehouse", "Product", "Batch Number", "Quantity", "Status"] : type === "adjustment" ? ["Adjustment Number", "Adjustment Date", "Warehouse", "Product", "Batch Number", "Adjustment Type", "Quantity", "Status"] : ["Product", "Batch Number", "Expiry Date", "Warehouse", "Quantity", "Cost Price", "Opening Date", "Status"]}
        rows={[
          type === "transfer"
            ? ["TRF-0088", "2026-06-26", "Main Warehouse", "Kandy Warehouse", "Metformin 500mg Tablet", "B-MET-2409", "240", <StatusBadge key="posted" status="Posted" />]
            : type === "adjustment"
              ? ["ADJ-0044", "2026-06-25", "Main Warehouse", "Cetrizine 10mg Tablet", "B-CET-2309", "Expiry", "36", <StatusBadge key="pending" status="Pending Review" />]
              : ["Paracetamol 500mg Tablet", "B-PAR-2406", "2027-01-15", "Main Warehouse", "3,000", "Rs. 95", "2026-01-01", <StatusBadge key="posted" status="Posted" />],
        ]}
      />
      <InventoryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={title} description="Stock movement rules validate warehouses, quantities, batches, and ledger impact." primaryLabel="Save Movement">
        <FormSection title={title}>
          {type === "transfer" ? (
            <>
              <Field label="Transfer Number" required />
              <Field label="Transfer Date" type="date" required />
              <SelectField label="From Warehouse" values={warehouses.map((warehouse) => warehouse.name)} required />
              <SelectField label="To Warehouse" values={warehouses.map((warehouse) => warehouse.name)} required />
            </>
          ) : type === "adjustment" ? (
            <>
              <Field label="Adjustment Number" required />
              <Field label="Adjustment Date" type="date" required />
              <SelectField label="Warehouse" values={warehouses.map((warehouse) => warehouse.name)} required />
              <SelectField label="Adjustment Type" values={["Increase", "Decrease", "Damage", "Expiry", "Correction"]} required />
            </>
          ) : (
            <>
              <SelectField label="Warehouse" values={warehouses.map((warehouse) => warehouse.name)} required />
              <Field label="Opening Date" type="date" required />
              <Field label="Cost Price" type="number" />
            </>
          )}
          <SelectField label="Product" values={products.map((product) => product.name)} required />
          <Field label="Batch Number" required />
          <Field label="Quantity" type="number" required />
          <Field label="Reason" />
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium tracking-normal text-slate-600">Notes</Label>
            <Textarea className="min-h-20 rounded-lg border-slate-200 tracking-normal" />
          </div>
        </FormSection>
      </InventoryDrawer>
    </InventoryPage>
  );
}

export function OpeningStockPage() {
  return <MovementPage title="Opening Stock" description="Enter starting stock when implementing the ERP." type="opening" />;
}

export function StockTransfersPage() {
  return <MovementPage title="Stock Transfers" description="Transfer stock between warehouses or branches." type="transfer" />;
}

export function StockAdjustmentsPage() {
  return <MovementPage title="Stock Adjustments" description="Correct stock differences for damage, expiry, and physical count variances." type="adjustment" />;
}

function ReturnsPage({ title, description, sales = false }: { title: string; description: string; sales?: boolean }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <InventoryPage title={title} description={description} icon={RotateCcw}>
      <SearchToolbar search="" setSearch={() => undefined}>
        <Button onClick={() => setDrawerOpen(true)} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Return
        </Button>
      </SearchToolbar>
      <SimpleTable
        columns={sales ? ["Return Number", "Return Date", "Customer", "Related Invoice", "Product", "Batch Number", "Quantity", "Condition"] : ["Return Number", "Return Date", "Supplier", "Related GRN", "Product", "Batch Number", "Quantity", "Reason"]}
        rows={[
          sales
            ? ["SR-0012", "2026-06-24", "City Pharmacy", "INV-1022", "Paracetamol 500mg Tablet", "B-PAR-2406", "12", <StatusBadge key="good" status="Good" />]
            : ["PR-0008", "2026-06-23", "MediSource Imports", "GRN-0261", "Amoxicillin 250mg Capsule", "B-AMX-2502", "24", "Damaged carton"],
        ]}
      />
      <InventoryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={title} description={sales ? "Good condition returns can return to available stock. Damaged or expired stock goes to hold." : "Purchase returns decrease available stock and must not exceed received quantity."} primaryLabel="Save Return">
        <FormSection title="Return Details">
          <Field label="Return Number" required />
          <Field label="Return Date" type="date" required />
          {sales ? <Field label="Customer" required /> : <SelectField label="Supplier" values={suppliers.map((supplier) => supplier.name)} required />}
          <Field label={sales ? "Related Invoice" : "Related GRN"} />
          <SelectField label="Product" values={products.map((product) => product.name)} required />
          <Field label="Batch Number" required />
          <Field label="Quantity" type="number" required />
          {sales ? <SelectField label="Condition" values={["Good", "Damaged", "Expired"]} required /> : <Field label="Reason" />}
          {sales ? <SelectField label="Warehouse" values={warehouses.map((warehouse) => warehouse.name)} /> : null}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium tracking-normal text-slate-600">Notes</Label>
            <Textarea className="min-h-20 rounded-lg border-slate-200 tracking-normal" />
          </div>
        </FormSection>
      </InventoryDrawer>
    </InventoryPage>
  );
}

export function PurchaseReturnsPage() {
  return <ReturnsPage title="Purchase Returns" description="Return goods to supplier." />;
}

export function SalesReturnsPage() {
  return <ReturnsPage title="Sales Returns" description="Receive returned stock from customers." sales />;
}

function ReportPage({
  title,
  description,
  columns,
  rows,
}: {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <InventoryPage title={title} description={description} icon={BarChart3}>
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SelectField label="Warehouse" values={["All Warehouses", ...warehouses.map((warehouse) => warehouse.name)]} />
          <SelectField label="Product" values={["All Products", ...products.map((product) => product.name)]} />
          <SelectField label="Category" values={["All Categories", "Analgesics", "Antibiotics", "Diabetes Care"]} />
          <Field label="Date From" type="date" />
          <Field label="Date To" type="date" />
        </CardContent>
      </Card>
      <SimpleTable columns={columns} rows={rows.map((row) => row.map((cell) => (["Active", "Expired", "Monitor", "Expiring Soon", "On Hold"].includes(cell) ? <StatusBadge key={cell} status={cell} /> : cell)))} />
    </InventoryPage>
  );
}

export function StockBalanceReportPage() {
  return (
    <ReportPage
      title="Stock Balance"
      description="Current available, reserved, and valued stock by product, batch, and warehouse."
      columns={["Product", "Batch Number", "Warehouse", "Quantity", "Available Quantity", "Reserved Quantity", "Stock Value"]}
      rows={reportRows.stockBalance}
    />
  );
}

export function StockLedgerReportPage() {
  return (
    <ReportPage
      title="Stock Ledger"
      description="Every stock movement with references, in quantities, out quantities, and running balance."
      columns={["Date", "Product", "Batch", "Movement Type", "Reference No", "In Qty", "Out Qty", "Balance Qty"]}
      rows={reportRows.stockLedger}
    />
  );
}

export function ExpiryReportPage() {
  return (
    <ReportPage
      title="Expiry Report"
      description="Track expired and near-expiry pharma batches by product, category, and warehouse."
      columns={["Product", "Batch Number", "Expiry Date", "Quantity", "Days Left", "Warehouse", "Status"]}
      rows={reportRows.expiry}
    />
  );
}

export function BatchReportPage() {
  return (
    <ReportPage
      title="Batch Report"
      description="Batch movement summary with received quantity, sold quantity, balance, and status."
      columns={["Product", "Batch Number", "Manufacture Date", "Expiry Date", "Received Qty", "Sold Qty", "Balance Qty", "Status"]}
      rows={reportRows.batch}
    />
  );
}

