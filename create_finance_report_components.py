import os

components_dir = "frontend/src/components/finance/reports"

files = {
    "ReportPageHeader.jsx": """import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';

const ReportPageHeader = ({ title, description, backTo = "/finance/reports" }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {backTo && (
          <Button variant="outline" size="icon" onClick={() => navigate(backTo)} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-navy-800 dark:text-white">{title}</h1>
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );
};
export default ReportPageHeader;
""",

    "ReportFilterCard.jsx": """import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Filter, X } from 'lucide-react';

const ReportFilterCard = ({ children, onApply, onClear, isLoading }) => {
  return (
    <Card className="mb-6 border-gray-200 dark:border-navy-700 shadow-sm print:hidden">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {children}
          <div className="flex gap-2 lg:col-span-full justify-end mt-2">
            <Button variant="outline" onClick={onClear} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
            <Button onClick={onApply} disabled={isLoading} className="bg-brand-600 hover:bg-brand-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ReportFilterCard;
""",

    "ReportSummaryCard.jsx": """import React from 'react';
import { Card, CardContent } from '../../ui/card';

const ReportSummaryCard = ({ title, amount, className = "" }) => {
  return (
    <Card className={`border-gray-200 dark:border-navy-700 shadow-sm ${className}`}>
      <CardContent className="p-4 flex flex-col justify-center">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
        <p className="text-xl font-bold text-navy-800 dark:text-white">
          {amount === undefined || amount === null ? "-" : new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount)}
        </p>
      </CardContent>
    </Card>
  );
};
export default ReportSummaryCard;
""",

    "ReportAmountCell.jsx": """import React from 'react';

const ReportAmountCell = ({ amount, className = "" }) => {
  if (amount === undefined || amount === null || amount === 0) {
    return <div className={`text-right text-gray-400 dark:text-gray-500 ${className}`}>-</div>;
  }
  const formatted = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
  return <div className={`text-right font-medium ${className}`}>{formatted}</div>;
};
export default ReportAmountCell;
""",

    "ReportSection.jsx": """import React from 'react';

const ReportSection = ({ title, children, totalLabel, totalAmount }) => {
  return (
    <div className="mb-6 border rounded-lg border-gray-200 dark:border-navy-700 overflow-hidden">
      <div className="bg-gray-50 dark:bg-navy-800 px-4 py-3 border-b border-gray-200 dark:border-navy-700">
        <h3 className="text-lg font-semibold text-navy-800 dark:text-white">{title}</h3>
      </div>
      <div className="p-0">
        {children}
      </div>
      {totalLabel && (
        <div className="bg-gray-50 dark:bg-navy-800 px-4 py-3 flex justify-between items-center border-t border-gray-200 dark:border-navy-700">
          <span className="font-semibold text-navy-800 dark:text-white">{totalLabel}</span>
          <span className="font-bold text-navy-800 dark:text-white">
            {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(totalAmount || 0)}
          </span>
        </div>
      )}
    </div>
  );
};
export default ReportSection;
""",

    "ReportToolbar.jsx": """import React from 'react';
import { Button } from '../../ui/button';
import { Printer, RefreshCw, Download } from 'lucide-react';

const ReportToolbar = ({ onRefresh, onExportJson, isRefreshing }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 mb-4 print:hidden">
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
      {onExportJson && (
        <Button variant="outline" size="sm" onClick={onExportJson}>
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>
      )}
    </div>
  );
};
export default ReportToolbar;
""",

    "BalanceStatusBadge.jsx": """import React from 'react';

const BalanceStatusBadge = ({ isBalanced }) => {
  if (isBalanced) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Balanced
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
      Difference Found
    </span>
  );
};
export default BalanceStatusBadge;
""",

    "ProfitLossBadge.jsx": """import React from 'react';

const ProfitLossBadge = ({ amount }) => {
  if (amount > 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Net Profit
      </span>
    );
  }
  if (amount < 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        Net Loss
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
      Break-even
    </span>
  );
};
export default ProfitLossBadge;
""",

    "SourceTypeBadge.jsx": """import React from 'react';

const formatSourceType = (type) => {
  if (!type) return '';
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const SourceTypeBadge = ({ type }) => {
  const colors = {
    opening_balance: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    journal_entry: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    payment_voucher: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    receipt_voucher: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    petty_cash_voucher: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    fixed_asset_depreciation: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  };
  
  const colorClass = colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${colorClass}`}>
      {formatSourceType(type)}
    </span>
  );
};
export default SourceTypeBadge;
"""
}

for filename, content in files.items():
    filepath = os.path.join(components_dir, filename)
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Created {filepath}")

