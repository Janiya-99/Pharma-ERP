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
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receiptId: number;
  onSuccess: () => void;
}

export const CancelCustomerReceiptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  receiptId,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!remarks.trim()) {
      toast.error("Remarks are required for cancellation");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await invoiceCenterApi.cancelCustomerReceipt(receiptId, {
        remarks,
      });
      if (res.data?.success) {
        toast.success(
          res.data.message || "Customer receipt cancelled successfully"
        );
        onSuccess();
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to cancel customer receipt");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "An error occurred during cancellation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Customer Receipt</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this customer receipt? Please note
            that posted receipts cannot be cancelled in this step.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="remarks" className="text-gray-700">
              Cancellation Reason *
            </Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Receipt cancelled before posting..."
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Keep Receipt
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isSubmitting || !remarks.trim()}
            variant="destructive"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
