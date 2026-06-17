import { View, Text } from 'react-native';
import { Languages } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { chatTypography } from '../constants/typography';
import type { PreferredLang } from '@/src/lib/database.types';

interface Props {
  targetLang: PreferredLang;
}

const LANG_LABELS: Record<PreferredLang, string> = {
  en: 'English',
  tl: 'Filipino',
};

export function TranslateHint({ targetLang }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Languages color={colors.textSecondary} size={14} />
      <Text style={{ ...chatTypography.caption, color: colors.textSecondary }}>
        Tap Translate to see messages in {LANG_LABELS[targetLang]}
      </Text>
    </View>
  );
}
