/**
 * levels.ts — the 40-level voyage (spec 01 §1).
 *
 * LevelDefs are STATIC content: snapshots store only `levelId` and rehydrate from here (spec 02 §7).
 * Chapter keys are lowercase ('shallows'|'reef'|'deep'|'openwater') to drive the pressure dial
 * (assist.ts). Element counts are E3a recommendations [OPEN — sim-calibrate in E7]; collect/barnacle
 * targets are backed by enough seeded elements to be reachable.
 *
 * Element mapping from doc 01's table to engine ids: coral→'coral2'; deepTide→a level `tideRate`
 * (not a cell element). Anchor / current / storm are authored here but their BEHAVIOR is a later E3
 * slice — E3a seeds only barnacle/coral2/pearl/bonus, so anchor/current/storm levels currently play
 * as clean boards (flagged in the engine README).
 */

import type { ElementSpec, LevelDef } from './state.ts';

const barnacle = (count: number): ElementSpec => ({ kind: 'barnacle', count });
const coral = (count: number): ElementSpec => ({ kind: 'coral2', count });
const pearl = (count: number): ElementSpec => ({ kind: 'pearl', count });
const bonus = (count: number): ElementSpec => ({ kind: 'bonus', count });
const anchor = (count = 4): ElementSpec => ({ kind: 'anchor', count, params: { turns: 5 } });
const current = (): ElementSpec => ({ kind: 'current', count: 1, params: { dir: 1, strength: 1 } });
const storm = (): ElementSpec => ({ kind: 'storm', count: 1, params: { everyTurns: 8, magnitude: 3 } });

export const LEVELS: readonly LevelDef[] = [
  // ── Chapter 1 · The Shallows (guided) ──
  { id: 'l1', n: 1, name: 'First Steps', chapter: 'shallows', goal: 'lines', target: 1, fairness: 'guided', nextName: 'Find the Line' },
  { id: 'l2', n: 2, name: 'Find the Line', chapter: 'shallows', goal: 'lines', target: 3, fairness: 'guided', nextName: 'Keep Going' },
  { id: 'l3', n: 3, name: 'Keep Going', chapter: 'shallows', goal: 'lines', target: 5, fairness: 'guided', nextName: 'Double Up' },
  { id: 'l4', n: 4, name: 'Double Up', chapter: 'shallows', goal: 'multi', target: 2, fairness: 'guided', teachAssist: true, nextName: 'Combo Starter' },
  { id: 'l5', n: 5, name: 'Combo Starter', chapter: 'shallows', goal: 'combo', target: 2, fairness: 'guided', teachAssist: true, nextName: 'Tidal Pool' },
  { id: 'l6', n: 6, name: 'Tidal Pool', chapter: 'shallows', goal: 'survive', target: 4, fairness: 'guided', tideRate: 1.0, nextName: 'Efficiency' },
  { id: 'l7', n: 7, name: 'Efficiency', chapter: 'shallows', goal: 'lines', target: 4, moveLimit: 8, fairness: 'guided', nextName: 'Foundations' },
  { id: 'l8', n: 8, name: 'Foundations', chapter: 'shallows', goal: 'lines', target: 8, fairness: 'guided', nextName: 'Rising Waters' },
  { id: 'l9', n: 9, name: 'Rising Waters', chapter: 'shallows', goal: 'survive', target: 6, fairness: 'guided', tideRate: 1.0, nextName: 'Tight Quarters' },
  { id: 'l10', n: 10, name: 'Tight Quarters', chapter: 'shallows', goal: 'lines', target: 5, moveLimit: 12, fairness: 'guided', milestone: true, nextName: 'Barnacle Bay' },

  // ── Chapter 2 · The Reef (fair) ──
  { id: 'l11', n: 11, name: 'Barnacle Bay', chapter: 'reef', goal: 'lines', target: 4, fairness: 'fair', elements: [barnacle(4)], nextName: 'Scrub the Hull' },
  { id: 'l12', n: 12, name: 'Scrub the Hull', chapter: 'reef', goal: 'barnacle', target: 6, fairness: 'fair', elements: [barnacle(6)], nextName: 'Triple Crest' },
  { id: 'l13', n: 13, name: 'Triple Crest', chapter: 'reef', goal: 'multi', target: 3, fairness: 'fair', nextName: 'Coral Shelf' },
  { id: 'l14', n: 14, name: 'Coral Shelf', chapter: 'reef', goal: 'lines', target: 5, fairness: 'fair', elements: [coral(3)], nextName: 'Coral Garden' },
  { id: 'l15', n: 15, name: 'Coral Garden', chapter: 'reef', goal: 'collect', target: 5, fairness: 'fair', elements: [coral(5)], nextName: 'Reef Rhythm' },
  { id: 'l16', n: 16, name: 'Reef Rhythm', chapter: 'reef', goal: 'lines', target: 6, moveLimit: 14, fairness: 'fair', nextName: 'Open Shallows' },
  { id: 'l17', n: 17, name: 'Open Shallows', chapter: 'reef', goal: 'combo', target: 3, fairness: 'fair', nextName: 'Pearl Cove' },
  { id: 'l18', n: 18, name: 'Pearl Cove', chapter: 'reef', goal: 'collect', target: 4, fairness: 'fair', elements: [pearl(6)], nextName: 'Pearl Diver' },
  { id: 'l19', n: 19, name: 'Pearl Diver', chapter: 'reef', goal: 'collect', target: 6, fairness: 'fair', elements: [pearl(8)], nextName: 'The Reef Guardian' },
  { id: 'l20', n: 20, name: 'The Reef Guardian', chapter: 'reef', goal: 'lines', target: 6, fairness: 'fair', elements: [barnacle(4), coral(2)], milestone: true, nextName: 'Into the Deep' },

  // ── Chapter 3 · The Deep (fair) ──
  { id: 'l21', n: 21, name: 'Into the Deep', chapter: 'deep', goal: 'survive', target: 5, fairness: 'fair', tideRate: 1.35, nextName: "Anchor's Hold" },
  { id: 'l22', n: 22, name: "Anchor's Hold", chapter: 'deep', goal: 'lines', target: 5, fairness: 'fair', elements: [anchor()], nextName: 'Gold Rush' },
  { id: 'l23', n: 23, name: 'Gold Rush', chapter: 'deep', goal: 'score', target: 3000, moveLimit: 18, fairness: 'fair', nextName: 'Locked Reef' },
  { id: 'l24', n: 24, name: 'Locked Reef', chapter: 'deep', goal: 'lines', target: 6, fairness: 'fair', elements: [anchor()], nextName: 'Narrow Passage' },
  { id: 'l25', n: 25, name: 'Narrow Passage', chapter: 'deep', goal: 'lines', target: 7, moveLimit: 16, fairness: 'fair', nextName: 'The Current' },
  { id: 'l26', n: 26, name: 'The Current', chapter: 'deep', goal: 'lines', target: 5, fairness: 'fair', elements: [current()], nextName: 'Drift' },
  { id: 'l27', n: 27, name: 'Drift', chapter: 'deep', goal: 'lines', target: 6, fairness: 'fair', elements: [current()], nextName: 'Deep Water' },
  { id: 'l28', n: 28, name: 'Deep Water', chapter: 'deep', goal: 'survive', target: 8, fairness: 'fair', tideRate: 1.35, nextName: 'Treasure Hunt' },
  { id: 'l29', n: 29, name: 'Treasure Hunt', chapter: 'deep', goal: 'collect', target: 8, fairness: 'fair', elements: [pearl(10)], nextName: 'The Abyss' },
  { id: 'l30', n: 30, name: 'The Abyss', chapter: 'deep', goal: 'lines', target: 8, fairness: 'fair', elements: [anchor(), current()], milestone: true, nextName: 'Bright Shoals' },

  // ── Chapter 4 · Open Water (fair) ──
  { id: 'l31', n: 31, name: 'Bright Shoals', chapter: 'openwater', goal: 'lines', target: 5, fairness: 'fair', elements: [bonus(3)], nextName: 'Multiplier Reef' },
  { id: 'l32', n: 32, name: 'Multiplier Reef', chapter: 'openwater', goal: 'score', target: 4000, moveLimit: 20, fairness: 'fair', elements: [bonus(3)], nextName: 'Open Passage' },
  { id: 'l33', n: 33, name: 'Open Passage', chapter: 'openwater', goal: 'lines', target: 8, moveLimit: 18, fairness: 'fair', nextName: 'High Seas' },
  { id: 'l34', n: 34, name: 'High Seas', chapter: 'openwater', goal: 'survive', target: 9, fairness: 'fair', tideRate: 1.4, nextName: 'Pearl Fields' },
  { id: 'l35', n: 35, name: 'Pearl Fields', chapter: 'openwater', goal: 'collect', target: 9, fairness: 'fair', elements: [pearl(11)], nextName: 'Squall' },
  { id: 'l36', n: 36, name: 'Squall', chapter: 'openwater', goal: 'lines', target: 5, fairness: 'fair', elements: [storm()], nextName: 'Weathering' },
  { id: 'l37', n: 37, name: 'Weathering', chapter: 'openwater', goal: 'lines', target: 6, fairness: 'fair', elements: [storm()], nextName: 'Deep Gold' },
  { id: 'l38', n: 38, name: 'Deep Gold', chapter: 'openwater', goal: 'score', target: 4500, moveLimit: 22, fairness: 'fair', elements: [bonus(3)], nextName: 'Cascade' },
  { id: 'l39', n: 39, name: 'Cascade', chapter: 'openwater', goal: 'combo', target: 4, fairness: 'fair', nextName: 'The Open Sea' },
  { id: 'l40', n: 40, name: 'The Open Sea', chapter: 'openwater', goal: 'lines', target: 10, fairness: 'fair', elements: [bonus(3)], milestone: true },
] as const;

const BY_ID = new Map(LEVELS.map((l) => [l.id, l]));

export function levelById(id: string): LevelDef | undefined {
  return BY_ID.get(id);
}

/** Look up a level by its 1..40 ordinal. */
export function levelByNumber(n: number): LevelDef | undefined {
  return LEVELS.find((l) => l.n === n);
}
