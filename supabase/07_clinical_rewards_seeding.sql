-- 07_clinical_rewards_seeding.sql

ALTER TABLE public.cosmetic_items ADD COLUMN IF NOT EXISTS is_consumable boolean DEFAULT false;
ALTER TABLE public.cosmetic_items ADD COLUMN IF NOT EXISTS system_item_type text;
ALTER TABLE public.cosmetic_items DROP CONSTRAINT IF EXISTS cosmetic_items_system_item_type_check;

-- 2. Clear out legacy gamified items
TRUNCATE TABLE public.cosmetic_items CASCADE;

-- 3. Seed new Clinical Privileges & Rewards
INSERT INTO public.cosmetic_items (name, description, sp_cost, category, is_consumable, system_item_type) VALUES
  ('Weekend Pass', 'Allowed to stay off-site from Friday night to Sunday evening with an approved sponsor or family member.', 1000, 'personal', true, 'weekend_pass'),
  ('Curfew Extension', 'Extend Friday or Saturday curfew to Midnight. One-time use.', 300, 'personal', true, 'curfew_extension'),
  ('Chore Exemption', 'Skip one assigned house chore for the week. (Must notify house manager 24 hours prior).', 500, 'personal', true, 'chore_pass'),
  ('Guest Dinner Pass', 'Host an approved non-resident guest for house dinner.', 250, 'personal', true, 'guest_pass'),
  ('Tech Time Boost', 'Unlock an extra hour of personal device/phone time during restricted periods.', 200, 'personal', true, 'tech_time'),
  ('Sleep-In Privilege', 'Permission to skip early morning meditation/group once, sleeping until 9 AM.', 400, 'personal', true, 'sleep_in'),
  ('House Activity Choice', 'You choose the movie and snacks (provided by facility) for Saturday night.', 800, 'facility', true, 'house_activity'),
  ('Priority Waitlist Bump', 'Bump yourself to the top of the waitlist for a single room upgrade or prime parking spot.', 2000, 'status', false, 'priority_waitlist');
