const SLUG = 'source-to-recall-gate';
const LICENSE_KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `sb_license_verdict:${SLUG}`;
const VERIFY_AFTER_MS = 24 * 60 * 60 * 1000;

export const CHECKOUT_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;
const VERIFY_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/verify`;

export type LicenseState = { unlocked: boolean; notice: string; token: string };
type CachedVerdict = { valid: boolean; checkedAt: number };

function cleanToken(value: string | null): string {
  return (value ?? '').trim().slice(0, 4096);
}

export async function initializeLicense(fetcher: typeof fetch = fetch): Promise<LicenseState> {
  const query = new URLSearchParams(location.search);
  const returned = cleanToken(query.get('license'));
  if (returned) {
    localStorage.setItem(LICENSE_KEY, returned);
    query.delete('license');
    const cleanQuery = query.toString();
    history.replaceState({}, '', `${location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${location.hash}`);
  }
  const token = returned || cleanToken(localStorage.getItem(LICENSE_KEY));
  if (!token) return { unlocked: false, notice: '', token: '' };

  const cached = readCache();
  const optimistic = cached?.valid === true;
  if (cached && Date.now() - cached.checkedAt < VERIFY_AFTER_MS) {
    return { unlocked: cached.valid, notice: cached.valid ? '' : 'License no longer active.', token };
  }
  try {
    const response = await fetcher(`${VERIFY_URL}?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    return { unlocked: result.valid, notice: result.valid ? '' : 'License no longer active.', token };
  } catch {
    return {
      unlocked: optimistic,
      notice: optimistic ? 'Offline: using your most recent license check.' : 'Could not verify this license yet. Your free tools still work.',
      token
    };
  }
}

function readCache(): CachedVerdict | null {
  try {
    const value = localStorage.getItem(CACHE_KEY);
    return value ? JSON.parse(value) as CachedVerdict : null;
  } catch {
    return null;
  }
}

export async function restoreLicense(token: string, fetcher: typeof fetch = fetch): Promise<LicenseState> {
  localStorage.setItem(LICENSE_KEY, cleanToken(token));
  localStorage.removeItem(CACHE_KEY);
  return initializeLicense(fetcher);
}
