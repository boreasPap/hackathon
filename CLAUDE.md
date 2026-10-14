# CLAUDE.md

Guidance for Claude Code (and any other coding agent) working in this repository.

## What this is

The **Papcorns Hackathon Quickstart**: an empty copy of the Papcorns internal dashboard. It has the dashboard's shell (sidebar, theme, dark mode), its design tokens, fonts and shared components, and nothing else: **the menu on the left is empty and there are no pages.** Hackathon participants build their project here to see how it would look and feel inside the real dashboard.

Next.js 16 (App Router, Turbopack) / React 19 / TypeScript / Tailwind CSS 4. No sign-in, no database, no backend. Package manager is **npm**.

## Who you are working with

The people in this repo are Papcorns employees taking part in an internal hackathon. **Many of them are not engineers.** They describe what they want in plain words and you build it. Assume the person in front of you has never opened a terminal unless they show otherwise.

- **Answer in the language they write in** (most write Turkish). The dashboard's own UI text stays English (see Content rules) unless they ask for another language.
- **You do the technical work.** Run the commands yourself: installing, starting the server, checking for errors. Do not hand them a command to paste. When something truly needs them (a password prompt, an installer window, a permission dialog), say exactly what they will see and what to click.
- **No jargon in your replies.** Say "I added a page called Weekly Report, open it from the menu on the left", not which files changed. Keep file names and code out of the answer unless they ask.
- **Build first, ask little.** For a loose idea ("a page that shows our best ads"), choose sensible defaults, build a first version with sample data and show it. Ask a question only when the answer changes what you would build, one or two at most, in everyday words.
- **Check your own work.** After a change, look at the page in the browser yourself (light and dark mode) before you say it is done. They cannot tell you what a stack trace means.
- **Say what is sample data.** When a page shows numbers you made up, tell them so.
- **Their project stays on their computer.** Do not publish it: no pushing to GitHub or any other remote, no deploying, no public link or tunnel (see "Never publish" below). They show it from their own machine.

## First run: getting the dashboard on screen

When someone opens this project and asks to see it, run it or start, do the steps below without asking them to do any of it. Their computer may have nothing installed, not even Node.js.

### 1. Check Node.js

```bash
node -v
```

Next.js 16 needs **Node.js 20.9 or newer**. If the command prints `v20.9` or higher, go to step 2. If the command is not found or the version is older, install Node.js first. Tell the user in one sentence what you are about to install and why ("I need to install Node.js, the program that runs the dashboard; it takes a minute"), then do it:

**macOS / Linux, Homebrew present** (`command -v brew` prints a path):

```bash
brew install node
```

**macOS / Linux, no Homebrew.** Install the official build into the user's home folder. It needs no admin password, no Homebrew and no git:

```bash
ARCH=$(uname -m); [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ] && ARCH=arm64 || ARCH=x64
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
BASE=https://nodejs.org/dist/latest-v24.x
FILE=$(curl -fsSL $BASE/SHASUMS256.txt | grep "$OS-$ARCH.tar.gz" | awk '{print $2}')
cd /tmp && curl -fsSLO "$BASE/$FILE" \
  && curl -fsSL $BASE/SHASUMS256.txt | grep "$FILE" | shasum -a 256 -c - \
  && mkdir -p "$HOME/.local/node" \
  && tar -xzf "$FILE" -C "$HOME/.local/node" --strip-components=1 \
  && rm "$FILE"
```

(On Linux without `shasum`, use `sha256sum -c -` in its place.) Then make it available in new terminals (zsh is the default shell on macOS; use `~/.bashrc` when the shell is bash):

```bash
grep -q '.local/node/bin' ~/.zshrc 2>/dev/null || echo 'export PATH="$HOME/.local/node/bin:$PATH"' >> ~/.zshrc
```

Your own shell does not pick that line up between commands, so in this session prefix every command with the path: `PATH="$HOME/.local/node/bin:$PATH" npm install`.

**Windows:**

```powershell
winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
```

The terminal that was open before the install does not see Node.js. Call it by its full path in this session (`& "C:\Program Files\nodejs\npm.cmd" install`) or ask the user to close and reopen Claude.

**If none of that works** (no network access to nodejs.org, a locked-down computer, `winget` missing): ask the user to download the **LTS** installer from https://nodejs.org, run it and click through with the default choices, then reopen Claude. Tell them this is the only manual step.

Do not install anything else on their computer (Homebrew, nvm, pnpm, yarn, global npm packages). Nothing else is needed.

### 2. Install the project's packages

```bash
npm install
```

Run it from the project root, once. It downloads about 600 MB into `node_modules/` and can take a few minutes on a slow connection; tell the user it is working. Warnings (`npm warn`, "vulnerabilities") are fine. Do not run `npm audit fix`: it changes versions the shared components were built against.

### 3. Start the dashboard

- **In the Claude desktop app:** start the preview named `dashboard` from `.claude/launch.json` (the preview tool, not a shell command). It opens next to the conversation.
- **In a terminal session:** run `npm run dev` in the background and give the user the address it prints.

The address is http://localhost:3000. If port 3000 is taken, Next.js picks the next free one (3001, …) and prints it; read the real address from the output instead of assuming 3000. The page they should see: the sidebar with the Papcorns logo and an empty menu, and a card that says "Welcome, Hacker". Leave the server running while they work; pages update by themselves when you change files.

Only one dev server can run per project folder. If starting it fails because one is already running, use that one.

### 4. When something goes wrong

| Symptom | What to do |
|---|---|
| `node: command not found` after you installed it | The shell has an old `PATH`. Use the full path or the `PATH=…` prefix from step 1. |
| `npm install` fails with a network or certificate error | Retry once. If it still fails, the user is probably on a VPN or a restricted network: ask them to switch it off or change network, then retry. |
| `npm install` fails with `EACCES` / permission errors | Never use `sudo`. Check that the project folder is owned by the user and is not inside a read-only location; moving it to their Documents folder usually fixes it. |
| The page is blank, unstyled or shows an old error after big changes | Stop the server, delete the `.next` folder, start again. |
| "Module not found" for a package | It is not installed yet: `npm install <package>`, then restart the server. |
| Error overlay in the browser | Read it, fix the code, reload. Do not ask the user what it means. |
| The first start downloads the DM Mono font and the computer is offline | The page still works with the fallback font. Carry on. |

## Commands

```bash
npm run dev         # local dev server (http://localhost:3000)
npm run build       # production build; catches type errors
npm run lint        # eslint (there is no `next lint` in Next.js 16)
npm run typecheck   # tsc --noEmit
```

Run `npm run typecheck` and `npm run lint` after a change of any size and fix what they report. There is no test runner; do not assume one.

## Project map

```
public/fonts/                 the licensed Bomstad font files go here (not in git, optional)
src/app/
  layout.tsx                  root layout: fonts, theme, toaster
  globals.css                 design tokens (CSS variables) and Tailwind theme
  page.tsx                    redirects to /dashboard/welcome
  dashboard/
    layout.tsx                the shell: sidebar on the left, the page on the right
    welcome/page.tsx          the one landing card
    <your-page>/page.tsx      ← new pages go here
  design-system/page.tsx      gallery of every token and component (dev only)
src/components/
  design-system/              the shared components; import from "@/components/design-system"
  ui/                         shadcn primitives the design system lacks: Dialog, Sheet, Popover, Tooltip
  dashboard/Sidebar.tsx       the menu (empty) ← every new page adds its entry here
  dashboard/ProductSidebar.tsx  fills the sidebar from that menu
src/features/<your-feature>/  ← a project's own components, sample data and helpers
src/lib/
  format.ts                   dates, numbers, currency
  metrics.ts                  metric dictionary: name, format, polarity
  date-range.ts               date range logic and URL params
  current-user.ts             the name shown in the sidebar footer and the welcome card
docs/frontend/                the design system docs. Read before any UI work.
```

## Adding a page (what almost every request comes down to)

1. **Read `docs/frontend/README.md`** and the doc of each component you will use (`docs/frontend/components/<name>.md`). Open http://localhost:3000/design-system to see them rendered.
2. **Route:** `src/app/dashboard/<slug>/page.tsx`. Keep it thin; it renders a component from the feature folder.
3. **Feature code:** `src/features/<slug>/` holds the page's components, its sample data (`mock-data.ts`) and helpers.
4. **Menu entry:** add the page to `NAV` in `src/components/dashboard/Sidebar.tsx` (the comment there shows a link and a group). A page without an entry cannot be reached. Give it the `permission` key `dashboard/<slug>`; nothing checks it here, it travels with the page.
5. **Start from `PageHeader`** and build the content from the shared components.
6. **Look at it** in the browser, in light and dark mode and in at least one other accent theme (palette button in the sidebar footer).

The shape of a page:

```tsx
// src/app/dashboard/weekly-report/page.tsx
import { WeeklyReport } from "@/features/weekly-report/WeeklyReport";

export default function WeeklyReportPage() {
  return <WeeklyReport />;
}
```

```tsx
// src/features/weekly-report/WeeklyReport.tsx
"use client";

import { KpiCard, PageHeader } from "@/components/design-system";

export function WeeklyReport() {
  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader title="Weekly Report" description="Spend, revenue and installs of the last 7 days." />
      <div className="@container">
        <div className="grid grid-cols-1 gap-4 @min-[460px]:grid-cols-2 @min-[1140px]:grid-cols-4">
          <KpiCard metric="total_spend" value={24400} previous={21900} />
          {/* … */}
        </div>
      </div>
    </div>
  );
}
```

Blocks sit 32px apart (`gap-8`), cards in a row 16px apart (`gap-4`). A card or panel of your own is `rounded-xl border border-line bg-surface p-6`.

## Design system (read before any UI work)

**Before writing or changing any UI, read `docs/frontend/README.md`** and follow it. Build from those references, not from memory of how dashboards usually look. The point of this repo is that a project built here looks like it belongs in the Papcorns dashboard.

- **Our components come first.** Build pages from what `@/components/design-system` exports:

  | Need | Component |
  |---|---|
  | Page title, description, actions, filter bar | `PageHeader` |
  | Button, icon-only button | `Button` (`primary`, `secondary`, `ghost`, `link`), `IconButton` |
  | A filter in the filter bar | `FilterPill` (opens something), `FilterToggle` (on / off) |
  | Pick from a list (apps, channels, metrics, platforms) | `DropdownPanel` |
  | Date range, comparison period | `DateRangePicker`, `ComparePicker` |
  | 2 to 4 fixed options | `SegmentedControl` |
  | A headline number with its change | `KpiCard` |
  | Line / bar / pie chart over time | `TrendChartCard` |
  | Form fields | `Input`, `SearchInput`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Label` |
  | Icons | the Figma sets (`GridIcon`, `CalendarIcon`, `AppleIcon`, `MetaLogo` …); `lucide-react` when none fits |
  | Modal, side drawer, tooltip, free popover | `Dialog`, `Sheet`, `Tooltip`, `Popover` from `@/components/ui/*` (buttons inside them are still the design system `Button`) |

  Props and usage are in `docs/frontend/components/`. When nothing fits (a table, a badge, a tab bar), write the component in the project's feature folder from the tokens below, following the spec in `docs/frontend/design-system.md` where it has one.
- **Tokens, never raw values.** Colors, radius, shadow and type come from utilities mapped to CSS variables in `src/app/globals.css`: `bg-page`, `bg-surface`, `bg-muted`, `border-line`, `text-ink`, `text-ink-2`, `text-ink-3`, `bg-accent`, `text-accent-contrast`, `text-accent-text`, `text-success` / `bg-success-bg`, `text-danger`, `text-warning`, `rounded-sm` … `rounded-xl`, `shadow-popover`, `text-page-title`, `text-body`, `text-body-sm`, `text-caption`. The full list is in `docs/frontend/foundations.md`. **No hex values, no `gray-*` / `indigo-*` / `blue-*` palette classes, no `dark:` overrides**: the tokens already switch with the theme and the mode, and a raw color breaks one of them.
- **Theme and mode are separate.** Accent theme `data-theme="blue|lilac|green"` and mode via the `dark` class; the user picks both in the sidebar footer. A page must read well in all six combinations. Accent as text is `text-accent-text`, never `text-accent`.
- **The Bomstad font may be missing, and that is fine.** It is licensed, so its files are not in the repository. Without them all text is drawn in the system font and everything works; do not try to download the font, replace it or "fix" it. If the user has the three files, put them in `public/fonts/` (the README there names them) and never add them to git.
- **Words are Bomstad, numbers that are data are the system font.** The default stack does it per glyph. Add `font-num tabular-nums` to data values (KPI values, deltas, chart axes, table cells) and `font-bomstad` where a label carries digits (`Last 7 Days`, dates). Long text (paragraphs, AI answers, chat) gets `font-prose`; Bomstad is a display face and falls apart over paragraphs.
- **Charts** are chart.js through `react-chartjs-2`; use `TrendChartCard` when it fits. A chart that needs a color in JS reads the variable at runtime (`getComputedStyle(el).getPropertyValue("--viz-revenue")`), it does not copy the hex.

### Content rules

- UI text is **English**, whatever language the request came in. Text produced by an AI feature stays in the language of its reader.
- Dates read `17 Sep 2026`, ranges `17 Sep – 24 Sep 2026`, times 24h. Numbers use the EN format: compact on cards (`$24.4K`), full with separators in tables. Always through `src/lib/format.ts` (`formatDate`, `formatDateRange`, `formatCurrencyCompact`, `formatNumber`, `formatPercent` …), never hand-formatted.
- A metric's name, format and polarity come from `METRICS` in `src/lib/metrics.ts`, so a card, a table and a chart show it the same way. The color of a change follows the metric's polarity (good / bad), the arrow follows its direction.
- Three status levels (danger, warning, info); red only for a real problem. One primary action per page. Every popover closes on `Esc` and an outside click.

## Data

The template has no backend and no data of its own. What a project shows is up to the person building it.

- **Start with sample data** when they give you none. Put typed sample data in `src/features/<slug>/mock-data.ts` and read it through one function (`getWeeklyReport()`), so swapping in a real source later touches one place. Make it plausible (invented app names, sensible ranges, a few bad days), not `foo` / `123`.
- **Real data is welcome.** When they hand you a file, an export or access to a source, use it: the project runs on their computer and is shown from there. Keep data files in the project's feature folder.
- **When a project needs a server side** (calling an API or an AI model, querying a source, keeping a key secret), write a route handler at `src/app/api/<slug>/route.ts` and call it from the page.
- **Secrets go in `.env.local`**, which git ignores. Never write a key into the code, into a file that is committed, or into your reply. If the user has no key for the service they want, build the feature against sample responses and say what is needed to switch it on.
- For AI features, call the model from a route handler (the Anthropic SDK, `@anthropic-ai/sdk`), never from the browser.

## Filters live in the URL

A page with filters keeps their state in the URL, so a filtered view can be shared as a link.

- Read the initial state from `useSearchParams`; write back on every change with `router.replace(pathname + "?" + qs, { scroll: false })`. `replace`, never `push`.
- Wrap the client component that calls `useSearchParams` in `<Suspense>`.
- Keys are short English names (`apps`, `platforms`, `countries`); multi-select values are comma-separated; defaults are not written to the URL.
- A date preset is stored by name (`range=last-7-days`), a custom range as `from=YYYY-MM-DD&to=YYYY-MM-DD`. `dateRangeToParams` / `parseDateRangeParams` in `src/lib/date-range.ts` do both directions for the `DateRangePicker`.
- Put stable ids in the URL, not display names; match them case-insensitively.

Skip this for transient state (search text, an expanded row) and for a prototype where it gets in the way; it is a default, not a checklist.

## Keep it portable

A project that goes well here is moved into the real dashboard afterwards. That move should be a copy of the project's own folders.

- **A project's code lives in its own folders:** `src/app/dashboard/<slug>/`, `src/features/<slug>/`, `src/app/api/<slug>/`.
- **Do not edit the shared files:** `src/components/design-system/`, `src/components/ui/`, `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/bomstad-font.ts`, `src/lib/format.ts`, `src/lib/metrics.ts`, `src/lib/date-range.ts`, `src/lib/utils.ts`, `docs/frontend/`. They are the dashboard's design system; a local change is lost in the move and makes the project look different there. When a shared component almost fits, wrap it or write your own in the feature folder. If a metric is missing from `METRICS`, pass `label` / `format` / `polarity` to the component instead of adding it.
- **The two files a project does change:** `src/components/dashboard/Sidebar.tsx` (its menu entries) and, if the user wants their name on screen, `src/lib/current-user.ts`.
- **New packages are fine** when the project needs them (`npm install <package>`). Charts are `chart.js` (already installed), toasts `react-hot-toast` (the `<Toaster />` is already mounted); for forms prefer `react-hook-form` + `zod`.

## Next.js 16 is not the Next.js you know

APIs and conventions differ from older versions. **Read the relevant guide in `node_modules/next/dist/docs/` before writing code that touches a Next.js API** (it matches the installed version). What bites most often:

- `params` and `searchParams` of a page, layout or route handler are **Promises**: `const { id } = await params`. So are `cookies()` and `headers()`.
- `middleware.ts` is now `proxy.ts`.
- `next lint` is gone; `npm run lint` runs eslint directly.
- Turbopack is the bundler for `dev` and `build`. Tailwind is wired through the `@tailwindcss/turbopack` loader in `next.config.ts`; there is no `postcss.config` and no `tailwind.config`. The theme lives in `src/app/globals.css`.
- `next dev` keeps a managed block in `AGENTS.md`. Leave it there.

## Conventions

- Match the surrounding code: TypeScript, function components, the `cn()` helper from `@/lib/utils` for class names, imports through the `@/` alias.
- Client components start with `"use client"`; keep `page.tsx` a server component when it has nothing interactive of its own.
- No obvious comments, no `any` without a reason, no docs or test files unless asked.
- Do not refactor or "clean up" files outside the project you are building.
