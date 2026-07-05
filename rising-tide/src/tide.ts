/**
 * tide.ts — the tide model (spec 01 §5, spec 02 §4 step 5). Pure.
 *
 * Rise schedule (prototype, per PLACEMENT/turn):
 *   turns ≤ 10 → 0.25 | ≤ 30 → 0.5 | ≤ 60 → 0.75 | else → 1.0
 * Per-level `tideRate` multiplies the rise so "deep tide" is data, not a code fork (spec 01 §5).
 * On a clear, tide falls by N*1.5 (clamped ≥ 0). Drown occurs at tide ≥ 8 (checked in engine).
 *
 * `tideRises` accrues on UPWARD integer floor crossings and never decreases; `prevTideFloor`
 * tracks the last-seen floor, up or down (spec 02 §3). This is the survive-goal progress metric.
 *
 * Phase thresholds are [OPEN — product owner]: chosen against the 8-cap for a calm→drowning ramp.
 */

import { BOARD_SIZE, type TidePhase } from './state.ts';

export const TIDE_CAP = BOARD_SIZE; // drown at ≥ 8

export function riseFor(turns: number): number {
  if (turns <= 10) return 0.25;
  if (turns <= 30) return 0.5;
  if (turns <= 60) return 0.75;
  return 1.0;
}

export function phaseFor(tide: number): TidePhase {
  if (tide < 3) return 'calm';
  if (tide < 5) return 'rising';
  if (tide < 7) return 'critical';
  return 'drowning';
}

export interface TideState {
  tide: number;
  tidePhase: TidePhase;
  tideRises: number;
  prevTideFloor: number;
}

/**
 * Advance the tide for one placement. `turns` is the post-increment turn count for this placement.
 * Pure: returns the next tide sub-state; caller writes it back.
 */
export function applyTide(prev: TideState, turns: number, linesCleared: number, tideRate = 1.0): TideState {
  let tide = prev.tide + riseFor(turns) * tideRate;
  if (linesCleared > 0) tide -= linesCleared * 1.5;
  if (tide < 0) tide = 0;

  const newFloor = Math.floor(tide);
  const risesAdded = newFloor > prev.prevTideFloor ? newFloor - prev.prevTideFloor : 0;

  return {
    tide,
    tidePhase: phaseFor(tide),
    tideRises: prev.tideRises + risesAdded,
    prevTideFloor: newFloor,
  };
}
