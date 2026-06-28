import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Textarea } from "../../../../components/ui/textarea";
import { Label } from "../../../../components/ui/label";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => Promise<void>;
  title: string;
  description: string;
  confirmLabel: string;
  requireRemarks?: boolean;
}

export const WorkflowActionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  requireRemarks = false,
}) => {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (requireRemarks && !remarks.trim()) {
      return;
    }
    setLoading(true);
    try {
      await onConfirm(remarks);
      setRemarks("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 my-4">
          <Label htmlFor="remarks">
            Remarks {requireRemarks ? <span className="text-red-500">*</span> : "(Optional)"}
          </Label>
          <Textarea
            id="remarks"
            placeholder="Enter remarks here..."
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || (requireRemarks && !remarks.trim())}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
