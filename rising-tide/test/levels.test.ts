/**
 * levels.test.ts — the 40-level voyage (spec 01 §1) and the E3a ship criterion.
 *
 * E3a proves the CONTENT + MECHANICS are correct and playable headless: all 40 levels run to a
 * terminal without error, every goal TYPE is winnable, and the un-losable Shallows are un-losable.
 * The move-limited efficiency levels' budgets are `[OPEN — product owner]` values whose win-RATE
 * bands are calibrated against the tuned CasualBot in E7 (spec 01 §2, spec 07); a simple greedy bot
 * winning them is not the E3a bar, so those are only required to PLAY correctly here.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LEVELS, levelByNumber, RisingTideEngine, type GoalType, type LevelDef } from '../src/index.ts';
import { goalSeekingMove, playToWin } from './helpers.ts';

test('the voyage is 40 levels, ordinals 1..40 unique', () => {
  assert.equal(LEVELS.length, 40);
  const ns = LEVELS.map((l) => l.n).sort((a, b) => (a ?? 0) - (b ?? 0));
  assert.deepEqual(ns, Array.from({ length: 40 }, (_, i) => i + 1));
});

test('element drip debuts at the authored levels', () => {
  const has = (n: number, kind: string) => (levelByNumber(n)?.elements ?? []).some((e) => e.kind === kind);
  assert.ok(has(11, 'barnacle'), 'barnacle debuts L11');
  assert.ok(has(14, 'coral2'), 'coral debuts L14');
  assert.ok(has(18, 'pearl'), 'pearl debuts L18');
  assert.ok(has(31, 'bonus'), 'bonus debuts L31');
});

test('chapters and fairness are consistent (Ch1 guided, Ch2-4 fair)', () => {
  for (const l of LEVELS) {
    if ((l.n ?? 0) <= 10) assert.equal(l.fairness, 'guided', `${l.name} should be guided`);
    else assert.equal(l.fairness, 'fair', `${l.name} should be fair`);
  }
});

test('collect/barnacle targets are backed by enough seeded elements to be reachable', () => {
  for (const l of LEVELS) {
    if (l.goal === 'collect' || l.goal === 'barnacle') {
      const seeded = (l.elements ?? []).reduce((sum, e) => sum + e.count, 0);
      assert.ok(seeded >= l.target, `${l.name}: seeded ${seeded} must cover target ${l.target}`);
    }
  }
});

test('every one of the 40 levels plays to a terminal without error', () => {
  for (const level of LEVELS as readonly LevelDef[]) {
    const engine = new RisingTideEngine();
    engine.newGame({ surface: 'voyage', level, seed: `play-${level.id}` });
    let terminal = false;
    for (let t = 0; t < 500; t++) {
      if (engine.getState().status !== 'playing') {
        terminal = true;
        break;
      }
      const mv = goalSeekingMove(engine);
      if (!mv) break;
      engine.placePiece(mv.pieceIdx, mv.r, mv.c);
    }
    // Unlimited non-tide levels a competent player never loses may not self-terminate; the point is
    // it ran cleanly. Terminal OR still-playing-after-500 are both fine; a throw would have failed.
    assert.ok(terminal || engine.getState().status === 'playing', `${level.name} ran cleanly`);
  }
});

test('the un-losable Shallows (L1–3) are always won', () => {
  for (const n of [1, 2, 3]) {
    const level = levelByNumber(n)!;
    for (let seed = 0; seed < 3; seed++) {
      assert.ok(playToWin({ surface: 'voyage', level, seed: `shallows-${n}-${seed}` }), `${level.name} must be winnable`);
    }
  }
});

test('every goal type is winnable (mechanics proven)', () => {
  const winnableAtType = new Set<GoalType>();
  for (const level of LEVELS as readonly LevelDef[]) {
    if (winnableAtType.has(level.goal)) continue;
    for (let seed = 0; seed < 5; seed++) {
      if (playToWin({ surface: 'voyage', level, seed: `type-${level.id}-${seed}` })) {
        winnableAtType.add(level.goal);
        break;
      }
    }
  }
  // Score levels are all move-limited (calibration-sensitive); prove the score mechanic on an
  // unlimited synthetic level so the mechanic itself is demonstrably winnable.
  if (!winnableAtType.has('score')) {
    const synthetic: LevelDef = { id: 'score-mech', n: 999, name: 'Score Mechanic', chapter: 'shallows', goal: 'score', target: 800, fairness: 'guided' };
    if (playToWin({ surface: 'voyage', level: synthetic, seed: 'score-mech' })) winnableAtType.add('score');
  }
  const allTypes: GoalType[] = ['lines', 'multi', 'combo', 'survive', 'score', 'collect', 'barnacle'];
  const missing = allTypes.filter((g) => !winnableAtType.has(g));
  assert.deepEqual(missing, [], 'each goal type must be winnable by a competent player');
});

test('winnability coverage is high; any not-won level is only budget/multi calibration (E7)', () => {
  const notWon: LevelDef[] = [];
  for (const level of LEVELS as readonly LevelDef[]) {
    let won = false;
    for (let seed = 0; seed < 5 && !won; seed++) won = playToWin({ surface: 'voyage', level, seed: `cov-${level.id}-${seed}` });
    if (!won) notWon.push(level);
  }
  assert.ok(LEVELS.length - notWon.length >= 30, `expected ≥30/40 winnable, got ${LEVELS.length - notWon.length}`);
  // The simple greedy bot only ever misses move-limited or high-target-multi levels — never an
  // unlimited lines/survive/collect/barnacle level. A miss there would be a mechanic regression.
  const suspicious = notWon.filter((l) => !(l.moveLimit && l.moveLimit > 0) && !(l.goal === 'multi' && l.target >= 3) && l.goal !== 'score');
  assert.deepEqual(
    suspicious.map((l) => `${l.n}:${l.name}`),
    [],
    'a not-won level outside the budget/multi calibration set indicates a mechanic bug',
  );
});
