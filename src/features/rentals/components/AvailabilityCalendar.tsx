import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';
import { toDateOnly } from '@/src/features/rentals/utils/date-availability';

interface AvailabilityCalendarProps {
  blockedDates: ReadonlySet<string>;
  monthOffset?: number;
  readOnly?: boolean;
}

function buildMonthDays(base: Date, monthOffset: number): { label: string; date: string | null }[] {
  const month = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startWeekday = month.getDay();
  const cells: { label: string; date: string | null }[] = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ label: '', date: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    cells.push({ label: String(day), date: toDateOnly(date) });
  }

  return cells;
}

export function AvailabilityCalendar({
  blockedDates,
  monthOffset = 0,
  readOnly = true,
}: AvailabilityCalendarProps) {
  const { colors } = useTheme();
  const monthLabel = useMemo(() => {
    const month = new Date();
    month.setMonth(month.getMonth() + monthOffset);
    return month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [monthOffset]);

  const days = useMemo(() => buildMonthDays(new Date(), monthOffset), [monthOffset]);
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View>
      <Text style={{ ...typography.h3, color: colors.textPrimary, marginBottom: 12 }}>{monthLabel}</Text>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {weekdays.map((day, index) => (
          <Text
            key={`${day}-${index}`}
            style={{
              ...typography.caption,
              color: colors.textSecondary,
              width: `${100 / 7}%`,
              textAlign: 'center',
            }}
          >
            {day}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((cell, index) => {
          const blocked = cell.date ? blockedDates.has(cell.date) : false;
          return (
            <View
              key={`${cell.date ?? 'empty'}-${index}`}
              style={{
                width: `${100 / 7}%`,
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: cell.date ? 1 : 0,
              }}
            >
              {cell.date ? (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: blocked ? `${colors.secondary}22` : readOnly ? 'transparent' : colors.surface,
                    borderWidth: blocked ? 1 : 0,
                    borderColor: blocked ? colors.secondary : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      ...typography.caption,
                      color: blocked ? colors.secondary : colors.textPrimary,
                      fontFamily: blocked ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
                    }}
                  >
                    {cell.label}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
      <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 8 }}>
        Blocked dates are unavailable for new bookings.
      </Text>
    </View>
  );
}
