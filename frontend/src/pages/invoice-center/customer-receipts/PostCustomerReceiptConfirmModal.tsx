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
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receiptId: number;
  receiptAmount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  currentBalance: number;
  balanceAfterReceipt: number;
  allocationCount: number;
  onSuccess: () => void;
}

export const PostCustomerReceiptConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  receiptId,
  receiptAmount,
  allocatedAmount,
  unallocatedAmount,
  currentBalance,
  balanceAfterReceipt,
  allocationCount,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const handlePost = async () => {
    try {
      setIsSubmitting(true);
      const res = await invoiceCenterApi.postCustomerReceipt(receiptId);
      if (res.data?.success) {
        toast.success(
          res.data.message || "Customer receipt posted successfully"
        );
        onSuccess();
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to post customer receipt");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "An error occurred while posting"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Post Customer Receipt</DialogTitle>
          <DialogDescription>
            Posting this customer receipt will update allocated sales invoice
            paid amounts, reduce allocated invoice balances, recalculate invoice
            payment statuses, and reduce customer balance only by the allocated
            amount. Unallocated amount will be stored but will not reduce
            customer balance in this step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div className="grid grid-cols-2 gap-2 rounded-md border border-gray-100 bg-gray-50 p-3">
            <div className="text-gray-500">Receipt Amount:</div>
            <div className="text-right font-medium text-blue-700">
              {formatLKR(receiptAmount)}
            </div>

            <div className="text-gray-500">Allocated Amount:</div>
            <div className="text-right font-medium text-green-700">
              {formatLKR(allocatedAmount)}
            </div>

            <div className="text-gray-500">Unallocated Amount:</div>
            <div
              className={`text-right font-medium ${
                unallocatedAmount > 0 ? "text-orange-600" : "text-gray-700"
              }`}
            >
              {formatLKR(unallocatedAmount)}
            </div>

            <div className="col-span-2 my-1 border-t border-gray-200"></div>

            <div className="text-gray-500">Invoice Allocations:</div>
            <div className="text-right font-medium">{allocationCount}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-md border border-blue-100 bg-blue-50 p-3">
            <div className="text-blue-800">Customer Current Balance:</div>
            <div className="text-right font-medium text-blue-900">
              {formatLKR(currentBalance)}
            </div>

            <div className="font-semibold text-blue-800">
              Balance After Posting:
            </div>
            <div className="text-right font-bold text-blue-900">
              {formatLKR(balanceAfterReceipt)}
            </div>
          </div>
        </div>

        {unallocatedAmount > 0 && (
          <Alert
            variant="default"
            className="border-orange-200 bg-orange-50 py-2 text-orange-800"
          >
            <AlertCircle className="h-4 w-4 stroke-orange-600" />
            <AlertTitle className="text-sm font-semibold">
              Note on Unallocated Amount
            </AlertTitle>
            <AlertDescription className="text-xs">
              The {formatLKR(unallocatedAmount)} unallocated amount will not
              deduct the customer balance right now.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
