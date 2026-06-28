import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";

type ApproveSalesOrderModalProps = {
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remarks: string) => Promise<void> | void;
};

const ApproveSalesOrderModal: React.FC<ApproveSalesOrderModalProps> = ({
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
          <DialogTitle>Approve Sales Order</DialogTitle>
          <DialogDescription>
            Approve this sales order for downstream invoicing.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="Approval remarks"
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
            onClick={() => onConfirm(remarks)}
            disabled={loading}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApproveSalesOrderModal;
