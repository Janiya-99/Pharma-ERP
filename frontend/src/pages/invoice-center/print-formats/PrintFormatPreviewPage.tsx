import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { Button } from "../../../components/ui/button";
import type { InvoicePrintFormat } from "../../../types/invoice-center";
import { createDefaultPrintFormat } from "./printFormatDefaults";
import { PrintFormatLayoutPreview } from "./PrintFormatLayoutPreview";

const draftPreviewStorageKey = "invoice-center-print-format-draft-preview";

export default function PrintFormatPreviewPage() {
  const { id } = useParams();
  const { company, activeBranch } = useAuth();
  const [format, setFormat] = useState<InvoicePrintFormat>(
    createDefaultPrintFormat()
  );

  useEffect(() => {
    if (id === "draft") {
      const storedDraft = sessionStorage.getItem(draftPreviewStorageKey);
      if (!storedDraft) {
        toast.error(
          "No draft preview found. Open preview from the template editor."
        );
        return;
      }

      try {
        const draftFormat = JSON.parse(storedDraft) as InvoicePrintFormat;
        setFormat({
          ...createDefaultPrintFormat(draftFormat.document_type),
          ...draftFormat,
        });
      } catch {
        toast.error("Failed to load draft preview.");
      }
      return;
    }

    if (!id) return;
    invoiceCenterApi
      .getPrintFormatById(id)
      .then((response) => {
        const loadedFormat = response.data.data as InvoicePrintFormat;
        setFormat({
          ...createDefaultPrintFormat(loadedFormat.document_type),
          ...loadedFormat,
        });
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Failed to load preview");
      });
  }, [id]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/invoice-center/settings/print-formats">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {format.format_name || "Print Preview"}
            </h1>
            <p className="text-sm text-slate-500">
              {format.paper_size} / {format.orientation}
            </p>
          </div>
        </div>
        <Button type="button" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>
      <PrintFormatLayoutPreview
        format={format}
        company={company}
        branch={activeBranch}
      />
    </div>
  );
}
