/**
 * safety.test.ts — the E1 ship criterion: NO UNAVOIDABLE DEATHS (spec 03 §4, §7 T3/T4/T5).
 *
 * A RandomLegalBot plays many games. The generator's guarantee (spec 03 §2.6) is: whenever any safe
 * hand exists for the board, the served hand is safe. We assert that invariant on EVERY served hand
 * during play (T4). It follows that any no-moves loss is legitimate — either a mid-hand bad ordering
 * by the bot (player agency, L-a) or a genuinely terminal board — never a generator force-kill (T3).
 *
 * Scale here is a fast CI proxy; the full N ≥ 1e6 Guided run is E7 (spec 07). No-flood (T5) is
 * checked on every served tray in the same loop.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  RisingTideEngine,
  createRng,
  handIsSafe,
  pieceById,
  pieceSize,
  type GameEvent,
  type LevelDef,
  type NewGameConfig,
  type Rng,
} from '../src/index.ts';

const GUIDED_LEVEL: LevelDef = {
  id: 'safe-guided',
  name: 'Safe Guided',
  chapter: 'shallows',
  goal: 'score',
  target: 10_000_000, // effectively unreachable → the bot plays until it can't, stressing the floor
  fairness: 'guided',
};
const FAIR_LEVEL: LevelDef = { ...GUIDED_LEVEL, id: 'safe-fair', fairness: 'fair' };

function unplacedShapes(engine: RisingTideEngine) {
  return engine
    .getState()
    .tray.filter((p) => !p.placed)
    .map((p) => pieceById(p.pieceId));
}

/** Assert the currently-served (all-unplaced) hand is safe on the current board. */
function assertServedSafe(engine: RisingTideEngine, ctx: string): void {
  const shapes = unplacedShapes(engine);
  assert.equal(handIsSafe(engine.getState().board, shapes), true, `served hand must be safe (${ctx})`);
}

function assertNoFlood(engine: RisingTideEngine, ctx: string): void {
  const big = unplacedShapes(engine).filter((p) => pieceSize(p) >= 4).length;
  assert.ok(big < 3, `no-flood: at most two ≥4-cell pieces per hand (${ctx})`);
}

/** All legal (pieceIdx, r, c) moves for the current tray. */
function allLegalMoves(engine: RisingTideEngine): Array<{ i: number; r: number; c: number }> {
  const s = engine.getState();
  const out: Array<{ i: number; r: number; c: number }> = [];
  for (let i = 0; i < s.tray.length; i++) {
    if (s.tray[i]!.placed) continue;
    for (const [r, c] of engine.legalMoves(i)) out.push({ i, r, c });
  }
  return out;
}

function runSafetySim(baseConfig: NewGameConfig, games: number, maxTurns = 220): { losses: number; refills: number } {
  let losses = 0;
  let refills = 0;
  for (let g = 0; g < games; g++) {
    const engine = new RisingTideEngine();
    const botRng: Rng = createRng(`bot-${baseConfig.surface}-${g}`);
    engine.newGame({ ...baseConfig, seed: `safe-sim-${g}` });

    assertServedSafe(engine, `opening tray g=${g}`);
    assertNoFlood(engine, `opening tray g=${g}`);
    refills++;

    for (let t = 0; t < maxTurns; t++) {
      if (engine.getState().status !== 'playing') break;
      const moves = allLegalMoves(engine);
      if (moves.length === 0) break;
      const pick = moves[Math.floor(botRng.next() * moves.length)]!;
      const { events }: { events: GameEvent[] } = engine.placePiece(pick.i, pick.r, pick.c);

      if (events.some((e) => e.type === 'trayRefilled') && engine.getState().status === 'playing') {
        assertServedSafe(engine, `refill g=${g} t=${t}`);
        assertNoFlood(engine, `refill g=${g} t=${t}`);
        refills++;
      }
      if (engine.getState().status === 'lost') losses++;
    }
  }
  return { losses, refills };
}

test('Guided: every served hand is safe across many random-legal games (T3/T4/T5)', () => {
  const { refills } = runSafetySim({ surface: 'voyage', level: GUIDED_LEVEL }, 800);
  assert.ok(refills > 700, `should have exercised many generations (got ${refills})`);
});

test('Fair: every served hand is safe across many random-legal games (T4/T5)', () => {
  runSafetySim({ surface: 'voyage', level: FAIR_LEVEL }, 400);
});

test('Zen: every served hand is safe (calm surface still guarantees the floor)', () => {
  runSafetySim({ surface: 'zen' }, 300);
});
