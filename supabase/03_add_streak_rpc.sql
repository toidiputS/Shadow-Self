-- 03_add_streak_rpc.sql
-- Run this in the Supabase SQL Editor to enable the midnight streak processing

CREATE OR REPLACE FUNCTION process_daily_streaks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    prof RECORD;
    has_check_in BOOLEAN;
BEGIN
    FOR prof IN SELECT * FROM profiles LOOP
        -- Did they check in yesterday? (Checking interval between yesterday 00:00 and today 00:00 UTC)
        SELECT EXISTS (
            SELECT 1 FROM guild_check_ins
            WHERE user_id = prof.id
              AND created_at >= (CURRENT_DATE - INTERVAL '1 day')
              AND created_at < CURRENT_DATE
        ) INTO has_check_in;

        IF has_check_in THEN
            -- They checked in yesterday!
            UPDATE profiles
            SET current_streak = current_streak + 1,
                best_streak = GREATEST(best_streak, current_streak + 1)
            WHERE id = prof.id;
        ELSE
            -- They missed yesterday.
            IF prof.current_streak > 0 THEN
                IF prof.grace_days > 0 THEN
                    -- Consume 1 grace day to protect the streak.
                    UPDATE profiles
                    SET grace_days = grace_days - 1
                    WHERE id = prof.id;
                ELSE
                    -- Out of grace days. Reset streak entirely.
                    UPDATE profiles
                    SET current_streak = 0
                    WHERE id = prof.id;
                END IF;
            END IF;
        END IF;
    END LOOP;
END;
$$;

-- Note: To automate this, you should set up pg_cron (if enabled for your project),
-- or execute this periodically via an Edge Function/Trigger.
-- Example pg_cron command (requires the pg_cron extension):
-- select cron.schedule('process-streaks-midnight', '0 0 * * *', $$select process_daily_streaks()$$);
