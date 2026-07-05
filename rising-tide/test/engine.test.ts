/**
 * engine.test.ts — turn loop, goals, scoring, tide, terminals (spec 02 §3–4, spec 01 §5).
 *
 * These build boards directly via getState() mutation of a fresh engine's board to drive exact
 * scenarios. That is a test-only shortcut; production code only ever calls the public API.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { RisingTideEngine, scorePlacement, type GameEvent, type GameState } from '../src/index.ts';

function typesOf(events: GameEvent[]): string[] {
  return events.map((e) => e.type);
}

/** Test-only: a mutable handle to the engine's state for hand-crafting exact scenarios. */
function mut(e: RisingTideEngine): GameState {
  return e.getState() as GameState;
}

test('scoring formula: N*N*cells*10 + combo*50', () => {
  assert.equal(scorePlacement(0, 0, 0), 0);
  assert.equal(scorePlacement(1, 8, 1), 1 * 1 * 8 * 10 + 1 * 50); // 130
  assert.equal(scorePlacement(2, 16, 3), 2 * 2 * 16 * 10 + 3 * 50); // 790
});

test('invalid placements return unchanged state and no events', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 's' });
  const before = JSON.stringify(e.getState());

  assert.deepEqual(e.placePiece(99, 0, 0).events, [], 'bad piece index');
  const occupied = e.getState().tray.findIndex((p) => !p.placed);
  // Place off-board to force rejection.
  assert.deepEqual(e.placePiece(occupied, 100, 100).events, [], 'out of bounds');
  assert.equal(JSON.stringify(e.getState()), before, 'state untouched by rejected calls');
});

test('placing a piece emits placed and increments turns', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'place-1' });
  const idx = e.getState().tray.findIndex((p) => !p.placed);
  const moves = e.legalMoves(idx);
  const [r, c] = moves[0]!;
  const { events } = e.placePiece(idx, r, c);
  assert.ok(typesOf(events).includes('placed'));
  assert.equal(e.getState().turns, 1);
});

test('lines goal: clearing enough lines wins, checked before loss', () => {
  const e = new RisingTideEngine();
  e.newGame({
    surface: 'voyage',
    seed: 'win-lines',
    level: { id: 'e0-lines', name: 'L', chapter: 'shallows', goal: 'lines', target: 1, fairness: 'guided' },
  });
  const s = mut(e);
  // Hand-craft: fill row 0 except the last cell, then drop a dot there.
  for (let c = 0; c < 7; c++) s.board[0]![c] = { color: 'teal' };
  s.tray[0] = { pieceId: 'dot', cells: [[0, 0]], color: 'coral', placed: false };
  s.tray[1]!.placed = true;
  s.tray[2]!.placed = true;

  const { events } = e.placePiece(0, 0, 7);
  const kinds = typesOf(events);
  assert.ok(kinds.includes('linesCleared'));
  assert.ok(kinds.includes('won'));
  assert.equal(e.getState().status, 'won');
  assert.equal(e.getState().totalLines, 1);
});

test('score accumulates and combo rises on consecutive clears', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'score-combo' });
  const s = mut(e);
  for (let c = 0; c < 7; c++) s.board[0]![c] = { color: 'teal' };
  s.tray[0] = { pieceId: 'dot', cells: [[0, 0]], color: 'coral', placed: false };
  s.tray[1]!.placed = true;
  s.tray[2]!.placed = true;

  const { events } = e.placePiece(0, 0, 7);
  const cleared = events.find((ev) => ev.type === 'linesCleared');
  assert.ok(cleared && cleared.type === 'linesCleared');
  // One row of 8 cells, combo now 1: 1*1*8*10 + 1*50 = 130.
  assert.equal(cleared.points, 130);
  assert.equal(e.getState().score, 130);
  assert.equal(e.getState().combo, 1);
});

test('combo breaks on a non-clearing placement', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'combo-break' });
  const s = mut(e);
  s.combo = 2; // pretend a streak is live
  const idx = s.tray.findIndex((p) => !p.placed);
  const [r, c] = e.legalMoves(idx)[0]!;
  const { events } = e.placePiece(idx, r, c); // an empty-board placement clears nothing
  assert.ok(typesOf(events).includes('comboBroken'));
  assert.equal(e.getState().combo, 0);
});

test('tide surface: tide rises each turn and drowning ends the game', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'tide', seed: 'drown' });
  const s = mut(e);
  s.tide = 7.9; // one rise from the cap
  s.prevTideFloor = 7;
  const idx = s.tray.findIndex((p) => !p.placed);
  const [r, c] = e.legalMoves(idx)[0]!;
  const { events } = e.placePiece(idx, r, c);
  const kinds = typesOf(events);
  assert.ok(kinds.includes('tideRise'));
  assert.ok(kinds.includes('lost'));
  const lost = events.find((ev) => ev.type === 'lost');
  assert.ok(lost && lost.type === 'lost' && lost.reason === 'drowned');
});

test('survive goal: reaching the target tideRises wins', () => {
  const e = new RisingTideEngine();
  e.newGame({
    surface: 'voyage',
    seed: 'survive-win',
    level: { id: 'e0-survive', name: 'S', chapter: 'reef', goal: 'survive', target: 1, fairness: 'fair' },
  });
  const s = mut(e);
  s.tide = 0.9; // next small rise crosses floor 0→1 → one tideRise → hits target 1
  s.prevTideFloor = 0;
  const idx = s.tray.findIndex((p) => !p.placed);
  const [r, c] = e.legalMoves(idx)[0]!;
  const { events } = e.placePiece(idx, r, c);
  assert.ok(typesOf(events).includes('won'), 'survive target met');
  assert.equal(e.getState().status, 'won');
});

test('out-of-moves loss and grantMoves revival', () => {
  const e = new RisingTideEngine();
  e.newGame({
    surface: 'voyage',
    seed: 'oom',
    level: { id: 'e0-score', name: 'Sc', chapter: 'shallows', goal: 'score', target: 999999, moveLimit: 1, fairness: 'guided' },
  });
  const idx = e.getState().tray.findIndex((p) => !p.placed);
  const [r, c] = e.legalMoves(idx)[0]!;
  const { events } = e.placePiece(idx, r, c);
  assert.ok(typesOf(events).includes('lost'));
  assert.equal(e.getState().lossReason, 'out-of-moves');

  // grantMoves revives an out-of-moves loss deterministically.
  e.grantMoves(3);
  assert.equal(e.getState().status, 'playing');
  assert.equal(e.getState().moveLimit, 4);
});

test('pushTide lowers tide without touching survive progress', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'tide', seed: 'push' });
  const s = mut(e);
  s.tide = 6;
  s.tideRises = 5;
  e.pushTide(2);
  assert.equal(e.getState().tide, 4);
  assert.equal(e.getState().tideRises, 5, 'survive progress is never rectified downward');
});
