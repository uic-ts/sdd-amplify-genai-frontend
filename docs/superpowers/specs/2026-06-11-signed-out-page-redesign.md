# Signed-Out Page Redesign

## Problem

The existing `/signed-out` page is a minimal placeholder — plain centered text and a return button with no branding, no messaging typical of a sign-out page, and no visual identity.

## Goals

- Display the Amplify logo prominently
- Include standard sign-out messaging: session ended, credentials cleared, safe to close
- Use a visually attractive split layout (Option C from design review)
- Update button text to "Return to the UIC AI Hub"
- Support light and dark mode

## Out of Scope

- Changes to the SSO/logout flow (already implemented)
- Any new env vars or config
- Changes to other pages

---

## Design

### Layout

Full-screen centered page. A single card (`max-w-md`, `rounded-xl`, `shadow-lg`) splits horizontally:

**Left strip (~96px wide)**
- Soft indigo-to-blue gradient background (light: `from-blue-50 to-indigo-100`; dark: `from-slate-700 to-slate-800`)
- `<Logo>` component centered — already handles white-label config (`NEXT_PUBLIC_CUSTOM_LOGO`) and error fallback to `/sparc_apple.png`
- Brand name below logo in small-caps, read from `getWhiteLabelConfig().brandName` (defaults to `"Amplify GenAI"`)

**Right panel (flex-1)**
- Heading: "You've been signed out"
- Body: "Your session ended securely. It's safe to close this window."
- Security checklist (three items with green badge checkmarks):
  1. Session terminated
  2. Credentials cleared
  3. Safe to close
- Return button: "Return to the UIC AI Hub" → `appUrl` (`NEXT_PUBLIC_APP_URL` or `/`)

### Dark mode

- Page background: `bg-white dark:bg-neutral-900`
- Card: `bg-white dark:bg-neutral-800` with `border border-neutral-200 dark:border-neutral-700`
- Left strip: `from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-800`
- Heading: `text-neutral-900 dark:text-neutral-100`
- Body + brand name: `text-neutral-500 dark:text-neutral-400`
- Checklist items: `text-emerald-600 dark:text-emerald-400`
- Checklist badge bg: `bg-emerald-100 dark:bg-emerald-900/40`

### Logo sizing

`<Logo width={56} height={56} />` — same aspect ratio as existing uses. Logo component adds its own `logo-container` div wrapper.

### Button

Plain `<a href={appUrl}>` (full navigation, not Next.js `<Link>`) — SSO session is gone and we want a clean browser reload. Tailwind classes: `bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800`.

---

## Files Changed

| File | Change |
|------|--------|
| `pages/signed-out.tsx` | Replace entire component with split layout |

No other files change. `__tests__/components/SignedOut.test.tsx` tests only the `resolveAppUrl` logic — unaffected by layout changes.

---

## Accessibility

- Single `<main>` landmark, single `<h1>`
- Logo `<img>` alt text comes from `Logo` component (`{brandName} Logo`)
- Checklist items use `<ul>`/`<li>` semantics
- Button has visible focus ring
- All text meets WCAG AA contrast in both light and dark modes
