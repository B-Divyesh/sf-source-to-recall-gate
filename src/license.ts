const SLUG = 'source-to-recall-gate';
const LICENSE_KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `sb_license_verdict:${SLUG}`;
const VERIFY_AFTER_MS = 24 * 60 * 60 * 1000;

const VERIFY_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/verify`;

export type LicenseState = { unlocked: boolean; notice: string; token: string };
type CachedVerdict = { valid: boolean; checkedAt: number };

function keyFor(key: string, demo: boolean): string {
  return demo ? `demo:${key}` : key;
}

function cleanToken(value: string | null): string {
  return (value ?? '').trim().slice(0, 4096);
}

export async function initializeLicense(fetcher: typeof fetch = fetch, demo = false): Promise<LicenseState> {
  const query = new URLSearchParams(location.search);
  const returned = cleanToken(query.get('license'));
  if (returned) {
    localStorage.setItem(keyFor(LICENSE_KEY, demo), returned);
    query.delete('license');
    const cleanQuery = query.toString();
    history.replaceState({}, '', `${location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${location.hash}`);
  }
  const token = returned || cleanToken(localStorage.getItem(keyFor(LICENSE_KEY, demo)));
  if (!token) return { unlocked: false, notice: '', token: '' };

  const cached = readCache(demo);
  const optimistic = cached?.valid === true;
  if (cached && Date.now() - cached.checkedAt < VERIFY_AFTER_MS) {
    return { unlocked: cached.valid, notice: cached.valid ? '' : 'License no longer active.', token };
  }
  try {
    const response = await fetcher(`${VERIFY_URL}?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(keyFor(CACHE_KEY, demo), JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    return { unlocked: result.valid, notice: result.valid ? '' : 'License no longer active.', token };
  } catch {
    return {
      unlocked: optimistic,
      notice: optimistic ? 'Offline: using your most recent license check.' : 'Could not verify this license yet. Your free tools still work.',
      token
    };
  }
}

function readCache(demo: boolean): CachedVerdict | null {
  try {
    const value = localStorage.getItem(keyFor(CACHE_KEY, demo));
    return value ? JSON.parse(value) as CachedVerdict : null;
  } catch {
    return null;
  }
}

export async function restoreLicense(token: string, fetcher: typeof fetch = fetch, demo = false): Promise<LicenseState> {
  localStorage.setItem(keyFor(LICENSE_KEY, demo), cleanToken(token));
  localStorage.removeItem(keyFor(CACHE_KEY, demo));
  return initializeLicense(fetcher, demo);
}

export function discardDemoLicense(): void {
  localStorage.removeItem(keyFor(LICENSE_KEY, true));
  localStorage.removeItem(keyFor(CACHE_KEY, true));
}
