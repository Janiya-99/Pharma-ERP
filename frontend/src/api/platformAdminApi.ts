import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const platformAdminClient = axios.create({
  baseURL: `${baseURL}/platform-admin`,
  headers: {
    "Content-Type": "application/json",
  },
});

platformAdminClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("platform_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

platformAdminClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("platform_admin_token");
      // Redirect to platform-admin login
      if (!window.location.pathname.startsWith("/platform-admin/login")) {
        window.location.href = "/platform-admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default platformAdminClient;

// Platform Admin API functions
export const platformLogin = async (data: any) => {
  const res = await platformAdminClient.post("/auth/login", data);
  return res.data;
};

export const platformGetMe = async () => {
  const res = await platformAdminClient.get("/auth/me");
  return res.data;
};

// Companies
export const getPlatformCompanies = async (params?: any) => {
  const res = await platformAdminClient.get("/companies", { params });
  return res.data;
};

export const createPlatformCompany = async (data: any) => {
  const res = await platformAdminClient.post("/companies", data);
  return res.data;
};

export const getPlatformCompany = async (id: any) => {
  const res = await platformAdminClient.get(`/companies/${id}`);
  return res.data;
};

export const updatePlatformCompany = async (id: any, data: any) => {
  const res = await platformAdminClient.put(`/companies/${id}`, data);
  return res.data;
};

export const suspendPlatformCompany = async (id: any) => {
  const res = await platformAdminClient.post(`/companies/${id}/suspend`);
  return res.data;
};

export const activatePlatformCompany = async (id: any) => {
  const res = await platformAdminClient.post(`/companies/${id}/activate`);
  return res.data;
};

// Databases
export const getPlatformDatabases = async () => {
  const res = await platformAdminClient.get("/company-databases");
  return res.data;
};

// Plans
export const getPlatformPlans = async () => {
  const res = await platformAdminClient.get("/subscription-plans");
  return res.data;
};

export const createPlatformPlan = async (data: any) => {
  const res = await platformAdminClient.post("/subscription-plans", data);
  return res.data;
};

export const updatePlatformPlan = async (id: any, data: any) => {
  const res = await platformAdminClient.put(`/subscription-plans/${id}`, data);
  return res.data;
};

// Subscriptions
export const getPlatformSubscriptions = async () => {
  const res = await platformAdminClient.get("/subscriptions");
  return res.data;
};

// Invoices
export const getPlatformInvoices = async () => {
  const res = await platformAdminClient.get("/billing/invoices");
  return res.data;
};

export const createPlatformInvoice = async (data: any) => {
  const res = await platformAdminClient.post("/billing/invoices", data);
  return res.data;
};

// Payments
export const getPlatformPayments = async () => {
  const res = await platformAdminClient.get("/billing/payments");
  return res.data;
};

export const createPlatformPayment = async (data: any) => {
  const res = await platformAdminClient.post("/billing/payments", data);
  return res.data;
};

// Software modules
export const getPlatformModules = async () => {
  const res = await platformAdminClient.get("/modules");
  return res.data;
};

export const getPlatformFeatures = async () => {
  const res = await platformAdminClient.get("/features");
  return res.data;
};

export const getPlatformVersions = async () => {
  const res = await platformAdminClient.get("/versions");
  return res.data;
};

export const getPlatformFeatureFlags = async () => {
  const res = await platformAdminClient.get("/feature-flags");
  return res.data;
};

export const createPlatformFeatureFlag = async (data: any) => {
  const res = await platformAdminClient.post("/feature-flags", data);
  return res.data;
};

// Users & roles
export const getPlatformUsers = async () => {
  const res = await platformAdminClient.get("/users");
  return res.data;
};

export const createPlatformUser = async (data: any) => {
  const res = await platformAdminClient.post("/users", data);
  return res.data;
};

export const getPlatformRoles = async () => {
  const res = await platformAdminClient.get("/roles");
  return res.data;
};

export const getPlatformPermissions = async () => {
  const res = await platformAdminClient.get("/permissions");
  return res.data;
};

// Settings
export const getPlatformSettings = async () => {
  const res = await platformAdminClient.get("/settings");
  return res.data;
};

export const updateBrandingSettings = async (data: any) => {
  const res = await platformAdminClient.put("/settings/branding", data);
  return res.data;
};

export const updateEmailSettings = async (data: any) => {
  const res = await platformAdminClient.put("/settings/email", data);
  return res.data;
};

export const updateGatewaySettings = async (data: any) => {
  const res = await platformAdminClient.put("/settings/payment-gateway", data);
  return res.data;
};

export const updateBackupSettings = async (data: any) => {
  const res = await platformAdminClient.put("/settings/backup", data);
  return res.data;
};

// Support
export const getPlatformSupportTickets = async () => {
  const res = await platformAdminClient.get("/support/tickets");
  return res.data;
};

export const getPlatformTicketMessages = async (id: any) => {
  const res = await platformAdminClient.get(`/support/tickets/${id}/messages`);
  return res.data;
};

export const sendPlatformTicketMessage = async (id: any, data: any) => {
  const res = await platformAdminClient.post(`/support/tickets/${id}/messages`, data);
  return res.data;
};

// Audit logs
export const getPlatformAuditLogs = async () => {
  const res = await platformAdminClient.get("/audit-logs");
  return res.data;
};

export const getPlatformLoginLogs = async () => {
  const res = await platformAdminClient.get("/login-logs");
  return res.data;
};
