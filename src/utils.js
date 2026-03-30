export const createPageUrl = (page) => `/${page.toLowerCase()}`;
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, name: "Apprentice" },
  { level: 2, xp: 100, name: "Acolyte" },
  { level: 3, xp: 300, name: "Adept" },
  { level: 4, xp: 600, name: "Expert" },
  { level: 5, xp: 1000, name: "Master" },
  { level: 6, xp: 1500, name: "Grandmaster" },
  { level: 7, xp: 2500, name: "Ascended" },
];

export function getCurrentRank(totalXp) {
  let currentRank = LEVEL_THRESHOLDS[0];
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      currentRank = LEVEL_THRESHOLDS[i];
      break;
    }
  }
  return currentRank;
}

export function getNextRank(currentLevel) {
  return LEVEL_THRESHOLDS.find(rank => rank.level === currentLevel + 1);
}
