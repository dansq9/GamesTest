/**
 * generator.ts — the ContextualGenerator (spec 02 §6, spec 03 §2–3).
 *
 * Produces exactly 3 tray pieces that are collectively SAFE (a full 3-placement witness exists,
 * spec 03 §2) whenever any safe hand exists for the board. Composes:
 *   - weighted roulette pick, biased by the pressure dial (spec 01 §3b)
 *   - no-flood guard (never three ≥4-cell pieces outside Seeded, spec 03 §3)
 *   - gap-fill finisher (guided slot-0 gate, spec 03 §3)
 *   - per-hand safety validation + guaranteed-terminating constructive fallback (spec 03 §2.5)
 *
 * FROZEN DRAW ORDER (spec 03 §1.2) — the determinism contract:
 *   for slot 0,1,2:
 *     if guided/zen slot 0 with gapFill>0:  draw the gate (ALWAYS, even if it declines)
 *     if piece not chosen by gate:          draw 1 weighted pick
 *     while !fitsAnywhere && retries<CAP:    draw 1 re-roll each
 *   for slot 0,1,2:  draw 1 color            (separate trailing pass)
 * A whole-hand re-roll (safety) re-runs this sequence; the fallback draws nothing but colors.
 */

import type { Rng } from './rng.ts';
import { fitsAnywhere } from './board.ts';
import { COLORS, PIECES, pieceById, pieceSize, type ColorId, type Piece } from './pieces.ts';
import { handIsSafe, safeFallbackShapes } from './solvability.ts';
import type { Board, Fairness, Surface, TrayPiece } from './state.ts';
import { assistFor, noFloodFor, type Assist } from './assist.ts';
import { fillPct } from './board.ts';

/** Bounded re-roll cap for whole-hand safety rejection (spec 03 §2.3). */
const RETRY_CAP = 8;
/** Per-slot fitness re-roll cap (prototype ≤10; keep bounded). */
const FIT_RETRY_CAP = 10;

export interface GenContext {
  surface: Surface;
  fairness: Fairness;
  assist: Assist;
  noFlood: boolean;
  rng: Rng;
}

export function contextFor(surface: Surface, fairness: Fairness, rng: Rng): GenContext {
  return { surface, fairness, assist: assistFor(surface, fairness), noFlood: noFloodFor(fairness), rng };
}

/** Per-slot cell cap as the board fills (spec 03 §3 pressure thresholds 0.60 / 0.78). */
function cellCap(fill: number): number {
  if (fill > 0.78) return 2;
  if (fill > 0.6) return 3;
  return 5; // our largest shapes are 5 cells; no cap on an open board
}

/** Pressure-adjusted weight for one piece (spec 01 §3b, spec 03 §3). */
function adjustedWeight(p: Piece, fill: number, pressure: number, cap: number): number {
  if (pieceSize(p) > cap) return 0;
  let w = p.weight;
  if (fill > 0.6) {
    if (pieceSize(p) >= 4) w *= 1 - 0.78 * pressure; // big pieces suppressed
    else if (pieceSize(p) <= 2) w *= 1 + 1.4 * pressure; // small pieces boosted
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
  if (total <= 0) return pieceById('dot'); // fully capped board → dot (always smallest)
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
function rollShapes(board: Board, ctx: GenContext): Piece[] {
  const fill = fillPct(board);
  const cap = cellCap(fill);
  const shapes: Piece[] = [];
  let bigCount = 0; // ≥4-cell pieces drawn so far (no-flood tracking)

  for (let i = 0; i < 3; i++) {
    // Effective cap tightens once two big pieces are out (no-flood).
    const effCap = ctx.noFlood && bigCount >= 2 ? Math.min(cap, 3) : cap;

    let piece: Piece | null = null;

    // Gap-fill gate — guided (or calm zen) slot 0 only. The gate draw is ALWAYS consumed so the
    // stream position never depends on board contents (spec 03 §1.2 invariant).
    const gateActive = i === 0 && ctx.assist.gapFill > 0 && (ctx.fairness === 'guided' || ctx.surface === 'zen');
    if (gateActive) {
      const gate = ctx.rng.next();
      if (gate < ctx.assist.gapFill) {
        const gf = gapFillPiece(board);
        if (gf && pieceSize(gf) <= effCap) piece = gf; // 0 draws (pure scan)
      }
    }

    if (!piece) piece = weightedPick(ctx.rng, fill, ctx.assist.pressure, effCap);

    // Fitness re-rolls — keep drawing until the piece fits somewhere (bounded).
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
 * Generate a safe 3-piece tray. Rejection-samples up to RETRY_CAP safe hands, then falls back to a
 * constructive safe prefix — so generation ALWAYS terminates and returns a safe hand whenever one
 * exists (spec 03 §2.5–2.6, invariant §7 T4).
 */
export function generateTray(rng: Rng, board: Board, ctx: GenContext): TrayPiece[] {
  for (let attempt = 0; attempt <= RETRY_CAP; attempt++) {
    const shapes = rollShapes(board, ctx);
    if (handIsSafe(board, shapes)) return withColors(shapes, rng);
    // else: re-roll the whole hand (draws advance the stream deterministically)
  }
  // Constructive guaranteed-safe fallback; colors still drawn in the trailing pass.
  return withColors(safeFallbackShapes(board, PIECES), rng);
}
