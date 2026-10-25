import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportPdfOptions {
  title: string;
  filename: string;
  subtitle?: string;
  companyName?: string;
  headers: string[];
  rows: (string | number)[][];
  alignments?: ("left" | "center" | "right")[];
  summary?: Array<{ title: string; value: string | number }>;
  orientation?: "portrait" | "landscape";
}

export interface ReportPrintOptions {
  title: string;
  subtitle?: string;
  companyName?: string;
  headers: string[];
  rows: (string | number)[][];
  alignments?: ("left" | "center" | "right")[];
  summary?: Array<{ title: string; value: string | number }>;
}

/**
 * Exports tabular data to Excel-compatible CSV with UTF-8 BOM.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const csvLines: string[] = [
    headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","),
  ];

  for (const row of rows) {
    const line = row
      .map((val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",");
    csvLines.push(line);
  }

  const csvBlobContent = "\uFEFF" + csvLines.join("\r\n");
  const blob = new Blob([csvBlobContent], {
    type: "text/csv;charset=utf-8;",
  });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Generates and downloads a polished PDF report using jsPDF and jspdf-autotable.
 */
export function exportToPdf(options: ReportPdfOptions): void {
  const {
    title,
    filename,
    subtitle,
    companyName = "PHARMA-ERP ENTERPRISE",
    headers,
    rows,
    alignments,
    summary,
    orientation,
  } = options;

  // Auto determine landscape if more than 6 columns
  const effectiveOrientation =
    orientation || (headers.length > 6 ? "landscape" : "portrait");

  const doc = new jsPDF({
    orientation: effectiveOrientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top header bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 20, "F");

  // Company Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(companyName, 14, 13);

  // System tag right-aligned
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    `CONFIDENTIAL REPORT • GENERATED ON ${new Date().toLocaleString()}`,
    pageWidth - 14,
    13,
    { align: "right" }
  );

  let currentY = 28;

  // Report Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, currentY);
  currentY += 6;

  // Optional subtitle
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(subtitle, 14, currentY);
    currentY += 6;
  }

  // Summary Cards block if present
  if (summary && summary.length > 0) {
    const cardWidth = Math.min(48, (pageWidth - 28) / summary.length - 3);
    const cardHeight = 14;

    summary.forEach((item, idx) => {
      const cardX = 14 + idx * (cardWidth + 3);
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(item.title.toUpperCase(), cardX + 3, currentY + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const valStr = String(item.value);
      doc.text(valStr, cardX + 3, currentY + 10.5);
    });

    currentY += cardHeight + 6;
  } else {
    currentY += 3;
  }

  // Column styles based on alignments
  const columnStyles: Record<number, any> = {};
  if (alignments && alignments.length > 0) {
    alignments.forEach((align, colIdx) => {
      columnStyles[colIdx] = { halign: align };
    });
  }

  // Generate table
  autoTable(doc, {
    startY: currentY,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles,
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = doc.getNumberOfPages();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - 14,
        pageHeight - 8,
        { align: "right" }
      );
      doc.text(
        `${companyName} • Internal Commercial & Statutory Accounting Records`,
        14,
        pageHeight - 8
      );
    },
  });

  const downloadName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  doc.save(downloadName);
}

/**
 * Opens a clean, styled printable window containing all records across all pages.
 */
export function printFullReport(options: ReportPrintOptions): void {
  const {
    title,
    subtitle,
    companyName = "PHARMA-ERP ENTERPRISE",
    headers,
    rows,
    alignments,
    summary,
  } = options;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return;
  }

  const summaryHtml =
    summary && summary.length > 0
      ? `
    <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
      ${summary
        .map(
          (s) => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 14px; min-width: 140px;">
          <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">${s.title}</div>
          <div style="font-size: 14px; color: #0f172a; font-weight: bold; margin-top: 2px;">${s.value}</div>
        </div>
      `
        )
        .join("")}
    </div>
  `
      : "";

  const tableHeaderHtml = `
    <thead>
      <tr style="background: #1e293b; color: #ffffff;">
        ${headers
          .map((h, i) => {
            const align = alignments?.[i] || "left";
            return `<th style="padding: 7px 10px; text-align: ${align}; font-size: 10px; font-weight: 600; text-transform: uppercase; border: 1px solid #334155;">${h}</th>`;
          })
          .join("")}
      </tr>
    </thead>
  `;

  const tableBodyHtml = `
    <tbody>
      ${rows
        .map((r, rowIdx) => {
          const bg = rowIdx % 2 === 0 ? "#ffffff" : "#f8fafc";
          return `
          <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
            ${r
              .map((val, colIdx) => {
                const align = alignments?.[colIdx] || "left";
                return `<td style="padding: 6px 10px; text-align: ${align}; font-size: 10px; color: #1e293b; border-right: 1px solid #e2e8f0;">${
                  val !== null && val !== undefined ? String(val) : ""
                }</td>`;
              })
              .join("")}
          </tr>
        `;
        })
        .join("")}
    </tbody>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ${companyName}</title>
        <style>
          @page { size: auto; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 16px;">
          <div>
            <h1 style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a;">${title}</h1>
            ${
              subtitle
                ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">${subtitle}</p>`
                : ""
            }
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 12px; color: #0f172a;">${companyName}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Generated: ${new Date().toLocaleString()}</div>
            <div style="font-size: 10px; color: #64748b;">Total Records: ${rows.length}</div>
          </div>
        </div>

        ${summaryHtml}

        <table>
          ${tableHeaderHtml}
          ${tableBodyHtml}
        </table>

        <div style="margin-top: 20px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px;">
          ${companyName} • Generated from Enterprise ERP Commercial & Reporting Module • Page 1
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
