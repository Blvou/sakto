import { Text, TextInput, View } from 'react-native';
import { typography } from '@/src/design-system/tokens';
import { getAttributeFieldsForCategory } from '@/src/features/listings/constants/attribute-fields';
import type { ListingAttributes } from '@/src/features/listings/types';
import { useTheme } from '@/src/hooks/use-theme';

interface ListingAttributesFieldsProps {
  categoryId: string | null | undefined;
  value: ListingAttributes;
  onChange: (value: ListingAttributes) => void;
}

export function ListingAttributesFields({ categoryId, value, onChange }: ListingAttributesFieldsProps) {
  const { colors } = useTheme();
  const fields = getAttributeFieldsForCategory(categoryId);

  const handleFieldChange = (key: string, text: string) => {
    const next = { ...value };
    if (text.trim().length === 0) {
      delete next[key];
    } else {
      next[key] = text;
    }
    onChange(next);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ ...typography.h3, color: colors.textPrimary, marginBottom: 4 }}>Specifications</Text>
      <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 16 }}>
        Details buyers look for in this category. Required fields are marked with *.
      </Text>

      {fields.map((field) => (
        <View key={field.key} style={{ marginBottom: 16 }}>
          <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>
            {field.label}
            {field.required ? ' *' : ''}
          </Text>
          <TextInput
            value={value[field.key] ?? ''}
            onChangeText={(text) => handleFieldChange(field.key, text)}
            placeholder={field.placeholder}
            placeholderTextColor={colors.textSecondary}
            keyboardType={field.keyboardType === 'numeric' ? 'numeric' : 'default'}
            style={{
              ...typography.body,
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          />
        </View>
      ))}
    </View>
  );
}
