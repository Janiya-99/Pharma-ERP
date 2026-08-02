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

type RejectSalesOrderModalProps = {
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remarks: string) => Promise<void> | void;
};

const RejectSalesOrderModal: React.FC<RejectSalesOrderModalProps> = ({
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
          <DialogTitle>Reject Sales Order</DialogTitle>
          <DialogDescription>
            Reject this sales order and return it to the requester.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="Rejection reason"
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
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectSalesOrderModal;
