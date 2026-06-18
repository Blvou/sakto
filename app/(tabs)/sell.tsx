import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Bike } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { typography } from '@/src/design-system/tokens';

export default function RentOutScreen() {
  const { colors } = useTheme();
  const cardLgStyle = useCardStyle({ borderRadius: 16 });
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <Text style={{ ...typography.h1, color: colors.textPrimary }}>Rent out</Text>
        <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 4 }}>
          List your bike or scooter for others to rent
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <Pressable
          onPress={() => router.push('/publish?type=scooter')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 20,
            minHeight: 88,
            ...cardLgStyle,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: `${colors.secondary}15`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Bike color={colors.secondary} size={24} strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ ...typography.h3, color: colors.textPrimary }}>List your bike</Text>
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
              Scooter or motorcycle — set your daily rate and availability
            </Text>
          </View>
          <Plus color={colors.textSecondary} size={20} />
        </Pressable>
      </View>
    </View>
  );
}
