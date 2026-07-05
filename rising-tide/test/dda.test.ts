/**
 * dda.test.ts — Dynamic Difficulty Adjustment (spec 11), incl. the determinism reconciliation
 * (audit B2): DDA modulates generation from the profile but never breaks seed-reproducibility.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyDda,
  assistFor,
  computeDDA,
  updateProfile,
  NEUTRAL_PROFILE,
  type LevelDef,
  type NewGameConfig,
  type PlayerProfile,
} from '../src/index.ts';
import { playGame } from './helpers.ts';

const struggling: PlayerProfile = { recentWinRate: 0.3, avgSlack: 0, lossStreak: 2, sessionClears: 0 };
const strong: PlayerProfile = { recentWinRate: 0.96, avgSlack: 4, lossStreak: 0, sessionClears: 200 };
const comfort: PlayerProfile = { recentWinRate: 0.25, avgSlack: 0, lossStreak: 4, sessionClears: 0 };

test('computeDDA: struggling players get gap-fill help; strong players a gentle bump', () => {
  const s = computeDDA(struggling, 'reef', 'fair');
  assert.ok(s.gapFillBoost > 0, 'struggling → positive gap-fill boost');
  assert.ok(s.pressureAdjust < 0, 'struggling → pressure softened');

  const g = computeDDA(strong, 'reef', 'fair');
  assert.equal(g.gapFillBoost, 0, 'strong → no gap-fill boost');
  assert.ok(g.pressureAdjust > 0, 'strong → gentle pressure bump');
});

test('DDA is asymmetric: softens more (−0.15) than it tightens (+0.10)', () => {
  const veryWeak = computeDDA({ ...struggling, recentWinRate: 0 }, 'reef', 'fair');
  const veryStrong = computeDDA({ ...strong, recentWinRate: 1 }, 'reef', 'fair');
  assert.ok(veryWeak.pressureAdjust >= -0.15 - 1e-9 && veryWeak.pressureAdjust <= -0.14);
  assert.ok(veryStrong.pressureAdjust <= 0.1 + 1e-9 && veryStrong.pressureAdjust >= 0.09);
  assert.ok(Math.abs(veryWeak.pressureAdjust) > veryStrong.pressureAdjust, 'help > challenge');
});

test('comfort mode after 3 losses maximally assists (within solvability)', () => {
  const dda = computeDDA(comfort, 'deep', 'fair');
  assert.equal(dda.comfortMode, true);
  const merged = applyDda(0, 0.55, dda);
  assert.ok(merged.gapFill >= 0.25, 'comfort floors gap-fill at 0.25');
  assert.equal(merged.pressure, 0.3, 'comfort drops pressure to the floor');
});

test('DDA is OFF in Seeded (neutral), and gentler in Fair than Guided', () => {
  assert.deepEqual(computeDDA(struggling, 'reef', 'seeded'), { gapFillBoost: 0, pressureAdjust: 0, comfortMode: false });
  const guided = computeDDA({ ...struggling, recentWinRate: 0 }, 'shallows', 'guided');
  const fair = computeDDA({ ...struggling, recentWinRate: 0 }, 'shallows', 'fair');
  assert.ok(guided.gapFillBoost > fair.gapFillBoost, 'Fair halves the boost ceiling');
});

test('DDA response is monotone: lower win rate ⇒ at least as much help (G16.5)', () => {
  let prev = -1;
  for (const wr of [0.0, 0.2, 0.4, 0.49]) {
    const boost = computeDDA({ ...struggling, recentWinRate: wr, lossStreak: 0 }, 'reef', 'fair').gapFillBoost;
    assert.ok(boost >= 0);
    if (prev >= 0) assert.ok(boost <= prev, 'help never inverts as win rate rises');
    prev = boost;
  }
});

test('updateProfile moves signals correctly on win and loss', () => {
  const afterWin = updateProfile(NEUTRAL_PROFILE, { won: true, slack: 5, linesCleared: 12 });
  assert.ok(afterWin.recentWinRate > NEUTRAL_PROFILE.recentWinRate);
  assert.equal(afterWin.lossStreak, 0);
  assert.equal(afterWin.sessionClears, 12);

  const afterLoss = updateProfile(NEUTRAL_PROFILE, { won: false, slack: 0, linesCleared: 3 });
  assert.ok(afterLoss.recentWinRate < NEUTRAL_PROFILE.recentWinRate);
  assert.equal(afterLoss.lossStreak, 1);
});

test('assistFor end-to-end: a struggling player gets more help than neutral (fair, post-L13)', () => {
  const base = { surface: 'voyage' as const, fairness: 'fair' as const, chapter: 'deep', levelNumber: 25 };
  const neutral = assistFor(base);
  const helped = assistFor({ ...base, dda: computeDDA(struggling, 'deep', 'fair') });
  assert.ok(helped.gapFill > neutral.gapFill || helped.pressure < neutral.pressure, 'DDA visibly softens');
});

// ── Determinism reconciliation (audit B2) ──────────────────────────────────

const FAIR_LEVEL: LevelDef = { id: 'dda-fair', n: 16, name: 'DDA Fair', chapter: 'reef', goal: 'lines', target: 99, fairness: 'fair' };
const SEEDED_LEVEL: LevelDef = { ...FAIR_LEVEL, id: 'dda-seeded', name: 'DDA Seeded', fairness: 'seeded' };
const cfg = (level: LevelDef, profile: PlayerProfile): NewGameConfig => ({ surface: 'voyage', level, seed: 'dda-det', profile });

test('same seed + same profile ⇒ identical game', () => {
  assert.deepEqual(playGame(cfg(FAIR_LEVEL, struggling)), playGame(cfg(FAIR_LEVEL, struggling)));
});

test('same seed + DIFFERENT profile ⇒ different game (DDA actually adapts generation)', () => {
  assert.notDeepEqual(playGame(cfg(FAIR_LEVEL, comfort)), playGame(cfg(FAIR_LEVEL, strong)));
});

test('Seeded ignores the profile entirely — identical board for everyone', () => {
  assert.deepEqual(playGame(cfg(SEEDED_LEVEL, comfort)), playGame(cfg(SEEDED_LEVEL, strong)));
});
