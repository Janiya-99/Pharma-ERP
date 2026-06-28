import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import BankAccountSelect from "../../../../components/finance/BankAccountSelect";
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";

export default function ChequeBooksPage() {
  const history = useHistory();
  const { hasPermission, activeSoftware } = useAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    bank_account_id: "",
    status: "",
    search: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      const res = await financeApi.getChequeBooks(params);
      if (res.data?.success) {
        setBooks(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load cheque books", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchBooks();
    }
  }, [filters, pagination.page, activeSoftware]);

  const handleDelete = async (book: unknown) => {
    if (book.used_leaves > 0) {
      alert("Cannot delete a cheque book that has used leaves.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this cheque book?")) {
      try {
        await financeApi.deleteChequeBook(book.id);
        fetchBooks();
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

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <FinancePageHeader
        title="Cheque Books"
        subtitle="Manage cheque books and cheque leaf inventory"
        onAdd={
          hasPermission("finance.cheque_book.create")
            ? () => history.push("/admin/finance/cheque-books/create")
            : undefined
        }
        addLabel="Create Cheque Book"
      />

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <BankAccountSelect
            value={filters.bank_account_id}
            onChange={(val: unknown) =>
              setFilters((prev: unknown) => ({ ...prev, bank_account_id: val }))
            }
            placeholder="All Bank Accounts"
          />
          <select
            value={filters.status}
            onChange={(e: any) =>
              setFilters((prev: unknown) => ({
                ...prev,
                status: e.target.value,
              }))
            }
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            placeholder="Search Book Number..."
            value={filters.search}
            onChange={(e: any) =>
              setFilters((prev: unknown) => ({
                ...prev,
                search: e.target.value,
              }))
            }
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 dark:border-navy-700 dark:bg-navy-700/50 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Book Number</th>
                <th className="px-4 py-3">Bank Account</th>
                <th className="px-4 py-3">Start - End</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center text-blue-600">Used</th>
                <th className="px-4 py-3 text-center text-red-600">
                  Cancelled
                </th>
                <th className="px-4 py-3 text-center text-green-600">
                  Available
                </th>
                <th className="px-4 py-3 text-center">Issued Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No cheque books found.
                  </td>
                </tr>
              ) : (
                books.map((book: unknown) => (
                  <tr
                    key={book.id}
                    className="hover:bg-gray-50 dark:hover:bg-navy-700/30"
                  >
                    <td className="px-4 py-3 font-medium text-navy-700">
                      <button
                        onClick={() =>
                          history.push(`/admin/finance/cheque-books/${book.id}`)
                        }
                        className="text-brand-500 hover:underline"
                      >
                        {book.cheque_book_number}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {book.bank_account?.bank_name} -{" "}
                      {book.bank_account?.account_number}
                    </td>
                    <td className="px-4 py-3">
                      {book.start_leaf_number} - {book.end_leaf_number}
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {book.total_leaves}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-blue-600">
                      {book.used_leaves}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-red-600">
                      {book.cancelled_leaves}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-green-600">
                      {book.available_leaves}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {new Date(book.issued_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          book.status === "active"
                            ? "bg-green-100 text-green-800"
                            : book.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission("finance.cheque_book.view") && (
                          <button
                            onClick={() =>
                              history.push(
                                `/admin/finance/cheque-books/${book.id}`
                              )
                            }
                            className="text-gray-500 hover:text-navy-700"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                        )}
                        {hasPermission("finance.cheque_book.update") && (
                          <button
                            onClick={() =>
                              history.push(
                                `/admin/finance/cheque-books/${book.id}/edit`
                              )
                            }
                            className="text-brand-500 hover:text-brand-700"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                        )}
                        {hasPermission("finance.cheque_book.delete") && (
                          <button
                            onClick={() => handleDelete(book)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-navy-700">
          <span className="text-gray-500">
            Total Records: {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev: unknown) => ({
                  ...prev,
                  page: prev.page - 1,
                }))
              }
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {pagination.page}</span>
            <button
              disabled={books.length < pagination.limit}
              onClick={() =>
                setPagination((prev: unknown) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
