const CYRILLIC = /[\u0400-\u04FF]/;
const HIRAGANA_KATAKANA = /[\u3040-\u30FF]/;
const HANGUL = /[\uAC00-\uD7AF]/;
const CJK = /[\u4E00-\u9FFF]/;
const VIETNAMESE =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const TAGALOG_MARKERS =
  /\b(ako|ikaw|siya|kayo|kami|tayo|ang|mga|ng|sa|na|po|opo|kumusta|salamat|magkano|oo|hindi|paano|saan|magandang)\b/i;

const MYMEMORY_ERROR_MARKERS = [
  'INVALID SOURCE LANGUAGE',
  'MYMEMORY WARNING',
  'QUERY LENGTH LIMIT',
  'PLEASE CONTACT',
] as const;

const SOURCE_FALLBACKS = ['en', 'ru', 'ja', 'zh', 'ko', 'vi', 'de', 'es', 'fr'] as const;

export type PreferredLang = 'en' | 'tl';

export function detectSourceLangCode(text: string): string {
  if (CYRILLIC.test(text)) return 'ru';
  if (HIRAGANA_KATAKANA.test(text)) return 'ja';
  if (HANGUL.test(text)) return 'ko';
  if (CJK.test(text)) return 'zh';
  if (VIETNAMESE.test(text)) return 'vi';
  if (TAGALOG_MARKERS.test(text)) return 'tl';
  return 'en';
}

export function getTargetLangCodes(targetLang: PreferredLang): string[] {
  if (targetLang === 'tl') return ['fil', 'tl'];
  return ['en'];
}

export function toMyMemorySourceCode(lang: string): string {
  if (lang === 'zh-CN' || lang === 'zh-TW') return 'zh';
  if (lang === 'tl') return 'fil';
  return lang;
}

export function buildSourceCandidates(text: string): string[] {
  const detected = detectSourceLangCode(text);
  const candidates: string[] = [detected];

  for (const code of SOURCE_FALLBACKS) {
    if (!candidates.includes(code)) {
      candidates.push(code);
    }
  }

  return candidates;
}

export function buildLangPairs(text: string, targetLang: PreferredLang): string[] {
  const sources = buildSourceCandidates(text);
  const targets = getTargetLangCodes(targetLang);
  const pairs: string[] = [];
  const seen = new Set<string>();

  for (const source of sources) {
    const mmSource = toMyMemorySourceCode(source);
    for (const target of targets) {
      if (mmSource === target) continue;
      const pair = `${mmSource}|${target}`;
      if (!seen.has(pair)) {
        seen.add(pair);
        pairs.push(pair);
      }
    }
  }

  return pairs;
}

export function normalizeForCompare(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isSameTranslation(original: string, translated: string): boolean {
  return normalizeForCompare(original) === normalizeForCompare(translated);
}

export function isMyMemoryErrorText(text: string): boolean {
  const upper = text.toUpperCase();
  return MYMEMORY_ERROR_MARKERS.some((marker) => upper.includes(marker));
}

export function isValidMyMemoryResponse(
  responseStatus: number | string | undefined,
  translatedText: string | undefined
): translatedText is string {
  if (responseStatus !== 200 && responseStatus !== '200') return false;
  if (!translatedText?.trim()) return false;
  return !isMyMemoryErrorText(translatedText);
}
