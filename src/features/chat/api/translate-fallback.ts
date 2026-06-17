import type { PreferredLang } from '@/src/lib/database.types';
import type { TranslateResponse } from './messages';
import {
  buildLangPairs,
  detectSourceLangCode,
  getTargetLangCodes,
  getTargetLangLabel,
  isSameTranslation,
} from './translate-utils';

const MAX_TEXT_LENGTH = 500;

async function fetchMyMemory(text: string, langpair: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Translation service unavailable');
  }

  const json = (await response.json()) as {
    responseData?: { translatedText?: string };
  };

  const translatedText = json.responseData?.translatedText?.trim();
  if (!translatedText) {
    throw new Error('No translation returned');
  }

  return translatedText;
}

/** Free fallback when Supabase Edge Function is not deployed yet. */
export async function translateWithMyMemory(
  text: string,
  targetLang: PreferredLang
): Promise<TranslateResponse> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Nothing to translate');
  if (trimmed.length > MAX_TEXT_LENGTH) {
    throw new Error(`Text exceeds ${MAX_TEXT_LENGTH} characters`);
  }

  const targetCodes = getTargetLangCodes(targetLang);
  const detected = detectSourceLangCode(trimmed);

  if (targetLang === 'tl' && detected === 'tl') {
    throw new Error('Message is already in Filipino');
  }
  if (targetLang === 'en' && detected === 'en') {
    throw new Error('Message is already in English');
  }

  const langPairs = buildLangPairs(trimmed, targetLang);

  for (const langpair of langPairs) {
    try {
      const translatedText = await fetchMyMemory(trimmed, langpair);
      if (!isSameTranslation(trimmed, translatedText)) {
        const [detectedSourceLang] = langpair.split('|');
        return { translatedText, detectedSourceLang };
      }
    } catch {
      continue;
    }
  }

  throw new Error(`Could not translate to ${getTargetLangLabel(targetLang)}`);
}
