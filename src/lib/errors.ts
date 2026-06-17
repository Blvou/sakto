import { getAuthBlockedReason } from './auth-context';

function isNetworkAuthError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const name = err.name;
  const msg = err.message.toLowerCase();
  return (
    name === 'AuthRetryableFetchError' ||
    msg.includes('load failed') ||
    msg.includes('network request failed') ||
    msg.includes('failed to fetch')
  );
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  const blocked = getAuthBlockedReason();
  if (blocked && isNetworkAuthError(err)) return blocked;

  if (err instanceof Error) return err.message || fallback;

  if (typeof err === 'object') {
    const record = err as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message) {
      if (blocked && isNetworkAuthError({ message: record.message })) return blocked;
      return record.message;
    }
    if (typeof record.error_description === 'string') return record.error_description;
    if (typeof record.details === 'string') return record.details;
    if (typeof record.hint === 'string' && record.hint) return record.hint;
  }

  return fallback;
}
