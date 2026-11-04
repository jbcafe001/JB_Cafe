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
 * Builds a styled 80mm Kitchen Order Ticket (KOT) PDF document.
 */
export function buildKotPdfDoc(data: KotData): jsPDF {
  const brandName = data.brand === 'KUNAFA' ? 'KUNAFA DESSERTS' : 'JB PAVILION & CAFE';
  const tableName = data.tableName || 'Takeaway';
  const customerName = data.customerName?.trim() || 'Guest';
  const waiterName = data.waiterName || 'Staff';
  const orderNumber = data.orderNumber || `${Date.now().toString().slice(-5)}`;
  const dateStr =
    data.date ||
    new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  const timeStr =
    data.time ||
    new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  const paymentMode = data.paymentMethod ? data.paymentMethod.toUpperCase() : 'PAID';
  const notes = data.notes?.trim() || '';

  // 1. Measure dynamic content to calculate exact height (no awkward whitespace or page breaks)
  const tempDoc = new jsPDF({ unit: 'mm', format: [80, 600] });
  tempDoc.setFont('helvetica', 'normal');
  tempDoc.setFontSize(9.5);

  let itemsHeight = 0;
  data.items.forEach((item) => {
    const wrappedLines = tempDoc.splitTextToSize(item.name, 50);
    itemsHeight += wrappedLines.length * 4.2;
    if (item.notes) {
      const noteLines = tempDoc.splitTextToSize(`* ${item.notes}`, 48);
      itemsHeight += noteLines.length * 3.5;
    }
    itemsHeight += 1.8;
  });

  let notesHeight = 0;
  if (notes) {
    const wrappedNotes = tempDoc.splitTextToSize(notes, 62);
    notesHeight = 8 + wrappedNotes.length * 4 + 4;
  }

  // Base overhead: Top (8) + Brand Header (16) + Table/Meta Info (32) + Items Header (9) + Totals (8) + Footer (16) = ~89mm
  const totalHeight = Math.max(120, Math.ceil(88 + itemsHeight + notesHeight + 14));

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

  // 2. ORDER & TABLE INFO
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(tableName.toUpperCase(), centerX, y, { align: 'center' });
  y += 5.5;

  // Order # & Time
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order: #${orderNumber.replace('#', '')}`, leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Time: ${timeStr}`, rightX, y, { align: 'right' });
  y += 4.5;

  // Date & Waiter
  doc.text(`Date: ${dateStr}`, leftX, y);
  doc.text(`Waiter: ${waiterName}`, rightX, y, { align: 'right' });
  y += 4.5;

  // Customer Name
  doc.setFont('helvetica', 'bold');
  doc.text('Customer: ', leftX, y);
  const custLabelWidth = doc.getTextWidth('Customer: ');
  doc.setTextColor(180, 83, 9); // Amber-800
  doc.text(customerName, leftX + custLabelWidth, y);
  doc.setTextColor(0, 0, 0);
  y += 4.5;

  // Payment Status
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Payment: ${paymentMode} (CONFIRMED)`, leftX, y);
  y += 3.5;

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
    doc.text(String(item.quantity), rightX - 2, y, { align: 'right' });

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
  doc.text(`Printed: ${dateStr} ${timeStr}`, centerX, y, { align: 'center' });

  return doc;
}

/**
 * Generates and automatically triggers the download of the KOT PDF in the browser.
 */
export function downloadKotPdf(data: KotData): string {
  try {
    const doc = buildKotPdfDoc(data);
    const safeTable = (data.tableName || 'Table').replace(/[^a-zA-Z0-9]/g, '_');
    const safeOrder = (data.orderNumber || `${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `KOT_${safeTable}_${safeOrder}.pdf`;
    doc.save(fileName);
    return fileName;
  } catch (error) {
    console.error('Failed to generate KOT PDF:', error);
    return '';
  }
}

