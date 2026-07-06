import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/invoice-center/InvoiceCenterActionDrawer";
import { Textarea } from "../../../components/ui/textarea";

type CancelSalesOrderModalProps = {
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remarks: string) => Promise<void> | void;
};

const CancelSalesOrderModal: React.FC<CancelSalesOrderModalProps> = ({
  open,
  loading,
  onOpenChange,
  onConfirm,
}) => {
  const [remarks, setRemarks] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Sales Order</DialogTitle>
          <DialogDescription>
            Cancel this sales order. This action should include a clear reason.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="Cancellation reason"
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(remarks)}
            disabled={loading}
          >
            Confirm cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelSalesOrderModal;
