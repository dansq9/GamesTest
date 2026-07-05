/**
 * powerups.test.ts — the power-up satchel (spec 10 §3): Undo-Last, +Moves, Tide-Push.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { RisingTideEngine, type GameEvent, type GameState, type LevelDef } from '../src/index.ts';

function mut(e: RisingTideEngine): GameState {
  return e.getState() as GameState;
}
function typesOf(events: GameEvent[]): string[] {
  return events.map((ev) => ev.type);
}

test('+Moves grants 5 and decrements inventory', () => {
  const level: LevelDef = { id: 'pu-mv', n: 7, name: 'Mv', chapter: 'shallows', goal: 'lines', target: 99, moveLimit: 5, fairness: 'guided' };
  const e = new RisingTideEngine();
  e.newGame({ surface: 'voyage', level, seed: 'mv' });
  mut(e).powerups.addMoves = 1;

  const { events } = e.usePowerUp('addMoves');
  assert.ok(typesOf(events).includes('powerUpUsed'));
  assert.ok(typesOf(events).includes('movesGranted'));
  assert.equal(e.getState().moveLimit, 10);
  assert.equal(e.getState().powerups.addMoves, 0);
});

test('Tide-Push lowers tide by 2 and decrements inventory', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'tide', seed: 'tp' });
  const s = mut(e);
  s.tide = 6;
  s.powerups.tidePush = 1;

  const { events } = e.usePowerUp('tidePush');
  assert.ok(typesOf(events).includes('tidePushed'));
  assert.equal(e.getState().tide, 4);
  assert.equal(e.getState().powerups.tidePush, 0);
});

test('Undo-Last reverts the previous placement', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'undo' });
  mut(e).powerups.undo = 1; // must be available BEFORE the placement to capture the undo point

  const idx = e.getState().tray.findIndex((p) => !p.placed);
  const [r, c] = e.legalMoves(idx)[0]!;
  e.placePiece(idx, r, c);
  assert.equal(e.getState().turns, 1);

  const { events } = e.usePowerUp('undo');
  assert.ok(typesOf(events).includes('undone'));
  assert.equal(e.getState().turns, 0, 'placement rewound');
  assert.equal(e.getState().powerups.undo, 0, 'one undo consumed');
  assert.ok(e.getState().board.flat().every((cell) => cell === null), 'board back to empty');
});

test('Undo is disabled in Seeded (would desync the shared board)', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'undo-seeded' });
  const s = mut(e);
  s.fairness = 'seeded';
  s.powerups.undo = 1;
  const idx = e.getState().tray.findIndex((p) => !p.placed);
  const [r, c] = e.legalMoves(idx)[0]!;
  e.placePiece(idx, r, c);

  assert.deepEqual(e.usePowerUp('undo').events, [], 'no-op in seeded');
  assert.equal(e.getState().turns, 1, 'placement stands');
});

test('using a power-up you do not have is a no-op', () => {
  const e = new RisingTideEngine();
  e.newGame({ surface: 'zen', seed: 'empty' });
  assert.deepEqual(e.usePowerUp('tidePush').events, []);
  assert.deepEqual(e.usePowerUp('addMoves').events, []);
  assert.deepEqual(e.usePowerUp('undo').events, []);
});
