import React from "react";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";

const PostPettyCashConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  onConfirm?: unknown;
  isSubmitting?: boolean;
}) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Post Record"
      message="Are you sure you want to post this record? Posting will update the petty cash balance and chart of account balances. This action cannot be reversed, and the record cannot be edited after posting."
      confirmText={isSubmitting ? "Posting..." : "Post"}
      confirmColor="bg-purple-500 hover:bg-purple-600"
    />
  );
};

export default PostPettyCashConfirmModal;
