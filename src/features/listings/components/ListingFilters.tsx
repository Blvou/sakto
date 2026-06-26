import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { Chip } from '@/src/design-system/components/Chip';
import { typography } from '@/src/design-system/tokens';
import {
  getFilterableFieldsForCategory,
  type ListingAttributeFieldDef,
} from '@/src/features/listings/constants/attribute-fields';
import {
  DEFAULT_LISTING_SORT,
  LISTING_SORT_OPTIONS,
  listingSortIdToLabel,
  listingSortLabelToId,
  type ListingSearchParams,
  type ListingSortOption,
} from '@/src/features/listings/utils/listing-filters';
import { useTheme } from '@/src/hooks/use-theme';

export interface ListingFilterState {
  sort: ListingSortOption;
  priceMin: string;
  priceMax: string;
  attributeFilters: Record<string, string>;
}

export const DEFAULT_LISTING_FILTER_STATE: ListingFilterState = {
  sort: DEFAULT_LISTING_SORT,
  priceMin: '',
  priceMax: '',
  attributeFilters: {},
};

function parseOptionalPrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function listingFilterStateToSearchParams(
  category: string | null | undefined,
  state: ListingFilterState
): Partial<ListingSearchParams> {
  return {
    sort: state.sort,
    priceMin: parseOptionalPrice(state.priceMin),
    priceMax: parseOptionalPrice(state.priceMax),
    attributeFilters:
      Object.keys(state.attributeFilters).length > 0 ? state.attributeFilters : undefined,
  };
}

interface ListingFiltersProps {
  categoryId?: string | null;
  value: ListingFilterState;
  onChange: (next: ListingFilterState) => void;
}

function SelectChipRow({
  field,
  selected,
  onSelect,
}: {
  field: ListingAttributeFieldDef;
  selected: string | undefined;
  onSelect: (key: string, value: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>
        {field.label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
          {(field.options ?? []).map((option) => (
            <Chip
              key={option}
              label={option}
              active={selected === option}
              onPress={() => onSelect(field.key, selected === option ? '' : option)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function ListingFilters({ categoryId, value, onChange }: ListingFiltersProps) {
  const { colors } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<ListingFilterState>(value);

  const filterableFields = useMemo(
    () => getFilterableFieldsForCategory(categoryId),
    [categoryId]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (value.priceMin.trim() || value.priceMax.trim()) count += 1;
    count += Object.values(value.attributeFilters).filter(Boolean).length;
    return count;
  }, [value]);

  const openSheet = useCallback(() => {
    setDraft(value);
    setSheetOpen(true);
  }, [value]);

  const applyDraft = useCallback(() => {
    onChange(draft);
    setSheetOpen(false);
  }, [draft, onChange]);

  const resetDraft = useCallback(() => {
    const next = { ...DEFAULT_LISTING_FILTER_STATE, sort: value.sort };
    setDraft(next);
    onChange(next);
    setSheetOpen(false);
  }, [onChange, value.sort]);

  const handleSortPress = useCallback(
    (label: string) => {
      onChange({ ...value, sort: listingSortLabelToId(label) });
    },
    [onChange, value]
  );

  const handleDraftAttribute = useCallback((key: string, option: string) => {
    setDraft((prev) => {
      const nextFilters = { ...prev.attributeFilters };
      if (!option) {
        delete nextFilters[key];
      } else {
        nextFilters[key] = option;
      }
      return { ...prev, attributeFilters: nextFilters };
    });
  }, []);

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}
      >
        <Chip
          label={activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
          active={activeFilterCount > 0}
          onPress={openSheet}
          accessibilityLabel="Open listing filters"
        />
        {LISTING_SORT_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            active={value.sort === option.id}
            onPress={() => handleSortPress(option.label)}
          />
        ))}
      </ScrollView>

      <Modal visible={sheetOpen} animationType="slide" transparent onRequestClose={() => setSheetOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setSheetOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 20,
              maxHeight: '80%',
            }}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <SlidersHorizontal color={colors.textPrimary} size={20} />
              <Text style={{ ...typography.h3, color: colors.textPrimary }}>Filters</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>
                Sort
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {LISTING_SORT_OPTIONS.map((option) => (
                  <Chip
                    key={option.id}
                    label={option.label}
                    active={draft.sort === option.id}
                    onPress={() => setDraft((prev) => ({ ...prev, sort: option.id }))}
                  />
                ))}
              </View>

              <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>
                Price range (₱)
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <TextInput
                  value={draft.priceMin}
                  onChangeText={(text) => setDraft((prev) => ({ ...prev, priceMin: text }))}
                  placeholder="Min"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    ...typography.body,
                    color: colors.textPrimary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    minHeight: 44,
                  }}
                />
                <TextInput
                  value={draft.priceMax}
                  onChangeText={(text) => setDraft((prev) => ({ ...prev, priceMax: text }))}
                  placeholder="Max"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    ...typography.body,
                    color: colors.textPrimary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    minHeight: 44,
                  }}
                />
              </View>

              {filterableFields.map((field) => (
                <SelectChipRow
                  key={field.key}
                  field={field}
                  selected={draft.attributeFilters[field.key]}
                  onSelect={handleDraftAttribute}
                />
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable
                onPress={resetDraft}
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ ...typography.body, color: colors.textPrimary }}>Reset</Text>
              </Pressable>
              <Pressable
                onPress={applyDraft}
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    ...typography.body,
                    color: '#FFFFFF',
                    fontFamily: 'PlusJakartaSans_700Bold',
                  }}
                >
                  Apply
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export function getActiveSortLabel(state: ListingFilterState): string {
  return listingSortIdToLabel(state.sort);
}
