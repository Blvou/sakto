import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip } from '@/src/design-system/components/Chip';
import { typography } from '@/src/design-system/tokens';
import {
  getFilterableFieldsForCategory,
  type ListingAttributeFieldDef,
} from '@/src/features/listings/constants/attribute-fields';
import {
  DEFAULT_LISTING_SORT,
  LISTING_SORT_OPTIONS,
  listingSortIdToShortLabel,
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
  contentPadding?: number;
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

function ToolbarButton({
  label,
  onPress,
  icon,
  badge,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  icon: ReactNode;
  badge?: number;
  accessibilityLabel: string;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        flex: 1,
        minHeight: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 12,
      }}
    >
      {icon}
      <Text
        style={{
          ...typography.caption,
          color: colors.textPrimary,
          fontFamily: 'PlusJakartaSans_600SemiBold',
          flexShrink: 1,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {badge != null && badge > 0 ? (
        <View
          style={{
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            paddingHorizontal: 6,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
          }}
        >
          <Text
            style={{
              ...typography.caption,
              color: '#FFFFFF',
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 11,
            }}
          >
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function ListingFilters({
  categoryId,
  value,
  onChange,
  contentPadding = 16,
}: ListingFiltersProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
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

  const activeFilterPills = useMemo(() => {
    const pills: { key: string; label: string }[] = [];

    if (value.priceMin.trim() || value.priceMax.trim()) {
      const min = value.priceMin.trim();
      const max = value.priceMax.trim();
      const label =
        min && max ? `₱${min} – ₱${max}` : min ? `From ₱${min}` : `Up to ₱${max}`;
      pills.push({ key: 'price', label });
    }

    for (const field of filterableFields) {
      const selected = value.attributeFilters[field.key];
      if (selected) {
        pills.push({ key: field.key, label: `${field.label}: ${selected}` });
      }
    }

    return pills;
  }, [filterableFields, value]);

  const openFilters = useCallback(() => {
    setDraft(value);
    setFiltersOpen(true);
  }, [value]);

  const applyDraft = useCallback(() => {
    onChange(draft);
    setFiltersOpen(false);
  }, [draft, onChange]);

  const resetDraft = useCallback(() => {
    const next = { ...DEFAULT_LISTING_FILTER_STATE, sort: value.sort };
    setDraft(next);
    onChange(next);
    setFiltersOpen(false);
  }, [onChange, value.sort]);

  const handleSortSelect = useCallback(
    (sort: ListingSortOption) => {
      onChange({ ...value, sort });
      setSortOpen(false);
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

  const clearFilterPill = useCallback(
    (key: string) => {
      if (key === 'price') {
        onChange({ ...value, priceMin: '', priceMax: '' });
        return;
      }

      const nextFilters = { ...value.attributeFilters };
      delete nextFilters[key];
      onChange({ ...value, attributeFilters: nextFilters });
    },
    [onChange, value]
  );

  const sortLabel = listingSortIdToShortLabel(value.sort);

  return (
    <>
      <View style={{ paddingHorizontal: contentPadding, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <ToolbarButton
            label="Filters"
            onPress={openFilters}
            icon={<SlidersHorizontal color={colors.textPrimary} size={16} strokeWidth={2} />}
            badge={activeFilterCount > 0 ? activeFilterCount : undefined}
            accessibilityLabel="Open listing filters"
          />
          <ToolbarButton
            label={sortLabel}
            onPress={() => setSortOpen(true)}
            icon={<ChevronDown color={colors.textSecondary} size={16} strokeWidth={2} />}
            accessibilityLabel="Change sort order"
          />
        </View>

        {activeFilterPills.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, paddingRight: contentPadding }}>
              {activeFilterPills.map((pill) => (
                <Pressable
                  key={pill.key}
                  onPress={() => clearFilterPill(pill.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${pill.label} filter`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      ...typography.caption,
                      color: colors.textPrimary,
                      fontFamily: 'PlusJakartaSans_500Medium',
                    }}
                  >
                    {pill.label}
                  </Text>
                  <X color={colors.textSecondary} size={14} strokeWidth={2} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : null}
      </View>

      <Modal visible={sortOpen} animationType="fade" transparent onRequestClose={() => setSortOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setSortOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: Math.max(insets.bottom, 16),
            }}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={{ ...typography.h3, color: colors.textPrimary, marginBottom: 12 }}>Sort by</Text>
            {LISTING_SORT_OPTIONS.map((option) => {
              const selected = value.sort === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleSortSelect(option.id)}
                  style={{
                    minHeight: 48,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      ...typography.body,
                      color: selected ? colors.primary : colors.textPrimary,
                      fontFamily: selected ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
                    }}
                  >
                    {option.label}
                  </Text>
                  {selected ? (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.primary,
                      }}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={filtersOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setFiltersOpen(false)}
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

            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                marginTop: 16,
                paddingBottom: Math.max(insets.bottom - 8, 0),
              }}
            >
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
  return listingSortIdToShortLabel(state.sort);
}
