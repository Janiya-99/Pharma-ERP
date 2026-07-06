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

export const SubmitCustomerReceiptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  receiptId,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState("Submitted for approval");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await invoiceCenterApi.submitCustomerReceipt(receiptId, {
        remarks,
      });
      if (res.data?.success) {
        toast.success(
          res.data.message || "Customer receipt submitted successfully"
        );
        onSuccess();
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to submit customer receipt");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "An error occurred during submission"
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
          <DialogTitle>Submit Customer Receipt</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit this customer receipt for approval?
            Once submitted, you can no longer edit it unless it is rejected.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks..."
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
