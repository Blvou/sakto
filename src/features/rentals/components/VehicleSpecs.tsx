import { View, Text } from 'react-native';
import { Gauge } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { typography } from '@/src/design-system/tokens';
import type { VehicleSpecItem } from '../utils/vehicle-specs';

interface VehicleSpecsProps {
  specs: VehicleSpecItem[];
}

export function VehicleSpecs({ specs }: VehicleSpecsProps) {
  const { colors } = useTheme();
  const cardStyle = useCardStyle({ borderRadius: 12 });

  return (
    <View style={{ marginTop: 20, padding: 16, ...cardStyle }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Gauge color={colors.primary} size={18} strokeWidth={2} />
        <Text style={{ ...typography.h3, color: colors.textPrimary }}>Specifications</Text>
      </View>
      <View style={{ gap: 10 }}>
        {specs.map((spec) => (
          <View
            key={spec.label}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text style={{ ...typography.caption, color: colors.textSecondary, flex: 1 }}>{spec.label}</Text>
            <Text
              style={{
                ...typography.body,
                color: colors.textPrimary,
                fontFamily: 'PlusJakartaSans_600SemiBold',
                textAlign: 'right',
                flex: 1,
              }}
            >
              {spec.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
