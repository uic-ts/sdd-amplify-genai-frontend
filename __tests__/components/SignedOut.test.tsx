import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mirror the URL resolution logic from the signed-out page
const resolveAppUrl = (envVar: string | undefined): string => {
  if (envVar && envVar.trim().length > 0) return envVar.trim();
  return '/';
};

describe('SignedOut page — URL resolution', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns NEXT_PUBLIC_APP_URL when set', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://aihub-dev.uic.edu';
    expect(resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL)).toBe('https://aihub-dev.uic.edu');
  });

  it('returns prod URL when set', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://aihub.uic.edu';
    expect(resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL)).toBe('https://aihub.uic.edu');
  });

  it('falls back to "/" when env var is missing', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL)).toBe('/');
  });

  it('falls back to "/" when env var is empty string', () => {
    process.env.NEXT_PUBLIC_APP_URL = '';
    expect(resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL)).toBe('/');
  });

  it('falls back to "/" when env var is only whitespace', () => {
    process.env.NEXT_PUBLIC_APP_URL = '   ';
    expect(resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL)).toBe('/');
  });
});
