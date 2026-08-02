import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import BankAccountSelect from "../../../components/finance/BankAccountSelect";
import { toast } from "react-hot-toast";

export default function ChequeBookFormPage() {
  const { id } = useParams();
  const history = useHistory();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    bank_account_id: "",
    cheque_book_number: "",
    start_leaf_number: "",
    number_of_leaves: 50,
    issued_date: new Date().toISOString().split('T')[0],
    remarks: "",
    status: "active"
  });

  useEffect(() => {
    if (isEdit) {
      fetchFormData();
    }
  }, [id]);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getChequeBookById(id);
      if (res.data?.success) {
        const book = res.data.data;
        setFormData({
          bank_account_id: book.bank_account_id?.toString() || "",
          cheque_book_number: book.cheque_book_number || "",
          start_leaf_number: book.start_leaf_number || "",
          number_of_leaves: book.total_leaves || 50,
          issued_date: book.issued_date ? book.issued_date.split('T')[0] : "",
          remarks: book.remarks || "",
          status: book.status || "active"
        });
      }
    } catch (error) {
      toast.error("Failed to load cheque book data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.bank_account_id) {
      toast.error("Please select a bank account");
      return;
    }
    if (formData.number_of_leaves <= 0) {
      toast.error("Number of leaves must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        bank_account_id: parseInt(formData.bank_account_id),
      };

      if (isEdit) {
        await financeApi.updateChequeBook(id, payload);
        toast.success("Cheque book updated successfully");
      } else {
        await financeApi.createChequeBook(payload);
        toast.success("Cheque book created successfully");
      }
      history.push("/admin/finance/cheque-books");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save cheque book");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="py-4 max-w-3xl mx-auto h-full overflow-y-auto">
      <div className="bg-white  rounded-xl shadow-sm border border-gray-100  p-6">
        <div className="flex items-center justify-between mb-6 border-b pb-4 ">
          <div>
            <h2 className="text-xl font-bold text-navy-700 ">
              {isEdit ? "Edit Cheque Book" : "Create Cheque Book"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit 
                ? "Update cheque book details. Note: You cannot modify leaves once created." 
                : "Create a new cheque book. Cheque leaves will be automatically generated."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => history.push("/admin/finance/cheque-books")}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700  mb-1">Bank Account *</label>
              <BankAccountSelect
                value={formData.bank_account_id}
                onChange={(val: unknown) => setFormData((prev: unknown) => ({ ...prev, bank_account_id: val }))}
                disabled={isEdit}
              />
              {isEdit && <p className="text-xs text-gray-500 mt-1">Bank account cannot be changed after creation.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Cheque Book Number *</label>
              <input
                type="text"
                name="cheque_book_number"
                value={formData.cheque_book_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Issued Date *</label>
              <input
                type="date"
                name="issued_date"
                value={formData.issued_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Start Leaf Number *</label>
              <input
                type="text"
                name="start_leaf_number"
                value={formData.start_leaf_number}
                onChange={handleChange}
                required
                disabled={isEdit}
                className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="e.g. 000001"
              />
              {isEdit && <p className="text-xs text-gray-500 mt-1">Cannot be changed after generation.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">Number of Leaves *</label>
              <input
                type="number"
                min="1"
                max="500"
                name="number_of_leaves"
                value={formData.number_of_leaves}
                onChange={handleChange}
                required
                disabled={isEdit}
                className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50 disabled:text-gray-500"
              />
              {isEdit && <p className="text-xs text-gray-500 mt-1">Cannot be changed after generation.</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700  mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700  mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Any additional notes about this cheque book"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t ">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update Cheque Book" : "Generate Cheque Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
