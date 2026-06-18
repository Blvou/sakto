import { View, Text } from 'react-native';
import { Check, Circle, Clock } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';
import type { BookingStatus } from '../types';

const STEPS: { key: BookingStatus | 'pickup' | 'trip'; label: string }[] = [
  { key: 'pending', label: 'Requested' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'pickup', label: 'Pickup' },
  { key: 'trip', label: 'On trip' },
  { key: 'completed', label: 'Returned' },
];

function stepIndex(status: BookingStatus): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'declined':
    case 'cancelled':
      return 0;
    case 'completed':
      return 4;
    default:
      return 0;
  }
}

interface BookingTimelineProps {
  status: BookingStatus;
}

export function BookingTimeline({ status }: BookingTimelineProps) {
  const { colors } = useTheme();
  const active = stepIndex(status);
  const isTerminal = status === 'declined' || status === 'cancelled';

  return (
    <View style={{ gap: 12 }}>
      {STEPS.map((step, index) => {
        const done = !isTerminal && index <= active;
        const current = !isTerminal && index === active;
        const Icon = done ? Check : current ? Clock : Circle;

        return (
          <View key={step.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon
              color={done ? colors.success : current ? colors.primary : colors.textSecondary}
              size={18}
              strokeWidth={2}
            />
            <Text
              style={{
                ...typography.body,
                color: done || current ? colors.textPrimary : colors.textSecondary,
                fontFamily: current ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
              }}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
      {isTerminal ? (
        <Text style={{ ...typography.caption, color: colors.secondary, marginTop: 4 }}>
          Booking {status}
        </Text>
      ) : null}
    </View>
  );
}
