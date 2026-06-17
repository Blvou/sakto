export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function buildDateRange(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

export function formatDateChip(date: Date): string {
  return date.toLocaleDateString('en-PH', { weekday: 'short', day: 'numeric' });
}

export function isDateBlocked(date: string, blockedDates: ReadonlySet<string>): boolean {
  return blockedDates.has(date);
}

export function isRangeBlocked(
  startDate: string,
  days: number,
  blockedDates: ReadonlySet<string>
): boolean {
  const start = new Date(`${startDate}T00:00:00.000Z`);

  for (let index = 0; index < days; index += 1) {
    if (blockedDates.has(toDateOnly(addDays(start, index)))) {
      return true;
    }
  }

  return false;
}
