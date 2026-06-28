import React from "react";
import { WorkflowActionModal } from "./WorkflowActionModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => Promise<void>;
}

export const SubmitDebitNoteModal: React.FC<Props> = (props) => (
  <WorkflowActionModal
    {...props}
    title="Submit Debit Note"
    description="Are you sure you want to submit this debit note for approval? Once submitted, it cannot be edited."
    confirmLabel="Submit"
  />
);

export const ApproveDebitNoteModal: React.FC<Props> = (props) => (
  <WorkflowActionModal
    {...props}
    title="Approve Debit Note"
    description="Are you sure you want to approve this debit note?"
    confirmLabel="Approve"
  />
);

export const RejectDebitNoteModal: React.FC<Props> = (props) => (
  <WorkflowActionModal
    {...props}
    title="Reject Debit Note"
    description="Are you sure you want to reject this debit note? Please provide a reason."
    confirmLabel="Reject"
    requireRemarks={true}
  />
);

export const CancelDebitNoteModal: React.FC<Props> = (props) => (
  <WorkflowActionModal
    {...props}
    title="Cancel Debit Note"
    description="Are you sure you want to cancel this debit note? This action cannot be undone."
    confirmLabel="Cancel Note"
    requireRemarks={true}
  />
);

export * from "./ConfirmModals";
