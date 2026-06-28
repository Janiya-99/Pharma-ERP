import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receiptId: number;
  receiptNumber: string;
  onSuccess: () => void;
}

export const DeleteCustomerReceiptConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  receiptId,
  receiptNumber,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await invoiceCenterApi.deleteCustomerReceipt(receiptId);
      if (res.data?.success) {
        toast.success(`Customer receipt ${receiptNumber} deleted successfully`);
        onSuccess();
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to delete customer receipt");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "An error occurred while deleting"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => !open && !isDeleting && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Customer Receipt</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete receipt{" "}
            <strong>{receiptNumber}</strong>? This action cannot be undone. Only
            draft or rejected receipts can be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={isDeleting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="destructive"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
