-- ⚠️ DANGER ZONE: CLEAN SLATE RESET
-- This script will completely wipe all app data: guilds, quests, logs, and registered users.
-- Run this in your Supabase SQL Editor to reset the entire application to zero for fresh testing and pitching.

-- 1. Wipe all application data from the public tables
TRUNCATE TABLE 
    public.quest_completions, 
    public.quest_audit_log,
    public.quests, 
    public.quest_templates, 
    public.quest_chains,
    public.guild_check_ins,
    public.guild_activity_log,
    public.guild_pot_transactions,
    public.guild_debuffs,
    public.guild_contracts,
    public.guild_members,
    public.guilds,
    public.daily_fails,
    public.user_cosmetic_inventory
CASCADE;

-- 2. Wipe the profiles table
TRUNCATE TABLE public.profiles CASCADE;

-- 3. Wipe all user authentications
-- Note: This cascades and deletes the actual user accounts. Everyone will be logged out and forced to re-register.
DELETE FROM auth.users;

-- 4. Reset sequence identity counters if needed (Optional, usually handled by UUIDs)
-- If you use any standard serial IDs, the TRUNCATE handles resetting them automatically.
