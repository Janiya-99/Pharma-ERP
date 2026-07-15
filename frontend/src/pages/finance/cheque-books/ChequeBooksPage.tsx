import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import { useAuth } from "../../../auth/AuthContext";
import FinancePageHeader from "../../../components/finance/FinancePageHeader";
import BankAccountSelect from "../../../components/finance/BankAccountSelect";
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import { DataTableToolbar } from "../shared/DataTableToolbar";

export default function ChequeBooksPage() {
  const navigate = useNavigate();
  const { hasPermission, activeSoftware } = useAuth();
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    bank_account_id: "",
    status: "",
    search: ""
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, limit: pagination.limit };
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

  const handleDelete = async (book: any) => {
    if (book.used_leaves > 0) {
      alert("Cannot delete a cheque book that has used leaves.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this cheque book?")) {
      try {
        await financeApi.deleteChequeBook(book.id);
        fetchBooks();
      } catch (err: any) {
        alert("Failed to delete: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (activeSoftware?.software_code !== "FINANCE") {
    return <div className="p-8 text-center text-red-500 font-medium">Please switch to Finance module to access this page.</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4 h-full">
      <FinancePageHeader
        title="Cheque Books"
        subtitle="Manage cheque books and cheque leaf inventory"
        onAdd={hasPermission("finance.cheque_book.create") ? () => navigate("/admin/finance/cheque-books/create") : undefined}
        addLabel="Create Cheque Book"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTableToolbar
          searchQuery={filters.search}
          onSearchChange={(value) =>
            setFilters((current: any) => ({ ...current, search: value }))
          }
          statusFilter={true}
          statusValue={filters.status || "all"}
          onStatusChange={(value) =>
            setFilters((current: any) => ({ ...current, status: value === "all" ? "" : value }))
          }
          customFilters={
            <div className="w-48">
              <BankAccountSelect
                value={filters.bank_account_id}
                onChange={(val: any) => setFilters((prev: any) => ({ ...prev, bank_account_id: val }))}
                placeholder="All Bank Accounts"
              />
            </div>
          }
        />
      </div>

      <div className="flex-1 bg-white  rounded-xl shadow-sm border border-gray-100  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide">Book Number</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide">Bank Account</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide">Start - End</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-center">Total</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-center text-indigo-600">Used</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-center text-red-600">Cancelled</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-center text-green-600">Available</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-center">Issued Date</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-center">Status</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 ">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">No cheque books found.</td>
                </tr>
              ) : (
                books.map((book: any) => (
                  <tr key={book.id} className="hover:bg-gray-50 ">
                    <td className="px-4 py-3 font-medium text-navy-700">
                      <button 
                        onClick={() => navigate(`/admin/finance/cheque-books/${book.id}`)}
                        className="text-brand-500 hover:underline"
                      >
                        {book.cheque_book_number}
                      </button>
                    </td>
                    <td className="px-4 py-3">{book.bank_account?.bank_name} - {book.bank_account?.account_number}</td>
                    <td className="px-4 py-3">{book.start_leaf_number} - {book.end_leaf_number}</td>
                    <td className="px-4 py-3 text-center font-medium">{book.total_leaves}</td>
                    <td className="px-4 py-3 text-center text-indigo-600 font-medium">{book.used_leaves}</td>
                    <td className="px-4 py-3 text-center text-red-600 font-medium">{book.cancelled_leaves}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{book.available_leaves}</td>
                    <td className="px-4 py-3 text-center">{new Date(book.issued_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${book.status === "active" ? "bg-green-100 text-green-800" : book.status === "completed" ? "bg-indigo-100 text-indigo-800" : "bg-red-100 text-red-800"}`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission("finance.cheque_book.view") && (
                          <button onClick={() => navigate(`/admin/finance/cheque-books/${book.id}`)} className="text-gray-500 hover:text-navy-700">
                            <MdVisibility className="h-5 w-5" />
                          </button>
                        )}
                        {hasPermission("finance.cheque_book.update") && (
                          <button onClick={() => navigate(`/admin/finance/cheque-books/${book.id}/edit`)} className="text-brand-500 hover:text-brand-700">
                            <MdEdit className="h-5 w-5" />
                          </button>
                        )}
                        {hasPermission("finance.cheque_book.delete") && (
                          <button onClick={() => handleDelete(book)} className="text-red-500 hover:text-red-700">
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 ">
          <span className="text-gray-500">Total Records: {pagination.total}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => setPagination((prev: any) => ({ ...prev, page: prev.page - 1 }))} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
            <span className="px-3 py-1">Page {pagination.page}</span>
            <button disabled={books.length < pagination.limit} onClick={() => setPagination((prev: any) => ({ ...prev, page: prev.page + 1 }))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
