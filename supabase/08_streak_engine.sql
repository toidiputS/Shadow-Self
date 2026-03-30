-- 08_streak_engine.sql
-- Full streak engine: relapse tracking, grace days, recovery bounce-back

-- Already applied via migration: is_relapse column on guild_check_ins
-- Already applied via migration: last_relapse_at column on profiles

-- Update the process_daily_streaks RPC with relapse-aware logic
CREATE OR REPLACE FUNCTION process_daily_streaks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    prof RECORD;
    has_check_in BOOLEAN;
    had_relapse BOOLEAN;
BEGIN
    FOR prof IN SELECT * FROM profiles LOOP
        -- Check if they had a relapse-flagged check-in yesterday
        SELECT EXISTS (
            SELECT 1 FROM guild_check_ins
            WHERE user_id = prof.user_id
              AND is_relapse = true
              AND created_at >= (CURRENT_DATE - INTERVAL '1 day')
              AND created_at < CURRENT_DATE
        ) INTO had_relapse;

        IF had_relapse THEN
            -- Relapse overrides everything — reset streak, log timestamp
            UPDATE profiles
            SET current_streak = 0,
                last_relapse_at = NOW()
            WHERE user_id = prof.user_id;

            -- Deduct 100 SP penalty for relapse
            UPDATE progress
            SET sp = GREATEST(0, sp - 100)
            WHERE user_id = prof.user_id;

            CONTINUE; -- Skip normal streak processing
        END IF;

        -- Did they check in yesterday?
        SELECT EXISTS (
            SELECT 1 FROM guild_check_ins
            WHERE user_id = prof.user_id
              AND created_at >= (CURRENT_DATE - INTERVAL '1 day')
              AND created_at < CURRENT_DATE
              AND (is_relapse IS NULL OR is_relapse = false)
        ) INTO has_check_in;

        IF has_check_in THEN
            -- They checked in yesterday (clean)
            UPDATE profiles
            SET current_streak = current_streak + 1,
                best_streak = GREATEST(best_streak, current_streak + 1)
            WHERE user_id = prof.user_id;
        ELSE
            -- They missed yesterday
            IF prof.current_streak > 0 THEN
                IF prof.grace_days > 0 THEN
                    -- Consume 1 grace day to protect the streak
                    UPDATE profiles
                    SET grace_days = grace_days - 1
                    WHERE user_id = prof.user_id;
                ELSE
                    -- Out of grace days — reset streak, apply 50 SP penalty
                    UPDATE profiles
                    SET current_streak = 0
                    WHERE user_id = prof.user_id;

                    UPDATE progress
                    SET sp = GREATEST(0, sp - 50)
                    WHERE user_id = prof.user_id;
                END IF;
            END IF;
        END IF;
    END LOOP;
END;
$$;

-- Note: Schedule via pg_cron if available:
-- SELECT cron.schedule('process-streaks-midnight', '0 0 * * *', $$SELECT process_daily_streaks()$$);
