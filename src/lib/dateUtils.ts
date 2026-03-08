/**
 * Calendar date key (YYYY-MM-DD) for grouping transactions by day.
 * Accepts ISO strings, "YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss", or Date.
 * Uses the date part only so the calendar day matches regardless of timezone.
 */
export function toCalendarDateKey(date: Date | string | null | undefined): string | null {
  if (date == null) return null;
  if (typeof date === "string") {
    const match = date.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return null;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Local date key from a Date (for building grid labels). */
export function toLocalDateKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
