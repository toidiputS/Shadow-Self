/**
 * Shadow Self — Clinical Terminology Engine
 * 
 * Central semantic map for all user-facing language.
 * Replaces gamification tropes (XP, SP, Quests) with
 * clinically-grounded recovery terminology.
 * 
 * Usage: import { T } from '@/constants/terminology';
 *        then use T.XP, T.SP, T.QUEST, etc.
 */

export const T = {
  // Core Metrics
  XP: 'Progress',
  XP_LABEL: 'Progress Score',
  SP: 'Points',
  SP_LABEL: 'House Points',
  
  // Task System
  QUEST: 'Habit',
  QUESTS: 'Habits',
  QUEST_COMPLETION: 'Habit Finished',
  QUEST_QUEUE: 'Today\'s Habits',
  
  // Streak & Momentum
  STREAK: 'Daily Streak',
  STREAK_LABEL: 'Daily Streak',
  SHADOW_DEBT: 'Catching Up',
  
  // Grace / Recovery
  GRACE_DAY: 'Self-Care Day',
  GRACE_DAYS: 'Self-Care Days',
  
  // Vault / Archive
  VAULT: 'My History',
  VAULT_LABEL: 'My History',
  
  // Guild / Community
  GUILD: 'House',
  GUILD_SIGNAL: 'Support Rally',
  GUILD_BREACH: 'Requesting Help',
  GUILD_RALLY: 'House Rally',
  
  // Bounce Back
  BOUNCE_BACK: 'Support Mode',
  BOUNCE_BACK_LABEL: 'Currently Getting Extra Support',
  BOUNCE_BACK_TAG: 'GETTING SUPPORT',
  
  // Ranks (Resilience Tiers)
  RANKS: [
    { level: 1, threshold: 0, name: 'Starting Out' },
    { level: 2, threshold: 100, name: 'Steady' },
    { level: 3, threshold: 300, name: 'Reliable' },
    { level: 4, threshold: 600, name: 'Strong' },
    { level: 5, threshold: 1000, name: 'Lead' },
    { level: 6, threshold: 1500, name: 'Rock' },
    { level: 7, threshold: 2500, name: 'Solid' },
  ],
};
