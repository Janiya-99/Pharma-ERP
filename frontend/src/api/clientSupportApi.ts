import apiClient from "./apiClient";

export interface SupportTicketItem {
  id: number;
  tenant_company_id: number;
  company_name?: string;
  company_code?: string;
  ticket_number: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent" | string;
  status: "open" | "in_progress" | "resolved" | "closed" | string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketMessageItem {
  id: number;
  support_ticket_id: number;
  sender_type: "platform_admin" | "client" | string;
  sender_id: number;
  message_text: string;
  created_at: string;
  updated_at: string;
}

export const getClientSupportTickets = async (): Promise<SupportTicketItem[]> => {
  try {
    const res = await apiClient.get("/support/tickets");
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (err) {
    // Fallback to local storage if network or offline
    const local = JSON.parse(localStorage.getItem("erp_user_tickets") || "[]");
    return local;
  }
};

export const createClientSupportTicket = async (data: {
  subject: string;
  description: string;
  priority: string;
}): Promise<SupportTicketItem> => {
  const res = await apiClient.post("/support/tickets", data);
  return res.data?.data;
};

export const getClientTicketMessages = async (
  ticketId: number
): Promise<SupportTicketMessageItem[]> => {
  const res = await apiClient.get(`/support/tickets/${ticketId}/messages`);
  return res.data?.data || [];
};

export const sendClientTicketMessage = async (
  ticketId: number,
  messageText: string
): Promise<SupportTicketMessageItem> => {
  const res = await apiClient.post(`/support/tickets/${ticketId}/messages`, {
    message_text: messageText,
  });
  return res.data?.data;
};

export const updateClientTicketStatus = async (
  ticketId: number,
  status: string
): Promise<SupportTicketItem> => {
  const res = await apiClient.put(`/support/tickets/${ticketId}/status`, { status });
  return res.data?.data;
};

export interface SupportNotificationsData {
  unread_replies: number;
  latest_replies: Array<{
    ticket_id: number;
    subject: string;
    reply_message: string;
    sender: string;
    created_at: string;
  }>;
}

export const getSupportNotifications = async (): Promise<SupportNotificationsData> => {
  try {
    const res = await apiClient.get("/support/notifications");
    return res.data?.data || { unread_replies: 0, latest_replies: [] };
  } catch (err) {
    return { unread_replies: 0, latest_replies: [] };
  }
};
