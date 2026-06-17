import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';

interface SkeletonProps extends ViewProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style, ...props }: SkeletonProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity: 0.6,
        },
        style,
      ]}
      {...props}
    />
  );
}
