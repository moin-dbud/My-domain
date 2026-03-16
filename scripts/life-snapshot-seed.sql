-- Run in Supabase SQL Editor to seed Life Snapshot defaults into site_settings

insert into public.site_settings (key, value, updated_at)
values (
  'life_snapshot',
  '{"location":"Nagpur, India","role":"AI & Data Science Student","vibe":"Coffee + late-night builds","mood":"Focused with music","status":"Always building something"}'::jsonb,
  now()
)
on conflict (key) do nothing;

insert into public.site_settings (key, value, updated_at)
values (
  'life_facts',
  '["I get my best ideas at night 🌙","I prefer dark mode always 😌","I love building micro tools","Debugging feels like solving a mystery 🕵️","I enjoy turning ideas into real apps","I read commit history like it''s a story 📖","My tab count is proportional to my curiosity 🤔"]'::jsonb,
  now()
)
on conflict (key) do nothing;
