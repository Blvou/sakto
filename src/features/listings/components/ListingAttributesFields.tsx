import { ScrollView, Text, TextInput, View } from 'react-native';
import { Chip } from '@/src/design-system/components/Chip';
import { typography } from '@/src/design-system/tokens';
import {
  getAttributeFieldsForCategory,
  type ListingAttributeFieldDef,
} from '@/src/features/listings/constants/attribute-fields';
import type { ListingAttributes } from '@/src/features/listings/types';
import { useTheme } from '@/src/hooks/use-theme';

interface ListingAttributesFieldsProps {
  categoryId: string | null | undefined;
  value: ListingAttributes;
  onChange: (value: ListingAttributes) => void;
}

function SelectAttributeField({
  field,
  selected,
  onSelect,
}: {
  field: ListingAttributeFieldDef;
  selected: string | undefined;
  onSelect: (value: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>
        {field.label}
        {field.required ? ' *' : ''}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
          {(field.options ?? []).map((option) => (
            <Chip
              key={option}
              label={option}
              active={selected === option}
              onPress={() => onSelect(selected === option ? '' : option)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
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

      {fields.map((field) => {
        if (field.type === 'select') {
          return (
            <SelectAttributeField
              key={field.key}
              field={field}
              selected={value[field.key]}
              onSelect={(option) => handleFieldChange(field.key, option)}
            />
          );
        }

        return (
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
        );
      })}
    </View>
  );
}
