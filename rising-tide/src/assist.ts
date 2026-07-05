/**
 * assist.ts — the data-driven assist-fade curve (spec 01 §3, spec 02 §C).
 *
 * Replaces the prototype's two cliffs (assists fully on below L10 / off at/above, flat 0.55 gap-fill)
 * with smooth functions the generator reads:
 *   - gap-fill probability p_gap(L): strong in Ch1, linear to 0 by L13, +teach/+milestone bonuses.
 *   - pressure-dial strength s_p(chapter): relaxes over chapters but never reaches 0.
 *   - solvability floor: constant 1.0 forever (that lives in the generator, not here).
 *
 * ZEN stays deliberately calm and does NOT fade: it keeps the strongest board-opening dial plus a
 * gentle finisher aid, with no goal/tide to inflate (product-owner direction, spec 08 §I ZN1).
 */

import type { Fairness, Surface } from './state.ts';
import { applyDda, NEUTRAL_DDA, type DdaDeltas } from './dda.ts';

export interface Assist {
  gapFill: number; // guided slot-0 finisher gate probability (0 = off)
  pressure: number; // s_p ∈ (0,1]: anti-flood dial strength; never 0 (spec 01 §3b)
}

export interface AssistInput {
  surface: Surface;
  fairness: Fairness;
  chapter?: string; // level chapter → pressure dial
  levelNumber?: number; // level ordinal 1..40 → gap-fill curve
  milestone?: boolean;
  teach?: boolean; // level where the assist is the lesson (+teachBonus)
  gamesPlayed?: number; // lifetime; drives the endless/zen assist index
  dda?: DdaDeltas; // frozen DDA deltas for the game (spec 11); omitted → neutral
}

/** Pressure-dial strength per chapter (spec 01 §3b). Never 0 — the anti-flood instinct stays on. */
export function pressureForChapter(chapter: string | undefined, surface: Surface): number {
  if (surface === 'zen') return 1.0; // calmest surface: strongest board-opening posture
  switch (chapter) {
    case 'shallows':
      return 1.0;
    case 'reef':
      return 0.75;
    case 'deep':
      return 0.55;
    case 'openwater':
      return 0.4;
    case 'endless':
      return 0.4;
    default:
      return 0.6; // non-voyage surfaces (tide/blitz) with no chapter
  }
}

/** Gap-fill probability p_gap(L) (spec 01 §3a). Linear from 0.60 at L1, hits 0 at L13. */
export function pGap(levelNumber: number, milestone = false, teach = false): number {
  const base = clamp(0.6 - 0.05 * (levelNumber - 1), 0, 0.6);
  const withBonus = base + (teach ? 0.1 : 0) + (milestone ? 0.2 : 0);
  return clamp(withBonus, 0, 0.6);
}

/**
 * Assist index for endless/zen replays of early content: a veteran replaying L2 is not over-helped
 * (spec 01 §3 "assistIndex"). Blends toward the fade tail as lifetime games rise.
 */
function assistIndexFromGames(gamesPlayed = 0): number {
  return Math.max(1, Math.min(gamesPlayed, 20));
}

export function assistFor(input: AssistInput): Assist {
  const authoredPressure = pressureForChapter(input.chapter, input.surface);
  const dda = input.dda ?? NEUTRAL_DDA;

  // Zen: gentle, non-fading finisher aid (calm surface, no DDA).
  if (input.surface === 'zen') return { gapFill: 0.3, pressure: authoredPressure };

  // Authored gap-fill: the fading curve in Guided; none in Fair/Seeded.
  const authoredGapFill =
    input.fairness === 'guided' ? pGap(input.levelNumber ?? assistIndexFromGames(input.gamesPlayed), input.milestone, input.teach) : 0;

  // The DDA modulates the authored dials (neutral in Seeded → identical to authored).
  return applyDda(authoredGapFill, authoredPressure, dda);
}

/** No-flood (never three ≥4-cell pieces) applies everywhere except pure Seeded (spec 03 §3). */
export function noFloodFor(fairness: Fairness): boolean {
  return fairness !== 'seeded';
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}
