import { financeApi } from "../../../api/financeApi";
import { FinanceQuickResourcePage, QuickField } from "../shared/FinanceQuickResourcePage";

const branchField: QuickField = { name: "branch_id", label: "Branch", type: "select", source: "branches", required: true };
const optionalBranchField: QuickField = { name: "branch_id", label: "Branch", type: "select", source: "branches" };
const financialYearField: QuickField = { name: "financial_year_id", label: "Financial Year", type: "select", source: "financialYears", required: true };
const accountingPeriodField: QuickField = { name: "accounting_period_id", label: "Accounting Period", type: "select", source: "accountingPeriods", required: true };
const accountField = (name: string, label: string, required = true): QuickField => ({ name, label, type: "select", source: "accounts", required });

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

const depreciationMethodField = (name = "default_depreciation_method"): QuickField => ({
  name,
  label: "Depreciation Method",
  type: "select",
  required: true,
  table: true,
  defaultValue: "straight_line",
  options: [
    { label: "Straight Line", value: "straight_line" },
    { label: "Reducing Balance", value: "reducing_balance" },
  ],
});

export const FixedAssetCategoriesPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "Fixed Assets",
      title: "Fixed Asset Categories",
      description: "Define asset categories, control accounts, and depreciation defaults.",
      createLabel: "Create Asset Category",
      listApi: financeApi.getFixedAssetCategories,
      createApi: financeApi.createFixedAssetCategory,
      updateApi: financeApi.updateFixedAssetCategory,
      deleteApi: financeApi.deleteFixedAssetCategory,
      statusFilter: true,
      fields: [
        { name: "category_code", label: "Category Code", type: "text", required: true, table: true, placeholder: "FA-COMP" },
        { name: "category_name", label: "Category Name", type: "text", required: true, table: true, placeholder: "Computers" },
        { name: "description", label: "Description", type: "textarea" },
        accountField("default_asset_account_id", "Default Asset Account"),
        accountField("default_accumulated_depreciation_account_id", "Accumulated Depreciation Account"),
        accountField("default_depreciation_expense_account_id", "Depreciation Expense Account"),
        accountField("default_gain_on_disposal_account_id", "Gain on Disposal Account", false),
        accountField("default_loss_on_disposal_account_id", "Loss on Disposal Account", false),
        { name: "default_useful_life_months", label: "Useful Life Months", type: "number", required: true, table: true, defaultValue: 12 },
        depreciationMethodField(),
        statusField,
      ],
    }}
  />
);

export const FixedAssetsPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "Fixed Assets",
      title: "Fixed Assets",
      description: "Register fixed assets and connect them to asset and depreciation accounts.",
      createLabel: "Create Fixed Asset",
      listApi: financeApi.getFixedAssets,
      createApi: financeApi.createFixedAsset,
      updateApi: financeApi.updateFixedAsset,
      deleteApi: financeApi.deleteFixedAsset,
      statusFilter: true,
      fields: [
        branchField,
        { name: "fixed_asset_category_id", label: "Category", type: "select", source: "fixedAssetCategories", required: true },
        { name: "asset_code", label: "Asset Code", type: "text", required: true, table: true },
        { name: "asset_name", label: "Asset Name", type: "text", required: true, table: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "serial_number", label: "Serial Number", type: "text" },
        { name: "model_number", label: "Model Number", type: "text" },
        { name: "manufacturer", label: "Manufacturer", type: "text" },
        { name: "purchase_date", label: "Purchase Date", type: "date", required: true, table: true },
        { name: "acquisition_date", label: "Acquisition Date", type: "date", required: true },
        { name: "supplier_name", label: "Supplier Name", type: "text" },
        { name: "invoice_number", label: "Invoice Number", type: "text" },
        { name: "acquisition_cost", label: "Acquisition Cost", type: "number", required: true, table: true, defaultValue: 0 },
        { name: "residual_value", label: "Residual Value", type: "number", defaultValue: 0 },
        { name: "useful_life_months", label: "Useful Life Months", type: "number", required: true, table: true, defaultValue: 12 },
        depreciationMethodField("depreciation_method"),
        { name: "depreciation_start_date", label: "Depreciation Start Date", type: "date", required: true },
        accountField("asset_account_id", "Asset Account"),
        accountField("accumulated_depreciation_account_id", "Accumulated Depreciation Account"),
        accountField("depreciation_expense_account_id", "Depreciation Expense Account"),
        accountField("gain_on_disposal_account_id", "Gain on Disposal Account", false),
        accountField("loss_on_disposal_account_id", "Loss on Disposal Account", false),
        statusField,
      ],
    }}
  />
);

export const DepreciationRunsPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "Fixed Assets",
      title: "Depreciation Runs",
      description: "Prepare periodic depreciation runs for active fixed assets.",
      createLabel: "Create Depreciation Run",
      listApi: financeApi.getFixedAssetDepreciationRuns,
      createApi: financeApi.createFixedAssetDepreciationRun,
      deleteApi: financeApi.deleteFixedAssetDepreciationRun,
      fields: [
        optionalBranchField,
        financialYearField,
        accountingPeriodField,
        { name: "run_date", label: "Run Date", type: "date", required: true, table: true },
        { name: "depreciation_from_date", label: "From Date", type: "date", required: true, table: true },
        { name: "depreciation_to_date", label: "To Date", type: "date", required: true, table: true },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ],
    }}
  />
);

export const AssetDisposalsPage = () => (
  <FinanceQuickResourcePage
    config={{
      eyebrow: "Fixed Assets",
      title: "Asset Disposals",
      description: "Record asset sales, write-offs, and disposal gains or losses.",
      createLabel: "Create Asset Disposal",
      listApi: financeApi.getFixedAssetDisposals,
      createApi: financeApi.createFixedAssetDisposal,
      updateApi: financeApi.updateFixedAssetDisposal,
      deleteApi: financeApi.deleteFixedAssetDisposal,
      fields: [
        branchField,
        { name: "fixed_asset_id", label: "Fixed Asset", type: "select", source: "fixedAssets", required: true, table: true },
        financialYearField,
        accountingPeriodField,
        { name: "disposal_date", label: "Disposal Date", type: "date", required: true, table: true },
        { name: "disposal_type", label: "Disposal Type", type: "select", required: true, table: true, defaultValue: "sale", options: [
          { label: "Sale", value: "sale" },
          { label: "Write Off", value: "write_off" },
          { label: "Scrap", value: "scrap" },
          { label: "Lost", value: "lost" },
          { label: "Damaged", value: "damaged" },
        ] },
        { name: "proceeds_amount", label: "Proceeds Amount", type: "number", table: true, defaultValue: 0 },
        accountField("received_to_account_id", "Received To Account", false),
        accountField("gain_on_disposal_account_id", "Gain on Disposal Account", false),
        accountField("loss_on_disposal_account_id", "Loss on Disposal Account", false),
        { name: "reason", label: "Reason", type: "textarea" },
      ],
    }}
  />
);

