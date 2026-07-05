/**
 * starbands.ts — 3/2/1-star resolution (spec 09).
 *
 * Stars are encouragement, not a skill filter: the design target is most completions earn 2–3 stars,
 * 3★ is reachable by a median casual, 1★ is a rare sloppy clear. ONE metric per goal, dispatched by
 * goal-type then move-limit (spec 09 §1.1). Resolved at WIN-TIME ONLY (never a mid-level HUD element).
 *
 * The cutoffs here are the DESIGN-TIME SEEDS (tagged [OPEN]); at ship they are refit from the
 * CasualBot(0.55) metric percentiles and frozen into `LevelDef.starBands` (spec 09 §4, an E7 pass).
 * If a level carries `starBands`, that fitted override wins.
 */

import type { LevelDef } from './state.ts';

export type StarMetric = 'movesUsed' | 'endFillPct' | 'survivalMargin' | 'scoreRate' | 'movesToWin';

/** Optional sim-fitted per-level override (spec 09 §4): cutoffs for 3★ and 2★ on `metric`. */
export interface StarBands {
  metric: StarMetric;
  three: number;
  two: number;
  higherIsBetter: boolean;
}

export interface StarInput {
  goal: LevelDef['goal'];
  chapter: string;
  target: number;
  moveLimit: number;
  movesUsed: number;
  maxTide: number;
  endFillPct: number;
  score: number;
  turns: number;
  hasBonus: boolean;
}

export interface StarResult {
  stars: number;
  metric: StarMetric;
  value: number;
}

// ── design-time seeds (spec 09 §1–2; refit by the E7 sim) ─────────────────────
function costPerLine(chapter: string): number {
  switch (chapter) {
    case 'shallows':
      return 1.3;
    case 'reef':
      return 1.6;
    case 'deep':
      return 1.8;
    default:
      return 2.0;
  }
}
function cushionB3(chapter: string): number {
  return chapter === 'shallows' || chapter === 'reef' ? 1 : 0;
}
const C3 = 1.15; // 3★ factor for gather/multi/combo (spec 09 §1.8 seed)
const C2 = 1.6; // 2★ factor

/** Expected-moves-to-win seed for a level's goal (spec 09 §1.2/§1.3/§1.5/§1.6/§1.7). */
function emwSeed(input: StarInput): number {
  switch (input.goal) {
    case 'lines':
      return Math.round(costPerLine(input.chapter) * input.target + 1);
    case 'score':
      return Math.round(input.target / (input.hasBonus ? 240 : 200));
    case 'multi':
      return Math.round(2.0 * input.target + 1);
    case 'combo':
      return Math.round(1.5 * input.target + 1);
    case 'collect':
    case 'barnacle':
      return Math.round(1.5 * input.target + 1);
    default:
      return Math.round(costPerLine(input.chapter) * input.target + 1);
  }
}

function band(value: number, three: number, two: number, higherIsBetter: boolean): number {
  if (higherIsBetter) return value >= three ? 3 : value >= two ? 2 : 1;
  return value <= three ? 3 : value <= two ? 2 : 1;
}

/** Resolve stars for a won level (spec 09 §1.1 precedence). */
export function resolveStars(level: LevelDef, input: StarInput): StarResult {
  // Sim-fitted override wins if present.
  if (level.starBands) {
    const b = level.starBands;
    const value =
      b.metric === 'movesUsed' || b.metric === 'movesToWin'
        ? input.movesUsed
        : b.metric === 'endFillPct'
          ? input.endFillPct
          : b.metric === 'survivalMargin'
            ? 8 - input.maxTide
            : input.score / Math.max(1, input.turns);
    return { stars: band(value, b.three, b.two, b.higherIsBetter), metric: b.metric, value };
  }

  const b3 = cushionB3(input.chapter);

  // 1. survive → survival margin M = 8 − maxTide (higher is better).
  if (input.goal === 'survive') {
    const M = 8 - input.maxTide;
    return { stars: band(M, 3.0, 1.5, true), metric: 'survivalMargin', value: M };
  }

  // 2. score → score/turn rate, expressed in turns form (lower turns is better).
  if (input.goal === 'score') {
    const emw = emwSeed(input);
    const stars = band(input.turns, emw + b3, input.moveLimit - 1, false);
    return { stars, metric: 'scoreRate', value: input.score / Math.max(1, input.turns) };
  }

  // 3. move-limited lines → movesUsed (lower is better).
  if (input.moveLimit > 0) {
    const emw = emwSeed(input);
    return { stars: band(input.movesUsed, emw + b3, input.moveLimit - 1, false), metric: 'movesUsed', value: input.movesUsed };
  }

  // 4. multi / combo / collect / barnacle → moves-to-win (lower is better).
  if (input.goal === 'multi' || input.goal === 'combo' || input.goal === 'collect' || input.goal === 'barnacle') {
    const emw = emwSeed(input);
    return { stars: band(input.movesUsed, Math.ceil(emw * C3), Math.ceil(emw * C2), false), metric: 'movesToWin', value: input.movesUsed };
  }

  // 5. unlimited-move lines → end-fill % (lower is better).
  return { stars: band(input.endFillPct, 0.25, 0.45, false), metric: 'endFillPct', value: input.endFillPct };
}
