import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import type { PreferredLang } from '@/src/lib/database.types';
import { getErrorMessage } from '@/src/lib/errors';
import {
  fetchCachedTranslation,
  cacheTranslation,
  translateMessage,
} from '../api/messages';

function isPersistedMessageId(messageId: string): boolean {
  return !messageId.startsWith('temp-');
}

export function useTranslateMessage() {
  return useMutation({
    mutationFn: async ({
      messageId,
      text,
      targetLang,
      sourceLang,
    }: {
      messageId: string;
      text: string;
      targetLang: PreferredLang;
      sourceLang?: PreferredLang;
    }) => {
      if (isPersistedMessageId(messageId)) {
        const cached = await fetchCachedTranslation(messageId, targetLang);
        if (cached) {
          return {
            translatedText: cached.translated_body,
            fromCache: true,
          };
        }
      }

      const result = await translateMessage(messageId, text, targetLang, sourceLang);

      if (isPersistedMessageId(messageId)) {
        try {
          await cacheTranslation(messageId, targetLang, result.translatedText);
        } catch {
          // Cache is optional — translation still shown in UI.
        }
      }

      return {
        translatedText: result.translatedText,
        fromCache: false,
      };
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Translation failed'));
    },
  });
}
