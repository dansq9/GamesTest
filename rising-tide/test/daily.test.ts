/**
 * daily.test.ts — Daily Tide seeding: one board worldwide per UTC date (spec 03 §1.3).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { dailySeed, utcDateString, type NewGameConfig } from '../src/index.ts';
import { playGame } from './helpers.ts';

test('dailySeed is date-derived and stable', () => {
  assert.equal(dailySeed('2026-07-05'), 'daily:2026-07-05');
  assert.equal(dailySeed('2026-07-05'), dailySeed('2026-07-05'));
  assert.notEqual(dailySeed('2026-07-05'), dailySeed('2026-07-06'));
});

test('utcDateString formats a Date as YYYY-MM-DD in UTC', () => {
  assert.equal(utcDateString(new Date('2026-07-05T23:30:00Z')), '2026-07-05');
  assert.equal(utcDateString(new Date('2026-01-09T00:00:00Z')), '2026-01-09');
});

test('same daily seed ⇒ identical board for everyone (Seeded sameness)', () => {
  const config = (seed: string): NewGameConfig => ({ surface: 'tide', seed });
  const playerA = playGame(config(dailySeed('2026-07-05')));
  const playerB = playGame(config(dailySeed('2026-07-05')));
  assert.deepEqual(playerA, playerB, 'two players on the same date play the identical board');
});

test("different dates ⇒ different boards", () => {
  const today = playGame({ surface: 'tide', seed: dailySeed('2026-07-05') });
  const tomorrow = playGame({ surface: 'tide', seed: dailySeed('2026-07-06') });
  assert.notDeepEqual(today, tomorrow);
});
