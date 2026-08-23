# Bulletin

A personal habit, goal, and project tracker built with React Native built as a reaction to Notion paywalling database/scheduling features I actually want for free.

Second React Native practice project (first was [Cranium](../../cranium), an invoice tracker for freelance work). This one's being built mostly solo, with AI kept in a support/debugging role rather than generating the app outright — see `Build Roadmap` below for how that's structured.

## Status: early schema/foundation phase

Not yet functional as an app — currently wiring up the data layer before any real UI work begins.

## Tech stack

- **Expo** (React Native, TypeScript)
- **expo-router** — file-based navigation
- **expo-sqlite** — local, offline-first storage
- **NativeWind** — Tailwind for React Native

## Data model (current)

Four core entities, each representing a different kind of thing being tracked:

- **`habits`** — recurring, yes/no daily habits (e.g. "meditate"). Has a `scheduleDays` field (which days it applies) and an `isPriority` flag — the priority habit is meant to surface a 30-day streak graph on the Home screen.
- **`habit_log`** — one row per day a habit is marked complete/incomplete. Completion lives here, not on `habits` itself, since a habit is a recurring definition and completion is a per-day fact.
- **`project`** — one-off tracked items with `status`, `priority`, and `progress` (not recurring, not calendar-based — closer to a lightweight task tracker).
- **`meeting`** — dated/timed calendar entries.

All tables use auto-incrementing integer primary keys (`INTEGER PRIMARY KEY AUTOINCREMENT`) rather than UUIDs, since this is a single-device app with no sync planned — simpler than the UUID approach used in Cranium.

Schema lives in `db/schema.ts`, initialized once on app mount via `initDatabase()`.

## Planned features (not yet built)

- Home screen: overview/stats summary first, condensed goals summary, priority-habit streak graph
- Per-habit detail screen with its own 30-day streak graph
- Goals with numeric progress tracking
- Meetings/schedule screen
- Floating pill nav bar (Home / Meetings / Activity) — component built, not yet wired to real screens

## Notes to self

- `expo-sqlite`'s `execSync` can fail to parse a combined multi-statement SQL string even when every individual statement is valid — split multiple `CREATE TABLE` calls into separate `execSync` calls if a "syntax error near )" shows up with no obvious cause.
- Schema/DB init only runs on a genuine cold start (`useEffect` on mount) — fast refresh won't re-trigger it after editing `schema.ts`.
