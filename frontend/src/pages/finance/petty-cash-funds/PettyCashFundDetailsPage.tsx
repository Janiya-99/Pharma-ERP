import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import PettyCashBalanceCard from "../../../../components/finance/PettyCashBalanceCard";
import { MdEdit, MdDelete, MdArrowBack } from "react-icons/md";

export default function PettyCashFundDetailsPage() {
  const { id } = useParams();
  const history = useHistory();
  const { hasPermission, activeSoftware } = useAuth();

  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeSoftware?.software_code !== "FINANCE") return;

    const fetchFund = async () => {
      try {
        const res = await financeApi.getPettyCashFundById(id);
        if (res.data?.success) {
          setFund(res.data.data);
        } else {
          setError("Failed to load petty cash fund details");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load petty cash fund details"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchFund();
  }, [id, activeSoftware]);

  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to delete this petty cash fund?")
    ) {
      try {
        await financeApi.deletePettyCashFund(id);
        history.push("/admin/finance/petty-cash-funds");
      } catch (err) {
        alert(
          "Failed to delete: " + (err.response?.data?.message || err.message)
        );
      }
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
  if (error || !fund)
    return (
      <div className="p-8 text-center font-medium text-red-500">
        {error || "Fund not found."}
      </div>
    );

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 py-4">
      <div className="mb-2 flex items-center gap-4">
        <button
          onClick={() => history.push("/admin/finance/petty-cash-funds")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-brand-500 hover:text-brand-500 dark:border-navy-700 dark:bg-navy-800"
          title="Back to List"
        >
          <MdArrowBack className="h-5 w-5" />
        </button>
        <FinancePageHeader
          title={`Fund Details: ${fund.fund_name}`}
          subtitle={`Code: ${fund.fund_code} | Branch: ${fund.branch?.branch_name}`}
        />
      </div>

      <div className="mb-2 flex justify-end gap-2">
        {hasPermission("finance.petty_cash_fund.update") && (
          <button
            onClick={() =>
              history.push(`/admin/finance/petty-cash-funds/${fund.id}/edit`)
            }
            className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-brand-600 shadow-sm ring-1 ring-inset ring-brand-200 hover:bg-brand-50 dark:bg-navy-800 dark:text-brand-400 dark:ring-navy-600 dark:hover:bg-navy-700"
          >
            <MdEdit className="h-4 w-4" />
            Edit Fund
          </button>
        )}
        {hasPermission("finance.petty_cash_fund.delete") && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-50 dark:bg-navy-800 dark:text-red-400 dark:ring-navy-600 dark:hover:bg-navy-700"
          >
            <MdDelete className="h-4 w-4" />
            Delete Fund
          </button>
        )}
      </div>

      <PettyCashBalanceCard fund={fund} />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <h3 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
          General Information
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          <div>
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Fund Code
            </span>
            <span className="mt-1 block text-base font-medium text-gray-900 dark:text-white">
              {fund.fund_code}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Fund Name
            </span>
            <span className="mt-1 block text-base font-medium text-gray-900 dark:text-white">
              {fund.fund_name}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Branch
            </span>
            <span className="mt-1 block text-base text-gray-900 dark:text-white">
              {fund.branch?.branch_name}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Cash Account
            </span>
            <span className="mt-1 block text-base text-gray-900 dark:text-white">
              {fund.chart_of_account?.account_code} -{" "}
              {fund.chart_of_account?.account_name}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Custodian User
            </span>
            <span className="mt-1 block text-base text-gray-900 dark:text-white">
              {fund.custodian_user?.name || fund.custodian_user?.full_name}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Status
            </span>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                fund.status === "active"
                  ? "border border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "border border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {fund.status}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Created By
            </span>
            <span className="mt-1 block text-base text-gray-900 dark:text-white">
              {fund.created_by_user?.name || fund.created_by_user?.full_name}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Created At
            </span>
            <span className="mt-1 block text-base text-gray-900 dark:text-white">
              {new Date(fund.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
