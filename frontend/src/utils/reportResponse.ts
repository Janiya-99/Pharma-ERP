export type ReportEnvelope<TSummary = Record<string, unknown>, TRow = unknown> = {
  summary: TSummary;
  rows: TRow[];
};

export function normalizeReportEnvelope<TSummary, TRow>(
  payload: unknown,
  fallbackSummary = {} as TSummary
): ReportEnvelope<TSummary, TRow> {
  const report = payload as Partial<ReportEnvelope<TSummary, TRow>> | null;

  return {
    summary: report?.summary ?? fallbackSummary,
    rows: Array.isArray(report?.rows) ? report.rows : [],
  };
}
