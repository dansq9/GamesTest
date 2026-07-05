/**
 * solvability.test.ts — the per-hand safety guarantee (spec 03 §2, §7 T4).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { emptyBoard, handIsSafe, pieceById, safeFallbackShapes, type Board, type ColorId } from '../src/index.ts';

function fullBoard(): Board {
  const b = emptyBoard();
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) b[r]![c] = { color: 'teal' as ColorId };
  return b;
}

test('empty board with three dots is safe', () => {
  assert.equal(handIsSafe(emptyBoard(), [pieceById('dot'), pieceById('dot'), pieceById('dot')]), true);
});

test('full board is unsafe for any piece (no legal placement)', () => {
  assert.equal(handIsSafe(fullBoard(), [pieceById('dot')]), false);
});

test('collective unsafety: pieces that individually cannot fit two isolated gaps', () => {
  // Board full except two NON-adjacent single cells → no domino fits anywhere.
  const b = fullBoard();
  b[0]![0] = null;
  b[0]![2] = null;
  assert.equal(handIsSafe(b, [pieceById('dom-h'), pieceById('dom-h'), pieceById('dom-h')]), false);
});

test('clearing opens space: dots complete a line and free the board (safe via simulated clears)', () => {
  // Same board, but dots fit the singles and completing row/col 0 clears space for the third.
  const b = fullBoard();
  b[0]![0] = null;
  b[0]![2] = null;
  assert.equal(handIsSafe(b, [pieceById('dot'), pieceById('dot'), pieceById('dot')]), true);
});

test('safeFallback builds a placeable prefix on an open board', () => {
  const shapes = safeFallbackShapes(emptyBoard(), [pieceById('dot'), pieceById('dom-h'), pieceById('i4-h')]);
  assert.equal(shapes.length, 3);
  assert.equal(handIsSafe(emptyBoard(), shapes), true);
});
