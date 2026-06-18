import { Pressable, Text, View, type PressableProps } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';

interface FabProps extends PressableProps {
  onPress: () => void;
}

export function Fab({ onPress, style, ...props }: FabProps) {
  const { colors } = useTheme();
  const { fabBottom } = useResponsive();

  return (
    <Pressable
      onPress={onPress}
      style={(state) => [
        {
          position: 'absolute',
          right: 16,
          bottom: fabBottom,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.secondary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.secondary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
          opacity: state.pressed ? 0.9 : 1,
          zIndex: 10,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="List a bike"
      {...props}
    >
      <Plus color="#FFFFFF" size={24} strokeWidth={2} />
    </Pressable>
  );
}

export function FabBackdrop({ visible, onPress }: { visible: boolean; onPress: () => void }) {
  if (!visible) return null;

  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 31, 68, 0.4)',
        zIndex: 9,
      }}
    />
  );
}

export function FabSheet({
  visible,
  onClose,
  onListBike,
}: {
  visible: boolean;
  onClose: () => void;
  onListBike: () => void;
}) {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 11,
      }}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: 40,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.4 : 0.1,
          shadowRadius: 12,
          elevation: 16,
        }}
      >
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 20,
          }}
        />
        <Pressable
          onPress={() => {
            onClose();
            onListBike();
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 4,
            minHeight: 56,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 28, marginRight: 16 }}>🛵</Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'PlusJakartaSans_600SemiBold',
              color: colors.textPrimary,
            }}
          >
            List a bike
          </Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{
            marginTop: 8,
            paddingVertical: 14,
            alignItems: 'center',
            minHeight: 44,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary, fontFamily: 'PlusJakartaSans_500Medium' }}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );
}