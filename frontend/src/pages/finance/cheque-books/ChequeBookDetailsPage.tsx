import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import ChequeLeavesTable from "./ChequeLeavesTable";
import { MdEdit, MdDelete, MdArrowBack } from "react-icons/md";
import { toast } from "react-hot-toast";

export default function ChequeBookDetailsPage() {
  const { id } = useParams();
  const history = useHistory();
  const { hasPermission } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getChequeBookById(id);
      if (res.data?.success) {
        setBook(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load cheque book details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (book.used_leaves > 0) {
      alert("Cannot delete a cheque book that has used leaves.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this cheque book?")) {
      try {
        await financeApi.deleteChequeBook(id);
        toast.success("Cheque book deleted successfully");
        history.push("/admin/finance/cheque-books");
      } catch (err) {
        alert(
          "Failed to delete: " + (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleCancelLeaf = async (
    leafId: string | number,
    remarks: unknown
  ) => {
    try {
      await financeApi.cancelChequeLeaf(leafId, { remarks });
      toast.success("Cheque leaf cancelled successfully");
      fetchDetails();
    } catch (err) {
      toast.error(
        "Failed to cancel leaf: " + (err.response?.data?.message || err.message)
      );
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading details...</div>
    );
  if (!book)
    return (
      <div className="p-8 text-center text-red-500">Cheque book not found.</div>
    );

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto py-4">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <button
            onClick={() => history.push("/admin/finance/cheque-books")}
            className="mb-2 flex items-center text-sm text-gray-500 hover:text-brand-500"
          >
            <MdArrowBack className="mr-1" /> Back to Cheque Books
          </button>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-navy-700 dark:text-white">
            Cheque Book #{book.cheque_book_number}
          </h1>
          <p className="text-gray-500">
            {book.bank_account?.bank_name} - {book.bank_account?.account_number}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission("finance.cheque_book.update") && (
            <button
              onClick={() =>
                history.push(`/admin/finance/cheque-books/${book.id}/edit`)
              }
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <MdEdit /> Edit
            </button>
          )}
          {hasPermission("finance.cheque_book.delete") &&
            book.used_leaves === 0 && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-4 py-2 text-red-600 shadow-sm hover:bg-red-100"
              >
                <MdDelete /> Delete
              </button>
            )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Total Leaves
          </p>
          <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">
            {book.total_leaves}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Available Leaves
          </p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {book.available_leaves}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Used Leaves
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {book.used_leaves}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Cancelled Leaves
          </p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {book.cancelled_leaves}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          {/* Details Grid */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              Book Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Bank Account</p>
                <p className="font-medium text-navy-900 dark:text-white">
                  {book.bank_account?.bank_name} -{" "}
                  {book.bank_account?.account_number}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issued Date</p>
                <p className="font-medium text-navy-900 dark:text-white">
                  {new Date(book.issued_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start - End Leaf</p>
                <p className="font-medium text-navy-900 dark:text-white">
                  {book.start_leaf_number} to {book.end_leaf_number}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    book.status === "active"
                      ? "bg-green-100 text-green-800"
                      : book.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {book.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remarks</p>
                <p className="font-medium text-navy-900 dark:text-white">
                  {book.remarks || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Leaves Table */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b pb-2 text-lg font-bold text-navy-700 dark:border-navy-700 dark:text-white">
              Cheque Leaves
            </h3>
            <ChequeLeavesTable
              leaves={book.cheque_leaves || []}
              onCancelLeaf={handleCancelLeaf}
              hasPermission={hasPermission("finance.cheque_book.cancel")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
