import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
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
  showCreditWarning?: boolean;
  showStockWarning?: boolean;
}

export const ApproveSalesInvoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  invoiceId,
  onSuccess,
  showCreditWarning,
  showStockWarning,
}) => {
  const [remarks, setRemarks] = useState("Approved");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await invoiceCenterApi.approveSalesInvoice(invoiceId, { remarks });
      toast.success("Sales invoice approved successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to approve sales invoice."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Sales Invoice</DialogTitle>
          <DialogDescription>
            Review and approve this sales invoice.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {showCreditWarning && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>
                Warning: This invoice will exceed the customer's credit limit.
              </span>
            </div>
          )}
          {showStockWarning && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>Warning: Insufficient available stock for some items.</span>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
