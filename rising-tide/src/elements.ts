/**
 * elements.ts — board-element seeding + clear resolution (spec 04 §1).
 *
 * E3a implements the Tier-A cell/collectible elements whose rules are self-contained:
 *   - barnacle : fills a board cell; removed when its line clears → barnaclesRemoved
 *   - coral2   : fills a board cell with hits=2; a crossing clear STRIKES it (hits--); clears at 0
 *   - pearl    : element-layer marker over an empty cell; collected when the covering cell clears
 *   - bonus    : element-layer marker over an empty cell; multiplies that placement's clear points
 * Deferred to a later E3 slice: anchor (lock semantics), current + storm (Tier B, spec 04 §1.6–1.7).
 * `deepTide` is not a cell element — it is expressed as a level `tideRate` (spec 01 §5).
 *
 * Seeding draws from the injected rng ONLY, BEFORE the first tray (spec 03 §1.2), and spreads
 * elements so no line is pre-loaded near completion (spec 04 §1.0).
 */

import { BOARD_SIZE, type Board, type Cell, type ElementId, type ElementSpec } from './state.ts';
import type { Rng } from './rng.ts';

const MAX_PER_LINE = 2;
const SEED_ATTEMPTS = 200;
export const BONUS_MULT = 2; // spec 04 §1.5 default
export const BONUS_MULT_CAP = 4; // spec 04 §1.5 stacking cap

/** Fixed seed order (spec 04 §1.0). */
const SEED_ORDER: ElementId[] = ['barnacle', 'coral2', 'anchor', 'bonus', 'pearl', 'current', 'storm'];

/** Elements E3a actually seeds into the board/layer. */
function isSeedable(kind: ElementId): boolean {
  return kind === 'barnacle' || kind === 'coral2' || kind === 'pearl' || kind === 'bonus';
}

/** Whether a kind occupies (fills) the board cell (vs. an element-layer marker over an empty cell). */
function fillsBoard(kind: ElementId): boolean {
  return kind === 'barnacle' || kind === 'coral2';
}

type ElementsLayer = (ElementId | null)[][];

function emptiesInRow(board: Board, r: number): number {
  let n = 0;
  for (let c = 0; c < BOARD_SIZE; c++) if (board[r]![c] === null) n++;
  return n;
}
function emptiesInCol(board: Board, c: number): number {
  let n = 0;
  for (let r = 0; r < BOARD_SIZE; r++) if (board[r]![c] === null) n++;
  return n;
}

/**
 * Seed a level's elements into board + elements layer, mutating both. Draws from rng in the fixed
 * seed order; gives up on a spec after SEED_ATTEMPTS (seeds fewer, never crashes — spec 04 §1.0).
 */
export function seedElements(board: Board, elements: ElementsLayer, specs: readonly ElementSpec[], rng: Rng): void {
  const perRow = new Array<number>(BOARD_SIZE).fill(0);
  const perCol = new Array<number>(BOARD_SIZE).fill(0);

  const ordered = [...specs].sort((a, b) => SEED_ORDER.indexOf(a.kind) - SEED_ORDER.indexOf(b.kind));
  for (const spec of ordered) {
    if (!isSeedable(spec.kind)) continue;
    for (let i = 0; i < spec.count; i++) {
      const cell = freeCell(board, elements, spec.kind, perRow, perCol, rng);
      if (!cell) break;
      applySpec(board, elements, spec.kind, cell.r, cell.c);
      perRow[cell.r]!++;
      perCol[cell.c]!++;
    }
  }
}

function freeCell(
  board: Board,
  elements: ElementsLayer,
  kind: ElementId,
  perRow: number[],
  perCol: number[],
  rng: Rng,
): { r: number; c: number } | null {
  for (let attempt = 0; attempt < SEED_ATTEMPTS; attempt++) {
    const r = Math.floor(rng.next() * BOARD_SIZE);
    const c = Math.floor(rng.next() * BOARD_SIZE);
    if (board[r]![c] !== null || elements[r]![c] !== null) continue;
    if (perRow[r]! >= MAX_PER_LINE || perCol[c]! >= MAX_PER_LINE) continue;
    // Board-filling elements must not push a line below 2 empty cells at spawn (spec 04 §1.0).
    if (fillsBoard(kind) && (emptiesInRow(board, r) - 1 < 2 || emptiesInCol(board, c) - 1 < 2)) continue;
    return { r, c };
  }
  return null;
}

function applySpec(board: Board, elements: ElementsLayer, kind: ElementId, r: number, c: number): void {
  switch (kind) {
    case 'barnacle':
      board[r]![c] = { color: 'barnacle', element: 'barnacle' };
      elements[r]![c] = 'barnacle';
      break;
    case 'coral2':
      board[r]![c] = { color: 'coral2', element: 'coral2', hits: 2 };
      elements[r]![c] = 'coral2';
      break;
    case 'pearl':
      elements[r]![c] = 'pearl'; // board stays empty; player fills over it
      break;
    case 'bonus':
      elements[r]![c] = 'bonus';
      break;
    default:
      break; // anchor/current/storm deferred
  }
}

export interface ClearResolution {
  board: Board;
  elements: ElementsLayer;
  cleared: [number, number][]; // cells actually removed (excludes struck-but-surviving coral)
  pearls: [number, number][];
  barnacles: [number, number][];
  corals: [number, number][]; // corals fully struck (removed)
  coralHits: Array<{ cell: [number, number]; remaining: number }>; // strikes (incl. final)
  bonusMult: number; // product of triggered bonus multipliers, capped
}

/**
 * Resolve an explicit SET of cells with element awareness (spec 04 §1) — the shared core used by
 * line clears AND special-block blasts. Corals with hits>1 are struck (hits--) but NOT removed this
 * clear; everything else clears, collecting pearls/barnacles/corals and accumulating bonus
 * multipliers. Cells are processed in row-major order; duplicates are harmless (idempotent).
 * Pure: returns fresh board+layer.
 */
export function resolveClearedCells(board: Board, elements: ElementsLayer, cells: Iterable<readonly [number, number]>): ClearResolution {
  const want = new Set<number>();
  for (const [r, c] of cells) want.add(r * BOARD_SIZE + c);

  const nextBoard: Board = board.map((row) => row.map((cell) => (cell === null ? null : { ...cell })));
  const nextEl: ElementsLayer = elements.map((row) => row.slice());

  const cleared: [number, number][] = [];
  const pearls: [number, number][] = [];
  const barnacles: [number, number][] = [];
  const corals: [number, number][] = [];
  const coralHits: Array<{ cell: [number, number]; remaining: number }> = [];
  let bonusMult = 1;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!want.has(r * BOARD_SIZE + c)) continue;
      const cell = nextBoard[r]![c];
      if (!cell) continue;

      if (cell.element === 'coral2' && (cell.hits ?? 1) > 1) {
        const remaining = (cell.hits ?? 2) - 1;
        nextBoard[r]![c] = { ...cell, hits: remaining };
        coralHits.push({ cell: [r, c], remaining });
        continue;
      }

      const marker = nextEl[r]![c];
      nextBoard[r]![c] = null;
      nextEl[r]![c] = null;
      cleared.push([r, c]);

      if (cell.element === 'barnacle') barnacles.push([r, c]);
      else if (cell.element === 'coral2') {
        corals.push([r, c]);
        coralHits.push({ cell: [r, c], remaining: 0 });
      } else if (marker === 'pearl') pearls.push([r, c]);
      else if (marker === 'bonus') bonusMult *= BONUS_MULT;
    }
  }

  if (bonusMult > BONUS_MULT_CAP) bonusMult = BONUS_MULT_CAP;
  return { board: nextBoard, elements: nextEl, cleared, pearls, barnacles, corals, coralHits, bonusMult };
}

/** Resolve a set of full rows+cols (the normal line clear). */
export function resolveClears(board: Board, elements: ElementsLayer, rows: number[], cols: number[]): ClearResolution {
  const cells: [number, number][] = [];
  const rowSet = new Set(rows);
  const colSet = new Set(cols);
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (rowSet.has(r) || colSet.has(c)) cells.push([r, c]);
    }
  }
  return resolveClearedCells(board, elements, cells);
}

export type { Cell };
