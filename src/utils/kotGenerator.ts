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
