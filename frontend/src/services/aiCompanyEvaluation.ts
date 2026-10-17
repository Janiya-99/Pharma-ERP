export interface CompanyEvaluationResult {
  companyId: number;
  companyName: string;
  companyCode: string;
  status: string;
  isLocked: boolean;
  daysRemaining: number;
  expiryStatus: "active" | "expiring_soon" | "expired" | "locked";
  alertLevel: "healthy" | "warning" | "critical" | "suspended";
  healthScore: number;
  healthGrade: "A+" | "A" | "B" | "C" | "F";
  churnRisk: "LOW" | "MODERATE" | "ELEVATED" | "CRITICAL";
  categoryScores: {
    license: { score: number; max: number; label: string };
    database: { score: number; max: number; label: string };
    support: { score: number; max: number; label: string };
    billing: { score: number; max: number; label: string };
  };
  metrics: {
    activeModulesCount: number;
    openTicketsCount: number;
    urgentTicketsCount: number;
    unpaidInvoicesCount: number;
  };
  recommendations: {
    type: "action" | "opportunity" | "warning" | "success";
    title: string;
    description: string;
  }[];
  executiveSummary: string;
}

export function evaluateCompanyAI(
  company: any,
  tickets: any[] = [],
  modules: any[] = [],
  invoices: any[] = []
): CompanyEvaluationResult {
  const isLocked = company.status === "suspended" || company.subscription_status === "suspended";
  
  // 1. Calculate License Expiration & Days Remaining
  let daysRemaining = 365;
  if (company.license_end_date) {
    const end = new Date(company.license_end_date).getTime();
    const now = new Date().getTime();
    daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }

  let expiryStatus: "active" | "expiring_soon" | "expired" | "locked" = "active";
  let alertLevel: "healthy" | "warning" | "critical" | "suspended" = "healthy";

  if (isLocked) {
    expiryStatus = "locked";
    alertLevel = "suspended";
  } else if (daysRemaining <= 0) {
    expiryStatus = "expired";
    alertLevel = "critical";
  } else if (daysRemaining <= 30) {
    expiryStatus = "expiring_soon";
    alertLevel = daysRemaining <= 7 ? "critical" : "warning";
  } else {
    expiryStatus = "active";
    alertLevel = "healthy";
  }

  // 2. Score breakdown:
  // a) License Validity (max 30)
  let licenseScore = 30;
  if (isLocked) {
    licenseScore = 5;
  } else if (daysRemaining <= 0) {
    licenseScore = 8;
  } else if (daysRemaining <= 7) {
    licenseScore = 15;
  } else if (daysRemaining <= 30) {
    licenseScore = 22;
  }

  // b) Database & Infrastructure (max 25)
  let databaseScore = 25;
  if (company.database_name) {
    databaseScore = 25; // provisioned and isolated
  } else {
    databaseScore = 10;
  }

  // c) Support & Friction (max 25)
  const companyTickets = tickets.filter(
    (t) => t.tenant_company_id === company.id || t.company_code === company.company_code
  );
  const openTickets = companyTickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const urgentTickets = openTickets.filter((t) => t.priority === "urgent" || t.priority === "high");

  let supportScore = 25;
  if (urgentTickets.length > 0) {
    supportScore = Math.max(8, 25 - urgentTickets.length * 7);
  } else if (openTickets.length > 2) {
    supportScore = Math.max(15, 25 - openTickets.length * 3);
  }

  // d) Billing & Financials (max 20)
  const companyInvoices = invoices.filter((i) => i.tenant_company_id === company.id);
  const unpaidInvoices = companyInvoices.filter((i) => i.invoice_status === "unpaid" || i.invoice_status === "overdue");
  let billingScore = 20;
  if (unpaidInvoices.length > 0) {
    billingScore = Math.max(5, 20 - unpaidInvoices.length * 6);
  }

  const totalScore = licenseScore + databaseScore + supportScore + billingScore;

  // Grade & Churn Risk
  let healthGrade: "A+" | "A" | "B" | "C" | "F" = "A";
  let churnRisk: "LOW" | "MODERATE" | "ELEVATED" | "CRITICAL" = "LOW";

  if (totalScore >= 90) {
    healthGrade = "A+";
    churnRisk = "LOW";
  } else if (totalScore >= 78) {
    healthGrade = "A";
    churnRisk = "LOW";
  } else if (totalScore >= 65) {
    healthGrade = "B";
    churnRisk = "MODERATE";
  } else if (totalScore >= 45) {
    healthGrade = "C";
    churnRisk = "ELEVATED";
  } else {
    healthGrade = "F";
    churnRisk = "CRITICAL";
  }

  // Override churn risk if locked or expired
  if (isLocked) {
    churnRisk = "CRITICAL";
  } else if (daysRemaining <= 0) {
    churnRisk = "CRITICAL";
  }

  // Generate intelligent recommendations
  const recommendations: CompanyEvaluationResult["recommendations"] = [];

  if (isLocked) {
    recommendations.push({
      type: "warning",
      title: "Account Locked / Clocked",
      description: "Company tenant login is currently blocked. Reactivate via 'Unlock Tenant' once billing terms are settled.",
    });
  } else if (daysRemaining <= 0) {
    recommendations.push({
      type: "warning",
      title: "Subscription Expired",
      description: `License ended ${Math.abs(daysRemaining)} days ago. Use 'Clock / Lock Tenant' to enforce expiration or 'Extend License' to renew.`,
    });
  } else if (daysRemaining <= 30) {
    recommendations.push({
      type: "action",
      title: "License Expiry Alert",
      description: `Subscription expires in ${daysRemaining} days (${company.license_end_date ? new Date(company.license_end_date).toLocaleDateString() : ""}). Dispatch automated renewal notification.`,
    });
  } else {
    recommendations.push({
      type: "success",
      title: "License Healthy",
      description: `Active contract valid for ${daysRemaining} days remaining with uninterrupted multi-branch access.`,
    });
  }

  if (urgentTickets.length > 0) {
    recommendations.push({
      type: "action",
      title: "High-Priority Support Ticket Unresolved",
      description: `${urgentTickets.length} critical ticket(s) currently open. Rapid resolution needed to prevent customer dissatisfaction.`,
    });
  }

  if (modules.length > 0 && modules.length < 5) {
    recommendations.push({
      type: "opportunity",
      title: "Module Expansion Potential",
      description: `Client is currently utilizing ${modules.length} modules. High upsell potential for POS & Supply Chain analytics add-ons.`,
    });
  } else {
    recommendations.push({
      type: "success",
      title: "Full ERP Suite Deployed",
      description: "Dedicated database schema provisioned with automated audit trails and multi-tenant isolation.",
    });
  }

  // Executive summary
  let executiveSummary = "";
  if (isLocked) {
    executiveSummary = `${company.company_name} (${company.company_code}) is currently suspended from tenant login access. Reactivation requires owner review of outstanding terms or manual license clocking adjustment.`;
  } else if (daysRemaining <= 0) {
    executiveSummary = `${company.company_name} subscription has lapsed by ${Math.abs(daysRemaining)} days. Urgent commercial intervention required to prevent tenant churn or enforce platform locking.`;
  } else if (daysRemaining <= 30) {
    recommendations.push({
      type: "opportunity",
      title: "Proactive Renewal Campaign",
      description: "Send personalized renewal incentive with annual billing discount.",
    });
    executiveSummary = `${company.company_name} maintains good operational telemetry with an AI Health Score of ${totalScore}/100. Subscription expires in ${daysRemaining} days; immediate renewal outreach advised.`;
  } else {
    executiveSummary = `${company.company_name} exhibits optimal system health with an AI Health Score of ${totalScore}/100 (${healthGrade}). No critical operational bottlenecks detected across database or licensing pipelines.`;
  }

  return {
    companyId: company.id,
    companyName: company.company_name,
    companyCode: company.company_code,
    status: company.status,
    isLocked,
    daysRemaining,
    expiryStatus,
    alertLevel,
    healthScore: totalScore,
    healthGrade,
    churnRisk,
    categoryScores: {
      license: { score: licenseScore, max: 30, label: "License & Expiry" },
      database: { score: databaseScore, max: 25, label: "Database Isolation" },
      support: { score: supportScore, max: 25, label: "Support Velocity" },
      billing: { score: billingScore, max: 20, label: "Financial Health" },
    },
    metrics: {
      activeModulesCount: modules.length,
      openTicketsCount: openTickets.length,
      urgentTicketsCount: urgentTickets.length,
      unpaidInvoicesCount: unpaidInvoices.length,
    },
    recommendations,
    executiveSummary,
  };
}
