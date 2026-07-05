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

export const getDesignationsForDepartment = async (deptId: string | number) => {
  const res = await apiClient.get(`/control/departments/${deptId}/designations`);
  return res.data;
};

export const getDesignationDefaultRoles = async (desigId: string | number) => {
  const res = await apiClient.get(`/control/designations/${desigId}/default-roles`);
  return res.data;
};

export const setDesignationDefaultRoles = async (desigId: string | number, payload: { role_ids: string[] | number[] }) => {
  const res = await apiClient.put(`/control/designations/${desigId}/default-roles`, payload);
  return res.data;
};

export const getDesignationDepartments = async (desigId: string | number) => {
  const res = await apiClient.get(`/control/designations/${desigId}/departments`);
  return res.data;
};

export const setDesignationDepartments = async (desigId: string | number, payload: { department_ids: string[] | number[] }) => {
  const res = await apiClient.put(`/control/designations/${desigId}/departments`, payload);
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

export const getUserAccessPreview = async (userId: string | number) => {
  const res = await apiClient.get(`/control/users/${userId}/access-preview`);
  return res.data;
};

export const getUserEffectiveAccess = async (userId: string | number) => {
  const res = await apiClient.get(`/control/users/${userId}/effective-access`);
  return res.data;
};

export const getUserOrganizationAssignments = async (userId: string | number) => {
  const res = await apiClient.get(`/control/users/${userId}/organization-assignments`);
  return res.data;
};

export const createUserOrganizationAssignment = async (
  userId: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.post(
    `/control/users/${userId}/organization-assignments`,
    payload
  );
  return res.data;
};

export const updateUserOrganizationAssignment = async (
  userId: string | number,
  assignmentId: string | number,
  payload: Record<string, unknown>
) => {
  const res = await apiClient.put(
    `/control/users/${userId}/organization-assignments/${assignmentId}`,
    payload
  );
  return res.data;
};

export const deleteUserOrganizationAssignment = async (
  userId: string | number,
  assignmentId: string | number
) => {
  const res = await apiClient.delete(
    `/control/users/${userId}/organization-assignments/${assignmentId}`
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

// --- System Settings & Configuration (Step 71) ---
export const getSettingsGroups = async () => {
  const res = await apiClient.get("/control/settings/groups");
  return res.data;
};

export const getSettings = async (params?: Record<string, unknown>) => {
  const res = await apiClient.get("/control/settings", { params });
  return res.data;
};

export const saveSetting = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/settings", payload);
  return res.data;
};

export const publishSetting = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/settings/publish", payload);
  return res.data;
};

export const saveBranchOverride = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/settings/branch-override", payload);
  return res.data;
};

export const getSettingsImpactPreview = async (settingKey: string, proposedValue: unknown) => {
  const res = await apiClient.post(
    `/control/settings/impact-preview?setting_key=${encodeURIComponent(settingKey)}`,
    { proposed_value: proposedValue, setting_key: settingKey }
  );
  return res.data;
};

// --- Approval Workflows ---
export const getApprovalWorkflows = async (params?: Record<string, unknown>) => {
  const res = await apiClient.get("/control/approval-workflows", { params });
  return res.data;
};

export const getApprovalWorkflowById = async (id: string | number) => {
  const res = await apiClient.get(`/control/approval-workflows/${id}`);
  return res.data;
};

export const saveApprovalWorkflow = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/approval-workflows", payload);
  return res.data;
};

export const publishApprovalWorkflow = async (id: string | number) => {
  const res = await apiClient.post(`/control/approval-workflows/${id}/publish`);
  return res.data;
};

export const deleteApprovalWorkflow = async (id: string | number) => {
  const res = await apiClient.delete(`/control/approval-workflows/${id}`);
  return res.data;
};

export const getApprovalWorkflowVersions = async (id: string | number) => {
  const res = await apiClient.get(`/control/approval-workflows/${id}/versions`);
  return res.data;
};

// --- Document Numbering ---
export const getDocumentNumberingRules = async (params?: Record<string, unknown>) => {
  const res = await apiClient.get("/control/document-numbering", { params });
  return res.data;
};

export const saveDocumentNumberingRule = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/document-numbering", payload);
  return res.data;
};

export const publishDocumentNumberingRule = async (id: string | number) => {
  const res = await apiClient.post(`/control/document-numbering/${id}/publish`);
  return res.data;
};

export const deleteDocumentNumberingRule = async (id: string | number) => {
  const res = await apiClient.delete(`/control/document-numbering/${id}`);
  return res.data;
};

export const previewDocumentNumber = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/document-numbering/preview", payload);
  return res.data;
};

// --- Security Settings & Backups ---
export const getSecurityPolicy = async (params?: Record<string, unknown>) => {
  const res = await apiClient.get("/control/security/policy", { params });
  return res.data;
};

export const saveSecurityPolicy = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/security/policy", payload);
  return res.data;
};

export const publishSecurityPolicy = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/security/policy/publish", payload);
  return res.data;
};

export const getTrustedIPRules = async () => {
  const res = await apiClient.get("/control/security/trusted-ips");
  return res.data;
};

export const saveTrustedIPRule = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/security/trusted-ips", payload);
  return res.data;
};

export const deleteTrustedIPRule = async (id: string | number) => {
  const res = await apiClient.delete(`/control/security/trusted-ips/${id}`);
  return res.data;
};

export const getBackupPolicies = async () => {
  const res = await apiClient.get("/control/security/backups/policies");
  return res.data;
};

export const saveBackupPolicy = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post("/control/security/backups/policies", payload);
  return res.data;
};

export const getBackupLogs = async (params?: Record<string, unknown>) => {
  const res = await apiClient.get("/control/security/backups/logs", { params });
  return res.data;
};

export const triggerManualBackup = async () => {
  const res = await apiClient.post("/control/security/backups/trigger");
  return res.data;
};

export const getActiveSessions = async () => {
  const res = await apiClient.get("/control/security/sessions");
  return res.data;
};

export const terminateSession = async (id: string | number) => {
  const res = await apiClient.delete(`/control/security/sessions/${id}`);
  return res.data;
};

export const terminateAllOtherSessions = async () => {
  const res = await apiClient.delete("/control/security/sessions/terminate-all");
  return res.data;
};

