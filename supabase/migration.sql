-- Shadow Self MVP Schema - Complete Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- PROFILES (extends Supabase auth)
-- ============================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text default 'member' check (role in ('member', 'sponsor', 'leader', 'admin')),
  status text default 'active' check (status in ('pending', 'active', 'suspended')),
  house_program text,
  sponsor_code text,
  guild_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- GUILDS (recovery groups)
-- ============================================
create table if not exists public.guilds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  health_score int default 100,
  shadow_stacks int default 0,
  pot_balance int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- GUILD MEMBERSHIP
-- ============================================
create table if not exists public.guild_members (
  guild_id uuid references public.guilds(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('owner','admin','member')) default 'member',
  joined_at timestamptz default now(),
  primary key (guild_id, user_id)
);

-- ============================================
-- QUESTS / HABITS
-- ============================================
create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  guild_id uuid references public.guilds(id) on delete cascade,
  creator_id uuid references auth.users(id) on delete cascade,
  title text not null,
  type text check (type in ('daily','single')) not null,
  xp_reward int not null default 10,
  sp_reward int not null default 50,
  category text default 'recovery',
  difficulty_band text default 'small',
  estimated_time text,
  trigger_text text,
  chain_id uuid,
  chain_position int default 1,
  proof_required boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- QUEST COMPLETIONS (permanent log)
-- ============================================
create table if not exists public.quest_completions (
  id bigint primary key generated always as identity,
  quest_id uuid references public.quests(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  completed_at timestamptz default now(),
  completed_on date generated always as (date(completed_at at time zone 'UTC')) stored
);

-- Enforce 1 completion per user per day for daily quests
create unique index if not exists uq_daily_completion 
  on public.quest_completions (quest_id, user_id, completed_on);

-- ============================================
-- PLAYER ECONOMY / PROGRESS
-- ============================================
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp int default 0,
  sp int default 0,
  rank text default 'Apprentice',
  perfect_days int default 0,
  updated_at timestamptz default now()
);

-- ============================================
-- DAILY FAILS (missed habits for penalty tracking)
-- ============================================
create table if not exists public.daily_fails (
  id bigint primary key generated always as identity,
  guild_id uuid references public.guilds(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  missed_count int default 0
);

-- ============================================
-- COSMETIC ITEMS (for Shadow Vault)
-- ============================================
create table if not exists public.cosmetic_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sp_cost int not null default 100,
  image_url text,
  category text default 'avatar',
  created_at timestamptz default now()
);

-- ============================================
-- USER COSMETIC INVENTORY
-- ============================================
create table if not exists public.user_cosmetic_inventory (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) on delete cascade,
  item_id uuid references public.cosmetic_items(id) on delete cascade,
  item_name text,
  purchase_date timestamptz default now()
);

-- ============================================
-- GUILD CHECK-INS (Daily check-in system)
-- ============================================
create table if not exists public.guild_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guild_id uuid references public.guilds(id) on delete cascade,
  date date not null default current_date,
  mood int check (mood between 1 and 5),
  craving_level int check (craving_level between 1 and 5),
  is_relapse boolean default false,
  sleep_quality int check (sleep_quality between 1 and 5),
  energy int check (energy between 1 and 5),
  message text,
  check_in_type text default 'daily',
  created_at timestamptz default now()
);

-- ============================================
-- GUILD POT (SP accumulation and penalties)
-- ============================================
create table if not exists public.guild_pot (
  id uuid primary key default gen_random_uuid(),
  guild_id uuid unique references public.guilds(id) on delete cascade,
  sp_balance int default 0,
  debuff_active text,
  debuff_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- GUILD DEBUFFS (Active penalties)
-- ============================================
create table if not exists public.guild_debuffs (
  id uuid primary key default gen_random_uuid(),
  guild_id uuid references public.guilds(id) on delete cascade,
  debuff_type text not null,
  consequence_type text not null,
  threshold int default 90,
  duration_days int default 7,
  active boolean default true,
  triggered_at timestamptz default now(),
  cleared_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- GUILD ACTIVITY LOG
-- ============================================
create table if not exists public.guild_activity_log (
  id uuid primary key default gen_random_uuid(),
  guild_id uuid references public.guilds(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  action_type text not null,
  description text,
  sp_amount int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- NOTIFICATIONS (System notifications)
-- ============================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  read boolean default false,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ============================================
-- SPONSORSHIP (Sponsor relationships)
-- ============================================
create table if not exists public.sponsorships (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references auth.users(id) on delete cascade,
  member_id uuid references auth.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'active', 'ended')),
  started_at timestamptz default now(),
  ended_at timestamptz,
  created_at timestamptz default now(),
  unique(sponsor_id, member_id)
);

-- ============================================
-- REVIEW QUEUE (Proof reviews by sponsors)
-- ============================================
create table if not exists public.review_queue (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references auth.users(id) on delete cascade,
  member_id uuid references auth.users(id) on delete cascade,
  quest_id uuid references public.quests(id) on delete cascade,
  proof_type text,
  notes text,
  status text default 'pending' check (status in ('pending', 'approved', 'denied')),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- ACCOUNTABILITY CONTRACTS
-- ============================================
create table if not exists public.accountability_contracts (
  id uuid primary key default gen_random_uuid(),
  guild_id uuid references public.guilds(id) on delete cascade,
  name text not null,
  threshold int default 90,
  consequence_type text not null,
  duration_days int default 7,
  active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;
alter table public.quests enable row level security;
alter table public.quest_completions enable row level security;
alter table public.progress enable row level security;
alter table public.daily_fails enable row level security;
alter table public.cosmetic_items enable row level security;
alter table public.user_cosmetic_inventory enable row level security;
alter table public.guild_check_ins enable row level security;
alter table public.guild_pot enable row level security;
alter table public.guild_debuffs enable row level security;
alter table public.guild_activity_log enable row level security;
alter table public.notifications enable row level security;
alter table public.sponsorships enable row level security;
alter table public.review_queue enable row level security;
alter table public.accountability_contracts enable row level security;

-- Profiles RLS
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);
create policy "Sponsors can view their members profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.sponsorships s
      where s.sponsor_id = auth.uid() and s.member_id = profiles.user_id and s.status = 'active'
    )
  );

-- Progress RLS
create policy "Users can view own progress" on public.progress
  for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.progress
  for update using (auth.uid() = user_id);

-- Guilds RLS
create policy "Authenticated users can create guilds" on public.guilds
  for insert with check (auth.uid() = owner_id);
create policy "Guild members can read guild" on public.guilds
  for select using (
    exists (
      select 1 from public.guild_members gm
      where gm.guild_id = id and gm.user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );
create policy "Guild owner can update" on public.guilds
  for update using (owner_id = auth.uid());

-- Guild members RLS
create policy "Guild members can view members" on public.guild_members
  for select using (
    exists (
      select 1 from public.guild_members gm2
      where gm2.guild_id = guild_id and gm2.user_id = auth.uid()
    )
  );
create policy "Users can join guilds" on public.guild_members
  for insert with check (auth.uid() = user_id);

-- Quests RLS
create policy "Users can create quests" on public.quests
  for insert with check (auth.uid() = creator_id);
create policy "Users can view own quests" on public.quests
  for select using (
    creator_id = auth.uid()
    or exists (
      select 1 from public.guild_members gm
      where gm.guild_id = quests.guild_id and gm.user_id = auth.uid()
    )
  );
create policy "Quest creator can update" on public.quests
  for update using (creator_id = auth.uid());

-- Quest completions RLS
create policy "Users can insert own completions" on public.quest_completions
  for insert with check (auth.uid() = user_id);
create policy "Users can view own completions" on public.quest_completions
  for select using (auth.uid() = user_id);
create policy "Guild members can view quest completions" on public.quest_completions
  for select using (
    exists (
      select 1 from public.guild_members gm
      join public.quests q on q.guild_id = gm.guild_id
      where q.id = quest_completions.quest_id and gm.user_id = auth.uid()
    )
  );

-- Daily fails RLS
create policy "Guild members can view fails" on public.daily_fails
  for select using (
    exists (
      select 1 from public.guild_members gm
      where gm.guild_id = daily_fails.guild_id and gm.user_id = auth.uid()
    )
  );

-- Cosmetic items: public read
create policy "Anyone can view cosmetic items" on public.cosmetic_items
  for select using (true);

-- User inventory RLS
create policy "Users can view own inventory" on public.user_cosmetic_inventory
  for select using (auth.uid() = user_id);
create policy "Users can purchase items" on public.user_cosmetic_inventory
  for insert with check (auth.uid() = user_id);

-- Guild check-ins RLS
create policy "Users can create own check-ins" on public.guild_check_ins
  for insert with check (auth.uid() = user_id);
create policy "Users can view own check-ins" on public.guild_check_ins
  for select using (auth.uid() = user_id);
create policy "Guild members can view check-ins" on public.guild_check_ins
  for select using (
    exists (
      select 1 from public.guild_members gm
      where gm.guild_id = guild_check_ins.guild_id and gm.user_id = auth.uid()
    )
  );

-- Guild pot RLS
create policy "Guild members can view pot" on public.guild_pot
  for select using (
    exists (
      select 1 from public.guild_members gm
      where gm.guild_id = guild_pot.guild_id and gm.user_id = auth.uid()
    )
  );
create policy "Guild admins can update pot" on public.guild_pot
  for update using (
    exists (
      select 1 from public.guild_members gm
      where gm.guild_id = guild_pot.guild_id and gm.user_id = auth.uid() and gm.role in ('owner', 'admin')
    )
  );

-- Guild debuffs RLS
create policy "Guild members can view debuffs" on public.guild_debuffs
  for select using (
    exists (
      select 1 from public.guild_members gm
      where gm.guild_id = guild_debuffs.guild_id and gm.user_id = auth.uid()
    )
  );

-- Guild activity log RLS
create policy "Guild members can view activity log" on public.guild_activity_log
  for select using (
    exists (
      select 1 from public.guild_members gm
      where gm.guild_id = guild_activity_log.guild_id and gm.user_id = auth.uid()
    )
  );
create policy "Users can create activity log" on public.guild_activity_log
  for insert with check (auth.uid() = user_id);

-- Notifications RLS
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "Users can insert own notifications" on public.notifications
  for insert with check (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);
create policy "Admins can view all notifications" on public.notifications
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Sponsorships RLS
create policy "Users can view own sponsorships" on public.sponsorships
  for select using (auth.uid() = sponsor_id or auth.uid() = member_id);
create policy "Users can create sponsorships" on public.sponsorships
  for insert with check (auth.uid() = sponsor_id);

-- Review queue RLS
create policy "Sponsors can view their review queue" on public.review_queue
  for select using (auth.uid() = sponsor_id);
create policy "Sponsors can update reviews" on public.review_queue
  for update using (auth.uid() = sponsor_id);
create policy "Members can view their reviews" on public.review_queue
  for select using (auth.uid() = member_id);

-- Accountability contracts RLS
create policy "Guild members can view contracts" on public.accountability_contracts
  for select using (
    exists (
      select 1 from public.guild_members gm
      where gm.guild_id = accountability_contracts.guild_id and gm.user_id = auth.uid()
    )
  );
create policy "Guild admins can create contracts" on public.accountability_contracts
  for insert with check (
    exists (
      select 1 from public.guild_members gm
      where gm.guild_id = accountability_contracts.guild_id and gm.user_id = auth.uid() and gm.role in ('owner', 'admin')
    )
  );

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email), 'member');

  insert into public.progress (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- AUTO-CREATE GUILD POT ON GUILD CREATION
-- ============================================
create or replace function public.handle_new_guild()
returns trigger as $$
begin
  insert into public.guild_pot (guild_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_guild_created on public.guilds;
create trigger on_guild_created
  after insert on public.guilds
  for each row execute procedure public.handle_new_guild();

-- ============================================
-- SEED: Sample cosmetic items for Shadow Vault
-- ============================================
insert into public.cosmetic_items (name, description, sp_cost, category) values
  ('Shadow Cloak', 'A dark cloak that marks your dedication', 500, 'avatar'),
  ('Phoenix Badge', 'Rising from the ashes — 30 day milestone', 1000, 'badge'),
  ('Iron Will Frame', 'Profile frame showing unbreakable resolve', 750, 'frame'),
  ('Ember Trail', 'Animated fire trail on your profile', 1500, 'effect'),
  ('Midnight Crown', 'Crown of discipline and consistency', 2000, 'avatar')
on conflict do nothing;

-- ============================================
-- SEED: Sample quest templates
-- ============================================
-- These will be created per guild, so seeds are optional
