/**
 * economy.test.ts — the pearl economy: payouts, First-Win-of-Day, daily streak + freeze (spec 10).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  FRESH_ECONOMY,
  applyWin,
  grantFreezeToken,
  spendPearls,
  starPearls,
  updateDailyStreak,
  winPayout,
  type EconomyState,
} from '../src/index.ts';

test('star payouts are 30 / 20 / 10', () => {
  assert.equal(starPearls(3), 30);
  assert.equal(starPearls(2), 20);
  assert.equal(starPearls(1), 10);
});

test('winPayout combines stars + milestone + First-Win-of-Day (once per UTC day)', () => {
  const p = winPayout(FRESH_ECONOMY, { stars: 3, levelNumber: 10, isMilestone: true, utcDate: '2026-07-05' });
  assert.equal(p.stars, 30);
  assert.equal(p.milestone, 30); // L10 milestone bonus
  assert.equal(p.firstWinOfDay, 10);
  assert.equal(p.total, 70);

  const after = applyWin(FRESH_ECONOMY, { stars: 3, levelNumber: 10, isMilestone: true, utcDate: '2026-07-05' });
  assert.equal(after.pearls, 70);
  // Second win the same day: no First-Win bonus.
  const second = winPayout(after, { stars: 2, utcDate: '2026-07-05' });
  assert.equal(second.firstWinOfDay, 0);
  assert.equal(second.total, 20);
});

test('daily streak advances on consecutive days and survives short gaps', () => {
  let e: EconomyState = FRESH_ECONOMY;
  let r = updateDailyStreak(e, 'd1', 1, null);
  assert.equal(r.econ.streakCount, 1);
  r = updateDailyStreak(r.econ, 'd2', 2, 1);
  assert.equal(r.econ.streakCount, 2, 'consecutive day');
  r = updateDailyStreak(r.econ, 'd4', 4, 2);
  assert.equal(r.econ.streakCount, 3, 'missed 1 day (<3) — streak survives');
  assert.equal(r.broke, false);
});

test('streak breaks after 3 missed days; a freeze token holds it', () => {
  const base: EconomyState = { ...FRESH_ECONOMY, streakCount: 5 };
  const broke = updateDailyStreak(base, 'd10', 10, 5); // missed = 10-5-1 = 4 ≥ 3
  assert.equal(broke.broke, true);
  assert.equal(broke.econ.streakCount, 1);

  const withFreeze: EconomyState = { ...base, freezeTokens: 1 };
  const held = updateDailyStreak(withFreeze, 'd10', 10, 5);
  assert.equal(held.held, true);
  assert.equal(held.broke, false);
  assert.equal(held.econ.streakCount, 6);
  assert.equal(held.econ.freezeTokens, 0);
});

test('reaching a streak-chest tier pays out once', () => {
  const base: EconomyState = { ...FRESH_ECONOMY, streakCount: 2 };
  const r = updateDailyStreak(base, 'd3', 3, 2); // streak → 3 → chest 75
  assert.equal(r.chestPearls, 75);
  assert.equal(r.econ.pearls, 75);
  // Not paid again if we somehow revisit tier 3.
  const again = updateDailyStreak({ ...r.econ, streakCount: 2 }, 'd4', 4, 3);
  assert.equal(again.chestPearls, 0);
});

test('spendPearls guards affordability; freeze tokens respect the cap', () => {
  const rich: EconomyState = { ...FRESH_ECONOMY, pearls: 100 };
  assert.equal(spendPearls(rich, 40)?.pearls, 60);
  assert.equal(spendPearls(rich, 200), null, 'cannot overspend');

  let e: EconomyState = { ...FRESH_ECONOMY, freezeTokens: 4 };
  e = grantFreezeToken(e);
  assert.equal(e.freezeTokens, 4, 'freeze token hold cap');
});
