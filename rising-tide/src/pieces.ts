/**
 * pieces.ts — the block-shape library and color ids.
 *
 * NO rotation at runtime (spec 02 §1): each rotation is its own entry. Cells are
 * normalized offsets (min row = 0, min col = 0), row-major.
 *
 * SPEC GAP (build-readiness): the canonical 18-shape library + weights live in the
 * v5 prototype's `_genTray`, which is not in this repo. The set below is the standard
 * block-puzzle genre library — sufficient and correct for the E0 determinism skeleton,
 * where the exact shape set is swappable data that does not affect engine logic. It is
 * tagged [OPEN — reconcile against prototype `_genTray`] and expected to be replaced with
 * the exact prototype weights during E1 tray-generation work.
 */

export type ColorId = 'coral' | 'teal' | 'amber' | 'violet' | 'lime';

/** Fixed color order — index i maps to COLORS[i]. Draw order is frozen (spec 03 §1.2). */
export const COLORS: readonly ColorId[] = ['coral', 'teal', 'amber', 'violet', 'lime'] as const;

export interface Piece {
  id: string;
  cells: ReadonlyArray<readonly [number, number]>;
  /** Roulette weight for weighted piece selection. [OPEN — reconcile against prototype]. */
  weight: number;
}

/** Cell count of a piece (size category is derived, not stored). */
export function pieceSize(p: Piece): number {
  return p.cells.length;
}

export const PIECES: readonly Piece[] = [
  // ── 1 cell ──
  { id: 'dot', cells: [[0, 0]], weight: 8 },

  // ── 2 cells ──
  { id: 'dom-h', cells: [[0, 0], [0, 1]], weight: 10 },
  { id: 'dom-v', cells: [[0, 0], [1, 0]], weight: 10 },

  // ── 3 cells ──
  { id: 'tri-i-h', cells: [[0, 0], [0, 1], [0, 2]], weight: 8 },
  { id: 'tri-i-v', cells: [[0, 0], [1, 0], [2, 0]], weight: 8 },
  { id: 'tri-l-0', cells: [[0, 0], [1, 0], [1, 1]], weight: 6 },
  { id: 'tri-l-1', cells: [[0, 0], [0, 1], [1, 0]], weight: 6 },
  { id: 'tri-l-2', cells: [[0, 0], [0, 1], [1, 1]], weight: 6 },
  { id: 'tri-l-3', cells: [[0, 1], [1, 0], [1, 1]], weight: 6 },

  // ── 4 cells ──
  { id: 'sq2', cells: [[0, 0], [0, 1], [1, 0], [1, 1]], weight: 6 },
  { id: 'i4-h', cells: [[0, 0], [0, 1], [0, 2], [0, 3]], weight: 4 },
  { id: 'i4-v', cells: [[0, 0], [1, 0], [2, 0], [3, 0]], weight: 4 },
  { id: 'l4-0', cells: [[0, 0], [1, 0], [2, 0], [2, 1]], weight: 3 },
  { id: 'l4-1', cells: [[0, 0], [0, 1], [0, 2], [1, 0]], weight: 3 },
  { id: 't4-0', cells: [[0, 0], [0, 1], [0, 2], [1, 1]], weight: 3 },
  { id: 's4', cells: [[0, 1], [0, 2], [1, 0], [1, 1]], weight: 3 },
  { id: 'z4', cells: [[0, 0], [0, 1], [1, 1], [1, 2]], weight: 3 },

  // ── 5 cells ──
  { id: 'i5-h', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], weight: 2 },
  { id: 'plus', cells: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]], weight: 2 },
] as const;

const PIECE_BY_ID = new Map(PIECES.map((p) => [p.id, p]));

export function pieceById(id: string): Piece {
  const p = PIECE_BY_ID.get(id);
  if (!p) throw new Error(`Unknown pieceId: ${id}`);
  return p;
}
