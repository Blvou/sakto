import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Flag, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '@/src/design-system/tokens';
import { useTheme } from '@/src/hooks/use-theme';
import { LISTING_REPORT_REASONS, type ListingReportReason } from '../types';

interface ReportListingModalProps {
  visible: boolean;
  listingTitle: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reason: ListingReportReason, details?: string) => void;
}

export function ReportListingModal({
  visible,
  listingTitle,
  isSubmitting,
  onClose,
  onSubmit,
}: ReportListingModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<ListingReportReason | null>(null);
  const [details, setDetails] = useState('');

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setReason(null);
    setDetails('');
    onClose();
  }, [isSubmitting, onClose]);

  const handleSubmit = useCallback(() => {
    if (!reason) return;
    onSubmit(reason, details.trim() || undefined);
  }, [details, onSubmit, reason]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 16,
            maxHeight: '85%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Flag color={colors.secondary} size={18} />
              <Text style={{ ...typography.h3, color: colors.textPrimary, flex: 1 }} numberOfLines={1}>
                Report listing
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              disabled={isSubmitting}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              accessibilityRole="button"
              accessibilityLabel="Close report form"
            >
              <X color={colors.textSecondary} size={22} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, gap: 16 }}
          >
            <Text style={{ ...typography.body, color: colors.textSecondary }}>
              Tell us what is wrong with &quot;{listingTitle}&quot;. Our team will review your report.
            </Text>

            <View style={{ gap: 8 }}>
              {LISTING_REPORT_REASONS.map((item) => {
                const selected = reason === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setReason(item.id)}
                    disabled={isSubmitting}
                    style={{
                      minHeight: 48,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? `${colors.primary}14` : colors.surface,
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={{
                        ...typography.body,
                        color: colors.textPrimary,
                        fontFamily: selected ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ ...typography.caption, color: colors.textSecondary }}>Additional details (optional)</Text>
              <TextInput
                value={details}
                onChangeText={setDetails}
                editable={!isSubmitting}
                multiline
                maxLength={500}
                placeholder="Describe the issue..."
                placeholderTextColor={colors.textSecondary}
                style={{
                  minHeight: 96,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  ...typography.body,
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={!reason || isSubmitting}
              style={{
                minHeight: 52,
                borderRadius: 12,
                backgroundColor: colors.secondary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !reason || isSubmitting ? 0.65 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel="Submit report"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
                  Submit report
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
