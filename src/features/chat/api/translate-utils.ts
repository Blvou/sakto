import type { PreferredLang } from '@/src/lib/database.types';

const CYRILLIC = /[\u0400-\u04FF]/;
const TAGALOG_MARKERS =
  /\b(ako|ikaw|siya|kayo|kami|tayo|ang|mga|ng|sa|na|po|opo|kumusta|salamat|magkano|oo|hindi|paano|saan|magandang|kumusta|po)\b/i;

/** Sakto chat always translates into Filipino (Tagalog). */
export function resolveUserTargetLang(_preferredLang?: PreferredLang): PreferredLang {
  return 'tl';
}

export function detectSourceLangCode(text: string): string {
  if (CYRILLIC.test(text)) return 'ru';
  if (TAGALOG_MARKERS.test(text)) return 'tl';
  return 'en';
}

/** MyMemory / Google codes for target language (try variants for Tagalog). */
export function getTargetLangCodes(targetLang: PreferredLang): string[] {
  if (targetLang === 'tl') return ['fil', 'tl'];
  return ['en'];
}

export function buildLangPairs(text: string, targetLang: PreferredLang): string[] {
  const source = detectSourceLangCode(text);
  const targets = getTargetLangCodes(targetLang);
  const pairs = new Set<string>();

  for (const target of targets) {
    if (source !== target) {
      pairs.add(`${source}|${target}`);
    }
    pairs.add(`auto|${target}`);
    if (source === 'ru') pairs.add(`ru|${target}`);
    if (source === 'en') pairs.add(`en|${target}`);
  }

  return [...pairs];
}

export function normalizeForCompare(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isSameTranslation(original: string, translated: string): boolean {
  return normalizeForCompare(original) === normalizeForCompare(translated);
}

export function getTargetLangLabel(targetLang: PreferredLang): string {
  return targetLang === 'tl' ? 'Filipino' : 'English';
}
