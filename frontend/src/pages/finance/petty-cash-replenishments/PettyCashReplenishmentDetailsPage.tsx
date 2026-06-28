import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import PettyCashActionButtons from "../../../../components/finance/PettyCashActionButtons";
import PettyCashStatusBadge from "../../../../components/finance/PettyCashStatusBadge";
import PettyCashPostedStatusBadge from "../../../../components/finance/PettyCashPostedStatusBadge";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import { MdArrowBack } from "react-icons/md";
import { toast } from "react-hot-toast";

import SubmitPettyCashModal from "../petty-cash/shared/SubmitPettyCashModal";
import ApprovePettyCashModal from "../petty-cash/shared/ApprovePettyCashModal";
import RejectPettyCashModal from "../petty-cash/shared/RejectPettyCashModal";
import PostPettyCashConfirmModal from "../petty-cash/shared/PostPettyCashConfirmModal";

export default function PettyCashReplenishmentDetailsPage() {
  const { id } = useParams();
  const history = useHistory();
  const { activeSoftware } = useAuth();

  const [replenishment, setReplenishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modals, setModals] = useState({
    submit: false,
    approve: false,
    reject: false,
    post: false,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReplenishment = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getPettyCashReplenishmentById(id);
      if (res.data?.success) {
        setReplenishment(res.data.data);
      } else {
        setError("Failed to load petty cash replenishment details");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load petty cash replenishment details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchReplenishment();
    }
  }, [id, activeSoftware]);

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this petty cash replenishment?"
      )
    ) {
      try {
        await financeApi.deletePettyCashReplenishment(id);
        toast.success("Replenishment deleted successfully");
        history.push("/admin/finance/petty-cash-replenishments");
      } catch (err) {
        toast.error(
          "Failed to delete: " + (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleAction = async (
    actionFn: unknown,
    payload: Record<string, unknown>,
    modalName: unknown
  ) => {
    setActionLoading(true);
    try {
      await actionFn(id, payload);
      toast.success(`Action successful`);
      setModals((prev: unknown) => ({ ...prev, [modalName]: false }));
      fetchReplenishment();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to perform action`);
    } finally {
      setActionLoading(false);
    }
  };

  if (activeSoftware?.software_code !== "FINANCE") {
    return (
      <div className="p-8 text-center font-medium text-red-500">
        Please switch to Finance module to access this page.
      </div>
    );
  }

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error || !replenishment)
    return (
      <div className="p-8 text-center font-medium text-red-500">
        {error || "Replenishment not found."}
      </div>
    );

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-4 py-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              history.push("/admin/finance/petty-cash-replenishments")
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-brand-500 hover:text-brand-500 dark:border-navy-700 dark:bg-navy-800"
          >
            <MdArrowBack className="h-5 w-5" />
          </button>
          <FinancePageHeader
            title={`Replenishment Details: ${
              replenishment.replenishment_number || "Draft"
            }`}
            subtitle={`Date: ${replenishment.replenishment_date} | Fund: ${replenishment.petty_cash_fund?.fund_code}`}
          />
        </div>

        <PettyCashActionButtons
          approvalStatus={replenishment.approval_status}
          postedStatus={replenishment.posted_status}
          permissions={{
            update: "finance.petty_cash_replenishment.update",
            delete: "finance.petty_cash_replenishment.delete",
            submit: "finance.petty_cash_replenishment.submit",
            approve: "finance.petty_cash_replenishment.approve",
            reject: "finance.petty_cash_replenishment.reject",
            post: "finance.petty_cash_replenishment.post",
          }}
          onEdit={() =>
            history.push(
              `/admin/finance/petty-cash-replenishments/${replenishment.id}/edit`
            )
          }
          onDelete={handleDelete}
          onSubmit={() => setModals((m: unknown) => ({ ...m, submit: true }))}
          onApprove={() => setModals((m: unknown) => ({ ...m, approve: true }))}
          onReject={() => setModals((m: unknown) => ({ ...m, reject: true }))}
          onPost={() => setModals((m: unknown) => ({ ...m, post: true }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              General Information
            </h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </span>
                <div className="mt-1 flex gap-2">
                  <PettyCashStatusBadge
                    status={replenishment.approval_status}
                  />
                  {replenishment.approval_status === "approved" && (
                    <PettyCashPostedStatusBadge
                      status={replenishment.posted_status}
                    />
                  )}
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Amount
                </span>
                <span className="mt-1 block text-lg font-bold text-gray-900 dark:text-white">
                  <MoneyDisplay amount={replenishment.replenishment_amount} />
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Petty Cash Fund
                </span>
                <span className="mt-1 block text-base text-gray-900 dark:text-white">
                  {replenishment.petty_cash_fund?.fund_code} -{" "}
                  {replenishment.petty_cash_fund?.fund_name}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Funding Bank Account
                </span>
                <span className="mt-1 block text-base text-gray-900 dark:text-white">
                  {replenishment.bank_account?.bank_name} -{" "}
                  {replenishment.bank_account?.account_number}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Branch
                </span>
                <span className="mt-1 block text-base text-gray-900 dark:text-white">
                  {replenishment.branch?.branch_name}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Reference Number
                </span>
                <span className="mt-1 block text-base text-gray-900 dark:text-white">
                  {replenishment.reference_number || "-"}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Remarks
                </span>
                <span className="mt-1 block text-base text-gray-900 dark:text-white">
                  {replenishment.remarks || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              Approval History
            </h3>
            {!replenishment.approvals ||
            replenishment.approvals.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No approval history available.
              </p>
            ) : (
              <div className="space-y-4">
                {replenishment.approvals.map((approval: unknown) => (
                  <div
                    key={approval.id}
                    className="relative border-l-2 border-gray-200 pl-4 dark:border-navy-600"
                  >
                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-500 dark:border-navy-800"></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-navy-700 dark:text-white">
                        {approval.action.charAt(0).toUpperCase() +
                          approval.action.slice(1)}{" "}
                        by {approval.user?.name || approval.user?.full_name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(approval.created_at).toLocaleString()}
                      </span>
                      {approval.remarks && (
                        <span className="mt-1 rounded-md bg-gray-50 p-2 text-sm text-gray-600 dark:bg-navy-900 dark:text-gray-300">
                          "{approval.remarks}"
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SubmitPettyCashModal
        isOpen={modals.submit}
        onClose={() => setModals((m: unknown) => ({ ...m, submit: false }))}
        isSubmitting={actionLoading}
        onSubmit={(payload: Record<string, unknown>) =>
          handleAction(
            financeApi.submitPettyCashReplenishment,
            payload,
            "submit"
          )
        }
      />
      <ApprovePettyCashModal
        isOpen={modals.approve}
        onClose={() => setModals((m: unknown) => ({ ...m, approve: false }))}
        isSubmitting={actionLoading}
        onApprove={(payload: Record<string, unknown>) =>
          handleAction(
            financeApi.approvePettyCashReplenishment,
            payload,
            "approve"
          )
        }
      />
      <RejectPettyCashModal
        isOpen={modals.reject}
        onClose={() => setModals((m: unknown) => ({ ...m, reject: false }))}
        isSubmitting={actionLoading}
        onReject={(payload: Record<string, unknown>) =>
          handleAction(
            financeApi.rejectPettyCashReplenishment,
            payload,
            "reject"
          )
        }
      />
      <PostPettyCashConfirmModal
        isOpen={modals.post}
        onClose={() => setModals((m: unknown) => ({ ...m, post: false }))}
        isSubmitting={actionLoading}
        onConfirm={() =>
          handleAction(financeApi.postPettyCashReplenishment, undefined, "post")
        }
      />
    </div>
  );
}
