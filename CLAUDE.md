# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Language

- Write **everything in English** — do not use Vietnamese.
- This applies to: source code (comments, identifiers), user-facing UI text
  (labels, buttons, toasts, placeholders), commit messages, and documentation.

## Project

A Next.js (App Router) developer-tools app. Each tool is a self-contained
feature.

Tools are grouped by category (e.g. `cryptography`, `string`, `json`,
`http-client`, `image-converter`, `markdown`). A category with a single tool
today may still get more tools later, so create it even if it only holds one
route. Ungrouped, standalone tools (e.g. `timestamp`, `uuid`) live directly
under `src/app/<tool>` / `src/features/<tool>`.

Both `src/app` and `src/features` mirror the same `<category>/<tool>`
structure:

```
src/app/<category>/<tool>/page.tsx        # route: metadata + render only
src/features/<category>/<tool>-page.tsx   # "use client" implementation
```

The split exists because `page.tsx` must stay a server component to export
`metadata`, while the actual tool UI needs `"use client"`. Keep the route
file a thin wrapper — no logic beyond `metadata` and rendering the feature
component.

### Adding a new tool

1. Create the feature UI at `src/features/<category>/<tool>-page.tsx` (a
   `"use client"` component). If the tool is complex enough to need its own
   components/hooks/store/types/utils, give it a subfolder instead, following
   the `src/features/http-client/<protocol>/` pattern (with a `shared/`
   folder for code reused across sibling tools).
2. Add the route at `src/app/<category>/<tool>/page.tsx` — export `metadata`
   and render the feature component.
3. Register the tool in the sidebar nav in `src/components/app-sidebar.tsx`
   (`data.navMain`), grouped under its category.

### URL naming

- Don't repeat the category name inside the tool segment: prefer
  `/json/formatter` over `/json/json-formatter`.
- If a tool must be reachable at a shorter URL than its category folder
  implies, use a Next.js route group (`src/app/(category)/tool/page.tsx`)
  instead of nesting the category into the path.

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
