import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { toast } from 'react-hot-toast';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import ReportToolbar from '../../../../components/finance/reports/ReportToolbar';
import ReportSection from '../../../../components/finance/reports/ReportSection';
import ProfitLossBadge from '../../../../components/finance/reports/ProfitLossBadge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AlertCircle } from 'lucide-react';

const ProfitLossReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState([]);

  const [filters, setFilters] = useState({
    financial_year_id: "",
    date_from: "",
    date_to: "",
    branch_id: activeBranch?.id || ""
  });

  const fetchFiltersData = async () => {
    try {
      const fyRes = await financeApi.getFinancialYears({ limit: 100 });
      if (fyRes.data?.success) setFinancialYears(fyRes.data.data || []);
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key: unknown) => {
        if (params[key] === "") delete params[key];
      });

      const response = await financeApi.getProfitLossReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch profit and loss report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  const handleFilterChange = (key: unknown, value: unknown) => {
    setFilters((prev: unknown) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    setFilters({
      financial_year_id: "",
      date_from: "",
      date_to: "",
      branch_id: activeBranch?.id || ""
    });
    setData(null);
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-and-loss-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPermission("finance.report.profit_loss.view")) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800  mb-2">Access Denied</h2>
        <p className="text-gray-500 ">You do not have permission to view the Profit and Loss report.</p>
      </div>
    );
  }

  const renderSectionLines = (lines: unknown) => {
    if (!lines || lines.length === 0) {
      return <div className="px-4 py-3 text-sm text-gray-500  italic text-center">No accounts found in this section.</div>;
    }

    return (
      <div className="divide-y divide-gray-100 ">
        {lines.map((line: unknown) => (
          <div key={line.account_id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50  transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-navy-800 ">{line.account_code}</span>
              <span className="text-xs text-gray-500 ">{line.account_name}</span>
            </div>
            <div className="text-sm">
              <ReportAmountCell amount={line.balance} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ReportPageHeader 
        title="Profit and Loss" 
        description="Financial performance summary showing revenues, costs, and expenses over a period." 
      />

      <ReportFilterCard 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>Financial Year</Label>
          <Select 
            value={filters.financial_year_id} 
            onValueChange={(val: unknown) => handleFilterChange('financial_year_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {(financialYears || []).map((fy: unknown) => (
                <SelectItem key={fy.id} value={fy.id.toString()}>{fy.year_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date From</Label>
          <Input 
            type="date" 
            value={filters.date_from}
            onChange={(e: any) => handleFilterChange('date_from', e.target.value)}
           placeholder="Enter value" />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input 
            type="date" 
            value={filters.date_to}
            onChange={(e: any) => handleFilterChange('date_to', e.target.value)}
           placeholder="Enter value" />
        </div>
      </ReportFilterCard>

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end mb-6">
            <ReportToolbar onRefresh={fetchReport} onExportJson={handleExportJson} isRefreshing={loading} />
            <div className="mb-4">
               <ProfitLossBadge amount={data.net_profit} />
            </div>
          </div>

          <div className="bg-white  rounded-lg shadow-sm border border-gray-200  p-6 mb-8">
            <h2 className="text-2xl font-bold text-center text-navy-800  mb-6">Income Statement</h2>
            
            {/* Income Sections */}
            <ReportSection title="Revenue" totalLabel="Total Revenue" totalAmount={data.revenue?.total}>
              {renderSectionLines(data.revenue?.lines)}
            </ReportSection>

            <ReportSection title="Other Income" totalLabel="Total Other Income" totalAmount={data.other_income?.total}>
              {renderSectionLines(data.other_income?.lines)}
            </ReportSection>

            <div className="bg-green-50  border border-green-200  rounded-lg px-4 py-3 flex justify-between items-center mb-8">
              <span className="font-bold text-green-800 ">Total Income</span>
              <span className="font-bold text-green-800 ">
                <ReportAmountCell amount={data.total_income} />
              </span>
            </div>

            {/* Expense Sections */}
            <ReportSection title="Direct Expenses" totalLabel="Total Direct Expenses" totalAmount={data.direct_expenses?.total}>
              {renderSectionLines(data.direct_expenses?.lines)}
            </ReportSection>
            
            {/* Gross Profit could be calculated here, but following exactly the requested layout */}

            <ReportSection title="Administrative Expenses" totalLabel="Total Administrative Expenses" totalAmount={data.administrative_expenses?.total}>
              {renderSectionLines(data.administrative_expenses?.lines)}
            </ReportSection>

            <ReportSection title="Selling Expenses" totalLabel="Total Selling Expenses" totalAmount={data.selling_expenses?.total}>
              {renderSectionLines(data.selling_expenses?.lines)}
            </ReportSection>

            <ReportSection title="Finance Expenses" totalLabel="Total Finance Expenses" totalAmount={data.finance_expenses?.total}>
              {renderSectionLines(data.finance_expenses?.lines)}
            </ReportSection>

            <div className="bg-red-50  border border-red-200  rounded-lg px-4 py-3 flex justify-between items-center mb-8">
              <span className="font-bold text-red-800 ">Total Expenses</span>
              <span className="font-bold text-red-800 ">
                <ReportAmountCell amount={data.total_expense} />
              </span>
            </div>

            {/* Net Profit */}
            <div className={`rounded-lg px-6 py-4 flex justify-between items-center border-2 ${
              data.net_profit > 0 
                ? "bg-green-100  border-green-300 " 
                : data.net_profit < 0 
                  ? "bg-red-100  border-red-300 "
                  : "bg-gray-100  border-gray-300 "
            }`}>
              <span className={`text-xl font-bold ${
                data.net_profit > 0 ? "text-green-800 " : data.net_profit < 0 ? "text-red-800 " : "text-gray-800 "
              }`}>
                Net {data.net_profit > 0 ? "Profit" : data.net_profit < 0 ? "Loss" : "Profit/Loss"}
              </span>
              <span className={`text-2xl font-bold ${
                data.net_profit > 0 ? "text-green-800 " : data.net_profit < 0 ? "text-red-800 " : "text-gray-800 "
              }`}>
                <ReportAmountCell amount={data.net_profit} />
              </span>
            </div>

          </div>
        </div>
      )}
      
      {!data && !loading && (
        <div className="bg-white  rounded-lg shadow p-8 text-center border border-gray-200 ">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 ">Run Report</h3>
          <p className="mt-2 text-sm text-gray-500 ">
            Click Apply Filters to view the profit and loss statement.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfitLossReportPage;
