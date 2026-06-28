import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  invoiceNumber: string;
  totalAmount: number;
  totalQuantity: number;
  customerName: string;
  warehouseName: string;
  onSuccess: () => void;
}

export const PostSalesInvoiceConfirmModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  invoiceId, 
  invoiceNumber,
  totalAmount,
  totalQuantity,
  customerName,
  warehouseName,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      await invoiceCenterApi.postSalesInvoice(invoiceId);
      toast.success("Sales invoice posted successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to post sales invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-blue-800">Post Sales Invoice</DialogTitle>
          <DialogDescription>
            Posting this sales invoice will execute financial and inventory transactions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-blue-50/50 p-4 rounded-md border border-blue-100 space-y-2 text-sm mt-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Invoice Number</span>
            <span className="font-semibold">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Customer</span>
            <span className="font-medium text-right max-w-[200px] truncate">{customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Warehouse</span>
            <span className="font-medium text-right max-w-[200px] truncate">{warehouseName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Quantity</span>
            <span className="font-medium">{totalQuantity.toFixed(3)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-blue-200 mt-2">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-blue-700">{formatLKR(totalAmount)}</span>
          </div>
        </div>

        <div className="bg-red-50 text-red-700 p-3 rounded-md flex gap-2 items-start text-sm border border-red-200 mt-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Warning:</strong> Posting this sales invoice will issue stock, reduce stock balances, create stock ledger entries, update customer balance, and update linked sales order invoiced quantities. 
            <br/><br/>
            This action cannot be edited after posting.
          </p>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handlePost} className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? "Posting..." : "Confirm Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
