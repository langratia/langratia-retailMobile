/**
 * Shared date utilities for the retail POS app.
 *
 * Existing transactions stored in AsyncStorage carry a human-readable `date`
 * string (e.g. "Aug 5, 2026") and a `createdAt` Unix timestamp (ms) added
 * in v1.2. New transactions always include `createdAt`. All date comparison
 * functions handle both formats gracefully for backward compatibility.
 */

/**
 * Returns true if the given Unix timestamp falls on today's calendar date
 * (device local time).
 */
export function isTimestampToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Returns true if the given Unix timestamp falls in the current calendar month
 * and year (device local time).
 */
export function isTimestampThisMonth(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/**
 * Returns true if the given Unix timestamp falls in the current calendar year.
 */
export function isTimestampThisYear(ts: number): boolean {
  const d = new Date(ts);
  return d.getFullYear() === new Date().getFullYear();
}

/**
 * Returns the ISO day-of-week string (0 = Sunday … 6 = Saturday) for a
 * given Unix timestamp, in local time.
 */
export function getDayOfWeek(ts: number): number {
  return new Date(ts).getDay();
}

/**
 * Legacy fallback: parse a stored locale date string ("Aug 5, 2026") back
 * into a timestamp. Returns null if the string cannot be parsed.
 */
export function parseLegacyDateString(dateStr: string): number | null {
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Resolve the best available timestamp for a transaction record.
 * Prefers `createdAt` (new); falls back to parsing the legacy `date` string.
 * Returns `null` only if both are unavailable / unparseable.
 */
export function resolveTransactionTimestamp(
  createdAt: number | undefined,
  dateStr: string
): number | null {
  if (createdAt != null && !isNaN(createdAt)) return createdAt;
  return parseLegacyDateString(dateStr);
}
