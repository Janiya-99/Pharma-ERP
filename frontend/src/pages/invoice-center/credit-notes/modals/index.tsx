import React from "react";
import { WorkflowActionModal } from "./WorkflowActionModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => Promise<void>;
}

export const SubmitCreditNoteModal: React.FC<Props> = (props) => (
  <WorkflowActionModal
    {...props}
    title="Submit Credit Note"
    description="Are you sure you want to submit this credit note for approval? Once submitted, it cannot be edited."
    confirmLabel="Submit"
  />
);

export const ApproveCreditNoteModal: React.FC<Props> = (props) => (
  <WorkflowActionModal
    {...props}
    title="Approve Credit Note"
    description="Are you sure you want to approve this credit note?"
    confirmLabel="Approve"
  />
);

export const RejectCreditNoteModal: React.FC<Props> = (props) => (
  <WorkflowActionModal
    {...props}
    title="Reject Credit Note"
    description="Are you sure you want to reject this credit note? Please provide a reason."
    confirmLabel="Reject"
    requireRemarks={true}
  />
);

export const CancelCreditNoteModal: React.FC<Props> = (props) => (
  <WorkflowActionModal
    {...props}
    title="Cancel Credit Note"
    description="Are you sure you want to cancel this credit note? This action cannot be undone."
    confirmLabel="Cancel Note"
    requireRemarks={true}
  />
);

export * from "./ConfirmModals";
