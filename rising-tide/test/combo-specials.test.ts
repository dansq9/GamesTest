/**
 * combo-specials.test.ts — combo one-move grace, combo-earned specials, and the two special
 * blocks (spec 05 §1–2).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { RisingTideEngine, type ColorId, type GameEvent, type GameState } from '../src/index.ts';

function mut(e: RisingTideEngine): GameState {
  return e.getState() as GameState;
}
function typesOf(events: GameEvent[]): string[] {
  return events.map((ev) => ev.type);
}

/** A guaranteed non-clearing placement on the (mostly empty) board: first legal move of some piece. */
function placeQuiet(e: RisingTideEngine): GameEvent[] {
  const s = e.getState();
  for (let i = 0; i < s.tray.length; i++) {
    if (s.tray[i]!.placed) continue;
    const moves = e.legalMoves(i);
    if (moves.length) {
      const [r, c] = moves[0]!;
      return e.placePiece(i, r, c).events;
    }
  }
  return [];
}

test('combo grace: one quiet move is forgiven, the second breaks the streak', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'grace' });
  const s = mut(e);
  s.combo = 2;
  s.comboGrace = true;

  const first = placeQuiet(e); // quiet move #1 → held
  assert.ok(typesOf(first).includes('comboHeld'));
  assert.equal(e.getState().combo, 2, 'streak survives the first quiet move');
  assert.equal(e.getState().comboGrace, false, 'grace spent');

  const second = placeQuiet(e); // quiet move #2 → broken
  assert.ok(typesOf(second).includes('comboBroken'));
  assert.equal(e.getState().combo, 0);
});

test('a clearing placement refreshes grace and increments combo', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'refresh' });
  const s = mut(e);
  s.combo = 1;
  s.comboGrace = false;
  for (let c = 0; c < 7; c++) s.board[0]![c] = { color: 'teal' as ColorId };
  s.tray[0] = { pieceId: 'dot', cells: [[0, 0]], color: 'coral', placed: false };
  s.tray[1]!.placed = true;
  s.tray[2]!.placed = true;

  const events = e.placePiece(0, 0, 7).events; // completes row 0
  assert.ok(typesOf(events).includes('linesCleared'));
  assert.equal(e.getState().combo, 2);
  assert.equal(e.getState().comboGrace, true, 'grace refreshed by the clear');
});

test('combo milestone grants a special into the satchel (×3 → Line-Blaster)', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'reward3' });
  const s = mut(e);
  s.combo = 2;
  s.comboRewardAt = 0;
  for (let c = 0; c < 7; c++) s.board[0]![c] = { color: 'teal' as ColorId };
  s.tray[0] = { pieceId: 'dot', cells: [[0, 0]], color: 'coral', placed: false };
  s.tray[1]!.placed = true;
  s.tray[2]!.placed = true;

  const events = e.placePiece(0, 0, 7).events; // combo 2 → 3
  const reward = events.find((ev) => ev.type === 'comboReward');
  assert.ok(reward && reward.type === 'comboReward' && reward.special === 'lineBlaster');
  assert.equal(e.getState().satchel.lineBlaster, 1);
  assert.equal(e.getState().comboRewardAt, 3);
});

test('combo rewards are disabled in Seeded (shared board stays identical)', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'seeded-no-reward' });
  const s = mut(e);
  s.fairness = 'seeded';
  s.combo = 2;
  for (let c = 0; c < 7; c++) s.board[0]![c] = { color: 'teal' as ColorId };
  s.tray[0] = { pieceId: 'dot', cells: [[0, 0]], color: 'coral', placed: false };
  s.tray[1]!.placed = true;
  s.tray[2]!.placed = true;

  const events = e.placePiece(0, 0, 7).events;
  assert.ok(!typesOf(events).includes('comboReward'), 'no reward in seeded');
  assert.equal(e.getState().satchel.lineBlaster, 0);
});

test('reward milestone resets when the streak breaks', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'reset' });
  const s = mut(e);
  s.combo = 3;
  s.comboRewardAt = 3;
  s.comboGrace = false;
  placeQuiet(e); // break
  assert.equal(e.getState().combo, 0);
  assert.equal(e.getState().comboRewardAt, 0, 'a fresh streak can earn again');
});

test('Line-Blaster clears its entire row and column and counts as a clear', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'lb' });
  const s = mut(e);
  s.satchel.lineBlaster = 1;
  // Fill row 3 and col 5 (except the origin 3,5) with player blocks.
  for (let c = 0; c < 8; c++) if (c !== 5) s.board[3]![c] = { color: 'teal' as ColorId };
  for (let r = 0; r < 8; r++) if (r !== 3) s.board[r]![5] = { color: 'teal' as ColorId };

  const idx = e.deploySpecial('lineBlaster').state.tray.length - 1;
  const { events } = e.placePiece(idx, 3, 5);
  assert.ok(typesOf(events).includes('linesCleared'));
  // Row 3 and col 5 are now empty.
  for (let c = 0; c < 8; c++) assert.equal(e.getState().board[3]![c], null);
  for (let r = 0; r < 8; r++) assert.equal(e.getState().board[r]![5], null);
  assert.equal(e.getState().combo, 1, 'special counts as a clearing placement');
  assert.equal(e.getState().totalLines, 2, 'row + column = N=2');
});

test('Bomb clears the 3×3 around it and removes barnacles for the goal', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'bomb' });
  const s = mut(e);
  s.satchel.bomb = 1;
  // Fill the 8 cells around (4,4) with blocks; put a barnacle at (3,3).
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++)
      if (!(dr === 0 && dc === 0)) s.board[4 + dr]![4 + dc] = { color: 'teal' as ColorId };
  s.board[3]![3] = { color: 'barnacle', element: 'barnacle' };
  s.elements[3]![3] = 'barnacle';

  const idx = e.deploySpecial('bomb').state.tray.length - 1;
  const { events } = e.placePiece(idx, 4, 4);
  // The 3×3 is cleared.
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) assert.equal(e.getState().board[4 + dr]![4 + dc], null);
  assert.ok(typesOf(events).includes('barnacleRemoved'));
  assert.equal(e.getState().barnaclesRemoved, 1);
  assert.equal(e.getState().combo, 1);
});

test('deploySpecial is a no-op without the special, and appends when available', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'deploy' });
  const before = e.getState().tray.length;
  assert.deepEqual(e.deploySpecial('bomb').events, [], 'no bomb in satchel → no-op');
  assert.equal(e.getState().tray.length, before);

  mut(e).satchel.bomb = 1;
  const { events } = e.deploySpecial('bomb');
  assert.ok(typesOf(events).includes('specialDeployed'));
  assert.equal(e.getState().tray.length, before + 1);
  assert.equal(e.getState().tray.at(-1)!.special, 'bomb');
});
