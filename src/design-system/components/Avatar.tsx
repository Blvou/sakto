import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { User } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';

function getInitials(name?: string): string {
  if (!name?.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

export function Avatar({ uri, name, size = 48 }: AvatarProps) {
  const { colors } = useTheme();
  const initials = getInitials(name);
  const fontSize = Math.max(12, Math.round(size * 0.36));
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [uri]);

  if (uri && !imageFailed) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        cachePolicy="memory-disk"
        onError={() => setImageFailed(true)}
        accessibilityLabel={name ? `${name} avatar` : 'User avatar'}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityLabel={name ? `${name} avatar placeholder` : 'User avatar placeholder'}
    >
      {initials ? (
        <Text
          style={{
            fontSize,
            color: colors.textSecondary,
            fontFamily: 'PlusJakartaSans_600SemiBold',
          }}
        >
          {initials}
        </Text>
      ) : (
        <User color={colors.textSecondary} size={size * 0.45} strokeWidth={1.5} />
      )}
    </View>
  );
}
