import apiClient from "./client";

export interface HealthResponse {
  status: string;
  service: string;
}

/**
 * Check the backend health status.
 * GET /api/v1/health
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>("/health");
  return response.data;
};
