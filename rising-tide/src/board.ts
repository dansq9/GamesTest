/**
 * board.ts — pure board operations (board-in → board-out), spec 02 §1, §4.
 * No state, no rng, no events. Coordinates are [row, col], row-major, 0..7.
 */

import { BOARD_SIZE, type Board, type Cell, type ColorId } from './state.ts';

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

/** A cell counts toward line completion iff it is filled AND not an anchor-locked cell (spec 04 §1.4). */
export function isSolid(cell: Cell | null | undefined): boolean {
  return cell != null && !cell.locked;
}

/** Absolute cells a piece occupies when its normalized cells are placed at origin (r, c). */
export function absoluteCells(cells: ReadonlyArray<readonly [number, number]>, r: number, c: number): [number, number][] {
  return cells.map(([dr, dc]) => [r + dr, c + dc] as [number, number]);
}

/** True if every target cell is in bounds and empty. */
export function canPlace(board: Board, cells: ReadonlyArray<readonly [number, number]>, r: number, c: number): boolean {
  for (const [dr, dc] of cells) {
    const rr = r + dr;
    const cc = c + dc;
    if (!inBounds(rr, cc)) return false;
    if (board[rr]![cc] !== null) return false;
  }
  return true;
}

/** All origins (r, c) where the piece fits. Deterministic row-major order. */
export function legalMoves(board: Board, cells: ReadonlyArray<readonly [number, number]>): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, cells, r, c)) out.push([r, c]);
    }
  }
  return out;
}

/** True if the piece fits anywhere (cheap early-out over legalMoves). */
export function fitsAnywhere(board: Board, cells: ReadonlyArray<readonly [number, number]>): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, cells, r, c)) return true;
    }
  }
  return false;
}

/** Deep-copy a board (engine keeps state immutable-visibly, spec 02 preamble). */
export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell === null ? null : { ...cell })));
}

/** Return a NEW board with the piece stamped in the given color. Caller pre-validates with canPlace. */
export function placeCells(
  board: Board,
  cells: ReadonlyArray<readonly [number, number]>,
  r: number,
  c: number,
  color: ColorId,
): Board {
  const next = cloneBoard(board);
  for (const [dr, dc] of cells) {
    next[r + dr]![c + dc] = { color };
  }
  return next;
}

/** Full rows and full cols (each fully non-null). */
export function findFullLines(board: Board): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r]!.every((cell) => isSolid(cell))) rows.push(r);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (!isSolid(board[r]![c])) {
        full = false;
        break;
      }
    }
    if (full) cols.push(c);
  }
  return { rows, cols };
}

/**
 * Clear the given rows+cols SIMULTANEOUSLY (spec 02 §4 step 2). Returns the new board and the
 * DEDUPED set of cleared cells in row-major order (a cell at a row∩col intersection counts once).
 */
export function clearLines(board: Board, rows: number[], cols: number[]): { board: Board; cleared: [number, number][] } {
  const rowSet = new Set(rows);
  const colSet = new Set(cols);
  const next = cloneBoard(board);
  const cleared: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (rowSet.has(r) || colSet.has(c)) {
        if (next[r]![c] !== null) {
          next[r]![c] = null;
          cleared.push([r, c]);
        }
      }
    }
  }
  return { board: next, cleared };
}

/** All cells of row r and column c (the Line-Blaster cross), deduped. */
export function rowColCells(r: number, c: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let cc = 0; cc < BOARD_SIZE; cc++) cells.push([r, cc]);
  for (let rr = 0; rr < BOARD_SIZE; rr++) if (rr !== r) cells.push([rr, c]);
  return cells;
}

/** The 3×3 box centered on (r, c), clipped to the board (the Bomb blast). */
export function boxCells(r: number, c: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr;
      const cc = c + dc;
      if (inBounds(rr, cc)) cells.push([rr, cc]);
    }
  }
  return cells;
}

export function filledCount(board: Board): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell !== null) n++;
  return n;
}

export function fillPct(board: Board): number {
  return filledCount(board) / (BOARD_SIZE * BOARD_SIZE);
}

/** Any unplaced tray piece placeable anywhere? (spec 02 §4 game-over check). */
export function hasAnyMove(board: Board, tray: Array<{ cells: ReadonlyArray<readonly [number, number]>; placed: boolean }>): boolean {
  for (const piece of tray) {
    if (!piece.placed && fitsAnywhere(board, piece.cells)) return true;
  }
  return false;
}

export type { Cell };
