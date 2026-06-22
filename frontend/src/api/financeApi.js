import apiClient from "./apiClient";

export const financeApi = {
  // Financial Years
  getFinancialYears: (params) => apiClient.get("/finance/financial-years", { params }),
  getFinancialYearById: (id) => apiClient.get(`/finance/financial-years/${id}`),
  createFinancialYear: (payload) => apiClient.post("/finance/financial-years", payload),
  updateFinancialYear: (id, payload) => apiClient.put(`/finance/financial-years/${id}`, payload),
  closeFinancialYear: (id) => apiClient.post(`/finance/financial-years/${id}/close`),

  // Accounting Periods
  getAccountingPeriods: (params) => apiClient.get("/finance/accounting-periods", { params }),
  createAccountingPeriod: (payload) => apiClient.post("/finance/accounting-periods", payload),
  updateAccountingPeriod: (id, payload) => apiClient.put(`/finance/accounting-periods/${id}`, payload),
  closeAccountingPeriod: (id) => apiClient.post(`/finance/accounting-periods/${id}/close`),

  // Account Classifications
  getAccountClassifications: (params) => apiClient.get("/finance/account-classifications", { params }),
  getAccountClassificationsTree: () => apiClient.get("/finance/account-classifications", { params: { tree: true } }),
  createAccountClassification: (payload) => apiClient.post("/finance/account-classifications", payload),
  updateAccountClassification: (id, payload) => apiClient.put(`/finance/account-classifications/${id}`, payload),
  deleteAccountClassification: (id) => apiClient.delete(`/finance/account-classifications/${id}`),

  // Chart of Accounts
  getChartOfAccounts: (params) => apiClient.get("/finance/chart-of-accounts", { params }),
  getChartOfAccountById: (id) => apiClient.get(`/finance/chart-of-accounts/${id}`),
  createChartOfAccount: (payload) => apiClient.post("/finance/chart-of-accounts", payload),
  updateChartOfAccount: (id, payload) => apiClient.put(`/finance/chart-of-accounts/${id}`, payload),
  deleteChartOfAccount: (id) => apiClient.delete(`/finance/chart-of-accounts/${id}`),

  // Opening Balances
  getOpeningBalances: (params) => apiClient.get("/finance/opening-balances", { params }),
  createOpeningBalance: (payload) => apiClient.post("/finance/opening-balances", payload),
  updateOpeningBalance: (id, payload) => apiClient.put(`/finance/opening-balances/${id}`, payload),
  deleteOpeningBalance: (id) => apiClient.delete(`/finance/opening-balances/${id}`),

  // Journal Entries
  getJournalEntries: (params) => apiClient.get("/finance/journal-entries", { params }),
  getJournalEntryById: (id) => apiClient.get(`/finance/journal-entries/${id}`),
  createJournalEntry: (payload) => apiClient.post("/finance/journal-entries", payload),
  updateJournalEntry: (id, payload) => apiClient.put(`/finance/journal-entries/${id}`, payload),
  deleteJournalEntry: (id) => apiClient.delete(`/finance/journal-entries/${id}`),
  submitJournalEntry: (id, payload) => apiClient.post(`/finance/journal-entries/${id}/submit`, payload),
  approveJournalEntry: (id, payload) => apiClient.post(`/finance/journal-entries/${id}/approve`, payload),
  rejectJournalEntry: (id, payload) => apiClient.post(`/finance/journal-entries/${id}/reject`, payload),
  postJournalEntry: (id) => apiClient.post(`/finance/journal-entries/${id}/post`),
  reverseJournalEntry: (id, payload) => apiClient.post(`/finance/journal-entries/${id}/reverse`, payload),

  // Payment Vouchers
  getPaymentVouchers: (params) => apiClient.get("/finance/payment-vouchers", { params }),
  getPaymentVoucherById: (id) => apiClient.get(`/finance/payment-vouchers/${id}`),
  createPaymentVoucher: (payload) => apiClient.post("/finance/payment-vouchers", payload),
  updatePaymentVoucher: (id, payload) => apiClient.put(`/finance/payment-vouchers/${id}`, payload),
  deletePaymentVoucher: (id) => apiClient.delete(`/finance/payment-vouchers/${id}`),
  submitPaymentVoucher: (id, payload) => apiClient.post(`/finance/payment-vouchers/${id}/submit`, payload),
  approvePaymentVoucher: (id, payload) => apiClient.post(`/finance/payment-vouchers/${id}/approve`, payload),
  rejectPaymentVoucher: (id, payload) => apiClient.post(`/finance/payment-vouchers/${id}/reject`, payload),
  postPaymentVoucher: (id) => apiClient.post(`/finance/payment-vouchers/${id}/post`),

  // Receipt Vouchers
  getReceiptVouchers: (params) => apiClient.get("/finance/receipt-vouchers", { params }),
  getReceiptVoucherById: (id) => apiClient.get(`/finance/receipt-vouchers/${id}`),
  createReceiptVoucher: (payload) => apiClient.post("/finance/receipt-vouchers", payload),
  updateReceiptVoucher: (id, payload) => apiClient.put(`/finance/receipt-vouchers/${id}`, payload),
  deleteReceiptVoucher: (id) => apiClient.delete(`/finance/receipt-vouchers/${id}`),
  submitReceiptVoucher: (id, payload) => apiClient.post(`/finance/receipt-vouchers/${id}/submit`, payload),
  approveReceiptVoucher: (id, payload) => apiClient.post(`/finance/receipt-vouchers/${id}/approve`, payload),
  rejectReceiptVoucher: (id, payload) => apiClient.post(`/finance/receipt-vouchers/${id}/reject`, payload),
  postReceiptVoucher: (id) => apiClient.post(`/finance/receipt-vouchers/${id}/post`),

  // Bank Accounts
  getBankAccounts: (params) => apiClient.get("/finance/bank-accounts", { params }),
  getBankAccountById: (id) => apiClient.get(`/finance/bank-accounts/${id}`),
  createBankAccount: (payload) => apiClient.post("/finance/bank-accounts", payload),
  updateBankAccount: (id, payload) => apiClient.put(`/finance/bank-accounts/${id}`, payload),
  deleteBankAccount: (id) => apiClient.delete(`/finance/bank-accounts/${id}`),

  // Cheque Books
  getChequeBooks: (params) => apiClient.get("/finance/cheque-books", { params }),
  getChequeBookById: (id) => apiClient.get(`/finance/cheque-books/${id}`),
  createChequeBook: (payload) => apiClient.post("/finance/cheque-books", payload),
  updateChequeBook: (id, payload) => apiClient.put(`/finance/cheque-books/${id}`, payload),
  deleteChequeBook: (id) => apiClient.delete(`/finance/cheque-books/${id}`),
  cancelChequeLeaf: (id, payload) => apiClient.post(`/finance/cheque-books/leaves/${id}/cancel`, payload),

  // Bank Transactions
  getBankTransactions: (params) => apiClient.get("/finance/bank-transactions", { params }),
  getBankTransactionById: (id) => apiClient.get(`/finance/bank-transactions/${id}`),
  createBankTransaction: (payload) => apiClient.post("/finance/bank-transactions", payload),
  updateBankTransaction: (id, payload) => apiClient.put(`/finance/bank-transactions/${id}`, payload),
  deleteBankTransaction: (id) => apiClient.delete(`/finance/bank-transactions/${id}`),

  // Bank Reconciliations
  getBankReconciliations: (params) => apiClient.get("/finance/bank-reconciliations", { params }),
  getBankReconciliationById: (id) => apiClient.get(`/finance/bank-reconciliations/${id}`),
  getUnreconciledTransactions: (bankAccountId, params) => apiClient.get(`/finance/bank-reconciliations/unreconciled-transactions/${bankAccountId}`, { params }),
  createBankReconciliation: (payload) => apiClient.post("/finance/bank-reconciliations", payload),
  updateBankReconciliation: (id, payload) => apiClient.put(`/finance/bank-reconciliations/${id}`, payload),
  completeBankReconciliation: (id) => apiClient.post(`/finance/bank-reconciliations/${id}/complete`),
  cancelBankReconciliation: (id, payload) => apiClient.post(`/finance/bank-reconciliations/${id}/cancel`, payload),
  deleteBankReconciliation: (id) => apiClient.delete(`/finance/bank-reconciliations/${id}`),

  // Petty Cash Funds
  getPettyCashFunds: (params) => apiClient.get("/finance/petty-cash-funds", { params }),
  getPettyCashFundById: (id) => apiClient.get(`/finance/petty-cash-funds/${id}`),
  createPettyCashFund: (payload) => apiClient.post("/finance/petty-cash-funds", payload),
  updatePettyCashFund: (id, payload) => apiClient.put(`/finance/petty-cash-funds/${id}`, payload),
  deletePettyCashFund: (id) => apiClient.delete(`/finance/petty-cash-funds/${id}`),

  // Petty Cash Vouchers
  getPettyCashVouchers: (params) => apiClient.get("/finance/petty-cash-vouchers", { params }),
  getPettyCashVoucherById: (id) => apiClient.get(`/finance/petty-cash-vouchers/${id}`),
  createPettyCashVoucher: (payload) => apiClient.post("/finance/petty-cash-vouchers", payload),
  updatePettyCashVoucher: (id, payload) => apiClient.put(`/finance/petty-cash-vouchers/${id}`, payload),
  deletePettyCashVoucher: (id) => apiClient.delete(`/finance/petty-cash-vouchers/${id}`),
  submitPettyCashVoucher: (id, payload) => apiClient.post(`/finance/petty-cash-vouchers/${id}/submit`, payload),
  approvePettyCashVoucher: (id, payload) => apiClient.post(`/finance/petty-cash-vouchers/${id}/approve`, payload),
  rejectPettyCashVoucher: (id, payload) => apiClient.post(`/finance/petty-cash-vouchers/${id}/reject`, payload),
  postPettyCashVoucher: (id) => apiClient.post(`/finance/petty-cash-vouchers/${id}/post`),

  // Petty Cash Replenishments
  getPettyCashReplenishments: (params) => apiClient.get("/finance/petty-cash-replenishments", { params }),
  getPettyCashReplenishmentById: (id) => apiClient.get(`/finance/petty-cash-replenishments/${id}`),
  createPettyCashReplenishment: (payload) => apiClient.post("/finance/petty-cash-replenishments", payload),
  updatePettyCashReplenishment: (id, payload) => apiClient.put(`/finance/petty-cash-replenishments/${id}`, payload),
  deletePettyCashReplenishment: (id) => apiClient.delete(`/finance/petty-cash-replenishments/${id}`),
  submitPettyCashReplenishment: (id, payload) => apiClient.post(`/finance/petty-cash-replenishments/${id}/submit`, payload),
  approvePettyCashReplenishment: (id, payload) => apiClient.post(`/finance/petty-cash-replenishments/${id}/approve`, payload),
  rejectPettyCashReplenishment: (id, payload) => apiClient.post(`/finance/petty-cash-replenishments/${id}/reject`, payload),
  postPettyCashReplenishment: (id) => apiClient.post(`/finance/petty-cash-replenishments/${id}/post`),
};
