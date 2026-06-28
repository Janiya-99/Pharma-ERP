import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Eye, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import type { InvoicePrintFormat } from "../../../types/invoice-center";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { documentTypes } from "./printFormatDefaults";

export default function PrintFormatListPage() {
  const navigate = useNavigate();
  const [formats, setFormats] = useState<InvoicePrintFormat[]>([]);
  const [documentType, setDocumentType] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadFormats = async () => {
    setLoading(true);
    try {
      const response = await invoiceCenterApi.getPrintFormats(documentType === "all" ? {} : { document_type: documentType });
      setFormats(response.data.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load print formats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormats();
  }, [documentType]);

  const setDefault = async (id?: number) => {
    if (!id) return;
    try {
      await invoiceCenterApi.setDefaultPrintFormat(id);
      toast.success("Default print format updated");
      loadFormats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to set default");
    }
  };

  const deleteFormat = async (id?: number) => {
    if (!id) return;
    try {
      await invoiceCenterApi.deletePrintFormat(id);
      toast.success("Print format deleted");
      loadFormats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete print format");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Print Format Designer</h1>
          <p className="text-sm text-slate-500">Company and branch defaults for Invoice Center documents.</p>
        </div>
        <Button asChild>
          <Link to="/invoice-center/settings/print-formats/create">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Formats</CardTitle>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Paper</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formats.map((format) => (
                  <TableRow key={format.id}>
                    <TableCell className="font-medium">{format.format_name}</TableCell>
                    <TableCell>{documentTypes.find((type) => type.value === format.document_type)?.label || format.document_type}</TableCell>
                    <TableCell>{format.paper_size} / {format.orientation}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {format.is_default && <Badge>Default</Badge>}
                        <Badge variant={format.is_active ? "outline" : "secondary"}>{format.is_active ? "Active" : "Inactive"}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setDefault(format.id)} title="Set default">
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/invoice-center/settings/print-formats/${format.id}/preview`)} title="Preview">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/invoice-center/settings/print-formats/${format.id}/edit`)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteFormat(format.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && formats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
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
