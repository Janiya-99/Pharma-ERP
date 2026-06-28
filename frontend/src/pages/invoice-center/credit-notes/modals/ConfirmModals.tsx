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
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const PostCreditNoteConfirmModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post Credit Note</DialogTitle>
          <DialogDescription>
            Are you sure you want to post this credit note?
          </DialogDescription>
        </DialogHeader>

        <Alert className="my-4 border-amber-200 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Warning: Irreversible Action</AlertTitle>
          <AlertDescription className="text-amber-700 mt-2 text-sm">
            Posting this credit note will permanently update the customer's balance. This action cannot be undone.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
            {loading ? "Posting..." : "Confirm & Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteCreditNoteConfirmModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Credit Note</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this credit note? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? "Deleting..." : "Delete Credit Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
