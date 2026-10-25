import apiClient from "./apiClient";

export interface ComplianceSummary {
  active_licenses: number;
  quarantine_batches_count: number;
  quarantine_stock_value: number;
  active_recalls_count: number;
  pending_disposals_count: number;
  pending_disposals_value: number;
  pass_rate_data: Array<{
    month: string;
    "QC Pass Rate (%)": number;
    "NMRA Compliance Index": number;
  }>;
  quarantine_reasons_data: Array<{
    name: string;
    value: number;
  }>;
  expiry_write_off_data: Array<{
    category: string;
    "Write-off Value (LKR)": number;
  }>;
  total_write_off_value: number;
  recent_regulatory_actions: Array<{
    id: string;
    timestamp: string;
    type: string;
    target: string;
    action: string;
    authority: string;
    status: string;
    notes: string;
    user?: string;
  }>;
}

export const complianceApi = {
  getComplianceDashboardSummary: async () => {
    return apiClient.get<{ success: boolean; data: ComplianceSummary }>("/compliance/dashboard/summary");
  },
};
