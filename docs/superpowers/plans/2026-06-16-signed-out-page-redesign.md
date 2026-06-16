# Signed-Out Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the minimal signed-out page with an attractive split-layout design: logo strip on the left, sign-out messaging + security checklist + return button on the right, with full dark mode support.

**Architecture:** Single file replacement of `pages/signed-out.tsx`. The existing `Logo` component handles white-label config and fallback automatically. The `ThemeService` hydration guard and `appUrl` env-var logic are preserved unchanged. The test file is unaffected — it tests `resolveAppUrl` logic, not layout.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, existing `Logo` component (`components/Logo/Logo.tsx`), `ThemeService` (`utils/whiteLabel/themeService.ts`), `getWhiteLabelConfig` (`utils/whiteLabel/config.ts`).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `pages/signed-out.tsx` | Modify (full rewrite) | Split layout with logo strip, messaging, checklist, return button |
| `__tests__/components/SignedOut.test.tsx` | No change | URL resolution logic — unaffected by layout |

---

## Task 1: Rewrite `pages/signed-out.tsx` with split layout

**Files:**
- Modify: `amplify-genai-frontend/pages/signed-out.tsx`

This is a pure layout replacement. The `appUrl` constant, `ThemeService` hydration guard, and `mounted` pattern are preserved exactly. Only the JSX returned changes.

- [ ] **Step 1: Confirm existing tests still pass before touching anything**

```bash
cd /Users/mlarue4/Projects/Amplify/amplify-genai-frontend
npx vitest run __tests__/components/SignedOut.test.tsx 2>&1 | tail -10
```

Expected: `Tests  5 passed (5)` — all 5 URL resolution tests green.

- [ ] **Step 2: Replace `pages/signed-out.tsx` with the split layout**

Write the following complete file to `pages/signed-out.tsx`:

```tsx
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
```

Key points:
- `appUrl`, `ThemeService`, and `mounted` guard are preserved exactly from the original
- `CHECKLIST_ITEMS` array at module level keeps JSX clean and avoids repetition
- `getWhiteLabelConfig()` is called inside the rendered component (after `mounted` check) so it runs client-side only, consistent with how other components use it
- `Logo` component handles its own alt text (`{brandName} Logo`) and error fallback
- `w-fit` on the button constrains it to content width — no full-width button

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/mlarue4/Projects/Amplify/amplify-genai-frontend && npm run build 2>&1 | grep -E "^.*error TS" | head -20
```

Expected: no TypeScript errors.

- [ ] **Step 4: Run existing tests to confirm nothing regressed**

```bash
cd /Users/mlarue4/Projects/Amplify/amplify-genai-frontend
npx vitest run __tests__/components/SignedOut.test.tsx 2>&1 | tail -10
```

Expected: `Tests  5 passed (5)` — all 5 URL resolution tests still green. (Layout changes don't affect the `resolveAppUrl` logic under test.)

- [ ] **Step 5: Commit**

```bash
cd /Users/mlarue4/Projects/Amplify/amplify-genai-frontend
git add pages/signed-out.tsx
git commit -m "feat: redesign signed-out page with split layout, logo, and security checklist"
```

---

## Task 2: Verify in browser (light + dark mode)

**Files:** (no code changes)

- [ ] **Step 1: Confirm dev server is running**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/signed-out
```

Expected: `200`. If not running:
```bash
cd /Users/mlarue4/Projects/Amplify/amplify-genai-frontend && npm run dev &
# Wait ~8s then retry
```

Note: Next.js may pick port 3001 if 3000 is occupied — check terminal output for the actual port.

- [ ] **Step 2: Navigate to `/signed-out` and take a screenshot**

Open `http://localhost:3001/signed-out` (or whichever port the dev server is on) in a browser.

Verify visually:
- Left strip: logo renders, brand name shows below it, indigo-blue gradient background
- Right panel: "You've been signed out" heading, body copy, three green checklist items, "Return to the UIC AI Hub" button
- Card has rounded corners and a visible shadow

- [ ] **Step 3: Verify dark mode**

In browser DevTools console, run:
```js
localStorage.setItem('user-theme-preference', 'dark'); location.reload();
```

Verify:
- Page background becomes dark (`neutral-900`)
- Card becomes `neutral-800` with subtle border
- Left strip becomes slate gradient
- Brand name text becomes indigo-300
- Checklist text becomes `emerald-400`
- Heading becomes near-white

Restore light mode:
```js
localStorage.setItem('user-theme-preference', 'light'); location.reload();
```

- [ ] **Step 4: Verify return link target**

Right-click "Return to the UIC AI Hub" → Inspect. Confirm `href` matches the `NEXT_PUBLIC_APP_URL` value in `.env.local` (should be `https://aihub-dev.uic.edu`).

---

## Self-Review Checklist

- [x] **Spec coverage:**
  - Split layout with logo strip ✓ (Task 1 Step 2)
  - Logo component used ✓ (`<Logo width={56} height={56} />`)
  - Brand name from white-label config ✓ (`getWhiteLabelConfig().brandName`)
  - Heading: "You've been signed out" ✓
  - Body: "Your session ended securely. It's safe to close this window." ✓
  - Three-item security checklist ✓ (`CHECKLIST_ITEMS`)
  - Button text: "Return to the UIC AI Hub" ✓
  - Full dark mode ✓ (all `dark:` variants listed in spec are present)
  - `appUrl` from `NEXT_PUBLIC_APP_URL` ✓ (preserved)
  - Single `<main>` + single `<h1>` + descriptive link text ✓
  - Focus ring on button ✓
- [x] **No placeholders:** All code is complete and runnable.
- [x] **Type consistency:** `brandName` destructured from `getWhiteLabelConfig()` which returns `WhiteLabelConfig` (`{ customLogoPath, defaultTheme, brandName }`). `Logo` props `width` and `height` are `number` — passed as `56`. All consistent.
