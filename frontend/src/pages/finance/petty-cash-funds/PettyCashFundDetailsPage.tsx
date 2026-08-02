import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import { useAuth } from "../../../auth/AuthContext";
import FinancePageHeader from "../../../components/finance/FinancePageHeader";
import PettyCashBalanceCard from "../../../components/finance/PettyCashBalanceCard";
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
        setError(err.response?.data?.message || "Failed to load petty cash fund details");
      } finally {
        setLoading(false);
      }
    };
    fetchFund();
  }, [id, activeSoftware]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this petty cash fund?")) {
      try {
        await financeApi.deletePettyCashFund(id);
        history.push("/admin/finance/petty-cash-funds");
      } catch (err) {
        alert("Failed to delete: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (activeSoftware?.software_code !== "FINANCE") {
    return <div className="p-8 text-center text-red-500 font-medium">Please switch to Finance module to access this page.</div>;
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error || !fund) return <div className="p-8 text-center text-red-500 font-medium">{error || "Fund not found."}</div>;

  return (
    <div className="flex flex-col gap-4 py-4 h-full max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => history.push("/admin/finance/petty-cash-funds")}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white  border border-gray-200  text-gray-500 hover:text-brand-500 hover:border-brand-500 transition-colors shadow-sm"
          title="Back to List"
        >
          <MdArrowBack className="w-5 h-5" />
        </button>
        <FinancePageHeader
          title={`Fund Details: ${fund.fund_name}`}
          subtitle={`Code: ${fund.fund_code} | Branch: ${fund.branch?.branch_name}`}
        />
      </div>

      <div className="flex justify-end gap-2 mb-2">
        {hasPermission("finance.petty_cash_fund.update") && (
          <button
            onClick={() => history.push(`/admin/finance/petty-cash-funds/${fund.id}/edit`)}
            className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-brand-600 shadow-sm ring-1 ring-inset ring-brand-200 hover:bg-brand-50    "
          >
            <MdEdit className="h-4 w-4" />
            Edit Fund
          </button>
        )}
        {hasPermission("finance.petty_cash_fund.delete") && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-50    "
          >
            <MdDelete className="h-4 w-4" />
            Delete Fund
          </button>
        )}
      </div>

      <PettyCashBalanceCard fund={fund} />

      <div className="bg-white  rounded-xl shadow-sm border border-gray-100  p-6">
        <h3 className="text-lg font-bold text-navy-700  border-b border-gray-100  pb-3 mb-4">
          General Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <span className="block text-sm font-medium text-gray-500 ">Fund Code</span>
            <span className="block mt-1 text-base text-gray-900  font-medium">{fund.fund_code}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 ">Fund Name</span>
            <span className="block mt-1 text-base text-gray-900  font-medium">{fund.fund_name}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 ">Branch</span>
            <span className="block mt-1 text-base text-gray-900 ">{fund.branch?.branch_name}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 ">Cash Account</span>
            <span className="block mt-1 text-base text-gray-900 ">
              {fund.chart_of_account?.account_code} - {fund.chart_of_account?.account_name}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 ">Custodian User</span>
            <span className="block mt-1 text-base text-gray-900 ">
              {fund.custodian_user?.name || fund.custodian_user?.full_name}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 ">Status</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${fund.status === "active" ? "bg-green-100 text-green-800   border border-green-200 " : "bg-gray-100 text-gray-800   border border-gray-200 "}`}>
              {fund.status}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 ">Created By</span>
            <span className="block mt-1 text-base text-gray-900 ">{fund.created_by_user?.name || fund.created_by_user?.full_name}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500 ">Created At</span>
            <span className="block mt-1 text-base text-gray-900 ">{new Date(fund.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
