-- Run this file once in Supabase SQL Editor.
-- The service_role key is not required for the browser app.

create extension if not exists pgcrypto;

create table if not exists public.modules (
  id text primary key,
  title text not null,
  description text not null default '',
  cover text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  title text not null,
  description text not null default '',
  type text not null default 'video',
  url text not null default '',
  category text not null default 'teaching',
  tags jsonb not null default '[]'::jsonb,
  thumbnail text not null default '',
  duration integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  role text not null default 'member' check (role in ('member', 'owner')),
  language text not null default 'en',
  created_at timestamptz not null default now()
);

create table if not exists public.module_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null references public.modules(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'first_name', ''))
  on conflict (id) do update set email = excluded.email;

  insert into public.module_access (user_id, module_id)
  select new.id, id from public.modules
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.profiles enable row level security;
alter table public.module_access enable row level security;

drop policy if exists "Authenticated users can read modules" on public.modules;
create policy "Authenticated users can read modules" on public.modules
  for select to authenticated using (true);

drop policy if exists "Admins can manage modules" on public.modules;
create policy "Admins can manage modules" on public.modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Authenticated users can read lessons" on public.lessons;
create policy "Authenticated users can read lessons" on public.lessons
  for select to authenticated using (true);

drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Admins can manage lessons" on public.lessons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can create their profile" on public.profiles;
create policy "Users can create their profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "Users can read their module access" on public.module_access;
create policy "Users can read their module access" on public.module_access
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can receive module access" on public.module_access;
create policy "Users can receive module access" on public.module_access
  for insert to authenticated with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage module access" on public.module_access;
create policy "Admins can manage module access" on public.module_access
  for delete to authenticated using (public.is_admin());

insert into public.modules (id, title, description, cover, sort_order)
values
  ('a-aramaic-code', 'The Aramaic Code - The Prayer Stolen From Your Bible 1,700 Years Ago', 'A guided journey through the Aramaic prayer, its frequencies, and the seven daily lessons of The Aramaic Code.', 'assets/aramaic.jpg', 0),
  ('a-aramaic-code-bonus', 'Bonus - Who You Are Changes Everything', 'A bonus lesson to help you integrate the Aramaic Code into the person you are becoming.', 'assets/aramaic.jpg', 1)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  cover = excluded.cover,
  sort_order = excluded.sort_order;

insert into public.lessons (id, module_id, title, description, type, url, category, tags, thumbnail, duration, sort_order)
values
  ('lesson-intro', 'a-aramaic-code', 'The Aramaic Code - The Prayer Stolen From Your Bible 1,700 Years Ago', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'prayer', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 0),
  ('lesson-day-1', 'a-aramaic-code', 'Day 1 - The First Day Frequency', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 1),
  ('lesson-day-2', 'a-aramaic-code', 'Day 2 - The Second Day Frequency', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 2),
  ('lesson-day-3', 'a-aramaic-code', 'Day 3 - The Third Day Frequency', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 3),
  ('lesson-day-4', 'a-aramaic-code', 'Day 4 - The Fourth Day Frequency', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 4),
  ('lesson-day-5', 'a-aramaic-code', 'Day 5 - The Fifth Day Frequency', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 5),
  ('lesson-day-6', 'a-aramaic-code', 'Day 6 - The Sixth Day Frequency', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 6),
  ('lesson-day-7', 'a-aramaic-code', 'Day 7 - The Seventh Day Frequency', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 7),
  ('lesson-bonus-1', 'a-aramaic-code', 'Bonus 1 - The Sacred Hours', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 8),
  ('lesson-bonus-2', 'a-aramaic-code', 'Bonus 2 - The Atmosphere Shift', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 9),
  ('lesson-bonus-3', 'a-aramaic-code', 'Bonus 3 - The 12 Words', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 10),
  ('lesson-bonus-4', 'a-aramaic-code', 'Bonus 4 - Ephphatha - Be Opened', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 11),
  ('lesson-bonus-5', 'a-aramaic-code', 'Bonus 5 - The Miracle Generator', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 12),
  ('lesson-covenant', 'a-aramaic-code', 'The Covenant Hour - The Life Changing Hour', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["aramaic","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 13),
  ('lesson-bonus-who-you-are', 'a-aramaic-code-bonus', 'BONUS - Who You Are Changes Everything', 'Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.', 'video', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'teaching', '["bonus","identity","the-aramaic-code"]', 'assets/aramaic.jpg', 0, 0)
on conflict (id) do update set
  module_id = excluded.module_id,
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  url = excluded.url,
  category = excluded.category,
  tags = excluded.tags,
  thumbnail = excluded.thumbnail,
  duration = excluded.duration,
  sort_order = excluded.sort_order;

-- Replace placeholder media with the real CURSO1 files deployed in /assets.
delete from public.lessons where id = 'lesson-day-7';
insert into public.lessons (id, module_id, title, description, type, url, category, tags, thumbnail, duration, sort_order)
values ('lesson-frequency', 'a-aramaic-code', '5 Minutes Aramaic Frequency', 'Listen to this lesson from The Aramaic Code as part of your daily journey.', 'audio', '/assets/course1/module-1/lesson-02-aramaic-frequency.mp3', 'meditation', '["aramaic","the-aramaic-code"]', '/assets/aramaic.jpg', 304, 1)
on conflict (id) do update set
  module_id = excluded.module_id, title = excluded.title, description = excluded.description,
  type = excluded.type, url = excluded.url, category = excluded.category, tags = excluded.tags,
  thumbnail = excluded.thumbnail, duration = excluded.duration, sort_order = excluded.sort_order;

update public.lessons set type = 'file', description = 'Read the foundational prayer lesson from The Aramaic Code.', url = '/assets/course1/module-1/lesson-01-prayer.pdf', thumbnail = '/assets/aramaic.jpg', duration = 0, sort_order = 0 where id = 'lesson-intro';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-03-day-1.m4a', thumbnail = '/assets/aramaic.jpg', duration = 374, sort_order = 2 where id = 'lesson-day-1';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-04-day-2.m4a', thumbnail = '/assets/aramaic.jpg', duration = 373, sort_order = 3 where id = 'lesson-day-2';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-05-day-3.m4a', thumbnail = '/assets/aramaic.jpg', duration = 386, sort_order = 4 where id = 'lesson-day-3';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-06-day-4.m4a', thumbnail = '/assets/aramaic.jpg', duration = 377, sort_order = 5 where id = 'lesson-day-4';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-07-day-5.m4a', thumbnail = '/assets/aramaic.jpg', duration = 333, sort_order = 6 where id = 'lesson-day-5';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-08-day-6.m4a', thumbnail = '/assets/aramaic.jpg', duration = 465, sort_order = 7 where id = 'lesson-day-6';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-09-sacred-hours.mp3', thumbnail = '/assets/aramaic.jpg', duration = 219, sort_order = 8 where id = 'lesson-bonus-1';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-10-atmosphere-shift.mp3', thumbnail = '/assets/aramaic.jpg', duration = 199, sort_order = 9 where id = 'lesson-bonus-2';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-11-the-12-words.mp3', thumbnail = '/assets/aramaic.jpg', duration = 355, sort_order = 10 where id = 'lesson-bonus-3';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-12-ephphatha.mp3', thumbnail = '/assets/aramaic.jpg', duration = 45, sort_order = 11 where id = 'lesson-bonus-4';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-13-miracle-generator.mp3', thumbnail = '/assets/aramaic.jpg', duration = 336, sort_order = 12 where id = 'lesson-bonus-5';
update public.lessons set type = 'audio', url = '/assets/course1/module-1/lesson-14-covenant-hour.m4a', thumbnail = '/assets/aramaic.jpg', duration = 385, sort_order = 13 where id = 'lesson-covenant';
update public.lessons set type = 'audio', url = '/assets/course1/module-2/lesson-01-who-you-are.mp3', thumbnail = '/assets/aramaic.jpg', duration = 385, sort_order = 0 where id = 'lesson-bonus-who-you-are';

-- Backfill accounts that existed before this schema was installed.
insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

insert into public.module_access (user_id, module_id)
select users.id, modules.id
from auth.users users
cross join public.modules modules
on conflict do nothing;
