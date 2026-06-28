import apiClient from "./apiClient";

export const login = async (payload: Record<string, unknown>) => {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
};

export const getAuthContext = async () => {
  const response = await apiClient.get("/auth/context");
  return response.data;
};

export const switchBranch = async (branchId: string | number) => {
  const response = await apiClient.post("/auth/switch-branch", {
    branch_id: parseInt(branchId, 10),
  });
  return response.data;
};

export const switchSoftware = async (softwareCode: unknown) => {
  const response = await apiClient.post("/auth/switch-software", {
    software_code: softwareCode,
  });
  return response.data;
};
