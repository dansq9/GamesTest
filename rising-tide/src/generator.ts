/**
 * generator.ts — the ContextualGenerator (spec 02 §6, spec 03 §2–4).
 *
 * Produces exactly 3 tray pieces that are collectively SAFE (a full 3-placement witness exists,
 * spec 03 §2) whenever any safe hand exists. Composes weighted roulette + pressure dial + no-flood +
 * gap-fill, validated by the safety floor. In GUIDED above F_rescue it strengthens the guarantee to
 * global un-losability (spec 03 §4.3): the served hand must be CLEARING (a witness clears ≥1 line)
 * and within the fill ceiling F_cap, so the board can never ratchet into a dead state.
 *
 * FROZEN DRAW ORDER (spec 03 §1.2) — the determinism contract:
 *   for slot 0,1,2:
 *     if guided/zen slot 0 with gapFill>0:  draw the gate (ALWAYS, even if it declines)
 *     if piece not chosen by gate:          draw 1 weighted pick
 *     while !fitsAnywhere && retries<CAP:    draw 1 re-roll each
 *   for slot 0,1,2:  draw 1 color            (separate trailing pass)
 */

import type { Rng } from './rng.ts';
import { fillPct, fitsAnywhere } from './board.ts';
import { COLORS, PIECES, pieceById, pieceSize, type ColorId, type Piece } from './pieces.ts';
import { handCanClear, handIsSafe, minEndFill, safeFallbackShapes } from './solvability.ts';
import { BOARD_SIZE, type Board, type Fairness, type Surface, type TrayPiece } from './state.ts';
import { assistFor, noFloodFor, type Assist, type AssistInput } from './assist.ts';

/** Bounded re-roll cap for whole-hand rejection (spec 03 §2.3). */
const RETRY_CAP = 8;
/** Per-slot fitness re-roll cap (prototype ≤10; keep bounded). */
const FIT_RETRY_CAP = 10;
/** Guided rescue threshold: at/above this fill, the served hand must be able to clear (spec 03 §4.3). */
const F_RESCUE = 0.72;
/** Guided fill ceiling: reject hands whose minimum end-of-hand fill exceeds this (spec 03 §4.3). */
const F_CAP = 0.8;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

export interface GenContext {
  surface: Surface;
  fairness: Fairness;
  assist: Assist;
  noFlood: boolean;
  rng: Rng;
}

export function contextFor(input: AssistInput & { rng: Rng }): GenContext {
  return {
    surface: input.surface,
    fairness: input.fairness,
    assist: assistFor(input),
    noFlood: noFloodFor(input.fairness),
    rng: input.rng,
  };
}

/** Per-slot cell cap as the board fills (spec 03 §3 pressure thresholds 0.60 / 0.78). */
function cellCap(fill: number): number {
  if (fill > 0.78) return 2;
  if (fill > 0.6) return 3;
  return 5;
}

/** Pressure-adjusted weight for one piece (spec 01 §3b, spec 03 §3). */
function adjustedWeight(p: Piece, fill: number, pressure: number, cap: number): number {
  if (pieceSize(p) > cap) return 0;
  let w = p.weight;
  if (fill > 0.6) {
    if (pieceSize(p) >= 4) w *= 1 - 0.78 * pressure;
    else if (pieceSize(p) <= 2) w *= 1 + 1.4 * pressure;
  }
  if (fill > 0.78 && pieceSize(p) >= 3) w *= 0.35;
  return w;
}

/** Weighted roulette over pressure-adjusted weights — exactly one draw. */
function weightedPick(rng: Rng, fill: number, pressure: number, cap: number): Piece {
  let total = 0;
  const weights = PIECES.map((p) => {
    const w = adjustedWeight(p, fill, pressure, cap);
    total += w;
    return w;
  });
  if (total <= 0) return pieceById('dot');
  const target = rng.next() * total;
  let acc = 0;
  for (let i = 0; i < PIECES.length; i++) {
    acc += weights[i]!;
    if (target < acc) return PIECES[i]!;
  }
  return PIECES[PIECES.length - 1]!;
}

/** A ≤2-cell finisher for a line that is one cell from full — pure scan, zero draws (spec 03 §3). */
function gapFillPiece(board: Board): Piece | null {
  const n = board.length;
  for (let r = 0; r < n; r++) {
    let empty = 0;
    for (let c = 0; c < n; c++) if (board[r]![c] === null) empty++;
    if (empty === 1) return pieceById('dot');
  }
  for (let c = 0; c < n; c++) {
    let empty = 0;
    for (let r = 0; r < n; r++) if (board[r]![c] === null) empty++;
    if (empty === 1) return pieceById('dot');
  }
  return null;
}

/** Roll a candidate 3-shape hand in the frozen draw order (colors are a separate pass). */
function rollShapes(board: Board, ctx: GenContext, fill: number): Piece[] {
  const cap = cellCap(fill);
  // In Guided rescue territory, always try to offer a finisher (gate prob → 1) to satisfy the
  // clearing requirement; the gate draw is still consumed for determinism.
  const rescueMode = ctx.fairness === 'guided' && fill >= F_RESCUE;
  const gapFillProb = rescueMode ? 1 : ctx.assist.gapFill;

  const shapes: Piece[] = [];
  let bigCount = 0;

  for (let i = 0; i < 3; i++) {
    const effCap = ctx.noFlood && bigCount >= 2 ? Math.min(cap, 3) : cap;
    let piece: Piece | null = null;

    const gateActive = i === 0 && gapFillProb > 0 && (ctx.fairness === 'guided' || ctx.surface === 'zen');
    if (gateActive) {
      const gate = ctx.rng.next(); // ALWAYS consumed (spec 03 §1.2 invariant)
      if (gate < gapFillProb) {
        const gf = gapFillPiece(board);
        if (gf && pieceSize(gf) <= effCap) piece = gf;
      }
    }

    if (!piece) piece = weightedPick(ctx.rng, fill, ctx.assist.pressure, effCap);

    let retries = 0;
    while (!fitsAnywhere(board, piece.cells) && retries < FIT_RETRY_CAP) {
      piece = weightedPick(ctx.rng, fill, ctx.assist.pressure, effCap);
      retries++;
    }

    shapes.push(piece);
    if (pieceSize(piece) >= 4) bigCount++;
  }
  return shapes;
}

/** Trailing color pass — one draw per slot (spec 03 §1.2). */
function withColors(shapes: Piece[], rng: Rng): TrayPiece[] {
  const colors: ColorId[] = shapes.map(() => COLORS[Math.floor(rng.next() * COLORS.length)]!);
  return shapes.map((p, i) => ({
    pieceId: p.id,
    cells: p.cells.map(([r, c]) => [r, c] as [number, number]),
    color: colors[i]!,
    placed: false,
  }));
}

/**
 * Acceptance test: per-hand safety normally; in Guided at/above F_rescue, the stronger rescue +
 * fill-ceiling guarantee (spec 03 §4.3).
 */
function isAcceptable(board: Board, shapes: Piece[], ctx: GenContext, fill: number): boolean {
  if (ctx.fairness === 'guided' && fill >= F_RESCUE) {
    return handCanClear(board, shapes) && minEndFill(board, shapes) <= F_CAP * TOTAL_CELLS;
  }
  return handIsSafe(board, shapes);
}

/**
 * Generate a safe 3-piece tray. Rejection-samples up to RETRY_CAP acceptable hands, then falls back
 * to a constructive safe prefix — so generation ALWAYS terminates and returns a safe hand whenever
 * one exists (spec 03 §2.5–2.6, §4.3). The fallback guarantees per-hand safety; on the rare board
 * where no clearing hand is found within the cap, safety still holds (no unavoidable death).
 */
export function generateTray(rng: Rng, board: Board, ctx: GenContext): TrayPiece[] {
  const fill = fillPct(board);
  for (let attempt = 0; attempt <= RETRY_CAP; attempt++) {
    const shapes = rollShapes(board, ctx, fill);
    if (isAcceptable(board, shapes, ctx, fill)) return withColors(shapes, rng);
  }
  return withColors(safeFallbackShapes(board, PIECES), rng);
}
