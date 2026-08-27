import { afterEach, describe, expect, it, vi } from 'vitest';
import { initializeLicense, restoreLicense } from './license';

function installBrowserState(search = '') {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key)
  });
  vi.stubGlobal('location', { search, pathname: '/', hash: '' });
  vi.stubGlobal('history', { replaceState: vi.fn() });
  return values;
}

afterEach(() => vi.unstubAllGlobals());

describe('Press Pass license', () => {
  it('stores, strips, and verifies a returned checkout token', async () => {
    const values = installBrowserState('?license=token-123&from=checkout');
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ valid: true }), { status: 200 })) as unknown as typeof fetch;
    const state = await initializeLicense(fetcher);
    expect(state.unlocked).toBe(true);
    expect(values.get('sb_license:source-to-recall-gate')).toBe('token-123');
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('license=token-123'));
    expect(history.replaceState).toHaveBeenCalledWith({}, '', '/?from=checkout');
  });

  it('keeps free tools locked when verification rejects a token', async () => {
    installBrowserState();
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ valid: false }), { status: 200 })) as unknown as typeof fetch;
    const state = await restoreLicense('bad-token', fetcher);
    expect(state.unlocked).toBe(false);
    expect(state.notice).toMatch(/no longer active/i);
  });
});
