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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  onSuccess: () => void;
}

export const SubmitSalesInvoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  invoiceId,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState("Submitted for approval");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await invoiceCenterApi.submitSalesInvoice(invoiceId, { remarks });
      toast.success("Sales invoice submitted successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to submit sales invoice."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Sales Invoice</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit this invoice for approval?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
