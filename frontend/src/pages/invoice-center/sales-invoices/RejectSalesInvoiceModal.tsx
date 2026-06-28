import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  onSuccess: () => void;
}

export const RejectSalesInvoiceModal: React.FC<Props> = ({ isOpen, onClose, invoiceId, onSuccess }) => {
  const [remarks, setRemarks] = useState("Customer credit issue");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error("Remarks are required for rejection.");
      return;
    }
    
    setLoading(true);
    try {
      await invoiceCenterApi.rejectSalesInvoice(invoiceId, { remarks });
      toast.success("Sales invoice rejected successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject sales invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Sales Invoice</DialogTitle>
          <DialogDescription>Are you sure you want to reject this invoice? Remarks are required.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="remarks" className="text-red-500">Reason for Rejection *</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Customer credit issue..."
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={loading || !remarks.trim()}>
            {loading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
