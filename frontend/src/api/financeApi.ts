import apiClient from "./apiClient";

export const financeApi = {
  // Dashboard
  getDashboardData: (params?: Record<string, unknown>) =>
    apiClient.get("/finance/dashboard", { params }),

  // Financial Years
  getFinancialYears: (params: Record<string, unknown>) =>
    apiClient.get("/finance/financial-years", { params }),
  getFinancialYearById: (id: string | number) =>
    apiClient.get(`/finance/financial-years/${id}`),
  createFinancialYear: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/financial-years", payload),
  updateFinancialYear: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/financial-years/${id}`, payload),
  closeFinancialYear: (id: string | number) =>
    apiClient.post(`/finance/financial-years/${id}/close`),

  // Accounting Periods
  getAccountingPeriods: (params: Record<string, unknown>) =>
    apiClient.get("/finance/accounting-periods", { params }),
  createAccountingPeriod: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/accounting-periods", payload),
  updateAccountingPeriod: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/accounting-periods/${id}`, payload),
  closeAccountingPeriod: (id: string | number) =>
    apiClient.post(`/finance/accounting-periods/${id}/close`),

  // Account Classifications
  getAccountClassifications: (params: Record<string, unknown>) =>
    apiClient.get("/finance/account-classifications", { params }),
  getAccountClassificationsTree: () =>
    apiClient.get("/finance/account-classifications", {
      params: { tree: true },
    }),
  createAccountClassification: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/account-classifications", payload),
  updateAccountClassification: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/account-classifications/${id}`, payload),
  deleteAccountClassification: (id: string | number) =>
    apiClient.delete(`/finance/account-classifications/${id}`),

  // Chart of Accounts
  getChartOfAccounts: (params: Record<string, unknown>) =>
    apiClient.get("/finance/chart-of-accounts", { params }),
  getChartOfAccountById: (id: string | number) =>
    apiClient.get(`/finance/chart-of-accounts/${id}`),
  createChartOfAccount: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/chart-of-accounts", payload),
  updateChartOfAccount: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/chart-of-accounts/${id}`, payload),
  deleteChartOfAccount: (id: string | number) =>
    apiClient.delete(`/finance/chart-of-accounts/${id}`),
  deactivateChartOfAccount: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.patch(`/finance/chart-of-accounts/${id}/deactivate`, payload),

  // Opening Balances
  getOpeningBalances: (params: Record<string, unknown>) =>
    apiClient.get("/finance/opening-balances", { params }),
  createOpeningBalance: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/opening-balances", payload),
  updateOpeningBalance: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/opening-balances/${id}`, payload),
  deleteOpeningBalance: (id: string | number) =>
    apiClient.delete(`/finance/opening-balances/${id}`),

  // Journal Entries
  getJournalEntries: (params: Record<string, unknown>) =>
    apiClient.get("/finance/journal-entries", { params }),
  getJournalEntryById: (id: string | number) =>
    apiClient.get(`/finance/journal-entries/${id}`),
  createJournalEntry: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/journal-entries", payload),
  updateJournalEntry: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.put(`/finance/journal-entries/${id}`, payload),
  deleteJournalEntry: (id: string | number) =>
    apiClient.delete(`/finance/journal-entries/${id}`),
  submitJournalEntry: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.post(`/finance/journal-entries/${id}/submit`, payload),
  approveJournalEntry: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/journal-entries/${id}/approve`, payload),
  rejectJournalEntry: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.post(`/finance/journal-entries/${id}/reject`, payload),
  postJournalEntry: (id: string | number) =>
    apiClient.post(`/finance/journal-entries/${id}/post`),
  reverseJournalEntry: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/journal-entries/${id}/reverse`, payload),

  // Payment Vouchers
  getPaymentVouchers: (params: Record<string, unknown>) =>
    apiClient.get("/finance/payment-vouchers", { params }),
  getPaymentVoucherById: (id: string | number) =>
    apiClient.get(`/finance/payment-vouchers/${id}`),
  createPaymentVoucher: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/payment-vouchers", payload),
  updatePaymentVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/payment-vouchers/${id}`, payload),
  deletePaymentVoucher: (id: string | number) =>
    apiClient.delete(`/finance/payment-vouchers/${id}`),
  submitPaymentVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/payment-vouchers/${id}/submit`, payload),
  approvePaymentVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/payment-vouchers/${id}/approve`, payload),
  rejectPaymentVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/payment-vouchers/${id}/reject`, payload),
  postPaymentVoucher: (id: string | number) =>
    apiClient.post(`/finance/payment-vouchers/${id}/post`),

  // Receipt Vouchers
  getReceiptVouchers: (params: Record<string, unknown>) =>
    apiClient.get("/finance/receipt-vouchers", { params }),
  getReceiptVoucherById: (id: string | number) =>
    apiClient.get(`/finance/receipt-vouchers/${id}`),
  createReceiptVoucher: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/receipt-vouchers", payload),
  updateReceiptVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/receipt-vouchers/${id}`, payload),
  deleteReceiptVoucher: (id: string | number) =>
    apiClient.delete(`/finance/receipt-vouchers/${id}`),
  submitReceiptVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/receipt-vouchers/${id}/submit`, payload),
  approveReceiptVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/receipt-vouchers/${id}/approve`, payload),
  rejectReceiptVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/receipt-vouchers/${id}/reject`, payload),
  postReceiptVoucher: (id: string | number) =>
    apiClient.post(`/finance/receipt-vouchers/${id}/post`),

  // Bank Accounts
  getBankAccounts: (params: Record<string, unknown>) =>
    apiClient.get("/finance/bank-accounts", { params }),
  getBankAccountById: (id: string | number) =>
    apiClient.get(`/finance/bank-accounts/${id}`),
  createBankAccount: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/bank-accounts", payload),
  updateBankAccount: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.put(`/finance/bank-accounts/${id}`, payload),
  deleteBankAccount: (id: string | number) =>
    apiClient.delete(`/finance/bank-accounts/${id}`),
  deactivateBankAccount: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.patch(`/finance/bank-accounts/${id}/deactivate`, payload),
  getSriLankaBanks: () => apiClient.get("/finance/reference/sri-lanka-banks"),
  getSriLankaProvinces: () =>
    apiClient.get("/finance/reference/sri-lanka-provinces"),

  // Cash Accounts
  getCashAccounts: (params: Record<string, unknown>) =>
    apiClient.get("/finance/cash-accounts", { params }),
  getCashAccountById: (id: string | number) =>
    apiClient.get(`/finance/cash-accounts/${id}`),
  createCashAccount: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/cash-accounts", payload),
  updateCashAccount: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.put(`/finance/cash-accounts/${id}`, payload),
  deactivateCashAccount: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.patch(`/finance/cash-accounts/${id}/deactivate`, payload),

  // Account Groups and Tax Settings
  getAccountGroups: (params: Record<string, unknown>) =>
    apiClient.get("/finance/account-groups", { params }),
  getAccountGroupById: (id: string | number) =>
    apiClient.get(`/finance/account-groups/${id}`),
  createAccountGroup: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/account-groups", payload),
  updateAccountGroup: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.put(`/finance/account-groups/${id}`, payload),
  deactivateAccountGroup: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.patch(`/finance/account-groups/${id}/deactivate`, payload),
  getTaxSettings: (params: Record<string, unknown>) =>
    apiClient.get("/finance/tax-settings", { params }),
  createTaxSetting: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/tax-settings", payload),
  updateTaxSetting: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.put(`/finance/tax-settings/${id}`, payload),
  deactivateTaxSetting: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.patch(`/finance/tax-settings/${id}/deactivate`, payload),

  // Cheque Books
  getChequeBooks: (params: Record<string, unknown>) =>
    apiClient.request({
      url: "/finance/cheque-books",
      method: "QUERY",
      data: params,
    }),
  getChequeBookById: (id: string | number) =>
    apiClient.get(`/finance/cheque-books/${id}`),
  createChequeBook: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/cheque-books", payload),
  updateChequeBook: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.put(`/finance/cheque-books/${id}`, payload),
  deleteChequeBook: (id: string | number) =>
    apiClient.delete(`/finance/cheque-books/${id}`),
  cancelChequeLeaf: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.post(`/finance/cheque-books/leaves/${id}/cancel`, payload),

  // Bank Transactions
  getBankTransactions: (params: Record<string, unknown>) =>
    apiClient.get("/finance/bank-transactions", { params }),
  getBankTransactionById: (id: string | number) =>
    apiClient.get(`/finance/bank-transactions/${id}`),
  createBankTransaction: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/bank-transactions", payload),
  updateBankTransaction: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/bank-transactions/${id}`, payload),
  deleteBankTransaction: (id: string | number) =>
    apiClient.delete(`/finance/bank-transactions/${id}`),

  // Bank Reconciliations
  getBankReconciliations: (params: Record<string, unknown>) =>
    apiClient.get("/finance/bank-reconciliations", { params }),
  getBankReconciliationById: (id: string | number) =>
    apiClient.get(`/finance/bank-reconciliations/${id}`),
  getUnreconciledTransactions: (
    bankAccountId: string | number,
    params: Record<string, unknown>
  ) =>
    apiClient.get(
      `/finance/bank-reconciliations/unreconciled-transactions/${bankAccountId}`,
      { params }
    ),
  createBankReconciliation: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/bank-reconciliations", payload),
  updateBankReconciliation: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/bank-reconciliations/${id}`, payload),
  completeBankReconciliation: (id: string | number) =>
    apiClient.post(`/finance/bank-reconciliations/${id}/complete`),
  cancelBankReconciliation: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/bank-reconciliations/${id}/cancel`, payload),
  deleteBankReconciliation: (id: string | number) =>
    apiClient.delete(`/finance/bank-reconciliations/${id}`),

  // Petty Cash Funds
  getPettyCashFunds: (params: Record<string, unknown>) =>
    apiClient.get("/finance/petty-cash-funds", { params }),
  getPettyCashFundById: (id: string | number) =>
    apiClient.get(`/finance/petty-cash-funds/${id}`),
  createPettyCashFund: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/petty-cash-funds", payload),
  updatePettyCashFund: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/petty-cash-funds/${id}`, payload),
  deletePettyCashFund: (id: string | number) =>
    apiClient.delete(`/finance/petty-cash-funds/${id}`),

  // Petty Cash Vouchers
  getPettyCashVouchers: (params: Record<string, unknown>) =>
    apiClient.get("/finance/petty-cash-vouchers", { params }),
  getPettyCashVoucherById: (id: string | number) =>
    apiClient.get(`/finance/petty-cash-vouchers/${id}`),
  createPettyCashVoucher: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/petty-cash-vouchers", payload),
  updatePettyCashVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/petty-cash-vouchers/${id}`, payload),
  deletePettyCashVoucher: (id: string | number) =>
    apiClient.delete(`/finance/petty-cash-vouchers/${id}`),
  submitPettyCashVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/petty-cash-vouchers/${id}/submit`, payload),
  approvePettyCashVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/petty-cash-vouchers/${id}/approve`, payload),
  rejectPettyCashVoucher: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/petty-cash-vouchers/${id}/reject`, payload),
  postPettyCashVoucher: (id: string | number) =>
    apiClient.post(`/finance/petty-cash-vouchers/${id}/post`),

  // Petty Cash Replenishments
  getPettyCashReplenishments: (params: Record<string, unknown>) =>
    apiClient.get("/finance/petty-cash-replenishments", { params }),
  getPettyCashReplenishmentById: (id: string | number) =>
    apiClient.get(`/finance/petty-cash-replenishments/${id}`),
  createPettyCashReplenishment: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/petty-cash-replenishments", payload),
  updatePettyCashReplenishment: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/petty-cash-replenishments/${id}`, payload),
  deletePettyCashReplenishment: (id: string | number) =>
    apiClient.delete(`/finance/petty-cash-replenishments/${id}`),
  submitPettyCashReplenishment: (
    id: string | number,
    payload: Record<string, unknown>
  ) =>
    apiClient.post(`/finance/petty-cash-replenishments/${id}/submit`, payload),
  approvePettyCashReplenishment: (
    id: string | number,
    payload: Record<string, unknown>
  ) =>
    apiClient.post(`/finance/petty-cash-replenishments/${id}/approve`, payload),
  rejectPettyCashReplenishment: (
    id: string | number,
    payload: Record<string, unknown>
  ) =>
    apiClient.post(`/finance/petty-cash-replenishments/${id}/reject`, payload),
  postPettyCashReplenishment: (id: string | number) =>
    apiClient.post(`/finance/petty-cash-replenishments/${id}/post`),

  // Fixed Asset Categories
  getFixedAssetCategories: (params: Record<string, unknown>) =>
    apiClient.get("/finance/fixed-asset-categories", { params }),
  getFixedAssetCategoryById: (id: string | number) =>
    apiClient.get(`/finance/fixed-asset-categories/${id}`),
  createFixedAssetCategory: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/fixed-asset-categories", payload),
  updateFixedAssetCategory: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/fixed-asset-categories/${id}`, payload),
  deleteFixedAssetCategory: (id: string | number) =>
    apiClient.delete(`/finance/fixed-asset-categories/${id}`),

  // Fixed Assets
  getFixedAssets: (params: Record<string, unknown>) =>
    apiClient.get("/finance/fixed-assets", { params }),
  getFixedAssetById: (id: string | number) =>
    apiClient.get(`/finance/fixed-assets/${id}`),
  createFixedAsset: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/fixed-assets", payload),
  updateFixedAsset: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.put(`/finance/fixed-assets/${id}`, payload),
  deleteFixedAsset: (id: string | number) =>
    apiClient.delete(`/finance/fixed-assets/${id}`),

  // Fixed Asset Depreciation Runs
  getFixedAssetDepreciationRuns: (params: Record<string, unknown>) =>
    apiClient.get("/finance/fixed-asset-depreciations", { params }),
  getFixedAssetDepreciationRunById: (id: string | number) =>
    apiClient.get(`/finance/fixed-asset-depreciations/${id}`),
  previewFixedAssetDepreciation: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/fixed-asset-depreciations/preview", payload),
  createFixedAssetDepreciationRun: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/fixed-asset-depreciations", payload),
  postFixedAssetDepreciationRun: (id: string | number) =>
    apiClient.post(`/finance/fixed-asset-depreciations/${id}/post`),
  deleteFixedAssetDepreciationRun: (id: string | number) =>
    apiClient.delete(`/finance/fixed-asset-depreciations/${id}`),

  // Fixed Asset Disposals
  getFixedAssetDisposals: (params: Record<string, unknown>) =>
    apiClient.get("/finance/fixed-asset-disposals", { params }),
  getFixedAssetDisposalById: (id: string | number) =>
    apiClient.get(`/finance/fixed-asset-disposals/${id}`),
  createFixedAssetDisposal: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/fixed-asset-disposals", payload),
  updateFixedAssetDisposal: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.put(`/finance/fixed-asset-disposals/${id}`, payload),
  deleteFixedAssetDisposal: (id: string | number) =>
    apiClient.delete(`/finance/fixed-asset-disposals/${id}`),
  submitFixedAssetDisposal: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/fixed-asset-disposals/${id}/submit`, payload),
  approveFixedAssetDisposal: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/fixed-asset-disposals/${id}/approve`, payload),
  rejectFixedAssetDisposal: (
    id: string | number,
    payload: Record<string, unknown>
  ) => apiClient.post(`/finance/fixed-asset-disposals/${id}/reject`, payload),
  postFixedAssetDisposal: (id: string | number) =>
    apiClient.post(`/finance/fixed-asset-disposals/${id}/post`),

  // General Ledger
  getGeneralLedgerEntries: (params: Record<string, unknown>) =>
    apiClient.get("/finance/general-ledger", { params }),
  rebuildGeneralLedger: (payload: Record<string, unknown>) =>
    apiClient.post("/finance/general-ledger/rebuild", payload),

  // Finance Reports
  getAccountLedgerReport: (params: Record<string, unknown>) =>
    apiClient.get("/finance/reports/account-ledger", { params }),
  getTrialBalanceReport: (params: Record<string, unknown>) =>
    apiClient.get("/finance/reports/trial-balance", { params }),
  getProfitLossReport: (params: Record<string, unknown>) =>
    apiClient.get("/finance/reports/profit-loss", { params }),
  getBalanceSheetReport: (params: Record<string, unknown>) =>
    apiClient.get("/finance/reports/balance-sheet", { params }),
  getCashBookReport: (params: Record<string, unknown>) =>
    apiClient.get("/finance/reports/cash-bank-book", {
      params: { ...params, book_type: "cash" },
    }),
  getBankBookReport: (params: Record<string, unknown>) =>
    apiClient.get("/finance/reports/cash-bank-book", {
      params: { ...params, book_type: "bank" },
    }),
  getDayBookReport: (params: Record<string, unknown>) =>
    apiClient.get("/finance/reports/day-book", { params }),
  getJournalRegisterReport: (params: Record<string, unknown>) =>
    apiClient.get("/finance/reports/journal-register", { params }),
  getPaymentRegisterReport: (params: Record<string, unknown>) =>
    apiClient.get("/finance/reports/payment-register", { params }),
  getReceiptRegisterReport: (params: Record<string, unknown>) =>
    apiClient.get("/finance/reports/receipt-register", { params }),
  getCountries: () => apiClient.get("/finance/countries"),
};

