#!/bin/bash
mkdir -p frontend/src/pages/finance/general-ledger
mkdir -p frontend/src/pages/finance/reports/account-ledger
mkdir -p frontend/src/pages/finance/reports/trial-balance
mkdir -p frontend/src/pages/finance/reports/profit-loss
mkdir -p frontend/src/pages/finance/reports/balance-sheet
mkdir -p frontend/src/pages/finance/reports/cash-book
mkdir -p frontend/src/pages/finance/reports/bank-book
mkdir -p frontend/src/pages/finance/reports/day-book
mkdir -p frontend/src/pages/finance/reports/journal-register
mkdir -p frontend/src/pages/finance/reports/payment-register
mkdir -p frontend/src/pages/finance/reports/receipt-register
mkdir -p frontend/src/components/finance/reports

cat << 'INNER_EOF' > frontend/src/pages/finance/general-ledger/GeneralLedgerPage.jsx
import React from 'react';
const GeneralLedgerPage = () => { return <div>GeneralLedgerPage</div>; };
export default GeneralLedgerPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/general-ledger/RebuildLedgerModal.jsx
import React from 'react';
const RebuildLedgerModal = () => { return <div>RebuildLedgerModal</div>; };
export default RebuildLedgerModal;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/FinanceReportsDashboard.jsx
import React from 'react';
const FinanceReportsDashboard = () => { return <div>FinanceReportsDashboard</div>; };
export default FinanceReportsDashboard;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/account-ledger/AccountLedgerReportPage.jsx
import React from 'react';
const AccountLedgerReportPage = () => { return <div>AccountLedgerReportPage</div>; };
export default AccountLedgerReportPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/trial-balance/TrialBalanceReportPage.jsx
import React from 'react';
const TrialBalanceReportPage = () => { return <div>TrialBalanceReportPage</div>; };
export default TrialBalanceReportPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/profit-loss/ProfitLossReportPage.jsx
import React from 'react';
const ProfitLossReportPage = () => { return <div>ProfitLossReportPage</div>; };
export default ProfitLossReportPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/balance-sheet/BalanceSheetReportPage.jsx
import React from 'react';
const BalanceSheetReportPage = () => { return <div>BalanceSheetReportPage</div>; };
export default BalanceSheetReportPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/cash-book/CashBookReportPage.jsx
import React from 'react';
const CashBookReportPage = () => { return <div>CashBookReportPage</div>; };
export default CashBookReportPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/bank-book/BankBookReportPage.jsx
import React from 'react';
const BankBookReportPage = () => { return <div>BankBookReportPage</div>; };
export default BankBookReportPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/day-book/DayBookReportPage.jsx
import React from 'react';
const DayBookReportPage = () => { return <div>DayBookReportPage</div>; };
export default DayBookReportPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/journal-register/JournalRegisterReportPage.jsx
import React from 'react';
const JournalRegisterReportPage = () => { return <div>JournalRegisterReportPage</div>; };
export default JournalRegisterReportPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/payment-register/PaymentRegisterReportPage.jsx
import React from 'react';
const PaymentRegisterReportPage = () => { return <div>PaymentRegisterReportPage</div>; };
export default PaymentRegisterReportPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/finance/reports/receipt-register/ReceiptRegisterReportPage.jsx
import React from 'react';
const ReceiptRegisterReportPage = () => { return <div>ReceiptRegisterReportPage</div>; };
export default ReceiptRegisterReportPage;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/components/finance/reports/ReportPageHeader.jsx
import React from 'react';
const ReportPageHeader = () => { return <div>ReportPageHeader</div>; };
export default ReportPageHeader;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/components/finance/reports/ReportFilterCard.jsx
import React from 'react';
const ReportFilterCard = () => { return <div>ReportFilterCard</div>; };
export default ReportFilterCard;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/components/finance/reports/ReportSummaryCard.jsx
import React from 'react';
const ReportSummaryCard = () => { return <div>ReportSummaryCard</div>; };
export default ReportSummaryCard;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/components/finance/reports/ReportAmountCell.jsx
import React from 'react';
const ReportAmountCell = () => { return <div>ReportAmountCell</div>; };
export default ReportAmountCell;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/components/finance/reports/ReportSection.jsx
import React from 'react';
const ReportSection = () => { return <div>ReportSection</div>; };
export default ReportSection;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/components/finance/reports/ReportToolbar.jsx
import React from 'react';
const ReportToolbar = () => { return <div>ReportToolbar</div>; };
export default ReportToolbar;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/components/finance/reports/BalanceStatusBadge.jsx
import React from 'react';
const BalanceStatusBadge = () => { return <div>BalanceStatusBadge</div>; };
export default BalanceStatusBadge;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/components/finance/reports/ProfitLossBadge.jsx
import React from 'react';
const ProfitLossBadge = () => { return <div>ProfitLossBadge</div>; };
export default ProfitLossBadge;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/components/finance/reports/SourceTypeBadge.jsx
import React from 'react';
const SourceTypeBadge = () => { return <div>SourceTypeBadge</div>; };
export default SourceTypeBadge;
INNER_EOF

