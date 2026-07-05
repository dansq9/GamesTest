/**
 * levels.ts — the voyage level registry.
 *
 * LevelDefs are STATIC content, not serialized: snapshots store only `levelId` and rehydrate
 * from here (spec 02 §7). The 40-level table is authored in E3; E0 ships an empty registry plus
 * a couple of fixtures so voyage games can be constructed and resumed in tests.
 */

import type { LevelDef } from './state.ts';

/** E0 fixtures — not the real content. The authored 40-level voyage lands in E3 (spec 01). */
export const LEVELS: readonly LevelDef[] = [
  { id: 'e0-lines', name: 'First Lines', chapter: 'shallows', goal: 'lines', target: 3, fairness: 'guided', nextName: 'First Score' },
  { id: 'e0-score', name: 'First Score', chapter: 'shallows', goal: 'score', target: 500, moveLimit: 20, fairness: 'guided' },
  { id: 'e0-survive', name: 'First Tide', chapter: 'reef', goal: 'survive', target: 4, fairness: 'fair', tideRate: 1.0 },
] as const;

const BY_ID = new Map(LEVELS.map((l) => [l.id, l]));

export function levelById(id: string): LevelDef | undefined {
  return BY_ID.get(id);
}
