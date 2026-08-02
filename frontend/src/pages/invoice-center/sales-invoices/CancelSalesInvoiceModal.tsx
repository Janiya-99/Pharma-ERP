import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/invoice-center/InvoiceCenterActionDrawer";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  onSuccess: () => void;
}

export const CancelSalesInvoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  invoiceId,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState(
    "Customer cancelled invoice before posting"
  );
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!remarks.trim()) {
      toast.error("Remarks are required for cancellation.");
      return;
    }

    setLoading(true);
    try {
      await invoiceCenterApi.cancelSalesInvoice(invoiceId, { remarks });
      toast.success("Sales invoice cancelled successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to cancel sales invoice."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Sales Invoice</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this invoice?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>Note: Posted invoices cannot be cancelled in this step.</span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remarks" className="text-red-500">
              Reason for Cancellation *
            </Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Customer cancelled order..."
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading || !remarks.trim()}
          >
            {loading ? "Cancelling..." : "Cancel Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
