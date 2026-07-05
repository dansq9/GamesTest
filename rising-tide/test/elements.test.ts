/**
 * elements.test.ts — board-element seeding + clear resolution (spec 04 §1).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BONUS_MULT,
  createRng,
  emptyBoard,
  emptyElements,
  resolveClears,
  seedElements,
  type Board,
  type ColorId,
  type ElementId,
} from '../src/index.ts';

function fillRowExcept(b: Board, r: number, exceptCol: number): void {
  for (let c = 0; c < 8; c++) if (c !== exceptCol) b[r]![c] = { color: 'teal' as ColorId };
}

test('seedElements places the requested count and respects ≤2 per line', () => {
  const board = emptyBoard();
  const elements = emptyElements();
  seedElements(board, elements, [{ kind: 'pearl', count: 6 }], createRng('seed-pearls'));
  let pearls = 0;
  const perRow = new Array(8).fill(0);
  const perCol = new Array(8).fill(0);
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (elements[r]![c] === 'pearl') {
        pearls++;
        perRow[r]++;
        perCol[c]++;
      }
  assert.equal(pearls, 6);
  assert.ok(Math.max(...perRow) <= 2 && Math.max(...perCol) <= 2, 'no line holds more than 2 elements');
});

test('barnacle in a cleared line is removed and counted', () => {
  const board = emptyBoard();
  const elements = emptyElements();
  // Fill row 0 fully with a barnacle at col 3.
  for (let c = 0; c < 8; c++) board[0]![c] = { color: 'teal' as ColorId };
  board[0]![3] = { color: 'barnacle', element: 'barnacle' };
  elements[0]![3] = 'barnacle' as ElementId;

  const res = resolveClears(board, elements, [0], []);
  assert.equal(res.barnacles.length, 1);
  assert.deepEqual(res.barnacles[0], [0, 3]);
  assert.equal(res.board[0]![3], null, 'barnacle cell cleared');
});

test('coral takes two strikes: first survives (hits→1), second clears', () => {
  const board = emptyBoard();
  const elements = emptyElements();
  for (let c = 0; c < 8; c++) board[0]![c] = { color: 'teal' as ColorId };
  board[0]![4] = { color: 'coral2', element: 'coral2', hits: 2 };
  elements[0]![4] = 'coral2' as ElementId;

  const first = resolveClears(board, elements, [0], []);
  assert.equal(first.corals.length, 0, 'coral not yet removed on first strike');
  assert.equal(first.board[0]![4]?.hits, 1, 'hits decremented to 1');
  assert.ok(first.coralHits.some((h) => h.remaining === 1));
  assert.equal(first.board[0]![0], null, 'the rest of the line still clears');

  // Re-fill the line around the hits:1 coral and strike again.
  const b2 = first.board;
  const e2 = first.elements;
  for (let c = 0; c < 8; c++) if (c !== 4) b2[0]![c] = { color: 'teal' as ColorId };
  const second = resolveClears(b2, e2, [0], []);
  assert.equal(second.corals.length, 1, 'coral removed on second strike');
  assert.equal(second.board[0]![4], null);
});

test('pearl on a cleared cell is collected; bonus multiplies', () => {
  const board = emptyBoard();
  const elements = emptyElements();
  // Player-filled row 0; a pearl marker at col 2, a bonus marker at col 5.
  for (let c = 0; c < 8; c++) board[0]![c] = { color: 'teal' as ColorId };
  elements[0]![2] = 'pearl' as ElementId;
  elements[0]![5] = 'bonus' as ElementId;

  const res = resolveClears(board, elements, [0], []);
  assert.equal(res.pearls.length, 1);
  assert.deepEqual(res.pearls[0], [0, 2]);
  assert.equal(res.bonusMult, BONUS_MULT, 'one bonus tile → base multiplier');
});

test('resolveClears dedups a row∩col intersection', () => {
  const board = emptyBoard();
  const elements = emptyElements();
  for (let c = 0; c < 8; c++) board[0]![c] = { color: 'teal' as ColorId };
  for (let r = 0; r < 8; r++) board[r]![5] = { color: 'teal' as ColorId };
  const res = resolveClears(board, elements, [0], [5]);
  assert.equal(res.cleared.length, 15, 'row(8) + col(8) − shared(1)');
});
