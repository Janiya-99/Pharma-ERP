import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/invoice-center/InvoiceCenterActionDrawer";
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

export const RejectCustomerReceiptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  receiptId,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error("Remarks are required for rejection");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await invoiceCenterApi.rejectCustomerReceipt(receiptId, {
        remarks,
      });
      if (res.data?.success) {
        toast.success(
          res.data.message || "Customer receipt rejected successfully"
        );
        onSuccess();
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to reject customer receipt");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "An error occurred during rejection"
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
          <DialogTitle>Reject Customer Receipt</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this customer receipt? You must
            provide a reason.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="remarks" className="text-red-600">
              Rejection Reason *
            </Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Payment reference is not clear..."
              disabled={isSubmitting}
              className="border-red-200 focus-visible:ring-red-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={isSubmitting || !remarks.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
