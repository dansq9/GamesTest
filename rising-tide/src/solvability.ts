/**
 * solvability.ts — the per-hand safety guarantee (spec 03 §2).
 *
 * A tray H on board B is SAFE iff there exists an ordering + placements of its pieces such that all
 * can be placed in sequence — applying line-clears after each placement — with every piece having a
 * legal placement when its turn comes. Line clears MUST be simulated between placements: they open
 * space and are what makes many crowded hands safe.
 *
 * This is the check the generator uses so it never serves a hand that force-kills a player who had a
 * safe hand available (spec 03 §7 T4). E1 delivers per-hand safety; the Guided global "un-losable"
 * rescue rule + fill ceiling (spec 03 §4.3) arrive in E2.
 */

import { cloneBoard, findFullLines, legalMoves, placeCells } from './board.ts';
import type { Board } from './state.ts';
import { pieceSize, type Piece } from './pieces.ts';

/** Place a piece (color irrelevant for safety) and apply resulting clears — pure. */
function simulatePlaceAndClear(board: Board, cells: ReadonlyArray<readonly [number, number]>, r: number, c: number): Board {
  const stamped = placeCells(board, cells, r, c, 'teal');
  const { rows, cols } = findFullLines(stamped);
  if (rows.length + cols.length === 0) return stamped;
  // clearLines re-clones; avoid a double clone by clearing in place on the already-fresh board.
  const rowSet = new Set(rows);
  const colSet = new Set(cols);
  for (let rr = 0; rr < stamped.length; rr++) {
    for (let cc = 0; cc < stamped.length; cc++) {
      if (rowSet.has(rr) || colSet.has(cc)) stamped[rr]![cc] = null;
    }
  }
  return stamped;
}

/**
 * Depth-≤3 DFS over piece orderings, deduping identical shapes at each ply (spec 03 §2.3).
 * `clearing` toggles the success condition: with clearing=true, a witness must clear ≥1 line at some
 * step (the basis for the Guided rescue rule / handCanClear, spec 03 §4.3 — used in E2).
 */
function dfs(board: Board, remaining: readonly Piece[], clearing: boolean, clearedSoFar: boolean): boolean {
  if (remaining.length === 0) return clearing ? clearedSoFar : true;
  const seenShapes = new Set<string>();
  for (let i = 0; i < remaining.length; i++) {
    const p = remaining[i]!;
    if (seenShapes.has(p.id)) continue; // dedup identical shapes at this ply
    seenShapes.add(p.id);
    const moves = legalMoves(board, p.cells);
    if (moves.length === 0) continue;
    const rest = remaining.slice(0, i).concat(remaining.slice(i + 1));
    for (const [r, c] of moves) {
      const before = countFilled(board);
      const next = simulatePlaceAndClear(board, p.cells, r, c);
      const clearedHere = countFilled(next) < before + p.cells.length; // fewer than expected ⇒ a clear happened
      if (dfs(next, rest, clearing, clearedSoFar || clearedHere)) return true;
    }
  }
  return false;
}

function countFilled(board: Board): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell !== null) n++;
  return n;
}

/** True iff the hand has a full 3-placement witness sequence (per-hand safety). */
export function handIsSafe(board: Board, shapes: readonly Piece[]): boolean {
  return dfs(board, shapes, false, false);
}

/** True iff some safe witness sequence also clears ≥1 line (Guided rescue basis; E2). */
export function handCanClear(board: Board, shapes: readonly Piece[]): boolean {
  return dfs(board, shapes, true, false);
}

/**
 * Constructive guaranteed-terminating fallback (spec 03 §2.5): greedily place the smallest shape
 * with a legal move (preferring a dot), simulating clears, padding to 3 with dots. Returns the
 * maximal safe prefix; if it can't place even one piece the board is genuinely terminal (a
 * legitimate loss, not a generator bug).
 */
export function safeFallbackShapes(board: Board, pieces: readonly Piece[]): Piece[] {
  const bySize = [...pieces].sort((a, b) => pieceSize(a) - pieceSize(b));
  const dot = bySize.find((p) => pieceSize(p) === 1) ?? bySize[0]!;
  const out: Piece[] = [];
  let b = cloneBoard(board);
  for (let i = 0; i < 3; i++) {
    const p = bySize.find((cand) => legalMoves(b, cand.cells).length > 0);
    if (!p) break;
    const [r, c] = legalMoves(b, p.cells)[0]!;
    out.push(p);
    b = simulatePlaceAndClear(b, p.cells, r, c);
  }
  while (out.length < 3) out.push(dot);
  return out;
}
