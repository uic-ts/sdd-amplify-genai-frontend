import { useEffect, useState } from 'react';
import Head from 'next/head';
import { ThemeService } from '@/utils/whiteLabel/themeService';
import { Logo } from '@/components/Logo/Logo';
import { getWhiteLabelConfig } from '@/utils/whiteLabel/config';

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || '/';

const CHECKLIST_ITEMS = [
  'Session terminated',
  'Credentials cleared',
  'Safe to close',
];

export default function SignedOut() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const theme = ThemeService.getInitialTheme();
    ThemeService.applyTheme(theme);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const { brandName } = getWhiteLabelConfig();

  return (
    <>
      <Head>
        <title>Signed Out</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 px-4">
        <div className="w-full max-w-md rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
          <div className="flex">
            {/* Left accent strip — logo + brand name */}
            <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center gap-3 py-10 px-3 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-800">
              <Logo width={56} height={56} />
              <span className="text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-300 text-center uppercase leading-tight">
                {brandName}
              </span>
            </div>

            {/* Right content panel */}
            <div className="flex-1 flex flex-col justify-center gap-4 px-6 py-8 bg-white dark:bg-neutral-800">
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                You&apos;ve been signed out
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Your session ended securely.<br />
                It&apos;s safe to close this window.
              </p>
              <ul className="flex flex-col gap-1.5">
                {CHECKLIST_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[9px] font-bold flex-shrink-0">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={appUrl}
                className="inline-block mt-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 w-fit"
              >
                Return to the UIC AI Hub
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
