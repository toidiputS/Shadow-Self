-- Shadow Self - Add Missing Columns (Safe for Existing DBs)
-- Run this AFTER your existing migration
-- Safe to run multiple times - uses IF NOT EXISTS

-- ============================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Profiles - add missing columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'member';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS house_program text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sponsor_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guild_id uuid;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add check constraints if not exists (Postgres will ignore if already exists)
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role in ('member', 'sponsor', 'leader', 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check 
    CHECK (status in ('pending', 'active', 'suspended'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- NEW TABLES (Create if not exist)
-- ============================================

-- Guild check-ins
CREATE TABLE IF NOT EXISTS public.guild_check_ins (
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

-- Guild pot
CREATE TABLE IF NOT EXISTS public.guild_pot (
  id uuid primary key default gen_random_uuid(),
  guild_id uuid unique references public.guilds(id) on delete cascade,
  sp_balance int default 0,
  debuff_active text,
  debuff_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Guild debuffs
CREATE TABLE IF NOT EXISTS public.guild_debuffs (
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

-- Guild activity log
CREATE TABLE IF NOT EXISTS public.guild_activity_log (
  id uuid primary key default gen_random_uuid(),
  guild_id uuid references public.guilds(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  action_type text not null,
  description text,
  sp_amount int default 0,
  created_at timestamptz default now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  read boolean default false,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Sponsorships
CREATE TABLE IF NOT EXISTS public.sponsorships (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references auth.users(id) on delete cascade,
  member_id uuid references auth.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'active', 'ended')),
  started_at timestamptz default now(),
  ended_at timestamptz,
  created_at timestamptz default now(),
  unique(sponsor_id, member_id)
);

-- Review queue
CREATE TABLE IF NOT EXISTS public.review_queue (
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

-- Accountability contracts
CREATE TABLE IF NOT EXISTS public.accountability_contracts (
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
-- ENABLE RLS ON NEW TABLES
-- ============================================

ALTER TABLE public.guild_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_pot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_debuffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountability_contracts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================

-- Guild check-ins policies
CREATE POLICY IF NOT EXISTS "Users can create own check-ins" ON public.guild_check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view own check-ins" ON public.guild_check_ins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Guild members can view check-ins" ON public.guild_check_ins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = guild_check_ins.guild_id AND gm.user_id = auth.uid()
    )
  );

-- Guild pot policies
CREATE POLICY IF NOT EXISTS "Guild members can view pot" ON public.guild_pot
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = guild_pot.guild_id AND gm.user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Guild admins can update pot" ON public.guild_pot
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = guild_pot.guild_id AND gm.user_id = auth.uid() AND gm.role IN ('owner', 'admin')
    )
  );

-- Guild debuffs policies
CREATE POLICY IF NOT EXISTS "Guild members can view debuffs" ON public.guild_debuffs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = guild_debuffs.guild_id AND gm.user_id = auth.uid()
    )
  );

-- Guild activity log policies
CREATE POLICY IF NOT EXISTS "Guild members can view activity log" ON public.guild_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = guild_activity_log.guild_id AND gm.user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Users can create activity log" ON public.guild_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Sponsorships policies
CREATE POLICY IF NOT EXISTS "Users can view own sponsorships" ON public.sponsorships
  FOR SELECT USING (auth.uid() = sponsor_id OR auth.uid() = member_id);
CREATE POLICY IF NOT EXISTS "Users can create sponsorships" ON public.sponsorships
  FOR INSERT WITH CHECK (auth.uid() = sponsor_id);

-- Review queue policies
CREATE POLICY IF NOT EXISTS "Sponsors can view their review queue" ON public.review_queue
  FOR SELECT USING (auth.uid() = sponsor_id);
CREATE POLICY IF NOT EXISTS "Sponsors can update reviews" ON public.review_queue
  FOR UPDATE USING (auth.uid() = sponsor_id);
CREATE POLICY IF NOT EXISTS "Members can view their reviews" ON public.review_queue
  FOR SELECT USING (auth.uid() = member_id);

-- Accountability contracts policies
CREATE POLICY IF NOT EXISTS "Guild members can view contracts" ON public.accountability_contracts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = accountability_contracts.guild_id AND gm.user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Guild admins can create contracts" ON public.accountability_contracts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = accountability_contracts.guild_idAND gm.user_id = auth.uid() AND gm.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- ADD RLS POLICY TO PROFILES FOR SPONSORS
-- ============================================

CREATE POLICY IF NOT EXISTS "Sponsors can view their members profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sponsorships s
      WHERE s.sponsor_id = auth.uid() AND s.member_id = profiles.user_id AND s.status = 'active'
    )
  );

-- ============================================
-- UPDATE TRIGGER FOR PROFILES
-- ============================================

-- Update handle_new_user to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email), 'member')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.progress (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUTO-CREATE GUILD POT ON GUILD CREATION
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_guild()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.guild_pot (guild_id)
  VALUES (new.id)
  ON CONFLICT (guild_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_guild_created ON public.guilds;
CREATE TRIGGER on_guild_created
  AFTER INSERT ON public.guilds
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_guild();

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO public.cosmetic_items (name, description, sp_cost, category) VALUES
  ('Shadow Cloak', 'A dark cloak that marks your dedication', 500, 'avatar'),
  ('Phoenix Badge', 'Rising from the ashes — 30 day milestone', 1000, 'badge'),
  ('Iron Will Frame', 'Profile frame showing unbreakable resolve', 750, 'frame'),
  ('Ember Trail', 'Animated fire trail on your profile', 1500, 'effect'),
  ('Midnight Crown', 'Crown of discipline and consistency', 2000, 'avatar')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
