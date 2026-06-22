import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { financeApi } from '../../../api/financeApi';
import Modal from '../../../components/common/Modal';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { AlertTriangle } from 'lucide-react';

const RebuildLedgerModal = ({ isOpen, onClose, onSuccess, financialYears }) => {
  const [financialYearId, setFinancialYearId] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!financialYearId) {
      toast.error("Please select a financial year");
      return;
    }
    if (confirmationText !== "REBUILD") {
      toast.error("Please type REBUILD to confirm");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await financeApi.rebuildGeneralLedger({ financial_year_id: parseInt(financialYearId) });
      if (response.data?.success) {
        toast.success("Ledger rebuilt successfully");
        setFinancialYearId("");
        setConfirmationText("");
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to rebuild ledger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfirmDisabled = !financialYearId || confirmationText !== "REBUILD" || isSubmitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rebuild General Ledger"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-900/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-1">Warning: Destructive Action</h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                This will rebuild ledger entries for the selected financial year from posted transactions. 
                This action should only be used by Finance Managers. Existing entries for the selected year will be deleted and recreated.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-red-600 font-semibold">Select Financial Year to Rebuild <span className="text-red-500">*</span></Label>
          <Select 
            value={financialYearId} 
            onValueChange={setFinancialYearId}
          >
            <SelectTrigger className="border-red-200 focus:ring-red-500">
              <SelectValue placeholder="Select Financial Year" />
            </SelectTrigger>
            <SelectContent>
              {financialYears.map(fy => (
                <SelectItem key={fy.id} value={fy.id.toString()}>{fy.year_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Type <strong className="select-none">REBUILD</strong> to confirm</Label>
          <Input 
            type="text" 
            placeholder="REBUILD" 
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={isConfirmDisabled}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Rebuilding..." : "Rebuild Ledger"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RebuildLedgerModal;
