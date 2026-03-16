-- Run in Supabase SQL Editor

/* ─── Labs table ─────────────────────────────────────────────── */
create table if not exists public.labs (
  id           bigint generated always as identity primary key,
  title        text not null,
  type         text not null default 'Experiment',   -- 'VS Code Extension' | 'Browser Extension' | 'Tool' | 'Experiment'
  description  text,
  status       text not null default 'Experimental', -- 'Live' | 'In Progress' | 'Experimental' | 'Archived'
  icon         text default '🧪',
  tags         text[],
  problem      text,
  tech_stack   text[],
  features     text[],
  link_github  text,
  link_demo    text,
  link_install text,
  dev_note     text,
  is_featured  boolean not null default false,
  is_late_night boolean not null default false,
  sort_order   int not null default 0,
  views        int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

/* ─── Lab reactions table ────────────────────────────────────── */
create table if not exists public.lab_reactions (
  lab_id  bigint references public.labs(id) on delete cascade,
  emoji   text not null,
  count   int  not null default 0,
  primary key (lab_id, emoji)
);

/* ─── RLS ────────────────────────────────────────────────────── */
alter table public.labs          enable row level security;
alter table public.lab_reactions enable row level security;

-- Public can read
create policy "labs public read"          on public.labs          for select using (true);
create policy "lab_reactions public read" on public.lab_reactions for select using (true);

-- Public can increment/decrement reactions via RPC (service role bypasses RLS)
-- Authenticated admin can do everything
create policy "labs admin all"          on public.labs          for all using (auth.role() = 'authenticated');
create policy "lab_reactions admin all" on public.lab_reactions for all using (auth.role() = 'authenticated');

/* ─── Helper RPCs (increment / decrement reactions) ─────────── */
create or replace function public.lab_increment_reaction(p_lab_id bigint, p_emoji text)
returns void language plpgsql security definer as $$
begin
  insert into public.lab_reactions (lab_id, emoji, count) values (p_lab_id, p_emoji, 1)
  on conflict (lab_id, emoji) do update set count = lab_reactions.count + 1;
end;
$$;

create or replace function public.lab_decrement_reaction(p_lab_id bigint, p_emoji text)
returns void language plpgsql security definer as $$
begin
  update public.lab_reactions set count = greatest(0, count - 1)
  where lab_id = p_lab_id and emoji = p_emoji;
end;
$$;

/* ─── Seed sample data ───────────────────────────────────────── */
insert into public.labs (title, type, description, status, icon, tags, problem, tech_stack, features, dev_note, is_featured, is_late_night, sort_order)
values
  (
    'Smart Snippets',
    'VS Code Extension',
    'AI-powered code snippet generator that creates context-aware snippets from natural language.',
    'Live',
    '⚡',
    ARRAY['AI', 'Productivity', 'VS Code'],
    'Writing repetitive boilerplate code wastes hours. This extension understands your context and generates the exact snippet you need.',
    ARRAY['TypeScript', 'OpenAI API', 'VS Code API'],
    ARRAY['Context-aware snippet generation', 'Supports all major languages', 'Zero config setup', 'Works offline with cached snippets'],
    'Started as a weekend experiment, shipped in 3 days',
    true, true, 1
  ),
  (
    'Tab Mind',
    'Browser Extension',
    'Chrome extension that groups and names your tabs using AI based on their content.',
    'In Progress',
    '🧠',
    ARRAY['AI', 'Productivity', 'Chrome'],
    'Having 40+ open tabs with no organization is chaos. Tab Mind auto-groups tabs by topic.',
    ARRAY['JavaScript', 'Chrome API', 'GPT-4o mini'],
    ARRAY['Auto-group tabs by topic', 'Smart naming powered by AI', 'One-click focus mode'],
    'Built at 2am, still adding features daily',
    false, true, 2
  ),
  (
    'Dev Palette',
    'Tool',
    'Generate beautiful, accessible color palettes designed for developer portfolios.',
    'Live',
    '🎨',
    ARRAY['UI', 'Design', 'Tools'],
    'Picking good dark-theme colors that are both beautiful and WCAG accessible is painful.',
    ARRAY['React', 'Framer Motion', 'Color Theory'],
    ARRAY['1-click palette generation', 'WCAG contrast checker', 'Copy as CSS / Tailwind', 'Dark mode preview'],
    'Solved my own pain point while building this site',
    false, false, 3
  )
on conflict do nothing;
