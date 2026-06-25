import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { SalesReturn } from "types/inventory";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => Promise<void>;
  salesReturn: SalesReturn | null;
  loading?: boolean;
}

// ============================================================================
// Submit Modal
// ============================================================================
export const SubmitSalesReturnModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  salesReturn,
  loading,
}) => {
  const [remarks, setRemarks] = useState("");

  const handleConfirm = async () => {
    await onConfirm(remarks);
    setRemarks("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Sales Return</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit Sales Return{" "}
            <span className="font-semibold text-gray-900">{salesReturn?.sales_return_number}</span>{" "}
            for approval?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium">Remarks (Optional)</label>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any remarks for the approver..."
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Approve Modal
// ============================================================================
export const ApproveSalesReturnModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  salesReturn,
  loading,
}) => {
  const [remarks, setRemarks] = useState("");

  const handleConfirm = async () => {
    await onConfirm(remarks);
    setRemarks("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Sales Return</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve Sales Return{" "}
            <span className="font-semibold text-gray-900">{salesReturn?.sales_return_number}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium">Remarks (Optional)</label>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add approval remarks..."
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Reject Modal
// ============================================================================
export const RejectSalesReturnModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  salesReturn,
  loading,
}) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!remarks.trim()) {
      setError("Remarks are required for rejection");
      return;
    }
    setError("");
    await onConfirm(remarks);
    setRemarks("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setRemarks("");
        setError("");
        onClose();
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Sales Return</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject Sales Return{" "}
            <span className="font-semibold text-gray-900">{salesReturn?.sales_return_number}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium">Remarks <span className="text-red-500">*</span></label>
          <Textarea
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (e.target.value.trim()) setError("");
            }}
            placeholder="Reason for rejection..."
            className={`mt-2 ${error ? "border-red-500" : ""}`}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Post Confirm Modal
// ============================================================================
interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  salesReturn: SalesReturn | null;
  loading?: boolean;
}

export const PostSalesReturnConfirmModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  salesReturn,
  loading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Post Sales Return</DialogTitle>
          <DialogDescription>
            You are about to post Sales Return{" "}
            <span className="font-semibold text-gray-900">{salesReturn?.sales_return_number}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3 text-sm">
            <strong>Warning:</strong> Posting this return will permanently increase stock in the selected warehouse and create read-only stock ledger entries.
            <br className="my-1" />
            <span className="font-semibold">This action cannot be undone. You cannot edit or delete a posted document.</span>
          </div>

          {salesReturn && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm space-y-2">
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Customer:</span>
                <span className="font-medium">{salesReturn.customer_name || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Warehouse:</span>
                <span className="font-medium">{salesReturn.warehouse?.warehouse_name}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Return Condition:</span>
                <span className="font-medium uppercase text-xs">{salesReturn.return_condition}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Total Quantity:</span>
                <span className="font-medium">{salesReturn.total_quantity?.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-medium font-mono">{(salesReturn.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} LKR</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Posting..." : "Confirm & Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
