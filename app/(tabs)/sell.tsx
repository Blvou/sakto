import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Package, Bike } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { typography } from '@/src/design-system/tokens';

export default function SellScreen() {
  const { colors } = useTheme();
  const cardLgStyle = useCardStyle({ borderRadius: 16 });
  const router = useRouter();

  const options = [
    {
      icon: Package,
      title: 'Sell an item',
      description: 'List used goods on the marketplace',
      route: '/publish' as const,
      color: colors.primary,
    },
    {
      icon: Bike,
      title: 'List a scooter',
      description: 'Rent out your scooter or motorcycle',
      route: '/publish?type=scooter' as const,
      color: colors.secondary,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <Text style={{ ...typography.h1, color: colors.textPrimary }}>Sell / Rent</Text>
        <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 4 }}>
          What would you like to list?
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        {options.map((opt) => (
          <Pressable
            key={opt.title}
            onPress={() => router.push(opt.route)}
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
                backgroundColor: `${opt.color}15`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <opt.icon color={opt.color} size={24} strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...typography.h3, color: colors.textPrimary }}>{opt.title}</Text>
              <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
                {opt.description}
              </Text>
            </View>
            <Plus color={colors.textSecondary} size={20} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
