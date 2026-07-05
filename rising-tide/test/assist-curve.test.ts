/**
 * assist-curve.test.ts — the data-driven assist-fade curve (spec 01 §3).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { assistFor, pGap, pressureForChapter } from '../src/index.ts';

function approx(a: number, b: number, msg?: string): void {
  assert.ok(Math.abs(a - b) < 1e-9, msg ?? `${a} ≈ ${b}`);
}

test('p_gap follows the spec formula and hits 0 at L13', () => {
  // Implementation follows the FORMULA p_base = clamp(0.60 − 0.05·(L−1)), which the spec prose
  // pins ("hits 0 at L=13"). NOTE: spec 01 §3a's lookup TABLE is off-by-one vs its own formula at
  // L11/L12 (table shows .05/.00; formula gives .10/.05). Reconcile the spec table to the formula.
  approx(pGap(1), 0.6);
  approx(pGap(2), 0.55);
  approx(pGap(3), 0.5);
  approx(pGap(6), 0.35);
  approx(pGap(11), 0.1);
  approx(pGap(12), 0.05);
  approx(pGap(13), 0.0, 'gap-fill is off from L13 onward');
  approx(pGap(40), 0.0);
});

test('teach and milestone bonuses raise p_gap at their levels', () => {
  approx(pGap(4, false, true), 0.55, 'L4 with teach bonus');
  approx(pGap(5, false, true), 0.5, 'L5 with teach bonus');
  approx(pGap(10, true, false), 0.35, 'L10 milestone bonus');
});

test('pressure dial relaxes over chapters but never reaches 0', () => {
  assert.equal(pressureForChapter('shallows', 'voyage'), 1.0);
  assert.equal(pressureForChapter('reef', 'voyage'), 0.75);
  assert.equal(pressureForChapter('deep', 'voyage'), 0.55);
  assert.equal(pressureForChapter('openwater', 'voyage'), 0.4);
  assert.ok(pressureForChapter('openwater', 'voyage') > 0, 'never fully off');
});

test('zen is calm and non-fading; fair gets no gap-fill help', () => {
  const zen = assistFor({ surface: 'zen', fairness: 'fair', gamesPlayed: 500 });
  assert.equal(zen.gapFill, 0.3, 'zen keeps a gentle finisher aid regardless of lifetime games');
  assert.equal(zen.pressure, 1.0, 'zen keeps the strongest board-opening posture');

  const fair = assistFor({ surface: 'voyage', fairness: 'fair', chapter: 'reef', levelNumber: 16 });
  assert.equal(fair.gapFill, 0, 'Fair earns its wins — no gap-fill');
  assert.equal(fair.pressure, 0.75);

  const guidedEarly = assistFor({ surface: 'voyage', fairness: 'guided', chapter: 'shallows', levelNumber: 1 });
  approx(guidedEarly.gapFill, 0.6);
  assert.equal(guidedEarly.pressure, 1.0);
});
