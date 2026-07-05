/**
 * assist.ts — assist posture per surface/fairness (E1 placeholder).
 *
 * The full data-driven assist-fade curve (gap-fill p_gap(L) tapering to 0 by L13, per-chapter
 * pressure s_p, milestone bonuses) is E2 (spec 01 §3, spec 02 §C). E1 uses coarse per-fairness
 * constants so the generator's pressure dial + gap-fill have inputs to run and be tested.
 *
 * ZEN = genuinely calmer (product-owner direction): calm is delivered by GENERATION posture — the
 * kindest pressure dial (keep the board open) plus a light gap-fill aid — NOT by inflating targets.
 * Zen has no goal and no tide (see engine), so there is no score/number to inflate in the first place.
 */

import type { Fairness, Surface } from './state.ts';

export interface Assist {
  /** Probability the guided slot-0 gate offers a line finisher (0 = off). */
  gapFill: number;
  /** Pressure-dial strength s_p ∈ (0,1]: 1 = strongest anti-flood bias, never 0 (spec 01 §3b). */
  pressure: number;
}

export function assistFor(surface: Surface, fairness: Fairness): Assist {
  // Zen is the calmest surface: strongest board-opening posture + a gentle finisher aid.
  if (surface === 'zen') return { gapFill: 0.3, pressure: 1.0 };

  switch (fairness) {
    case 'guided':
      return { gapFill: 0.5, pressure: 1.0 };
    case 'fair':
      return { gapFill: 0, pressure: 0.6 };
    case 'seeded':
      return { gapFill: 0, pressure: 0.5 };
  }
}

/** No-flood (never three ≥4-cell pieces) applies everywhere except pure Seeded (spec 03 §3). */
export function noFloodFor(fairness: Fairness): boolean {
  return fairness !== 'seeded';
}
