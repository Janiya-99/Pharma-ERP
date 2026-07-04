import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { BookOpen, PieChart, FileText, ArrowRight, Activity, TrendingUp, TrendingDown, Clock, Archive, DollarSign, Wallet } from 'lucide-react';
import ReportPageHeader from '../../../components/finance/reports/ReportPageHeader';

const FinanceReportsDashboard = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const reportCards = [
    {
      title: "Account Ledger",
      description: "Detailed chronological record of all transactions for a specific account.",
      path: "/finance/general-ledger/account-ledger",
      permission: "finance.report.account_ledger.view",
      icon: <BookOpen className="h-6 w-6 text-indigo-500" />
    },
    {
      title: "Trial Balance",
      description: "Summary of closing balances for all accounts to verify double-entry accounting.",
      path: "/finance/reports/trial-balance",
      permission: "finance.report.trial_balance.view",
      icon: <Activity className="h-6 w-6 text-purple-500" />
    },
    {
      title: "Profit and Loss",
      description: "Financial performance summary showing revenues, costs, and expenses over a period.",
      path: "/finance/reports/profit-and-loss",
      permission: "finance.report.profit_loss.view",
      icon: <TrendingUp className="h-6 w-6 text-green-500" />
    },
    {
      title: "Balance Sheet",
      description: "Snapshot of assets, liabilities, and equity at a specific point in time.",
      path: "/finance/reports/balance-sheet",
      permission: "finance.report.balance_sheet.view",
      icon: <PieChart className="h-6 w-6 text-orange-500" />
    },
    {
      title: "Cash Book",
      description: "Daily record of all cash receipts and cash payments.",
      path: "/finance/banking/cash-book",
      permission: "finance.report.cash_book.view",
      icon: <DollarSign className="h-6 w-6 text-emerald-500" />
    },
    {
      title: "Bank Book",
      description: "Record of all transactions for specific bank accounts.",
      path: "/finance/banking/bank-book",
      permission: "finance.report.bank_book.view",
      icon: <Wallet className="h-6 w-6 text-cyan-500" />
    },
    {
      title: "Day Book",
      description: "Chronological daily summary of all accounting transactions.",
      path: "/finance/reports/day-book",
      permission: "finance.report.day_book.view",
      icon: <Clock className="h-6 w-6 text-rose-500" />
    },
    {
      title: "Journal Register",
      description: "Log of all manual journal entries with their approval and posting status.",
      path: "/finance/general-ledger/journal-register",
      permission: "finance.report.journal_register.view",
      icon: <Archive className="h-6 w-6 text-indigo-500" />
    },
    {
      title: "Payment Register",
      description: "Log of all payment vouchers with their approval and posting status.",
      path: "/finance/reports/payment-register",
      permission: "finance.report.payment_register.view",
      icon: <TrendingDown className="h-6 w-6 text-red-500" />
    },
    {
      title: "Receipt Register",
      description: "Log of all receipt vouchers with their approval and posting status.",
      path: "/finance/reports/receipt-register",
      permission: "finance.report.receipt_register.view",
      icon: <TrendingUp className="h-6 w-6 text-teal-500" />
    }
  ];

  // Filter cards based on user permissions
  const visibleCards = reportCards.filter((card: unknown) => hasPermission(card.permission));

  return (
    <div className="p-6">
      <ReportPageHeader 
        title="Finance Reports" 
        description="Access and analyze all financial reporting and accounting registers." 
        backTo={null}
      />

      {visibleCards.length === 0 ? (
        <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-navy-700">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Reports Available</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You do not have permission to view any finance reports. Contact your administrator to request access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleCards.map((card: unknown, index: unknown) => (
            <Card key={index} className="flex flex-col border-gray-200 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 bg-gray-50 dark:bg-navy-900 rounded-lg">
                  {card.icon}
                </div>
                <div>
                  <CardTitle className="text-lg text-navy-800 dark:text-white">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
              </CardContent>
              <CardFooter className="pt-4 border-t border-gray-100 dark:border-navy-700">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-navy-900 dark:hover:text-white"
                  onClick={() => navigate(card.path)}
                >
                  Open Report
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinanceReportsDashboard;
