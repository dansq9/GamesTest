/**
 * starbands.test.ts — 3/2/1-star resolution per goal type (spec 09 §1).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { RisingTideEngine, resolveStars, type ColorId, type GameEvent, type GameState, type LevelDef, type StarInput } from '../src/index.ts';

function starInput(over: Partial<StarInput>): StarInput {
  return {
    goal: 'lines',
    chapter: 'reef',
    target: 5,
    moveLimit: 0,
    movesUsed: 0,
    maxTide: 0,
    endFillPct: 0,
    score: 0,
    turns: 0,
    hasBonus: false,
    ...over,
  };
}
const L = (over: Partial<LevelDef>): LevelDef => ({ id: 'x', name: 'X', chapter: 'reef', goal: 'lines', target: 5, fairness: 'fair', ...over });

test('survive: calm survival is 3★, a near-drown is 1★', () => {
  const level = L({ goal: 'survive', chapter: 'reef' });
  assert.equal(resolveStars(level, starInput({ goal: 'survive', maxTide: 4 })).stars, 3); // M=4
  assert.equal(resolveStars(level, starInput({ goal: 'survive', maxTide: 6 })).stars, 2); // M=2
  assert.equal(resolveStars(level, starInput({ goal: 'survive', maxTide: 7 })).stars, 1); // M=1
});

test('move-limited lines: near-EMW is 3★, last-move win is 1★', () => {
  const level = L({ goal: 'lines', chapter: 'shallows', target: 5, moveLimit: 12 }); // EMW≈8, b3=+1
  const inp = (movesUsed: number) => starInput({ goal: 'lines', chapter: 'shallows', target: 5, moveLimit: 12, movesUsed });
  assert.equal(resolveStars(level, inp(9)).stars, 3);
  assert.equal(resolveStars(level, inp(11)).stars, 2);
  assert.equal(resolveStars(level, inp(12)).stars, 1);
});

test('unlimited lines: a tidy board is 3★, a full board is 1★', () => {
  const level = L({ goal: 'lines', moveLimit: 0 });
  assert.equal(resolveStars(level, starInput({ endFillPct: 0.2 })).stars, 3);
  assert.equal(resolveStars(level, starInput({ endFillPct: 0.4 })).stars, 2);
  assert.equal(resolveStars(level, starInput({ endFillPct: 0.6 })).stars, 1);
});

test('collect: efficient gathering is 3★, slow is 1★', () => {
  const level = L({ goal: 'collect', chapter: 'reef', target: 5 }); // EMW≈9 → 3★≤11, 2★≤15
  const inp = (movesUsed: number) => starInput({ goal: 'collect', chapter: 'reef', target: 5, movesUsed });
  assert.equal(resolveStars(level, inp(10)).stars, 3);
  assert.equal(resolveStars(level, inp(13)).stars, 2);
  assert.equal(resolveStars(level, inp(16)).stars, 1);
});

test('score: reaching target fast is 3★, needing the whole budget is 1★', () => {
  const level = L({ goal: 'score', chapter: 'deep', target: 3000, moveLimit: 18 }); // EMW=15, b3=0
  const inp = (turns: number) => starInput({ goal: 'score', chapter: 'deep', target: 3000, moveLimit: 18, turns, score: 3000 });
  assert.equal(resolveStars(level, inp(14)).stars, 3);
  assert.equal(resolveStars(level, inp(16)).stars, 2);
  assert.equal(resolveStars(level, inp(18)).stars, 1);
});

test('a sim-fitted starBands override wins over the seed formula', () => {
  const level = L({ goal: 'lines', moveLimit: 0, starBands: { metric: 'endFillPct', three: 0.1, two: 0.2, higherIsBetter: false } });
  assert.equal(resolveStars(level, starInput({ endFillPct: 0.05 })).stars, 3);
  assert.equal(resolveStars(level, starInput({ endFillPct: 0.15 })).stars, 2);
  assert.equal(resolveStars(level, starInput({ endFillPct: 0.3 })).stars, 1);
});

test('engine integration: a clean win resolves stars and pays star pearls', () => {
  const e = new RisingTideEngine();
  e.newGame({
    surface: 'voyage',
    seed: 'star-win',
    level: L({ id: 'sw', name: 'SW', goal: 'lines', target: 1, moveLimit: 0, chapter: 'shallows', fairness: 'guided' }),
  });
  const s = e.getState() as GameState;
  for (let c = 0; c < 7; c++) s.board[0]![c] = { color: 'teal' as ColorId };
  s.tray[0] = { pieceId: 'dot', cells: [[0, 0]], color: 'coral', placed: false };
  s.tray[1]!.placed = true;
  s.tray[2]!.placed = true;

  const { events } = e.placePiece(0, 0, 7);
  const won = events.find((ev: GameEvent) => ev.type === 'won');
  assert.ok(won && won.type === 'won');
  assert.equal(won.stars, 3, 'clearing on a nearly-empty board is a tidy 3★');
  const pearls = won.rewards.find((r) => r.kind === 'pearls');
  assert.equal(pearls?.amount, 30, '3★ pays 30 pearls');
});
