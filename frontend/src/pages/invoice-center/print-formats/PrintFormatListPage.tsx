import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Copy,
  Edit,
  Eye,
  FileText,
  Plus,
  ReceiptText,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import type { InvoicePrintFormat } from "../../../types/invoice-center";
import { documentTypes } from "./printFormatDefaults";

const templateCards = [
  {
    title: "Sales Invoice Templates",
    icon: FileText,
    types: ["sales_invoice"],
  },
  {
    title: "Receipt Templates",
    icon: ReceiptText,
    types: ["customer_receipt"],
  },
  { title: "Proforma Templates", icon: FileText, types: ["proforma_invoice"] },
  {
    title: "Credit / Debit Note Templates",
    icon: FileText,
    types: ["credit_note", "debit_note"],
  },
  {
    title: "Inventory Templates",
    icon: FileText,
    types: [
      "grn",
      "sales_return",
      "purchase_return",
      "stock_transfer",
      "stock_adjustment",
    ],
  },
];

const quickCreates = [
  ["Create Sales Invoice Template", "sales_invoice"],
  ["Create Receipt Template", "customer_receipt"],
  ["Create GRN Template", "grn"],
  ["Create Sales Return Template", "sales_return"],
];

export default function PrintFormatListPage() {
  const navigate = useNavigate();
  const [formats, setFormats] = useState<InvoicePrintFormat[]>([]);
  const [documentType, setDocumentType] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadFormats = async () => {
    setLoading(true);
    try {
      const response = await invoiceCenterApi.getPrintFormats(
        documentType === "all" ? {} : { document_type: documentType }
      );
      setFormats(response.data.data || []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load print formats"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFormats();
  }, [documentType]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        templateCards.map((card) => [
          card.title,
          formats.filter((format) => card.types.includes(format.document_type))
            .length,
        ])
      ),
    [formats]
  );

  const setDefault = async (id?: number) => {
    if (!id) return;
    try {
      await invoiceCenterApi.setDefaultPrintFormat(id);
      toast.success("Default print format updated");
      void loadFormats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to set default");
    }
  };

  const duplicateFormat = async (id?: number) => {
    if (!id) return;
    try {
      await invoiceCenterApi.duplicatePrintFormat(id);
      toast.success("Print format duplicated");
      void loadFormats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to duplicate");
    }
  };

  const deleteFormat = async (id?: number) => {
    if (!id) return;
    try {
      await invoiceCenterApi.deletePrintFormat(id);
      toast.success("Print format deleted");
      void loadFormats();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete print format"
      );
    }
  };

  const createWithType = (type: string) => {
    navigate("/invoice-center/settings/print-formats/create", {
      state: { document_type: type },
    });
  };

  return (
    <div className="page-content space-y-5 pb-32">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Print Format Designer
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Create, preview, set defaults, and connect templates to document
            print pages.
          </p>
        </div>
        <Button asChild className="bg-[#002137] text-white hover:bg-[#003452]">
          <Link to="/invoice-center/settings/print-formats/create">
            <Plus className="h-4 w-4" />
            Create
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {templateCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="rounded-2xl border-slate-200 bg-white/80 shadow-sm"
            >
              <CardContent className="p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#002137]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-[#1F2937]">
                  {card.title}
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#111827]">
                  {counts[card.title] || 0}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl border-slate-200 bg-white/80 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg text-[#111827]">
              Template Library
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {quickCreates.map(([label, type]) => (
                <Button
                  key={type}
                  type="button"
                  variant="outline"
                  onClick={() => createWithType(type)}
                >
                  <Plus className="h-4 w-4" />
                  {label}
                </Button>
              ))}
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="w-56 border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Paper Size</TableHead>
                  <TableHead>Orientation</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formats.map((format) => (
                  <TableRow key={format.id}>
                    <TableCell className="font-medium text-[#1F2937]">
                      {format.format_name}
                    </TableCell>
                    <TableCell>
                      {documentTypes.find(
                        (type) => type.value === format.document_type
                      )?.label || format.document_type}
                    </TableCell>
                    <TableCell>
                      {format.branch_id
                        ? `Branch #${format.branch_id}`
                        : "Company-wide"}
                    </TableCell>
                    <TableCell>{format.paper_size}</TableCell>
                    <TableCell className="capitalize">
                      {format.orientation}
                    </TableCell>
                    <TableCell>
                      {format.is_default ? (
                        <Badge>Default</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={format.is_active ? "outline" : "secondary"}
                      >
                        {format.is_active ? "Active" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format.updated_at
                        ? new Date(format.updated_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(
                              `/invoice-center/settings/print-formats/${format.id}/preview`
                            )
                          }
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(
                              `/invoice-center/settings/print-formats/${format.id}/edit`
                            )
                          }
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateFormat(format.id)}
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDefault(format.id)}
                          title="Set Default"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => deleteFormat(format.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && formats.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-sm text-[#6B7280]"
                    >
                      No print formats found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
