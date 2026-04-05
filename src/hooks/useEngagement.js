import { useMemo } from 'react';

/**
 * Progressive Disclosure Engine
 * 
 * Calculates which features should be visible based on the user's
 * enrollment age and consistency milestones. The goal is to prevent
 * cognitive overload during the fragile early days of recovery.
 * 
 * Disclosure Tiers:
 *   - FOUNDATION (Days 1-4):  Check-in + Protocol Queue only
 *   - ANCHOR     (Days 5-7):  + Heatmap, Guild Status
 *   - FULL       (Day 8+):    All features unlocked
 * 
 * Admin/Sponsor roles bypass disclosure gates entirely.
 */

const DISCLOSURE_TIERS = {
  FOUNDATION: 'foundation',  // Days 1-4
  ANCHOR: 'anchor',          // Days 5-7
  FULL: 'full',              // Day 8+
};

export function useEngagement(profile) {
  const engagement = useMemo(() => {
    // Bypass: Admins and sponsors always see everything
    if (profile?.role === 'admin' || profile?.role === 'sponsor' || profile?.role === 'leader') {
      return {
        tier: DISCLOSURE_TIERS.FULL,
        daysSinceEnrollment: 999,
        showGuildStatus: true,
        showHeatmap: true,
        showSponsorBridge: true,
        showProtocolQueue: true,
        showCheckIn: true,
        isFullAccess: true,
        tierLabel: 'Full Access',
      };
    }

    // Calculate days since enrollment
    const createdAt = profile?.created_at 
      ? new Date(profile.created_at) 
      : new Date(); // Default to today if no profile yet
    
    const now = new Date();
    const diffMs = now - createdAt;
    const daysSinceEnrollment = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Determine tier
    let tier;
    if (daysSinceEnrollment >= 8) {
      tier = DISCLOSURE_TIERS.FULL;
    } else if (daysSinceEnrollment >= 5) {
      tier = DISCLOSURE_TIERS.ANCHOR;
    } else {
      tier = DISCLOSURE_TIERS.FOUNDATION;
    }

    // Feature gates
    const isFoundation = tier === DISCLOSURE_TIERS.FOUNDATION;
    const isAnchor = tier === DISCLOSURE_TIERS.ANCHOR;
    const isFull = tier === DISCLOSURE_TIERS.FULL;

    return {
      tier,
      daysSinceEnrollment,
      showCheckIn: true,                          // Always visible
      showProtocolQueue: true,                     // Always visible
      showGuildStatus: isAnchor || isFull,         // Day 5+
      showHeatmap: isAnchor || isFull,             // Day 5+
      showSponsorBridge: isFull,                   // Day 8+
      isFullAccess: isFull,
      tierLabel: isFoundation ? 'Foundation' : isAnchor ? 'Anchor' : 'Full Access',
      daysUntilNextTier: isFoundation 
        ? (5 - daysSinceEnrollment) 
        : isAnchor 
          ? (8 - daysSinceEnrollment) 
          : 0,
    };
  }, [profile]);

  return engagement;
}

export { DISCLOSURE_TIERS };
