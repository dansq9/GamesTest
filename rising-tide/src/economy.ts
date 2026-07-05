/**
 * economy.ts — the pearl economy (spec 10). Per-PLAYER, persistent state + pure functions.
 *
 * Like the DDA profile, this is NOT per-game GameState — it's the persistence layer the host owns
 * (wallet, streak, freeze tokens). The engine computes a level's star payout and emits it in the
 * `won` event's rewards; the host applies these functions to the wallet. Single soft currency
 * (pearls), no hard currency, no gacha.
 */

export interface EconomyState {
  pearls: number; // persistent wallet (never resets)
  streakCount: number; // consecutive daily-play days
  lastDailyDate: string | null; // UTC date of last daily play
  freezeTokens: number; // hold a streak through a missed day
  lastFirstWinDate: string | null; // UTC date of last First-Win-of-Day payout
  streakChestTiersEarned: number[]; // streak-chest tiers already paid
}

export const FRESH_ECONOMY: EconomyState = {
  pearls: 0,
  streakCount: 0,
  lastDailyDate: null,
  freezeTokens: 0,
  lastFirstWinDate: null,
  streakChestTiersEarned: [],
};

// ── constants (spec 10; [OPEN] where tagged there) ───────────────────────────
export const STAR_PEARLS: Record<number, number> = { 3: 30, 2: 20, 1: 10, 0: 0 };
export const MILESTONE_BONUS: Record<number, number> = { 10: 30, 20: 40, 30: 50, 40: 75 };
export const FIRST_WIN_OF_DAY = 10;
export const FREEZE_CAP = 4; // raised from 2 per persona review
export const STREAK_BREAK_DAYS = 3; // breaks on 3 consecutive missed days
export const STREAK_CHEST_TIERS: Record<number, number> = { 3: 75, 7: 150, 14: 300, 30: 600 };

export function starPearls(stars: number): number {
  return STAR_PEARLS[stars] ?? 0;
}
export function milestoneBonus(levelNumber: number | undefined, isMilestone: boolean | undefined): number {
  if (!isMilestone || levelNumber === undefined) return 0;
  return MILESTONE_BONUS[levelNumber] ?? 0;
}

export interface WinPayout {
  total: number;
  stars: number;
  milestone: number;
  firstWinOfDay: number;
}

/**
 * The pearl payout for a won level: star payout + milestone bonus + First-Win-of-Day (once per UTC
 * day). Pure — returns the breakdown; `applyWin` folds it into the wallet.
 */
export function winPayout(
  econ: EconomyState,
  opts: { stars: number; levelNumber?: number; isMilestone?: boolean; utcDate: string },
): WinPayout {
  const stars = starPearls(opts.stars);
  const milestone = milestoneBonus(opts.levelNumber, opts.isMilestone);
  const firstWinOfDay = econ.lastFirstWinDate === opts.utcDate ? 0 : FIRST_WIN_OF_DAY;
  return { total: stars + milestone + firstWinOfDay, stars, milestone, firstWinOfDay };
}

/** Apply a win to the wallet (adds the payout, stamps the First-Win-of-Day date). */
export function applyWin(
  econ: EconomyState,
  opts: { stars: number; levelNumber?: number; isMilestone?: boolean; utcDate: string; collectiblePearls?: number },
): EconomyState {
  const payout = winPayout(econ, opts);
  return {
    ...econ,
    pearls: econ.pearls + payout.total + (opts.collectiblePearls ?? 0),
    lastFirstWinDate: opts.utcDate,
  };
}

export interface StreakUpdate {
  econ: EconomyState;
  broke: boolean; // the streak reset to 1
  held: boolean; // a freeze token saved the streak
  chestPearls: number; // streak-chest payout this update
}

/**
 * Register a day of daily play (spec 10 §5): advance the streak, or break it after
 * STREAK_BREAK_DAYS missed days (a freeze token holds it instead), and pay any streak chest reached.
 * `dayIndex(utcDate)` supplies a monotone integer day number (host computes it; avoids date math here).
 */
export function updateDailyStreak(econ: EconomyState, utcDate: string, dayNumber: number, lastDayNumber: number | null): StreakUpdate {
  let broke = false;
  let held = false;
  let streakCount = econ.streakCount;
  let freezeTokens = econ.freezeTokens;

  if (lastDayNumber === null) {
    streakCount = 1; // first ever play
  } else if (dayNumber === lastDayNumber) {
    // same day, no change to streak
  } else {
    const missed = dayNumber - lastDayNumber - 1; // days skipped between plays
    if (missed <= 0) {
      streakCount += 1; // consecutive day
    } else if (missed < STREAK_BREAK_DAYS) {
      streakCount += 1; // within grace window — streak survives
    } else if (freezeTokens > 0) {
      freezeTokens -= 1; // a freeze holds the streak through the gap
      streakCount += 1;
      held = true;
    } else {
      streakCount = 1; // broke
      broke = true;
    }
  }

  // Streak chest at the tiers, once each.
  let chestPearls = 0;
  const earned = [...econ.streakChestTiersEarned];
  const tier = STREAK_CHEST_TIERS[streakCount];
  if (tier !== undefined && !earned.includes(streakCount)) {
    chestPearls = tier;
    earned.push(streakCount);
  }

  return {
    econ: { ...econ, streakCount, freezeTokens, lastDailyDate: utcDate, pearls: econ.pearls + chestPearls, streakChestTiersEarned: earned },
    broke,
    held,
    chestPearls,
  };
}

/** Spend pearls if affordable (cosmetics, power-ups, freeze). Returns null if too poor. */
export function spendPearls(econ: EconomyState, amount: number): EconomyState | null {
  if (amount < 0 || econ.pearls < amount) return null;
  return { ...econ, pearls: econ.pearls - amount };
}

/** Add a freeze token, respecting the hold cap. */
export function grantFreezeToken(econ: EconomyState): EconomyState {
  return { ...econ, freezeTokens: Math.min(FREEZE_CAP, econ.freezeTokens + 1) };
}
