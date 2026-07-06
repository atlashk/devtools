# Web Developer Tools

A collection of everyday web-developer utilities that run almost entirely in the
**browser** — no backend, no account, nothing to deploy. The only server-side
piece is a thin proxy route used by the HTTP Client to get around browser CORS
restrictions.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**,
**Tailwind CSS v4**, **shadcn/ui**, **Zustand**, and the **Monaco** editor.

---

## ✨ Tools included

| Tool | Route | What it does |
| --- | --- | --- |
| **HTTP Client → REST** | `/http-client/rest` | Send REST requests, edit headers / query / body (incl. form-data), inspect responses |
| **HTTP Client → GraphQL** | `/http-client/graphql` | Run GraphQL queries/mutations against an endpoint |
| **HTTP Client → gRPC** | `/http-client/grpc` | Send gRPC-style requests |
| **HTTP Client → WebSocket** | `/http-client/websocket` | Connect to a WS server and view the live message log |
| **Diff Checker** | `/diff-checker` | Compare two pieces of text/code side by side (Monaco diff) |
| **JSON Formatter** | `/json-formatter` | Format and validate JSON |
| **HTML to Markdown** | `/html-to-markdown` | Convert raw HTML or a fetched URL to Markdown, optionally scoped to one element by id/class |
| **Base64** | `/base64` | Encode / decode Base64 |
| **String Counter** | `/string-counter` | Count characters, words, lines, etc. |
| **JWT Decoder** | `/jwt` | Decode and inspect JWT tokens |
| **Timestamp Converter** | `/timestamp` | Convert between Unix timestamps and human dates |
| **UUID Generator** | `/uuid` | Generate UUIDs |

Saved HTTP requests are persisted in the browser's **localStorage** (one key per
protocol) — they never leave your machine.

---

## 🚀 Quick start

### Requirements

- **Node.js** LTS (v18.18+ recommended) — <https://nodejs.org>
- **npm** (ships with Node)

### Run it

From the project root (`devtools/`):

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start the dev server
npm run dev
```

Then open your browser at **<http://localhost:9090>**.

> The dev server uses **Turbopack** on port **9090**. The first start may take
> ~10–20 seconds to compile — wait, then reload the page if needed.
> The root path `/` redirects to the REST client.

### Other commands

```bash
npm run build    # production build
npm start        # run the production build (after npm run build)
npm run lint     # ESLint check
```

---

## 📁 Project structure

```
devtools/
├── src/
│   ├── app/                      # Next.js App Router (routes + layout)
│   │   ├── api/proxy/route.ts    # Server-side proxy for the HTTP client (CORS bypass)
│   │   ├── http-client/          # REST / GraphQL / gRPC / WebSocket pages
│   │   ├── diff-checker/         # one page per tool
│   │   ├── json-formatter/
│   │   ├── base64/ jwt/ uuid/ timestamp/ string-counter/
│   │   ├── layout.tsx            # root layout (fonts, Toaster)
│   │   └── page.tsx              # → redirects to /http-client/rest
│   │
│   ├── features/                 # actual tool implementations (one folder per tool)
│   │   └── http-client/
│   │       ├── shared/           # reusable store/hooks/components across protocols
│   │       ├── rest/  graphql/  grpc/  websocket/
│   │       │   ├── *-page.tsx    # feature entry component
│   │       │   ├── api/          # request execution
│   │       │   ├── store/        # Zustand store + actions
│   │       │   ├── hooks/  components/  constants/  types/
│   │
│   ├── components/
│   │   ├── app-sidebar.tsx       # left-hand navigation (lists every tool)
│   │   └── ui/
│   │       ├── shadcn/           # shadcn/ui primitives
│   │       └── monaco-editor/    # Monaco editor + diff editor wrappers
│   │
│   ├── constants/                # HTTP methods + status code names
│   ├── hooks/                    # shared hooks (debounce, error handler, mobile)
│   └── utils/                    # cn() and helpers
│
├── public/                       # static assets
├── components.json               # shadcn/ui config
├── next.config.ts                # Next.js config
└── package.json
```

### Conventions

- **Path alias:** `@/*` → `./src/*` (see `tsconfig.json`).
- **UI:** shadcn/ui (`new-york` style) lives under `src/components/ui/shadcn`;
  app-level icons use `lucide-react`.
- **State:** each HTTP protocol has its own Zustand store built from the shared
  factories in `src/features/http-client/shared/store`.
- **Adding a tool:** create a folder under `src/features/<tool>`, expose it via a
  route in `src/app/<tool>/page.tsx`, and add an entry to the `navMain` list in
  `src/components/app-sidebar.tsx`.

---

## 🔌 How the HTTP Client proxy works

Browsers block cross-origin requests, so the REST/GraphQL/gRPC clients send their
request to `POST /api/proxy` (`src/app/api/proxy/route.ts`). The route forwards it
to the real target with **axios**, strips browser-managed headers
(`host`, `origin`, `referer`, `user-agent`), supports JSON and `multipart/form-data`
bodies, and returns the status, headers, and body back to the UI. There is also a
`GET /api/proxy?url=...` passthrough for quick testing.

> ⚠️ This proxy runs server-side and will forward requests to any URL you give it.
> Keep it on `localhost` / trusted networks — don't expose it publicly without
> adding authentication and allow-listing.
>
> ⚠️ It also skips TLS certificate validation (`rejectUnauthorized: false`) on
> outbound requests, since dev machines behind a corporate SSL-inspecting proxy
> otherwise get `self-signed certificate in certificate chain` errors on every
> HTTPS target. This disables MITM protection for anything forwarded through
> the proxy — acceptable for a localhost dev tool, but don't expose it beyond that.
