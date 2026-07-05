/**
 * determinism.test.ts — the E0 ship criterion: seed ⇒ byte-identical game (spec 03 §1, spec 13 E0).
 * Plus the resume contract: restore-then-play == continuous play (spec 03 §1.4).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { RisingTideEngine, type GameEvent, type NewGameConfig } from '../src/index.ts';
import { chooseMove, playGame } from './helpers.ts';

const TIDE_GAME: NewGameConfig = { surface: 'tide', seed: 'golden-seed-001' };
const VOYAGE_LINES: NewGameConfig = {
  surface: 'voyage',
  seed: 'golden-seed-002',
  level: { id: 'e0-lines', name: 'First Lines', chapter: 'shallows', goal: 'lines', target: 3, fairness: 'guided' },
};

test('golden-master: same seed ⇒ identical event stream (tide game)', () => {
  const a = playGame(TIDE_GAME);
  const b = playGame(TIDE_GAME);
  assert.deepEqual(a, b);
  assert.ok(a.length > 5, 'game should produce a non-trivial event stream');
});

test('golden-master: same seed ⇒ identical event stream (voyage game)', () => {
  const a = playGame(VOYAGE_LINES);
  const b = playGame(VOYAGE_LINES);
  assert.deepEqual(a, b);
});

test('different seeds ⇒ different event streams (seed actually matters)', () => {
  const a = playGame({ surface: 'tide', seed: 'seed-A' });
  const b = playGame({ surface: 'tide', seed: 'seed-B' });
  assert.notDeepEqual(a, b);
});

test('resume contract: restore-then-play == continuous play', () => {
  const config = TIDE_GAME;
  const SPLIT = 8;

  // Continuous run A: play SPLIT moves, snapshot, then record the TAIL (everything after).
  const engineA = new RisingTideEngine();
  engineA.newGame(config);
  for (let t = 0; t < SPLIT; t++) {
    if (engineA.getState().status !== 'playing') break;
    const mv = chooseMove(engineA);
    if (!mv) break;
    engineA.placePiece(mv.pieceIdx, mv.r, mv.c);
  }
  const snap = engineA.snapshot();
  const tailA: GameEvent[] = [];
  for (let t = 0; t < 300; t++) {
    if (engineA.getState().status !== 'playing') break;
    const mv = chooseMove(engineA);
    if (!mv) break;
    tailA.push(...engineA.placePiece(mv.pieceIdx, mv.r, mv.c).events);
  }

  // Run B: fresh engine restored from the snapshot, then play the same tail.
  const engineB = new RisingTideEngine();
  engineB.restore(snap);
  const tailB: GameEvent[] = [];
  for (let t = 0; t < 300; t++) {
    if (engineB.getState().status !== 'playing') break;
    const mv = chooseMove(engineB);
    if (!mv) break;
    tailB.push(...engineB.placePiece(mv.pieceIdx, mv.r, mv.c).events);
  }

  assert.ok(tailA.length > 0, 'there should be gameplay after the split point');
  assert.deepEqual(tailB, tailA, 'resumed play must match continuous play exactly');
});

test('snapshot round-trips core state (minus the static LevelDef)', () => {
  const engine = new RisingTideEngine();
  engine.newGame(VOYAGE_LINES);
  for (let t = 0; t < 5; t++) {
    const mv = chooseMove(engine);
    if (!mv) break;
    engine.placePiece(mv.pieceIdx, mv.r, mv.c);
  }
  const snap = engine.snapshot();

  const restored = new RisingTideEngine();
  restored.restore(snap);

  const before = engine.getState();
  const after = restored.getState();
  assert.equal(after.seed, before.seed);
  assert.equal(after.score, before.score);
  assert.equal(after.turns, before.turns);
  assert.deepEqual(after.board, before.board);
  assert.deepEqual(after.tray, before.tray);
  assert.equal(after.level?.id, before.level?.id, 'level rehydrated from the registry by id');
});
