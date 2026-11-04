-- شغّل هذا الملف مرة واحدة في Supabase → SQL Editor (بعد schema.sql)
alter table news add column if not exists images text[] not null default '{}';
alter table projects add column if not exists images text[] not null default '{}';

create table if not exists partners(id uuid primary key default gen_random_uuid(), name text not null, logo_url text,
  sort int not null default 0, published boolean not null default true, created_at timestamptz default now());
create table if not exists team(id uuid primary key default gen_random_uuid(), name text not null, role text, bio text, photo_url text,
  tier text not null default 'member' check (tier in ('executive','member')), sort int not null default 0,
  published boolean not null default true, created_at timestamptz default now());

alter table partners enable row level security; alter table team enable row level security;
create policy "partners read" on partners for select using (published or is_admin());
create policy "partners admin" on partners for all using (is_admin()) with check (is_admin());
create policy "team read" on team for select using (published or is_admin());
create policy "team admin" on team for all using (is_admin()) with check (is_admin());
