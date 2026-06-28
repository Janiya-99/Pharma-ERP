import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isConfirming = false,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title?: any;
  message?: any;
  confirmText?: string;
  isConfirming?: boolean;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
      <div className="mt-5 border-t border-gray-200 pt-4 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button
          variant="danger"
          className="w-full sm:ml-3 sm:w-auto"
          onClick={onConfirm}
          isLoading={isConfirming}
        >
          {confirmText}
        </Button>
        <Button
          variant="secondary"
          className="mt-3 w-full sm:mt-0 sm:w-auto"
          onClick={onClose}
          disabled={isConfirming}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
