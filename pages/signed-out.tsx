import { useEffect, useState } from 'react';
import Head from 'next/head';
import { ThemeService } from '@/utils/whiteLabel/themeService';

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || '/';

export default function SignedOut() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const theme = ThemeService.getInitialTheme();
    ThemeService.applyTheme(theme);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Signed Out</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-900 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            You&apos;ve been signed out
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Your session has ended. You can return to AI Hub to sign in again.
          </p>
          <a
            href={appUrl}
            className="inline-block px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
          >
            Return to AI Hub
          </a>
        </div>
      </main>
    </>
  );
}
