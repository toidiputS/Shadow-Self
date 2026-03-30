-- 1. Alter quests table to support triggers and assigned roles
ALTER TABLE public.quests
ADD COLUMN trigger_event TEXT,
ADD COLUMN assigned_by UUID REFERENCES auth.users(id),
ADD COLUMN consequence TEXT,
ADD COLUMN proof_requirement TEXT,
ADD COLUMN approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- 2. Create the Guild Audit Logs table
CREATE TABLE public.guild_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.guild_audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs Policies: Anyone in the guild can read logs
CREATE POLICY "Guild members can view audit logs"
ON public.guild_audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE guild_members.guild_id = guild_audit_logs.guild_id
    AND guild_members.user_id = auth.uid()
  )
);

-- Audit Logs Policies: Only authorized roles or system can insert logs implicitly, 
-- but for simplicity MVP we allow members of the guild to insert logs
CREATE POLICY "Guild members can insert audit logs"
ON public.guild_audit_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE guild_members.guild_id = guild_audit_logs.guild_id
    AND guild_members.user_id = auth.uid()
  )
);

-- 3. Update Row Level Security on quests for Sponsors/Leaders
-- Currently, quests are likely restricted to auth.uid() = user_id.
-- We must allow users with 'admin', 'leader', or 'sponsor' roles to insert/update quests for other members.

CREATE POLICY "Sponsors can assign quests to members" ON public.quests
FOR INSERT WITH CHECK (
  auth.uid() = assigned_by AND
  EXISTS (
    SELECT 1 FROM public.guild_members gm_sponsor
    JOIN public.guild_members gm_target ON gm_sponsor.guild_id = gm_target.guild_id
    WHERE gm_sponsor.user_id = auth.uid()
      AND gm_target.user_id = public.quests.user_id
      AND gm_sponsor.role IN ('admin', 'leader', 'sponsor')
  )
);

CREATE POLICY "Sponsors can update assigned quests" ON public.quests
FOR UPDATE USING (
  -- The updater is the sponsor OR the user completing the quest
  (auth.uid() = assigned_by AND
   EXISTS (
     SELECT 1 FROM public.guild_members gm_sponsor
     JOIN public.guild_members gm_target ON gm_sponsor.guild_id = gm_target.guild_id
     WHERE gm_sponsor.user_id = auth.uid()
       AND gm_target.user_id = public.quests.user_id
       AND gm_sponsor.role IN ('admin', 'leader', 'sponsor')
   )
  )
  OR auth.uid() = user_id
);

-- Let users view assigned quests that they assigned to others
CREATE POLICY "Sponsors can view assigned quests" ON public.quests
FOR SELECT USING (
  auth.uid() = assigned_by
);

-- Ensure guild_members enforces standard roles
-- (Note: If there are existing rows with weird roles, this might fail, but for MVP it's clean)
-- Actually, a trigger or just app-level enforcement is safer if data already exists wildly.
-- Let's just trust the app enforcement for `role` in guild_members.
