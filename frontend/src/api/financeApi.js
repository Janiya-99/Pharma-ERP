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
};
