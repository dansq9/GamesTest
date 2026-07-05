/**
 * generator.ts — E0 tray generator.
 *
 * Implements the FROZEN draw order (spec 03 §1.2), minus the guided gap-fill gate and the
 * solvability floor, which arrive in E1. Draw sequence per hand:
 *
 *   for slot 0,1,2:  draw 1 → weighted piece pick
 *   for slot 0,1,2:  draw 1 → color pick            (separate trailing pass — spec 03 §1.2 invariant)
 *
 * DELIBERATE SPEC CHOICE (build-readiness B1): spec 02 §5 draws color inline per slot; spec 03 §1.2
 * draws all shapes then colors in a trailing pass. These produce different RNG streams. We follow
 * spec 03 — the determinism authority, which explicitly freezes this order and matches the prototype.
 * Doc 02 §5 should be reconciled to match.
 */

import type { Rng } from './rng.ts';
import { COLORS, PIECES, type Piece } from './pieces.ts';
import type { TrayPiece } from './state.ts';

const TOTAL_WEIGHT = PIECES.reduce((s, p) => s + p.weight, 0);

/** Weighted roulette selection over PIECES — exactly one draw. */
function pickPiece(rng: Rng): Piece {
  const target = rng.next() * TOTAL_WEIGHT;
  let acc = 0;
  for (const p of PIECES) {
    acc += p.weight;
    if (target < acc) return p;
  }
  return PIECES[PIECES.length - 1]!; // float-safety fallback; unreachable for target < TOTAL_WEIGHT
}

/** Color selection — exactly one draw (spec 03 §1.2: COLORS[floor(rng*5)]). */
function pickColor(rng: Rng) {
  return COLORS[Math.floor(rng.next() * COLORS.length)]!;
}

/** Generate a fresh 3-piece tray consuming 6 draws in the frozen order. */
export function generateTray(rng: Rng): TrayPiece[] {
  const shapes: Piece[] = [pickPiece(rng), pickPiece(rng), pickPiece(rng)];
  const colors = [pickColor(rng), pickColor(rng), pickColor(rng)];
  return shapes.map((p, i) => ({
    pieceId: p.id,
    cells: p.cells.map(([r, c]) => [r, c] as [number, number]),
    color: colors[i]!,
    placed: false,
  }));
}
