# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Language

- Write **everything in English** — do not use Vietnamese.
- This applies to: source code (comments, identifiers), user-facing UI text
  (labels, buttons, toasts, placeholders), commit messages, and documentation.

## Project

A Next.js (App Router) developer-tools app. Each tool is a self-contained
feature.

### Adding a new tool

1. Create the feature UI in `src/features/<tool>/<tool>-page.tsx` (a
   `"use client"` component).
2. Add the route at `src/app/<tool>/page.tsx` — export `metadata` and render
   the feature component.
3. Register the tool in the sidebar nav in `src/components/app-sidebar.tsx`
   (`data.navMain`).

### Conventions

- UI is built with shadcn components from `src/components/ui/shadcn`.
- Icons come from `lucide-react`.
- Report errors via the `useErrorHandler` hook (`src/hooks/use-error-handler.ts`),
  which surfaces `sonner` toasts.
- Prefer client-side processing; do not upload user files to a server unless
  required.

### Commands

- `npm run dev` — dev server on port 9090
- `npm run build` — production build
- `npm run lint` — ESLint
