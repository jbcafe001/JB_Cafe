import { jsPDF } from 'jspdf';
import { OrderItem } from '../types';

export interface KotItem {
  name: string;
  quantity: number;
  notes?: string;
  price?: number;
}

export interface KotData {
  orderNumber?: string;
  tableName: string;
  customerName: string;
  waiterName?: string;
  items: KotItem[] | OrderItem[];
  notes?: string;
  paymentMethod?: string;
  brand?: 'JB Cafe' | 'KUNAFA' | string;
  date?: string;
  time?: string;
}

/**
 * Formats dates like "2026-11-05" into readable "05 Nov 2026".
 */
function formatKotDate(dateStr?: string): string {
  if (!dateStr) {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return dateStr;
}

/**
 * Builds a styled 80mm Kitchen Order Ticket (KOT) PDF document.
 * Excludes Order #, Waiter, and Payment as requested.
 * Sizes height dynamically to prevent blank space at the bottom.
 */
export function buildKotPdfDoc(data: KotData): jsPDF {
  const brandName = data.brand === 'KUNAFA' ? 'KUNAFA DESSERTS' : 'JB PAVILION & CAFE';
  const tableName = data.tableName || 'Takeaway';
  const customerName = data.customerName?.trim() || 'Guest';
  const formattedDate = formatKotDate(data.date);
  const timeStr =
    data.time ||
    new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  const notes = data.notes?.trim() || '';

  // 1. Pre-measure height using a temporary doc to achieve exact fit
  const measureDoc = new jsPDF({ unit: 'mm', format: [80, 1000] });
  measureDoc.setFont('helvetica', 'normal');
  measureDoc.setFontSize(9.5);

  let calcY = 8;
  calcY += 5;   // Brand
  calcY += 6.5; // Badge
  calcY += 4.5; // Solid line gap
  calcY += 5.5; // Table name
  calcY += 4.5; // Date & Time
  calcY += 4.5; // Name
  calcY += 4;   // Dashed line
  calcY += 2.5; // ITEM & QTY header
  calcY += 4;   // Solid line gap

  data.items.forEach((item) => {
    const nameLines = measureDoc.splitTextToSize(item.name, 50);
    calcY += nameLines.length * 4.2;
    if (item.notes) {
      const noteLines = measureDoc.splitTextToSize(`* ${item.notes}`, 50);
      calcY += noteLines.length * 3.5;
    }
    calcY += 1.5;
  });

  calcY += 1;   // Pre-divider gap
  calcY += 4;   // Dashed divider gap
  calcY += 3.5; // Totals summary
  calcY += 4;   // Solid divider gap

  if (notes) {
    const wrappedNotes = measureDoc.splitTextToSize(notes, 62);
    const boxHeight = 6 + wrappedNotes.length * 4;
    calcY += boxHeight + 4;
    calcY += 3.5;
  }

  calcY += 4;   // SEND TO KITCHEN
  calcY += 4.5; // Printed timestamp
  calcY += 7;   // Clean bottom padding

  const totalHeight = Math.ceil(calcY);

  const doc = new jsPDF({
    unit: 'mm',
    format: [80, totalHeight],
  });

  const leftX = 6;
  const rightX = 74;
  const centerX = 40;
  let y = 8;

  // Helper: Draw Dashed Divider
  const drawDashedDivider = (currY: number) => {
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    (doc as any).setLineDashPattern([1.5, 1], 0);
    doc.line(leftX, currY, rightX, currY);
    (doc as any).setLineDashPattern([], 0);
  };

  // Helper: Draw Solid Divider
  const drawSolidDivider = (currY: number, width: number = 0.35) => {
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(width);
    (doc as any).setLineDashPattern([], 0);
    doc.line(leftX, currY, rightX, currY);
  };

  // 1. BRAND & TICKET HEADER
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(brandName, centerX, y, { align: 'center' });
  y += 5;

  // Badge: KITCHEN ORDER TICKET (KOT)
  doc.setFillColor(30, 30, 30);
  doc.roundedRect(centerX - 28, y - 3.5, 56, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('KITCHEN ORDER TICKET (KOT)', centerX, y + 0.8, { align: 'center' });
  y += 6.5;

  drawSolidDivider(y);
  y += 4.5;

  // 2. TABLE & CUSTOMER INFO (Order, Waiter, and Payment removed as requested)
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(tableName.toUpperCase(), centerX, y, { align: 'center' });
  y += 5.5;

  // Date & Time (One single clean line)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formattedDate}`, leftX, y);
  doc.text(`Time: ${timeStr}`, rightX, y, { align: 'right' });
  y += 4.5;

  // Customer Name
  doc.setFont('helvetica', 'bold');
  doc.text('Name: ', leftX, y);
  const nameLabelWidth = doc.getTextWidth('Name: ');
  doc.setTextColor(180, 83, 9); // Amber-800
  doc.text(customerName, leftX + nameLabelWidth, y);
  doc.setTextColor(0, 0, 0);
  y += 4.5;

  drawDashedDivider(y);
  y += 4;

  // 3. ITEMS HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  doc.text('ITEM', leftX, y);
  doc.text('QTY', rightX, y, { align: 'right' });
  y += 2.5;

  drawSolidDivider(y, 0.25);
  y += 4;

  // 4. ITEMS LIST
  let totalQty = 0;
  data.items.forEach((item) => {
    totalQty += item.quantity;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);

    const nameLines = doc.splitTextToSize(item.name, 50);
    doc.text(nameLines, leftX, y);

    // Qty on the right aligned with first line of item name
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(String(item.quantity), rightX, y, { align: 'right' });

    y += nameLines.length * 4.2;

    if (item.notes) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const noteLines = doc.splitTextToSize(`* ${item.notes}`, 50);
      doc.text(noteLines, leftX + 2, y);
      y += noteLines.length * 3.5;
    }

    y += 1.5;
  });

  y += 1;
  drawDashedDivider(y);
  y += 4;

  // 5. TOTALS SUMMARY
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(`Total Items: ${data.items.length}`, leftX, y);
  doc.text(`Total Qty: ${totalQty}`, rightX, y, { align: 'right' });
  y += 3.5;

  drawSolidDivider(y, 0.3);
  y += 4;

  // 6. SPECIAL NOTES (Customer notes / kitchen instructions)
  if (notes) {
    const wrappedNotes = doc.splitTextToSize(notes, 62);
    const boxHeight = 6 + wrappedNotes.length * 4;

    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.roundedRect(leftX, y, rightX - leftX, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text('NOTES / SPECIAL INSTRUCTIONS:', leftX + 3, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(wrappedNotes, leftX + 3, y + 8);

    y += boxHeight + 4;
    drawDashedDivider(y);
    y += 3.5;
  }

  // 7. FOOTER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('*** SEND TO KITCHEN ***', centerX, y, { align: 'center' });
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(`Printed: ${formattedDate} ${timeStr}`, centerX, y, { align: 'center' });

  return doc;
}

/**
 * Escapes special HTML characters to prevent XSS and formatting breakages.
 */
function escapeHtml(str?: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates clean, printer-optimized HTML for an 80mm thermal receipt.
 * Matches the layout and content of the KOT PDF ticket.
 */
export function generateKotPrintHtml(data: KotData): string {
  const brandName = data.brand === 'KUNAFA' ? 'KUNAFA DESSERTS' : 'JB PAVILION & CAFE';
  const tableName = data.tableName || 'Takeaway';
  const customerName = data.customerName?.trim() || 'Guest';
  const formattedDate = formatKotDate(data.date);
  const timeStr =
    data.time ||
    new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  const notes = data.notes?.trim() || '';

  let totalQty = 0;
  const itemsHtml = data.items
    .map((item) => {
      totalQty += item.quantity;
      const notesHtml = item.notes
        ? `<div class="item-notes">* ${escapeHtml(item.notes)}</div>`
        : '';
      return `
        <tr>
          <td class="item-name">
            <div>${escapeHtml(item.name)}</div>
            ${notesHtml}
          </td>
          <td class="item-qty">${item.quantity}</td>
        </tr>
      `;
    })
    .join('');

  const notesSection = notes
    ? `
      <div class="notes-box">
        <div class="notes-label">NOTES / SPECIAL INSTRUCTIONS:</div>
        <div class="notes-text">${escapeHtml(notes)}</div>
      </div>
      <div class="divider-dashed"></div>
    `
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>KOT - ${escapeHtml(tableName)}</title>
  <style>
    @page {
      size: 80mm 297mm;
      margin: 0;
    }
    @media print {
      @page {
        size: 80mm 297mm;
        margin: 0;
      }
      html, body {
        width: 80mm !important;
        max-width: 80mm !important;
        margin: 0 !important;
        padding: 3mm 4mm !important;
        background: #fff !important;
        color: #000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    body {
      width: 78mm;
      max-width: 80mm;
      margin: 0 auto;
      padding: 3mm 4mm;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #000;
      background: #fff;
      font-size: 12px;
      line-height: 1.35;
    }
    .header-brand {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 3px;
    }
    .kot-badge {
      display: table;
      background: #111;
      color: #fff !important;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 3px;
      letter-spacing: 0.5px;
      margin: 3px auto 5px auto;
      text-align: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .divider-solid {
      border-top: 1.5px solid #111;
      margin: 5px 0;
    }
    .divider-dashed {
      border-top: 1px dashed #666;
      margin: 5px 0;
    }
    .table-title {
      font-size: 18px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
      margin: 3px 0 4px 0;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 3px;
    }
    .customer-row {
      font-size: 11.5px;
      margin-bottom: 2px;
    }
    .customer-name {
      font-weight: 800;
      color: #b45309;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 2px;
    }
    .items-table th {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 0;
      text-transform: uppercase;
      border-bottom: 1px solid #222;
    }
    .items-table td {
      padding: 4px 0;
      vertical-align: top;
      border-bottom: 1px solid #f0f0f0;
    }
    .item-name {
      font-size: 12px;
      font-weight: 700;
      word-break: break-word;
      padding-right: 8px;
    }
    .item-notes {
      font-size: 10px;
      font-style: italic;
      color: #555;
      margin-top: 1px;
    }
    .item-qty {
      font-size: 14px;
      font-weight: 900;
      text-align: right;
      white-space: nowrap;
      width: 32px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      font-weight: 800;
      padding: 2px 0;
    }
    .notes-box {
      border: 1px solid #888;
      background: #f7f7f7;
      padding: 6px;
      border-radius: 3px;
      margin: 5px 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .notes-label {
      font-size: 9.5px;
      font-weight: 800;
      color: #b45309;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .notes-text {
      font-size: 11px;
      font-weight: 700;
      word-break: break-word;
    }
    .footer-title {
      text-align: center;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-top: 8px;
    }
    .footer-time {
      text-align: center;
      font-size: 9.5px;
      color: #666;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="header-brand">${escapeHtml(brandName)}</div>
  <div class="kot-badge">KITCHEN ORDER TICKET (KOT)</div>
  <div class="divider-solid"></div>

  <div class="table-title">${escapeHtml(tableName)}</div>
  <div class="meta-row">
    <span>Date: <strong>${escapeHtml(formattedDate)}</strong></span>
    <span>Time: <strong>${escapeHtml(timeStr)}</strong></span>
  </div>
  <div class="customer-row">
    <strong>Name: </strong><span class="customer-name">${escapeHtml(customerName)}</span>
  </div>

  <div class="divider-dashed"></div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="text-align: left;">ITEM</th>
        <th style="text-align: right;">QTY</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="divider-dashed"></div>

  <div class="summary-row">
    <span>Total Items: ${data.items.length}</span>
    <span>Total Qty: ${totalQty}</span>
  </div>

  <div class="divider-solid"></div>

  ${notesSection}

  <div class="footer-title">*** SEND TO KITCHEN ***</div>
  <div class="footer-sub">Printed: ${escapeHtml(formattedDate)} ${escapeHtml(timeStr)}</div>
</body>
</html>`;
}

/**
 * Triggers an immediate browser print dialog for the KOT ticket formatted for 80mm thermal printers.
 * Uses a temporary off-screen iframe to avoid altering user screen or disrupting UI state.
 */
export function printKotTicket(data: KotData): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    const html = generateKotPrintHtml(data);

    // Remove any leftover print iframe from previous prints
    const oldIframe = document.getElementById('kot-print-iframe');
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'kot-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '80mm';
    iframe.style.height = '100px';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) {
      console.warn('Could not access iframe document for printing');
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Short delay for the iframe DOM to finish layout before opening the print dialog
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (printErr) {
        console.error('Failed to trigger KOT print dialog:', printErr);
      } finally {
        // Clean up the iframe after printing is dismissed or done
        setTimeout(() => {
          try {
            iframe.remove();
          } catch (_) {}
        }, 5000);
      }
    }, 250);
  } catch (err) {
    console.error('Failed to print KOT ticket:', err);
  }
}

/**
 * Generates the KOT PDF and saves it to Downloads.
 * Silent/manual: autoPrint defaults to false so no unexpected browser dialog pops up.
 */
export function downloadKotPdf(data: KotData, autoPrint: boolean = false): string {
  try {
    const doc = buildKotPdfDoc(data);
    doc.autoPrint();

    const safeTable = (data.tableName || 'Table').replace(/[^a-zA-Z0-9]/g, '_');
    const safeOrder = (data.orderNumber || `${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `KOT_${safeTable}_${safeOrder}.pdf`;

    // 1. Download/Save the PDF file
    doc.save(fileName);

    // 2. Automatically trigger thermal receipt print dialog
    if (autoPrint) {
      printKotTicket(data);
    }

    return fileName;
  } catch (error) {
    console.error('Failed to generate KOT PDF:', error);
    return '';
  }
}
