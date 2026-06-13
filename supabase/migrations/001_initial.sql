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
