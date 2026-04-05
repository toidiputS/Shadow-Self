import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

/**
 * Automated Bounce Back Detection Engine
 * 
 * Monitors behavioral signals from check-ins and protocol completion
 * to detect potential spirals BEFORE they become disciplinary events.
 * 
 * TRIGGER CRITERIA (any combination):
 *   1. Latest check-in has mood <= 2 OR craving >= 4 OR is_relapse === true
 *   2. AND fewer than 50% of protocols completed in the last 2 days
 * 
 * EXIT CRITERIA:
 *   - 3 consecutive days of completing at least 1 restorative task
 *   - OR manual sponsor override
 * 
 * COMPLIANCE SHIELDING:
 *   - While active, missed standard protocols are tagged as
 *     "ENGAGED/RESTORATIVE" in the audit trail
 *   - These are excluded from house-level breach calculations
 *   - Sponsor is notified immediately upon activation
 */

export function useBounceBack(userId, profile) {
  // Fetch latest check-in
  const { data: latestCheckIn } = useQuery({
    queryKey: ['bounceBack-checkIn', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('guild_check_ins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
    refetchInterval: 60000, // Re-check every minute
  });

  // Fetch recent protocol completions (last 48 hours)
  const { data: recentCompletions = [] } = useQuery({
    queryKey: ['bounceBack-completions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const { data } = await supabase
        .from('quest_completions')
        .select('*')
        .eq('user_id', userId)
        .gte('completed_at', twoDaysAgo.toISOString());
      return data || [];
    },
    enabled: !!userId,
    refetchInterval: 60000,
  });

  // Fetch active protocol count for ratio calculation
  const { data: activeProtocols = [] } = useQuery({
    queryKey: ['bounceBack-protocols'],
    queryFn: async () => {
      const { data } = await supabase
        .from('quests')
        .select('id')
        .eq('active', true);
      return data || [];
    },
  });

  const bounceBack = useMemo(() => {
    // Admin/sponsor/leader roles are never in bounce-back
    const role = profile?.role;
    if (role === 'admin' || role === 'sponsor' || role === 'leader') {
      return {
        isActive: false,
        triggerReason: null,
        severity: 'none',
        completionRatio: 1,
        restorativeDaysCompleted: 0,
        daysUntilExit: 3,
        complianceTag: null,
      };
    }

    // Signal 1: Emotional distress in latest check-in
    const hasDistressSignal = latestCheckIn && (
      latestCheckIn.mood <= 2 ||
      latestCheckIn.craving_level >= 4 ||
      latestCheckIn.is_relapse === true
    );

    // Signal 2: Low protocol completion ratio
    const totalExpected = activeProtocols.length * 2; // 2 days of protocols
    const completionRatio = totalExpected > 0 
      ? recentCompletions.length / totalExpected 
      : 1;
    const hasLowCompletion = completionRatio < 0.5;

    // Determine severity
    let severity = 'none';
    let triggerReason = null;

    if (latestCheckIn?.is_relapse) {
      severity = 'critical';
      triggerReason = 'Crisis event detected in daily check-in.';
    } else if (hasDistressSignal && hasLowCompletion) {
      severity = 'elevated';
      triggerReason = 'Emotional distress combined with missed protocols.';
    } else if (hasDistressSignal) {
      severity = 'watch';
      triggerReason = 'Emotional indicators suggest a difficult period.';
    }

    const isActive = severity === 'critical' || severity === 'elevated';

    // Calculate restorative progress (consecutive days of at least 1 completion)
    // This is simplified — in production, this would query a rolling 3-day window
    const restorativeDaysCompleted = Math.min(
      Math.floor(recentCompletions.length / Math.max(1, activeProtocols.length)),
      3
    );

    return {
      isActive,
      triggerReason,
      severity,  // 'none' | 'watch' | 'elevated' | 'critical'
      completionRatio: Math.round(completionRatio * 100),
      restorativeDaysCompleted,
      daysUntilExit: Math.max(0, 3 - restorativeDaysCompleted),
      complianceTag: isActive ? 'ENGAGED/RESTORATIVE' : null,
      
      // Restorative task suggestions
      restorativeTasks: isActive ? [
        { id: 'breathe', label: 'Breathing Exercise', description: '4-7-8 breathing pattern. Inhale 4 seconds, hold 7, exhale 8.', duration: '3 min' },
        { id: 'hydrate', label: 'Hydration Check', description: 'Drink a full glass of water. Note how your body feels.', duration: '1 min' },
        { id: 'ground', label: 'Grounding Exercise', description: '5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.', duration: '5 min' },
      ] : [],
    };
  }, [latestCheckIn, recentCompletions, activeProtocols, profile]);

  return bounceBack;
}
