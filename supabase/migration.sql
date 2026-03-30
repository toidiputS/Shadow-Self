-- Shadow Self MVP Schema
-- Run this in Supabase SQL Editor

-- PROFILES (extends Supabase auth)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- GUILDS (recovery groups)
create table public.guilds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  health_score int default 100,
  shadow_stacks int default 0,
  created_at timestamptz default now()
);

-- GUILD MEMBERSHIP
create table public.guild_members (
  guild_id uuid references public.guilds(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('owner','admin','member')) default 'member',
  joined_at timestamptz default now(),
  primary key (guild_id, user_id)
);

-- QUESTS / HABITS
create table public.quests (
  id uuid primary key default gen_random_uuid(),
  guild_id uuid references public.guilds(id) on delete cascade,
  creator_id uuid references auth.users(id) on delete cascade,
  title text not null,
  type text check (type in ('daily','single')) not null,
  xp_reward int not null default 10,
  sp_reward int not null default 50,
  active boolean default true,
  created_at timestamptz default now()
);

-- QUEST COMPLETIONS (permanent log)
create table public.quest_completions (
  id bigint primary key generated always as identity,
  quest_id uuid references public.quests(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  completed_at timestamptz default now(),
  completed_on date generated always as (date(completed_at at time zone 'UTC')) stored
);

-- Enforce 1 completion per user per day for daily quests
create unique index uq_daily_completion 
  on public.quest_completions (quest_id, user_id, completed_on);

-- PLAYER ECONOMY / PROGRESS
create table public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp int default 0,
  sp int default 0,
  rank text default 'Apprentice',
  perfect_days int default 0,
  updated_at timestamptz default now()
);

-- DAILY FAILS (missed habits for penalty tracking)
create table public.daily_fails (
  id bigint primary key generated always as identity,
  guild_id uuid references public.guilds(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  missed_count int default 0
);

-- COSMETIC ITEMS (for Shadow Vault)
create table public.cosmetic_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sp_cost int not null default 100,
  image_url text,
  category text default 'avatar',
  created_at timestamptz default now()
);

-- USER COSMETIC INVENTORY
create table public.user_cosmetic_inventory (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) on delete cascade,
  item_id uuid references public.cosmetic_items(id) on delete cascade,
  item_name text,
  purchase_date timestamptz default now()
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

-- Profiles: users manage their own
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Progress: users manage their own
create policy "Users can view own progress" on public.progress
  for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.progress
  for update using (auth.uid() = user_id);

-- Guilds: anyone authenticated can create, members can read
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

-- Guild members
create policy "Guild members can view members" on public.guild_members
  for select using (
    exists (
      select 1 from public.guild_members gm2
      where gm2.guild_id = guild_id and gm2.user_id = auth.uid()
    )
  );
create policy "Users can join guilds" on public.guild_members
  for insert with check (auth.uid() = user_id);

-- Quests: creators can manage, guild members can view
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

-- Quest completions: users log their own
create policy "Users can insert own completions" on public.quest_completions
  for insert with check (auth.uid() = user_id);
create policy "Users can view own completions" on public.quest_completions
  for select using (auth.uid() = user_id);

-- Daily fails: viewable by guild members
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

-- User inventory
create policy "Users can view own inventory" on public.user_cosmetic_inventory
  for select using (auth.uid() = user_id);
create policy "Users can purchase items" on public.user_cosmetic_inventory
  for insert with check (auth.uid() = user_id);


-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));

  insert into public.progress (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================
-- SEED: Sample cosmetic items for Shadow Vault
-- ============================================

insert into public.cosmetic_items (name, description, sp_cost, category) values
  ('Shadow Cloak', 'A dark cloak that marks your dedication', 500, 'avatar'),
  ('Phoenix Badge', 'Rising from the ashes — 30 day milestone', 1000, 'badge'),
  ('Iron Will Frame', 'Profile frame showing unbreakable resolve', 750, 'frame'),
  ('Ember Trail', 'Animated fire trail on your profile', 1500, 'effect'),
  ('Midnight Crown', 'Crown of discipline and consistency', 2000, 'avatar');
