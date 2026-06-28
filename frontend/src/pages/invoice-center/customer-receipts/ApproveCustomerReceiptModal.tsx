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
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receiptId: number;
  unallocatedAmount: number;
  onSuccess: () => void;
}

export const ApproveCustomerReceiptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  receiptId,
  unallocatedAmount,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState("Approved");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      const res = await invoiceCenterApi.approveCustomerReceipt(receiptId, {
        remarks,
      });
      if (res.data?.success) {
        toast.success(
          res.data.message || "Customer receipt approved successfully"
        );
        onSuccess();
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to approve customer receipt");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "An error occurred during approval"
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
          <DialogTitle>Approve Customer Receipt</DialogTitle>
          <DialogDescription>
            Please review the details before approving this customer receipt.
          </DialogDescription>
        </DialogHeader>

        {unallocatedAmount > 0 && (
          <Alert
            variant="default"
            className="mt-2 border-orange-200 bg-orange-50"
          >
            <AlertTriangle className="h-4 w-4 stroke-orange-600" />
            <AlertTitle className="text-orange-800">
              Unallocated Amount
            </AlertTitle>
            <AlertDescription className="text-sm text-orange-700">
              This receipt has an unallocated amount of{" "}
              <strong>{formatLKR(unallocatedAmount)}</strong> which will be
              stored on the receipt.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter approval remarks..."
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
