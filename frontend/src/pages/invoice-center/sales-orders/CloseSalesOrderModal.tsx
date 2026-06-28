import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";

type CloseSalesOrderModalProps = {
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remarks: string) => Promise<void> | void;
};

const CloseSalesOrderModal: React.FC<CloseSalesOrderModalProps> = ({ open, loading, onOpenChange, onConfirm }) => {
  const [remarks, setRemarks] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Sales Order</DialogTitle>
          <DialogDescription>Close this sales order when no further invoicing is expected.</DialogDescription>
        </DialogHeader>
        <Textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Close remarks" />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onConfirm(remarks)} disabled={loading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseSalesOrderModal;
