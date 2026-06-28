import apiClient from "./apiClient";

export const getCompanyProfile = async () => {
  const res = await apiClient.get("/control/company");
  return res.data;
};

export const updateCompanyProfile = async (
  payload: Record<string, unknown>
) => {
  const res = await apiClient.put("/control/company", payload);
  return res.data;
};

// --- Branches ---
export const getBranches = async (params: Record<string, unknown>) => {
  const res = await apiClient.get("/control/branches", { params });
  return res.data;
};

export const getBranchById = async (id: string | number) => {
  const res = await apiClient.get(`/control/branches/${id}`);
  return res.data;
};

export const createBranch = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/branches", payload);
  return res.data;
};

export const updateBranch = async (
  id: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.put(`/control/branches/${id}`, payload);
  return res.data;
};

export const deleteBranch = async (id: string | number) => {
  const res = await apiClient.delete(`/control/branches/${id}`);
  return res.data;
};

// --- Departments ---
export const getDepartments = async (params: Record<string, unknown>) => {
  const res = await apiClient.get("/control/departments", { params });
  return res.data;
};

export const getDepartmentById = async (id: string | number) => {
  const res = await apiClient.get(`/control/departments/${id}`);
  return res.data;
};

export const createDepartment = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/departments", payload);
  return res.data;
};

export const updateDepartment = async (
  id: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.put(`/control/departments/${id}`, payload);
  return res.data;
};

export const deleteDepartment = async (id: string | number) => {
  const res = await apiClient.delete(`/control/departments/${id}`);
  return res.data;
};

// --- Designations ---
export const getDesignations = async (params: Record<string, unknown>) => {
  const res = await apiClient.get("/control/designations", { params });
  return res.data;
};

export const getDesignationById = async (id: string | number) => {
  const res = await apiClient.get(`/control/designations/${id}`);
  return res.data;
};

export const createDesignation = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/designations", payload);
  return res.data;
};

export const updateDesignation = async (
  id: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.put(`/control/designations/${id}`, payload);
  return res.data;
};

export const deleteDesignation = async (id: string | number) => {
  const res = await apiClient.delete(`/control/designations/${id}`);
  return res.data;
};

// --- Software Modules ---
export const getSoftwareModules = async () => {
  const res = await apiClient.get("/control/software-modules");
  return res.data;
};

// --- Users ---
export const getUsers = async (params: Record<string, unknown>) => {
  const res = await apiClient.get("/control/users", { params });
  return res.data;
};

export const getUserById = async (id: string | number) => {
  const res = await apiClient.get(`/control/users/${id}`);
  return res.data;
};

export const createUser = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/users", payload);
  return res.data;
};

export const updateUser = async (
  id: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.put(`/control/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id: string | number) => {
  const res = await apiClient.delete(`/control/users/${id}`);
  return res.data;
};

export const changeUserStatus = async (
  id: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.post(
    `/control/users/${id}/change-status`,
    payload
  );
  return res.data;
};

export const resetUserPassword = async (
  id: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.post(
    `/control/users/${id}/reset-password`,
    payload
  );
  return res.data;
};

// --- User Branch Access ---
export const getUserBranches = async (userId: string | number) => {
  const res = await apiClient.get(`/control/users/${userId}/branches`);
  return res.data;
};

export const assignUserBranches = async (
  userId: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.post(
    `/control/users/${userId}/branches`,
    payload
  );
  return res.data;
};

export const removeUserBranch = async (
  userId: string | number,
  branchId: string | number
) => {
  const res = await apiClient.delete(
    `/control/users/${userId}/branches/${branchId}`
  );
  return res.data;
};

// --- User Software Access ---
export const getUserSoftware = async (userId: string | number) => {
  const res = await apiClient.get(`/control/users/${userId}/software`);
  return res.data;
};

export const assignUserSoftware = async (
  userId: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.post(
    `/control/users/${userId}/software`,
    payload
  );
  return res.data;
};

export const removeUserSoftware = async (
  userId: string | number,
  softwareId: string | number
) => {
  const res = await apiClient.delete(
    `/control/users/${userId}/software/${softwareId}`
  );
  return res.data;
};

// --- Roles ---
export const getRoles = async (params: Record<string, unknown>) => {
  const res = await apiClient.get("/control/roles", { params });
  return res.data;
};

export const getRoleById = async (id: string | number) => {
  const res = await apiClient.get(`/control/roles/${id}`);
  return res.data;
};

export const createRole = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/roles", payload);
  return res.data;
};

export const updateRole = async (
  id: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.put(`/control/roles/${id}`, payload);
  return res.data;
};

export const deleteRole = async (id: string | number) => {
  const res = await apiClient.delete(`/control/roles/${id}`);
  return res.data;
};

export const getRolesBySoftware = async (softwareId: string | number) => {
  const res = await apiClient.get(
    `/control/software-modules/${softwareId}/roles`
  );
  return res.data;
};

// --- Permissions ---
export const getPermissions = async (params: Record<string, unknown>) => {
  const res = await apiClient.get("/control/permissions", { params });
  return res.data;
};

export const getPermissionsGrouped = async (
  params: Record<string, unknown>
) => {
  const res = await apiClient.get("/control/permissions/grouped", { params });
  return res.data;
};

// --- Role Permission Matrix ---
export const getRolePermissionMatrix = async (roleId: string | number) => {
  const res = await apiClient.get(`/control/roles/${roleId}/permissions`);
  return res.data;
};

export const assignRolePermissions = async (
  roleId: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.post(
    `/control/roles/${roleId}/permissions`,
    payload
  );
  return res.data;
};

// --- User Access Matrix ---
export const getUserAccessMatrix = async (userId: string | number) => {
  const res = await apiClient.get(`/control/users/${userId}/access-matrix`);
  return res.data;
};

export const assignUserAccessMatrix = async (
  userId: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.post(
    `/control/users/${userId}/access-matrix`,
    payload
  );
  return res.data;
};

export const removeUserAccessMatrix = async (
  userId: string | number,
  accessId: string | number
) => {
  const res = await apiClient.delete(
    `/control/users/${userId}/access-matrix/${accessId}`
  );
  return res.data;
};

// --- Logs ---
export const getAuditLogs = async (params: Record<string, unknown>) => {
  const res = await apiClient.get("/control/audit-logs", { params });
  return res.data;
};

export const getLoginLogs = async (params: Record<string, unknown>) => {
  const res = await apiClient.get("/control/login-logs", { params });
  return res.data;
};
