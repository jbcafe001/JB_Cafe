/**
 * Cafe operates on a 5 PM to 5 AM time cycle:
 * - Orders placed before 5 PM (< 17:00) on the current calendar day belong to that day's date.
 * - Orders placed from 5 PM (>= 17:00) onwards belong to the NEXT day's date.
 * 
 * Example:
 * On 12 Oct, orders before 5 PM -> 12 Oct (2026-10-12)
 * On 12 Oct, orders from 5 PM onwards -> 13 Oct (2026-10-13)
 * On 13 Oct, orders until 5 PM -> 13 Oct (2026-10-13)
 */

export function getCafeBusinessDate(d: Date = new Date()): string {
  const target = new Date(d);
  if (target.getHours() >= 17) {
    // 5:00 PM or later -> advances to next calendar date
    target.setDate(target.getDate() + 1);
  }
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCafeYesterdayDate(d: Date = new Date()): string {
  const target = new Date(d);
  if (target.getHours() >= 17) {
    // When current time is >= 5 PM, current calendar day is yesterday's business shift
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } else {
    target.setDate(target.getDate() - 1);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Returns YYMMDD prefix for order numbers based on cafe business date (e.g. 261013).
 */
export function getCafeOrderPrefix(d: Date = new Date()): string {
  const dateStr = getCafeBusinessDate(d);
  const [year, month, day] = dateStr.split('-');
  return `${year.slice(-2)}${month}${day}`;
}
