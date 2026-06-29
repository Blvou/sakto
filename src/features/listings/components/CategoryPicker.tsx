import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { typography } from '@/src/design-system/tokens';
import {
  getCategoryNode,
  getChildCategories,
  getRootCategories,
  type CategoryNode,
} from '@/src/features/listings/constants/category-tree';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';
import { useCardStyle } from '@/src/design-system/use-card-style';

export interface CategoryPickerProps {
  /** Pre-selected leaf category id. */
  selectedId?: string | null;
  /** Initial section to open (parent id). */
  initialSectionId?: string | null;
  onSelect: (node: CategoryNode) => void;
  /** When true, selecting a section with children drills down instead of navigating away. */
  drillDown?: boolean;
  /** Skip outer ScrollView when embedded inside another scroll container. */
  embedded?: boolean;
}

export function CategoryPicker({
  selectedId,
  initialSectionId,
  onSelect,
  drillDown = true,
  embedded = false,
}: CategoryPickerProps) {
  const { colors } = useTheme();
  const { horizontalPadding, scale } = useResponsive();
  const cardStyle = useCardStyle({ borderRadius: 16 });

  const initialParent = useMemo(() => {
    if (initialSectionId) return initialSectionId;
    if (selectedId) {
      const node = getCategoryNode(selectedId);
      return node?.parentId ?? null;
    }
    return null;
  }, [initialSectionId, selectedId]);

  const [activeParentId, setActiveParentId] = useState<string | null>(initialParent);

  const sections = useMemo(() => getRootCategories(), []);
  const children = useMemo(
    () => (activeParentId ? getChildCategories(activeParentId) : []),
    [activeParentId]
  );

  const activeSection = activeParentId ? getCategoryNode(activeParentId) : undefined;

  const handleSectionPress = useCallback(
    (section: CategoryNode) => {
      if (section.leaf) {
        onSelect(section);
        return;
      }
      if (drillDown) {
        setActiveParentId(section.id);
      } else {
        onSelect(section);
      }
    },
    [drillDown, onSelect]
  );

  const handleChildPress = useCallback(
    (node: CategoryNode) => {
      onSelect(node);
    },
    [onSelect]
  );

  const handleBackToSections = useCallback(() => {
    setActiveParentId(null);
  }, []);

  if (activeParentId && children.length > 0) {
    return (
      <View style={{ gap: 12 }}>
        <Pressable
          onPress={handleBackToSections}
          accessibilityRole="button"
          accessibilityLabel="Back to all categories"
          style={{ paddingVertical: 4 }}
        >
          <Text style={{ ...typography.caption, color: colors.primary }}>
            ← All categories
          </Text>
        </Pressable>

        <Text style={{ ...typography.h3, color: colors.textPrimary, marginBottom: 4 }}>
          {activeSection?.label}
        </Text>

        {children.map((node) => {
          const Icon = node.icon;
          const selected = selectedId === node.id;

          return (
            <Pressable
              key={node.id}
              onPress={() => handleChildPress(node)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                minHeight: 64,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.primary : colors.border,
                ...cardStyle,
              }}
              accessibilityRole="button"
              accessibilityLabel={node.label}
              accessibilityState={{ selected }}
            >
              <View
                style={{
                  width: scale(44),
                  height: scale(44),
                  borderRadius: scale(22),
                  backgroundColor: `${colors.primary}12`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Icon color={colors.primary} size={scale(22)} strokeWidth={1.75} />
              </View>
              <Text style={{ ...typography.body, color: colors.textPrimary, flex: 1 }}>
                {node.label}
              </Text>
              <ChevronRight color={colors.textSecondary} size={20} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  const sectionGrid = (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingHorizontal: embedded ? horizontalPadding : 0,
      }}
    >
      {sections.map((section) => {
        const Icon = section.icon;
        const childCount = getChildCategories(section.id).length;

        return (
          <Pressable
            key={section.id}
            onPress={() => handleSectionPress(section)}
            style={{
              width: '47%',
              flexGrow: 1,
              flexBasis: '45%',
              minHeight: scale(108),
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel={section.label}
          >
            <View
              style={{
                width: scale(52),
                height: scale(52),
                borderRadius: scale(26),
                backgroundColor: `${colors.primary}12`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Icon color={colors.primary} size={scale(26)} strokeWidth={1.75} />
            </View>
            <Text
              style={{
                ...typography.body,
                fontFamily: 'PlusJakartaSans_600SemiBold',
                color: colors.textPrimary,
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {section.label}
            </Text>
            {childCount > 0 ? (
              <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 4 }}>
                {childCount} subcategories
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );

  if (embedded) {
    return sectionGrid;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingBottom: 24,
        gap: 12,
      }}
      showsVerticalScrollIndicator={false}
    >
      {sectionGrid}
    </ScrollView>
  );
}
