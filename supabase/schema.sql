-- Run this file once in Supabase SQL Editor.
-- The service_role key is not required for the browser app.

create extension if not exists pgcrypto;

/* =========================================================================
   1. MODULES (PRODUCTS)
   ========================================================================= */
create table if not exists public.modules (
  id text primary key,
  title text not null,
  description text not null default '',
  cover text not null default '',
  product_type text not null default 'main',
  checkout_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.modules add column if not exists product_type text not null default 'main';
alter table public.modules add column if not exists checkout_url text not null default '';

/* =========================================================================
   2. LESSONS (AUDIO / PDF / VIDEO CONTENT)
   ========================================================================= */
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

/* =========================================================================
   3. PROFILES (USER ACCOUNTS)
   ========================================================================= */
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  role text not null default 'member' check (role in ('member', 'owner')),
  language text not null default 'en',
  streak_count integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists streak_count integer not null default 1;

/* =========================================================================
   4. AUTHORIZED BUYERS (PAGGINS / CHECKOUT PURCHASES WHITELIST)
   ========================================================================= */
create table if not exists public.authorized_buyers (
  email text primary key,
  name text not null default '',
  purchased_modules text[] not null default array['a-aramaic-code'],
  transaction_id text not null default '',
  status text not null default 'paid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

/* =========================================================================
   5. MODULE ACCESS (ENROLLMENTS)
   ========================================================================= */
create table if not exists public.module_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null references public.modules(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

/* =========================================================================
   SECURITY & HELPER FUNCTIONS
   ========================================================================= */
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

-- Trigger to validate and grant access upon user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer record;
  v_mod text;
begin
  -- 1. Check if user email is authorized in authorized_buyers
  select * into v_buyer
  from public.authorized_buyers
  where lower(email) = lower(new.email);

  -- If not an authorized buyer, reject registration
  if v_buyer is null then
    raise exception 'Email % is not registered as a buyer. Please complete your purchase to activate your access.', new.email;
  end if;

  -- 2. Create member profile
  insert into public.profiles (id, email, first_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', v_buyer.name, '')
  )
  on conflict (id) do update set email = excluded.email;

  -- 3. Grant access ONLY to the purchased modules
  if v_buyer.purchased_modules is not null then
    foreach v_mod in array v_buyer.purchased_modules
    loop
      insert into public.module_access (user_id, module_id)
      values (new.id, v_mod)
      on conflict do nothing;
    end loop;
  else
    insert into public.module_access (user_id, module_id)
    values (new.id, 'a-aramaic-code')
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: When authorized_buyers is updated (e.g. buyer acquires an Order Bump or Upsell later),
-- automatically sync new module access to their existing account
create or replace function public.sync_buyer_module_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_mod text;
begin
  select id into v_user_id
  from public.profiles
  where lower(email) = lower(new.email);

  if v_user_id is not null and new.purchased_modules is not null then
    foreach v_mod in array new.purchased_modules
    loop
      insert into public.module_access (user_id, module_id)
      values (v_user_id, v_mod)
      on conflict do nothing;
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists on_authorized_buyer_updated on public.authorized_buyers;
create trigger on_authorized_buyer_updated
  after insert or update on public.authorized_buyers
  for each row execute procedure public.sync_buyer_module_access();

/* =========================================================================
   ROW LEVEL SECURITY (RLS) POLICIES
   ========================================================================= */
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.profiles enable row level security;
alter table public.authorized_buyers enable row level security;
alter table public.module_access enable row level security;

-- Modules
drop policy if exists "Authenticated users can read modules" on public.modules;
create policy "Authenticated users can read modules" on public.modules
  for select to authenticated using (true);

drop policy if exists "Admins can manage modules" on public.modules;
create policy "Admins can manage modules" on public.modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Lessons
drop policy if exists "Authenticated users can read lessons" on public.lessons;
create policy "Authenticated users can read lessons" on public.lessons
  for select to authenticated using (true);

drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Admins can manage lessons" on public.lessons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Profiles
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

-- Authorized Buyers
drop policy if exists "Admins can manage authorized buyers" on public.authorized_buyers;
create policy "Admins can manage authorized buyers" on public.authorized_buyers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Module Access
drop policy if exists "Users can read their module access" on public.module_access;
create policy "Users can read their module access" on public.module_access
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can receive module access" on public.module_access;
create policy "Users can receive module access" on public.module_access
  for insert to authenticated with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage module access" on public.module_access;
create policy "Admins can manage module access" on public.module_access
  for delete to authenticated using (public.is_admin());

/* =========================================================================
   SEED DATA (5 CANONICAL PRODUCTS)
   ========================================================================= */
insert into public.modules (id, title, description, cover, product_type, checkout_url, sort_order)
values
  ('a-aramaic-code', 'The Aramaic Code — The Prayer Stolen From Your Bible 1,700 Years Ago', 'A guided sacred journey through the original Aramaic prayer, divine sound frequencies, the 7 daily lessons, and included bonuses.', 'assets/aramaic.jpg', 'main', 'https://thearamaiccode.com', 0),
  ('a-miracle-generator', 'The Miracle Generator', 'Ancient acoustic resonance designed to trigger sudden positive shifts, divine synchronicities, and rapid material manifestations.', 'assets/aramaic.jpg', 'orderbump', 'https://thearamaiccode.com/checkout/miracle-generator', 1),
  ('a-jewish-secret-ritual', 'The Jewish Secret Ritual', 'Secret esoteric blessings, energetic shielding, and prosperity consecrations preserved through sacred rabbinical oral traditions.', 'assets/aramaic.jpg', 'orderbump', 'https://thearamaiccode.com/checkout/jewish-secret-ritual', 2),
  ('a-polyglot-sleep', 'The Polyglot Sleep', 'Subconscious nocturnal reprogramming in deep theta-delta wave frequencies to rewire cognitive patterns and unlock effortless fluency & wealth mindset during sleep.', 'assets/aramaic.jpg', 'orderbump', 'https://thearamaiccode.com/checkout/polyglot-sleep', 3),
  ('a-covenant-hour', 'The Covenant Hour — The Life Changing Hour', 'The ultimate deep immersion frequency: The Life Changing Hour. A high-potency sound transmission reserved for those ready for complete spiritual and financial ascension.', 'assets/aramaic.jpg', 'upsell', 'https://thearamaiccode.com/checkout/covenant-hour', 4)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  cover = excluded.cover,
  product_type = excluded.product_type,
  checkout_url = excluded.checkout_url,
  sort_order = excluded.sort_order;

delete from public.modules where id = 'a-aramaic-code-bonus';

insert into public.lessons (id, module_id, title, description, type, url, category, tags, thumbnail, duration, sort_order)
values
  ('lesson-intro', 'a-aramaic-code', 'The Aramaic Code — The Prayer Stolen From Your Bible 1,700 Years Ago', 'Read and download the foundational text and translation of the original Aramaic prayer.', 'file', '/assets/course1/module-1/lesson-01-prayer.pdf', 'prayer', '["aramaic","the-aramaic-code"]', '/assets/aramaic.jpg', 0, 0),
  ('lesson-frequency', 'a-aramaic-code', '5 Minutes Aramaic Frequency (Daily Tune-In)', 'Calibrate your pineal gland and heart coherence with this 5-minute sacred daily frequency.', 'audio', '/assets/course1/module-1/lesson-02-aramaic-frequency.mp3', 'meditation', '["aramaic","the-aramaic-code"]', '/assets/aramaic.jpg', 304, 1),
  ('lesson-day-1', 'a-aramaic-code', 'Day 1 — The First Day Frequency (Foundation of Light)', 'Day 1 of your 7-day ascension: Opening the channel of Divine Light.', 'audio', '/assets/course1/module-1/lesson-03-day-1.m4a', 'teaching', '["aramaic","the-aramaic-code"]', '/assets/aramaic.jpg', 374, 2),
  ('lesson-day-2', 'a-aramaic-code', 'Day 2 — The Second Day Frequency (Clearing Resistance)', 'Dissolving ancestral vows of poverty and subconscious doubt.', 'audio', '/assets/course1/module-1/lesson-04-day-2.m4a', 'teaching', '["aramaic","the-aramaic-code"]', '/assets/aramaic.jpg', 373, 3),
  ('lesson-day-3', 'a-aramaic-code', 'Day 3 — The Third Day Frequency (Sacred Alignment)', 'Aligning your breath and spoken intention with ancient Hebrew-Aramaic resonance.', 'audio', '/assets/course1/module-1/lesson-05-day-3.m4a', 'teaching', '["aramaic","the-aramaic-code"]', '/assets/aramaic.jpg', 386, 4),
  ('lesson-day-4', 'a-aramaic-code', 'Day 4 — The Fourth Day Frequency (Divine Abundance)', 'Attracting continuous material and spiritual flow into your everyday life.', 'audio', '/assets/course1/module-1/lesson-06-day-4.m4a', 'teaching', '["aramaic","the-aramaic-code"]', '/assets/aramaic.jpg', 377, 5),
  ('lesson-day-5', 'a-aramaic-code', 'Day 5 — The Fifth Day Frequency (Protection & Elevation)', 'Creating an impenetrable energetic field around your home and family.', 'audio', '/assets/course1/module-1/lesson-07-day-5.m4a', 'teaching', '["aramaic","the-aramaic-code"]', '/assets/aramaic.jpg', 333, 6),
  ('lesson-day-6', 'a-aramaic-code', 'Day 6 — The Sixth Day Frequency (Sacred Covenant)', 'Sealing your intention in the cosmic covenant of prosperity.', 'audio', '/assets/course1/module-1/lesson-08-day-6.m4a', 'teaching', '["aramaic","the-aramaic-code"]', '/assets/aramaic.jpg', 465, 7),
  ('lesson-bonus-1', 'a-aramaic-code', 'Bonus 1 — The Sacred Hours (Optimal Manifestation Windows)', 'The secret solar & lunar cosmic windows where prayer potency multiplies by 10x.', 'audio', '/assets/course1/module-1/lesson-09-sacred-hours.mp3', 'teaching', '["bonus","the-aramaic-code"]', '/assets/aramaic.jpg', 219, 8),
  ('lesson-bonus-2', 'a-aramaic-code', 'Bonus 2 — The Atmosphere Shift (Space Clearing)', 'Play this audio to immediately clear heavy spiritual energy from any room.', 'audio', '/assets/course1/module-1/lesson-10-atmosphere-shift.mp3', 'meditation', '["bonus","the-aramaic-code"]', '/assets/aramaic.jpg', 199, 9),
  ('lesson-bonus-3', 'a-aramaic-code', 'Bonus 3 — The 12 Words of Power', 'The 12 root Aramaic power words that command peace, healing, and supernatural favor.', 'audio', '/assets/course1/module-1/lesson-11-the-12-words.mp3', 'teaching', '["bonus","the-aramaic-code"]', '/assets/aramaic.jpg', 355, 10),
  ('lesson-bonus-4', 'a-aramaic-code', 'Bonus 4 — Ephphatha (Be Opened)', 'The instantaneous activation command used for sudden breakthroughs.', 'audio', '/assets/course1/module-1/lesson-12-ephphatha.mp3', 'prayer', '["bonus","the-aramaic-code"]', '/assets/aramaic.jpg', 45, 11),
  ('lesson-bonus-who-you-are', 'a-aramaic-code', 'Bonus 5 — Who You Are Changes Everything', 'Integrate the Aramaic Code into your sovereign identity and embody your true divine authority.', 'audio', '/assets/course1/module-2/lesson-01-who-you-are.mp3', 'teaching', '["bonus","identity","the-aramaic-code"]', '/assets/aramaic.jpg', 385, 12),
  ('lesson-miracle-generator', 'a-miracle-generator', 'The Miracle Generator — High Voltage Manifestation Frequency', 'Tap into quantum sonic codes designed to accelerate miracle manifestation.', 'audio', '/assets/course1/module-1/lesson-13-miracle-generator.mp3', 'meditation', '["expansion","miracle"]', '/assets/aramaic.jpg', 336, 0),
  ('lesson-jewish-ritual', 'a-jewish-secret-ritual', 'The Jewish Secret Ritual — Sacred Abundance & Protection Consecration', 'The guarded ancient ceremony for creating lifelong financial security and angelic defense.', 'audio', '/assets/course1/module-1/lesson-02-aramaic-frequency.mp3', 'prayer', '["expansion","jewish-ritual"]', '/assets/aramaic.jpg', 420, 0),
  ('lesson-polyglot-sleep', 'a-polyglot-sleep', 'The Polyglot Sleep — Theta-Delta Subconscious Language Reprogramming', 'Play during sleep to download subconscious fluency, mental sharpness, and wealth beliefs effortlessly.', 'audio', '/assets/course1/module-1/lesson-02-aramaic-frequency.mp3', 'meditation', '["expansion","sleep"]', '/assets/aramaic.jpg', 1800, 0),
  ('lesson-covenant', 'a-covenant-hour', 'The Covenant Hour — The Life Changing Hour (Master Frequency)', 'The full Covenant Hour immersion to unlock total spiritual, physical, and financial transformation.', 'audio', '/assets/course1/module-1/lesson-14-covenant-hour.m4a', 'teaching', '["master","covenant-hour"]', '/assets/aramaic.jpg', 385, 0)
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
