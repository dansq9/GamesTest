/**
 * scoring.ts — the scoring formula (spec 01 §5), unchanged from the prototype.
 *
 *   if (N > 0) pts = N*N*cellsCleared*10 + combo*50
 *
 * N = number of lines cleared this placement (quadratic — rewards multi-clears).
 * combo = the consecutive-clearing streak AFTER this placement increments it.
 * No time/speed bonus anywhere (non-negotiable #3: never a clock).
 *
 * NOTE (build-readiness S6): specials/bonus-tile multipliers compose ON TOP of this base in E3.
 * This function is the base term and is intentionally the single source of the base score.
 */

export function scorePlacement(linesCleared: number, cellsCleared: number, combo: number): number {
  if (linesCleared <= 0) return 0;
  return linesCleared * linesCleared * cellsCleared * 10 + combo * 50;
}
