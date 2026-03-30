-- Database Performance Optimization: Foreign Key Indexes
-- Add missing indexes to all foreign key columns to improve JOIN and CASCADE DELETE performance

-- Indexes for daily_fails
CREATE INDEX IF NOT EXISTS idx_daily_fails_guild_id ON public.daily_fails(guild_id);
CREATE INDEX IF NOT EXISTS idx_daily_fails_user_id ON public.daily_fails(user_id);

-- Indexes for guild_activity_log
CREATE INDEX IF NOT EXISTS idx_guild_activity_log_guild_id ON public.guild_activity_log(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_activity_log_user_id ON public.guild_activity_log(user_id);

-- Indexes for guild_check_ins
-- Covers both guild_check_ins_user_id_fkey and guild_check_ins_user_id_profiles_fkey
CREATE INDEX IF NOT EXISTS idx_guild_check_ins_user_id ON public.guild_check_ins(user_id);

-- Indexes for guild_contracts
CREATE INDEX IF NOT EXISTS idx_guild_contracts_guild_id ON public.guild_contracts(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_contracts_quest_id ON public.guild_contracts(quest_id);
CREATE INDEX IF NOT EXISTS idx_guild_contracts_user_id ON public.guild_contracts(user_id);

-- Indexes for guild_debuffs
CREATE INDEX IF NOT EXISTS idx_guild_debuffs_guild_id ON public.guild_debuffs(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_debuffs_triggered_by ON public.guild_debuffs(triggered_by);

-- Indexes for guild_members
-- Covers both guild_members_user_id_fkey and guild_members_user_id_profiles_fkey
CREATE INDEX IF NOT EXISTS idx_guild_members_user_id ON public.guild_members(user_id);

-- Indexes for guild_pot_transactions
CREATE INDEX IF NOT EXISTS idx_guild_pot_transactions_guild_id ON public.guild_pot_transactions(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_pot_transactions_user_id ON public.guild_pot_transactions(user_id);

-- Indexes for guilds
CREATE INDEX IF NOT EXISTS idx_guilds_owner_id ON public.guilds(owner_id);

-- Indexes for quest_audit_log
CREATE INDEX IF NOT EXISTS idx_quest_audit_log_changed_by ON public.quest_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_quest_audit_log_quest_id ON public.quest_audit_log(quest_id);

-- Indexes for quest_chains
CREATE INDEX IF NOT EXISTS idx_quest_chains_creator_id ON public.quest_chains(creator_id);
CREATE INDEX IF NOT EXISTS idx_quest_chains_guild_id ON public.quest_chains(guild_id);

-- Indexes for quest_completions
CREATE INDEX IF NOT EXISTS idx_quest_completions_user_id ON public.quest_completions(user_id);

-- Indexes for quest_templates
CREATE INDEX IF NOT EXISTS idx_quest_templates_created_by ON public.quest_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_quest_templates_guild_id ON public.quest_templates(guild_id);

-- Indexes for quests
CREATE INDEX IF NOT EXISTS idx_quests_assigned_by ON public.quests(assigned_by);
CREATE INDEX IF NOT EXISTS idx_quests_assigned_to ON public.quests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_quests_creator_id ON public.quests(creator_id);
CREATE INDEX IF NOT EXISTS idx_quests_guild_id ON public.quests(guild_id);
CREATE INDEX IF NOT EXISTS idx_quests_reviewed_by ON public.quests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_quests_template_id ON public.quests(template_id);

-- Indexes for user_cosmetic_inventory
CREATE INDEX IF NOT EXISTS idx_user_cosmetic_inventory_item_id ON public.user_cosmetic_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_user_cosmetic_inventory_user_id ON public.user_cosmetic_inventory(user_id);
