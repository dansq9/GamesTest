/**
 * rescue.test.ts — the Guided global "un-losable" guarantee (spec 03 §4.3).
 *
 * Two properties:
 *  (1) RESCUE INVARIANT — when a Guided board is at/above F_rescue, the generated hand is CLEARING
 *      (a witness clears ≥1 line). Tested directly on a constructed high-fill board.
 *  (2) A reasonable "take the clear" player never suffers a no-moves loss in Guided across many
 *      games — the empirical form of the guarantee (spec 03 §4.3; full N≥1e6 CasualBot run is E7).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  RisingTideEngine,
  board as boardOps,
  contextFor,
  createRng,
  emptyBoard,
  generateTray,
  handCanClear,
  handIsSafe,
  pieceById,
  type Board,
  type ColorId,
  type GameEvent,
  type LevelDef,
} from '../src/index.ts';

const GUIDED: LevelDef = { id: 'r-guided', name: 'RG', n: 3, chapter: 'shallows', goal: 'score', target: 1e9, fairness: 'guided' };

/** A high-fill (~0.77) but valid board: everything filled except column 7 and row 7. Rows 0–6 are
 *  each one cell (col 7) from full, so a finisher can always clear. */
function highFillBoard(): Board {
  const b = emptyBoard();
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) b[r]![c] = { color: 'teal' as ColorId };
  }
  return b; // 49/64 ≈ 0.766 filled
}

test('rescue invariant: a Guided hand at/above F_rescue can always clear', () => {
  const board = highFillBoard();
  assert.ok(boardOps.fillPct(board) >= 0.72, 'fixture must be above the rescue threshold');
  for (let s = 0; s < 40; s++) {
    const rng = createRng(`rescue-${s}`);
    const ctx = contextFor({ surface: 'voyage', fairness: 'guided', chapter: 'shallows', levelNumber: 3, rng });
    const tray = generateTray(rng, board, ctx);
    const shapes = tray.map((p) => pieceById(p.pieceId));
    assert.equal(handCanClear(board, shapes), true, `served Guided hand must be clearing (seed ${s})`);
  }
});

/**
 * A competent-player proxy: never DEAD-END a safe hand. Among legal moves, keep only those after
 * which the remaining pieces are still collectively safe (a placement the spec's classifier calls
 * "player agency" if skipped, L-a). Among those, prefer an immediate clear, then the lowest
 * resulting fill (keep the board open). This is the minimum competence the Guided guarantee assumes;
 * the tuned CasualBot for the full N≥1e6 certification is E7.
 */
function chooseSafePreserving(engine: RisingTideEngine): { i: number; r: number; c: number } | null {
  const s = engine.getState();
  const unplaced = s.tray.map((p, i) => ({ p, i })).filter((x) => !x.p.placed);
  let best: { i: number; r: number; c: number; fill: number; clears: boolean } | null = null;
  let anyLegal: { i: number; r: number; c: number } | null = null;

  for (const { p, i } of unplaced) {
    for (const [r, c] of engine.legalMoves(i)) {
      if (!anyLegal) anyLegal = { i, r, c };
      const stamped = boardOps.placeCells(s.board, p.cells, r, c, 'teal');
      const { rows, cols } = boardOps.findFullLines(stamped);
      const clears = rows.length + cols.length > 0;
      const after = clears ? boardOps.clearLines(stamped, rows, cols).board : stamped;
      const remaining = unplaced.filter((x) => x.i !== i).map((x) => pieceById(x.p.pieceId));
      if (!handIsSafe(after, remaining)) continue; // would dead-end the rest of the hand
      const fill = boardOps.fillPct(after);
      if (best === null || (clears && !best.clears) || (clears === best.clears && fill < best.fill)) {
        best = { i, r, c, fill, clears };
      }
    }
  }
  // If nothing preserves safety, the board is genuinely terminal — play any legal move and let the
  // loss stand (legitimate). In Guided the rescue rule + ceiling should keep us out of this state.
  return best ? { i: best.i, r: best.r, c: best.c } : anyLegal;
}

test('a competent (never-dead-end) player suffers zero no-moves losses in Guided', () => {
  const GAMES = 100;
  let noMovesLosses = 0;
  let reachedHighFill = 0;

  for (let g = 0; g < GAMES; g++) {
    const engine = new RisingTideEngine();
    engine.newGame({ surface: 'voyage', level: GUIDED, seed: `rescue-sim-${g}` });

    for (let t = 0; t < 300; t++) {
      if (engine.getState().status !== 'playing') break;
      if (boardOps.fillPct(engine.getState().board) >= 0.72) reachedHighFill++;
      const mv = chooseSafePreserving(engine);
      if (!mv) break;
      const { events }: { events: GameEvent[] } = engine.placePiece(mv.i, mv.r, mv.c);
      const lost = events.find((e) => e.type === 'lost');
      if (lost && lost.type === 'lost' && lost.reason === 'no-moves') noMovesLosses++;
    }
  }

  assert.equal(noMovesLosses, 0, `Guided must have zero no-moves losses (got ${noMovesLosses})`);
  assert.ok(reachedHighFill > 0, 'the sim should actually exercise the rescue band');
});
