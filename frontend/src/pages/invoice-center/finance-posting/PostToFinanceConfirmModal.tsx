import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import invoiceCenterApi from "../../../api/invoiceCenterApi";
import { FinancePostingImpactCard, FinancePostingDocumentTypeBadge } from "../../../components/invoice-center";
import { formatCurrency, formatDate } from "../../../lib/utils";
import type { PendingFinancePosting, InvoiceCenterFinancePostingDocumentType, FinancePostingResult } from "../../../types/invoice-center";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: PendingFinancePosting | null;
  onSuccess: () => void;
}

const postApiFunctions: Record<InvoiceCenterFinancePostingDocumentType, (id: number | string) => Promise<any>> = {
  sales_invoice: invoiceCenterApi.postSalesInvoiceToFinance,
  credit_note: invoiceCenterApi.postCreditNoteToFinance,
  debit_note: invoiceCenterApi.postDebitNoteToFinance,
  customer_receipt: invoiceCenterApi.postCustomerReceiptToFinance,
};

const PostToFinanceConfirmModal: React.FC<Props> = ({ open, onOpenChange, document, onSuccess }) => {
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState<FinancePostingResult | null>(null);

  const handlePost = async () => {
    if (!document) return;

    setPosting(true);
    try {
      const apiFn = postApiFunctions[document.document_type];
      if (!apiFn) {
        toast.error("Unknown document type");
        return;
      }

      const response = await apiFn(document.document_id);
      const res = response as any;
      if (res.data?.success) {
        const data = res.data.data as FinancePostingResult;
        setResult(data);
        toast.success(res.data.message || "Document posted to Finance successfully.");
        onSuccess();
      } else {
        toast.error(res.data?.message || "Failed to post to Finance");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to post document to Finance";
      toast.error(msg);
    } finally {
      setPosting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Posted Successfully
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Post to Finance
              </>
            )}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              {/* Document Details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <p className="text-xs text-gray-500">Document Type</p>
                  <FinancePostingDocumentTypeBadge type={document.document_type} className="mt-0.5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Document Number</p>
                  <p className="text-sm font-semibold text-gray-900">{document.document_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="text-sm text-gray-900">{document.customer_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Document Date</p>
                  <p className="text-sm text-gray-900">{formatDate(document.document_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(document.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Finance Post Status</p>
                  <Badge variant="outline" className="mt-0.5 border-transparent bg-gray-200 text-gray-800">
                    {document.finance_post_status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Accounting Impact */}
              <FinancePostingImpactCard documentType={document.document_type} />

              {result ? (
                /* Success Result */
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-green-600">Finance Reference</p>
                      <p className="text-sm font-mono font-semibold text-green-800">{result.finance_reference_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600">Status</p>
                      <Badge className="bg-green-600 text-white">Posted</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-green-600">Debit Total</p>
                      <p className="text-sm font-semibold text-green-800">{formatCurrency(result.debit_total)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600">Credit Total</p>
                      <p className="text-sm font-semibold text-green-800">{formatCurrency(result.credit_total)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Warning */
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                    Posting this document to Finance will create General Ledger entries and mark the document as finance posted. This action cannot be repeated.
                  </p>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {result ? (
            <Button onClick={handleClose}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={posting}>Cancel</Button>
              <Button onClick={handlePost} disabled={posting} className="bg-blue-600 hover:bg-blue-700">
                {posting ? "Posting..." : "Confirm Post to Finance"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostToFinanceConfirmModal;
