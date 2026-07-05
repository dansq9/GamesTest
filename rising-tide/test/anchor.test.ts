/**
 * anchor.test.ts — anchor locks (spec 04 §1.4): cells locked from placement that also cannot
 * complete a line until they unlock after K turns.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { RisingTideEngine, board as boardOps, emptyBoard, levelByNumber, type ColorId, type GameEvent, type GameState } from '../src/index.ts';
import { playToWin } from './helpers.ts';

function mut(e: RisingTideEngine): GameState {
  return e.getState() as GameState;
}

test('a locked cell blocks placement', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'lock' });
  const s = mut(e);
  s.board[3]![3] = { color: 'anchor', element: 'anchor', locked: true, unlockTurn: 5 };
  s.tray[0] = { pieceId: 'dot', cells: [[0, 0]], color: 'coral', placed: false };
  assert.equal(e.canPlace(0, 3, 3), false, 'cannot place on a locked cell');
  assert.equal(e.canPlace(0, 3, 4), true);
});

test('a line through a locked cell cannot complete', () => {
  const board = emptyBoard();
  for (let c = 0; c < 8; c++) board[0]![c] = { color: 'teal' as ColorId };
  board[0]![4] = { color: 'anchor', element: 'anchor', locked: true, unlockTurn: 5 };
  const { rows } = boardOps.findFullLines(board);
  assert.deepEqual(rows, [], 'row 0 is not full while a cell is locked');
});

test('an anchor unlocks after its K turns and becomes placeable', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'unlock' });
  const s = mut(e);
  s.board[5]![5] = { color: 'anchor', element: 'anchor', locked: true, unlockTurn: 1 };
  // Place any piece → turns becomes 1 → the lock (unlockTurn 1) expires.
  const idx = s.tray.findIndex((p) => !p.placed);
  const [r, c] = e.legalMoves(idx)[0]!;
  const { events } = e.placePiece(idx, r, c);
  const unlockEvent = events.find((ev) => ev.type === 'elementEvent' && ev.element === 'anchor');
  assert.ok(unlockEvent, 'an anchor-unlock elementEvent fires');
  assert.equal(e.getState().board[5]![5], null, 'the cell is now empty and placeable');
});

test('special blasts do not clear a locked cell (anchors are protected)', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'bomb-lock' });
  const s = mut(e);
  s.satchel.bomb = 1;
  s.board[4]![5] = { color: 'anchor', element: 'anchor', locked: true, unlockTurn: 9 };
  const idx = e.deploySpecial('bomb').state.tray.length - 1;
  e.placePiece(idx, 4, 4); // 3×3 around (4,4) includes (4,5)
  assert.ok(e.getState().board[4]![5]?.locked, 'the locked anchor survived the blast');
});

test('anchor levels remain winnable with real locks', () => {
  const level = levelByNumber(22)!; // Anchor's Hold
  let won = false;
  for (let seed = 0; seed < 8 && !won; seed++) won = playToWin({ surface: 'voyage', level, seed: `anchor-win-${seed}` });
  assert.ok(won, "Anchor's Hold must still be winnable");
});
