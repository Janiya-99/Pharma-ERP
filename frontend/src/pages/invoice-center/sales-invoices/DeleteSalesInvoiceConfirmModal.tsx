import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  invoiceNumber: string;
  customerName: string;
  onSuccess: () => void;
}

export const DeleteSalesInvoiceConfirmModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  invoiceId, 
  invoiceNumber,
  customerName,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await invoiceCenterApi.deleteSalesInvoice(invoiceId);
      toast.success("Sales invoice deleted successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete sales invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Sales Invoice</DialogTitle>
          <DialogDescription>
            Are you absolutely sure you want to delete this sales invoice?
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-md border text-sm my-4">
          <div className="flex flex-col space-y-1">
            <span><strong>Invoice Number:</strong> {invoiceNumber}</span>
            <span><strong>Customer:</strong> {customerName}</span>
          </div>
          <p className="mt-4 text-red-600 font-medium">This action cannot be undone.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
