/**
 * dda.ts — Dynamic Difficulty Adjustment (spec 11).
 *
 * Modulates the EXISTING assist dials (gap-fill, pressure) from four per-player behavioral signals.
 * No new mechanics, no ML — four tracked numbers and three formulas. Asymmetric by design: it helps
 * struggling players far more than it challenges strong ones (dominating IS the experience for the
 * 45–65 audience). The solvability floor and rescue rule are NEVER touched.
 *
 * DETERMINISM (audit B2, spec 11 §4): the DDA reads the PlayerProfile — a pure function of past game
 * outcomes — and produces STATIC numbers before tray generation. It draws nothing from the game RNG.
 * The engine computes the deltas once at newGame and FREEZES them into GameState.dda, so
 * `same seed + same profile ⇒ same board`, and snapshot/restore reproduces exactly. In Seeded the
 * deltas are forced neutral, so every player sees the identical Daily board.
 */

import type { Fairness } from './state.ts';

export interface PlayerProfile {
  recentWinRate: number; // rolling win rate over the last N attempts (0..1)
  avgSlack: number; // rolling average finishing slack
  lossStreak: number; // consecutive failures; resets to 0 on any win
  sessionClears: number; // lines cleared this session
}

/** A fresh/median player — the neutral profile the authored curve is tuned for. */
export const NEUTRAL_PROFILE: PlayerProfile = { recentWinRate: 0.7, avgSlack: 0, lossStreak: 0, sessionClears: 0 };

/** The static difficulty deltas the DDA injects into the assist dials. */
export interface DdaDeltas {
  gapFillBoost: number; // added floor under the authored gap-fill probability
  pressureAdjust: number; // signed delta on the authored pressure dial
  comfortMode: boolean; // after a loss streak: maximally (but still fairly) assisted
}

export const NEUTRAL_DDA: DdaDeltas = { gapFillBoost: 0, pressureAdjust: 0, comfortMode: false };

const ROLLING_N = 10; // rolling window for recentWinRate [OPEN — product owner]
const COMFORT_LOSS_STREAK = 3; // comfort-mode trigger [OPEN]
const COMFORT_GAPFILL = 0.25; // comfort-mode gap-fill floor (validation gate G16.4 cap)

/** First-try win-rate target per chapter (spec 01 §4) — the DDA centers pressure on this. */
export function chapterWinRateTarget(chapter: string | undefined): number {
  switch (chapter) {
    case 'shallows':
      return 0.92;
    case 'reef':
      return 0.85;
    case 'deep':
      return 0.76;
    case 'openwater':
      return 0.68;
    default:
      return 0.85;
  }
}

/**
 * Compute the static DDA deltas for a game. Pure. Forced neutral in Seeded (leaderboard integrity),
 * and gentler in Fair (halved boost ceiling — those players opted for more challenge, spec 11 §3).
 */
export function computeDDA(profile: PlayerProfile, chapter: string | undefined, fairness: Fairness): DdaDeltas {
  if (fairness === 'seeded') return NEUTRAL_DDA;

  const comfortMode = profile.lossStreak >= COMFORT_LOSS_STREAK;

  // Gap-fill boost: only for struggling players; halved ceiling in Fair.
  const boostCeiling = fairness === 'fair' ? 0.08 : 0.15;
  let gapFillBoost = 0;
  if (profile.recentWinRate < 0.5 || profile.lossStreak >= 2) {
    gapFillBoost = boostCeiling * (1 - clamp(profile.recentWinRate, 0, 1));
  }

  // Pressure adjust: asymmetric — soften up to 0.15, tighten at most 0.10 (never a wall).
  const pressureAdjust = clamp(profile.recentWinRate - chapterWinRateTarget(chapter), -0.15, 0.1);

  return { gapFillBoost, pressureAdjust, comfortMode };
}

/** Merge the DDA deltas into an authored (gapFill, pressure) pair (spec 11 §2). */
export function applyDda(authoredGapFill: number, authoredPressure: number, dda: DdaDeltas): { gapFill: number; pressure: number } {
  if (dda.comfortMode) {
    // Maximally assisted next attempt — but still inside the solvability contract (handIsSafe runs).
    return { gapFill: Math.max(authoredGapFill, COMFORT_GAPFILL), pressure: 0.3 };
  }
  return {
    gapFill: Math.max(authoredGapFill, dda.gapFillBoost),
    pressure: clamp(authoredPressure + dda.pressureAdjust, 0.3, authoredPressure + 0.1),
  };
}

/** Update the profile from a finished game (spec 11 §1). Pure — the host persists the result. */
export function updateProfile(
  profile: PlayerProfile,
  result: { won: boolean; slack: number; linesCleared: number },
  n = ROLLING_N,
): PlayerProfile {
  const win = result.won ? 1 : 0;
  return {
    recentWinRate: (profile.recentWinRate * (n - 1) + win) / n,
    avgSlack: result.won ? lerp(profile.avgSlack, result.slack, 0.2) : profile.avgSlack,
    lossStreak: result.won ? 0 : profile.lossStreak + 1,
    sessionClears: profile.sessionClears + result.linesCleared,
  };
}

/** Reset per-session signals at session start (spec 11 §1). */
export function startSession(profile: PlayerProfile): PlayerProfile {
  return { ...profile, sessionClears: 0 };
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
