# Project: LifeForge — personal gamification dashboard builder

## What this app is
A drag-and-drop dashboard builder where users create their own gamification systems.
Users pick functional UI elements (XP bars, quest cards, streak trackers, achievement shelves, etc.)
from a library, place them on a canvas, configure them, and wire them together so completing
tasks feeds XP into bars, which trigger level-ups, which unlock achievements.
Think Notion (flexible, user-built) meets a game UI engine (every element is live and functional).

---

## Tech stack — always use these, never suggest alternatives

- **Framework**: Next.js 14 App Router (use `app/` directory, never `pages/`)
- **Language**: TypeScript — strict mode, always type everything, no `any`
- **Styling**: Tailwind CSS — utility classes only, no custom CSS files unless absolutely necessary
- **Animations**: Framer Motion — for element drops, panel transitions, level-up effects
- **State management**: Zustand — one store per domain (builder store, user store, events store)
- **Database + Auth + Realtime**: Supabase — use the JS client, use RLS (row-level security) on all tables
- **Drag and drop canvas**: react-grid-layout — for the dashboard builder canvas
- **Component library base**: shadcn/ui — for forms, modals, dropdowns in the builder UI shell
- **Icons**: Lucide React — always use lucide-react, never inline SVG for icons
- **Package manager**: pnpm

---

## Project structure — always follow this layout

```
src/
  app/                        # Next.js App Router pages
    (auth)/
      login/page.tsx
      signup/page.tsx
    (dashboard)/
      layout.tsx
      page.tsx                # User's live dashboard view
    builder/
      [dashboardId]/
        page.tsx              # The builder canvas page
    api/
      events/route.ts         # POST endpoint to log gamification events
      widgets/route.ts
  components/
    builder/
      Canvas.tsx              # react-grid-layout wrapper
      ElementLibrary.tsx      # Left sidebar — draggable element list
      PropertiesPanel.tsx     # Right sidebar — selected element config
      ConnectionWirer.tsx     # Visual connection UI between elements
    elements/                 # Every gamification element lives here
      XpBar/
        XpBar.tsx             # The rendered element
        XpBar.config.ts       # Default config, input/output schema
        XpBar.settings.tsx    # Settings panel fields for this element
      LevelBadge/
      QuestCard/
      StreakTracker/
      AchievementShelf/
      ProgressRing/
      StatCard/
    ui/                       # shadcn/ui components (auto-generated, don't edit)
    shared/                   # Reusable non-element components
  lib/
    supabase/
      client.ts               # Browser Supabase client
      server.ts               # Server Supabase client (for Server Components)
      types.ts                # Generated database types
    stores/
      builderStore.ts         # Zustand — canvas layout, selected element, connections
      userStore.ts            # Zustand — current user, their dashboards
      eventsStore.ts          # Zustand — live event log
    engine/
      eventProcessor.ts       # Processes events: quest complete → XP gain → level up → achievement
      connectionResolver.ts   # Resolves the wiring graph between elements
    utils.ts
    constants.ts
  types/
    elements.ts               # All element config/input/output types
    events.ts                 # Gamification event types
    database.ts               # Supabase row types
```

---

## Database schema — always reference this

```sql
-- Users are managed by Supabase Auth (auth.users)

-- A user can have many dashboards
create table dashboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Each widget/element placed on a dashboard
create table widgets (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards on delete cascade not null,
  type text not null,               -- 'xp_bar' | 'level_badge' | 'quest_card' | etc.
  config jsonb not null default '{}',  -- element-specific settings (label, color, maxXp, etc.)
  layout jsonb not null default '{}',  -- {x, y, w, h} for react-grid-layout
  created_at timestamptz default now()
);

-- Wiring between elements: source output → destination input
create table connections (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards on delete cascade not null,
  source_widget_id uuid references widgets on delete cascade not null,
  source_output text not null,      -- e.g. 'quest_completed', 'xp_gained'
  target_widget_id uuid references widgets on delete cascade not null,
  target_input text not null,       -- e.g. 'add_xp', 'trigger_unlock'
  multiplier float default 1.0,     -- optional XP multiplier on the connection
  created_at timestamptz default now()
);

-- Append-only log of everything that happens
create table events (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards not null,
  widget_id uuid references widgets not null,
  user_id uuid references auth.users not null,
  event_type text not null,         -- 'quest_completed' | 'xp_gained' | 'level_up' | 'achievement_unlocked'
  payload jsonb not null default '{}',  -- { xpAmount: 450, newLevel: 13, achievementId: '...' }
  created_at timestamptz default now()
);

-- Current live state per widget (derived from events, cached for performance)
create table widget_state (
  widget_id uuid primary key references widgets on delete cascade,
  state jsonb not null default '{}',  -- { currentXp: 6200, level: 12, streakDays: 18 }
  updated_at timestamptz default now()
);

-- Achievements defined by the user
create table achievements (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards on delete cascade not null,
  name text not null,
  description text,
  icon text,                        -- emoji or lucide icon name
  trigger_type text not null,       -- 'level_reached' | 'streak_days' | 'xp_total' | 'manual'
  trigger_value jsonb,              -- { level: 10 } or { days: 30 } etc.
  is_secret boolean default false,
  created_at timestamptz default now()
);
```

---

## Element system — how every element is built

Every element in `src/components/elements/` must export three things:

### 1. The rendered component (`ElementName.tsx`)
```typescript
interface XpBarProps {
  config: XpBarConfig        // from config.ts
  state: XpBarState          // live state from widget_state table
  isEditing: boolean         // true when in builder mode
  onStateChange?: (newState: XpBarState) => void
}
```

### 2. The config definition (`ElementName.config.ts`)
```typescript
export const XpBarConfig = {
  type: 'xp_bar',
  displayName: 'XP Bar',
  icon: 'zap',               // lucide icon name
  defaultConfig: {
    label: 'My XP',
    color: 'purple',
    maxXpPerLevel: 1000,
    style: 'bar',            // 'bar' | 'ring' | 'segmented'
  },
  defaultLayout: { w: 2, h: 1 },
  inputs: ['add_xp'],        // what this element can receive
  outputs: ['level_up', 'xp_gained'],  // what this element can emit
}
```

### 3. The settings panel (`ElementName.settings.tsx`)
A React component that renders form fields in the PropertiesPanel sidebar.
Uses shadcn/ui form components. On change, calls `builderStore.updateWidgetConfig(id, newConfig)`.

---

## Zustand stores — patterns to follow

```typescript
// builderStore.ts — always structure like this
interface BuilderStore {
  // State
  layout: GridLayout[]
  widgets: Widget[]
  connections: Connection[]
  selectedWidgetId: string | null
  isDragging: boolean

  // Actions — always prefix with a verb
  selectWidget: (id: string | null) => void
  addWidget: (type: ElementType, position: GridPosition) => void
  removeWidget: (id: string) => void
  updateWidgetConfig: (id: string, config: Partial<WidgetConfig>) => void
  updateLayout: (newLayout: GridLayout[]) => void
  addConnection: (connection: NewConnection) => void
  removeConnection: (id: string) => void
}
```

---

## Event processing — how gamification logic runs

When a user completes a task or logs data, the flow is:

1. Element fires an event → POST to `/api/events`
2. API inserts into `events` table
3. Supabase DB function reads `connections` to find downstream elements
4. Calculates new state (XP += amount, check level threshold, check achievements)
5. Updates `widget_state` for all affected widgets
6. Supabase Realtime broadcasts the state changes
7. Zustand `eventsStore` receives the broadcast and updates UI live

This means all gamification logic is in `eventProcessor.ts` and Postgres functions — never scattered across components.

---

## Coding rules — always follow these

- **Server Components by default** — only add `'use client'` when you need interactivity or browser APIs
- **Never put business logic in components** — components call store actions or lib functions, that's it
- **All Supabase queries go in `lib/supabase/`** — never query Supabase directly from a component
- **Type every function signature** — parameters and return type, always
- **Use named exports** — never `export default` for components (except Next.js pages which require it)
- **Error boundaries** — wrap every element component in an ErrorBoundary so one broken widget doesn't crash the whole dashboard
- **Loading states** — every async operation needs a loading state displayed to the user
- **Optimistic updates** — update Zustand state immediately, then sync to Supabase in the background
- **Never hardcode colors** — use the color system in `constants.ts` (mapped to Tailwind classes)
- **Mobile-aware** — builder is desktop-only, but the published dashboard view must be responsive

---

## Naming conventions

- Components: PascalCase (`XpBar.tsx`)
- Files that aren't components: camelCase (`eventProcessor.ts`)
- Zustand stores: camelCase with Store suffix (`builderStore.ts`)
- Database tables: snake_case (`widget_state`)
- TypeScript types/interfaces: PascalCase (`XpBarConfig`)
- Supabase edge functions: kebab-case (`process-event`)
- CSS class names (Tailwind only): no custom class names except `data-` attributes for JS hooks

---

## What to build first — phase 1 scope

Focus only on these until they are solid:

1. Supabase project setup + schema migration
2. Auth (login / signup pages using Supabase Auth)
3. Dashboard list page (create, name, delete dashboards)
4. Builder canvas with react-grid-layout (drag, resize, persist layout)
5. Element library sidebar (static list, drag onto canvas)
6. These 5 elements only: XpBar, LevelBadge, QuestCard, StreakTracker, AchievementShelf
7. Properties panel for each element
8. Persist widget configs to Supabase on every change
9. Basic event processing: QuestCard complete → XpBar gains XP → LevelBadge updates
10. Published dashboard view (read-only, responsive)

Do NOT build templates, social features, AI features, or the connection wirer UI in phase 1.

---

## How to ask Cursor for help — prompt templates

Use these patterns when prompting inside Cursor chat:

**Adding a new element:**
> "Add a new element called HabitRing. Follow the exact same pattern as @XpBar/XpBar.tsx @XpBar/XpBar.config.ts @XpBar/XpBar.settings.tsx. It should track daily habit completion as a ring. Config options: label, color, resetInterval (daily/weekly). Output: habit_completed. Input: none."

**Fixing a bug:**
> "The XP bar is not updating when a quest is completed. Here is the event flow: @eventProcessor.ts @api/events/route.ts @XpBar.tsx. The event is being inserted into Supabase (confirmed) but the UI is not re-rendering. Find the problem."

**Adding a Supabase query:**
> "Add a function to @lib/supabase/client.ts that fetches all widgets and their current state for a given dashboardId. Return type should match @types/database.ts. Handle errors gracefully."

**Refactoring:**
> "Refactor @builderStore.ts — the addWidget action is getting too long. Extract the default config and layout logic into a separate helper function in @lib/utils.ts. Keep the same external interface."

