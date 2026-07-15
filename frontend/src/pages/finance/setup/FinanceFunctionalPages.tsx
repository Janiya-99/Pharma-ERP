import { financeApi } from "../../../api/financeApi";
import { FinanceQuickResourcePage, QuickField } from "../shared/FinanceQuickResourcePage";

const statusField: QuickField = {
  name: "status",
  label: "Status",
  type: "select",
  required: true,
  table: true,
  defaultValue: "active",
  options: [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ],
};

const activeStatusField = statusField;

const approvalStatusField: QuickField = {
  name: "posted_status",
  label: "Posted Status",
  type: "text",
  table: true,
};

const branchField: QuickField = { name: "branch_id", label: "Branch", type: "select", source: "branches", required: true };
const optionalBranchField: QuickField = { name: "branch_id", label: "Branch", type: "select", source: "branches" };
const financialYearField: QuickField = { name: "financial_year_id", label: "Financial Year", type: "select", source: "financialYears", required: true };
const accountingPeriodField: QuickField = { name: "accounting_period_id", label: "Accounting Period", type: "select", source: "accountingPeriods", required: true };
const accountField = (name: string, label: string, required = true): QuickField => ({ name, label, type: "select", source: "accounts", required });

export const OpeningBalancesPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "Finance Setup",
      title: "Opening Balances",
      description: "Capture opening debit and credit balances before posting finance transactions.",
      createLabel: "Create Opening Balance",
      listApi: financeApi.getOpeningBalances,
      createApi: financeApi.createOpeningBalance,
      updateApi: financeApi.updateOpeningBalance,
      deleteApi: financeApi.deleteOpeningBalance,
      statusFilter: true,
      fields: [
        optionalBranchField,
        financialYearField,
        accountField("account_id", "Account"),
        { name: "debit_amount", label: "Debit Amount", type: "number", table: true, defaultValue: 0 },
        { name: "credit_amount", label: "Credit Amount", type: "number", table: true, defaultValue: 0 },
        statusField,
        { name: "remarks", label: "Remarks", type: "textarea" },
      ],
    }}
  />
);

export const FinancialYearPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "Finance Setup",
      title: "Financial Year",
      description: "Configure financial years and close controls for ledger reporting.",
      createLabel: "Create Financial Year",
      listApi: financeApi.getFinancialYears,
      createApi: financeApi.createFinancialYear,
      updateApi: financeApi.updateFinancialYear,
      statusFilter: true,
      fields: [
        { name: "year_name", label: "Year Name", type: "text", required: true, table: true, placeholder: "FY 2026" },
        { name: "start_date", label: "Start Date", type: "date", required: true, table: true },
        { name: "end_date", label: "End Date", type: "date", required: true, table: true },
        { name: "is_active", label: "Active Year", type: "checkbox", required: true, table: true, defaultValue: false },
        activeStatusField,
      ],
    }}
  />
);

export const TaxSettingsPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "Finance Setup",
      title: "Tax Settings",
      description: "Maintain tax accounts, rates, and posting defaults.",
      createLabel: "Create Tax Setting",
      listApi: financeApi.getTaxSettings,
      createApi: financeApi.createTaxSetting,
      updateApi: financeApi.updateTaxSetting,
      deactivateApi: financeApi.deactivateTaxSetting,
      statusFilter: true,
      fields: [
        { name: "tax_code", label: "Tax Code", type: "text", required: true, table: true, placeholder: "VAT15" },
        { name: "tax_name", label: "Tax Name", type: "text", required: true, table: true, placeholder: "VAT 15%" },
        { name: "tax_rate", label: "Tax Rate", type: "number", required: true, table: true, defaultValue: 0 },
        accountField("tax_account_id", "Tax Account", false),
        { name: "description", label: "Description", type: "textarea" },
        statusField,
      ],
    }}
  />
);

export const JournalEntryPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "General Ledger",
      title: "Journal Entry",
      description: "Create balanced debit and credit journal vouchers that post to the general ledger.",
      createLabel: "Create Journal",
      listApi: financeApi.getJournalEntries,
      createApi: financeApi.createJournalEntry,
      updateApi: financeApi.updateJournalEntry,
      deleteApi: financeApi.deleteJournalEntry,
      fields: [
        branchField,
        financialYearField,
        accountingPeriodField,
        { name: "journal_date", label: "Journal Date", type: "date", required: true, table: true },
        { name: "reference_number", label: "Reference Number", type: "text", table: true },
        approvalStatusField,
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "lines",
          label: "Journal Lines",
          type: "dynamic-lines",
          required: true,
          columns: [
            optionalBranchField,
            accountField("account_id", "GL Account", true),
            { name: "debit_amount", label: "Debit Amount", type: "number", required: true, defaultValue: 0, placeholder: "0.00" },
            { name: "credit_amount", label: "Credit Amount", type: "number", required: true, defaultValue: 0, placeholder: "0.00" },
            { name: "line_description", label: "Remarks", type: "text", placeholder: "Remarks" },
          ],
          defaultValue: [
            { branch_id: "", account_id: "", debit_amount: 0, credit_amount: 0, line_description: "" },
            { branch_id: "", account_id: "", debit_amount: 0, credit_amount: 0, line_description: "" },
          ],
        },
      ],
    }}
  />
);

export const PaymentVouchersPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "Banking & Cash",
      title: "Payment Vouchers",
      description: "Create payment vouchers that reduce linked bank or cash balances.",
      createLabel: "Create Payment Voucher",
      listApi: financeApi.getPaymentVouchers,
      createApi: financeApi.createPaymentVoucher,
      updateApi: financeApi.updatePaymentVoucher,
      deleteApi: financeApi.deletePaymentVoucher,
      fields: [
        branchField,
        financialYearField,
        accountingPeriodField,
        { name: "payment_date", label: "Payment Date", type: "date", required: true, table: true },
        { name: "payment_type", label: "Payment Type", type: "select", required: true, table: true, defaultValue: "other_payment", options: [
          { label: "Supplier Payment", value: "supplier_payment" },
          { label: "Supplier Advance Payment", value: "supplier_advance_payment" },
          { label: "Other Payment", value: "other_payment" },
          { label: "Payment Return", value: "payment_return" },
        ] },
        { name: "payment_method", label: "Payment Method", type: "select", required: true, table: true, defaultValue: "cash", options: [
          { label: "Cash", value: "cash" },
          { label: "Bank Transfer", value: "bank_transfer" },
          { label: "Cheque", value: "cheque" },
          { label: "Online Transfer", value: "online_transfer" },
          { label: "Card", value: "card" },
        ] },
        accountField("paid_from_account_id", "Paid From Account"),
        { name: "reference_number", label: "Reference Number", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { 
          name: "lines", 
          label: "Payment Lines", 
          type: "dynamic-lines", 
          required: true, 
          columns: [
            optionalBranchField,
            accountField("account_id", "GL Account", true),
            { name: "amount", label: "Amount", type: "number", required: true, defaultValue: 0, placeholder: "0.00" },
            { name: "line_description", label: "Remarks", type: "text", placeholder: "Remarks" },
          ],
          defaultValue: [{ branch_id: "", account_id: "", amount: 0, line_description: "" }] 
        },
      ],
    }}
  />
);

export const ReceiptVouchersPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "Banking & Cash",
      title: "Receipt Vouchers",
      description: "Create receipt vouchers that increase linked bank or cash balances.",
      createLabel: "Create Receipt Voucher",
      listApi: financeApi.getReceiptVouchers,
      createApi: financeApi.createReceiptVoucher,
      updateApi: financeApi.updateReceiptVoucher,
      deleteApi: financeApi.deleteReceiptVoucher,
      fields: [
        branchField,
        financialYearField,
        accountingPeriodField,
        { name: "receipt_date", label: "Receipt Date", type: "date", required: true, table: true },
        { name: "receipt_type", label: "Receipt Type", type: "select", required: true, table: true, defaultValue: "other_receipt", options: [
          { label: "Customer Receipt", value: "customer_receipt" },
          { label: "Supplier Refund", value: "supplier_refund" },
          { label: "Other Receipt", value: "other_receipt" },
        ] },
        { name: "receipt_method", label: "Receipt Method", type: "select", required: true, table: true, defaultValue: "cash", options: [
          { label: "Cash", value: "cash" },
          { label: "Bank Transfer", value: "bank_transfer" },
          { label: "Cheque", value: "cheque" },
          { label: "Online Transfer", value: "online_transfer" },
          { label: "Card", value: "card" },
        ] },
        accountField("received_to_account_id", "Received To Account"),
        { name: "reference_number", label: "Reference Number", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { 
          name: "lines", 
          label: "Receipt Lines", 
          type: "dynamic-lines", 
          required: true, 
          columns: [
            optionalBranchField,
            accountField("account_id", "GL Account", true),
            { name: "amount", label: "Amount", type: "number", required: true, defaultValue: 0, placeholder: "0.00" },
            { name: "line_description", label: "Remarks", type: "text", placeholder: "Remarks" },
          ],
          defaultValue: [{ branch_id: "", account_id: "", amount: 0, line_description: "" }] 
        },
      ],
    }}
  />
);

export const BankReconciliationPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "Banking & Cash",
      title: "Bank Reconciliation",
      description: "Match bank statement lines with posted bank transactions.",
      createLabel: "Create Reconciliation",
      listApi: financeApi.getBankReconciliations,
      createApi: financeApi.createBankReconciliation,
      updateApi: financeApi.updateBankReconciliation,
      deleteApi: financeApi.deleteBankReconciliation,
      fields: [
        optionalBranchField,
        { name: "bank_account_id", label: "Bank Account", type: "select", source: "bankAccounts", required: true, table: true },
        { name: "statement_start_date", label: "Statement Start Date", type: "date", required: true, table: true },
        { name: "statement_end_date", label: "Statement End Date", type: "date", required: true, table: true },
        { name: "statement_opening_balance", label: "Opening Balance", type: "number", defaultValue: 0 },
        { name: "statement_closing_balance", label: "Closing Balance", type: "number", defaultValue: 0 },
        { name: "remarks", label: "Remarks", type: "textarea" },
        { name: "transaction_ids", label: "Transaction IDs JSON", type: "json", defaultValue: [] },
      ],
    }}
  />
);

