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
