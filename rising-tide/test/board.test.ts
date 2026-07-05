/**
 * board.test.ts — pure board-op unit tests (spec 02 §4).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { board, emptyBoard, type Board, type ColorId } from '../src/index.ts';

const { canPlace, findFullLines, clearLines, hasAnyMove, fillPct, legalMoves } = board;

function fillRow(b: Board, r: number, color: ColorId = 'teal'): void {
  for (let c = 0; c < 8; c++) b[r]![c] = { color };
}
function fillCol(b: Board, c: number, color: ColorId = 'teal'): void {
  for (let r = 0; r < 8; r++) b[r]![c] = { color };
}

test('canPlace: fits in empty, rejects overlap and out-of-bounds', () => {
  const b = emptyBoard();
  const domino: [number, number][] = [[0, 0], [0, 1]];
  assert.equal(canPlace(b, domino, 0, 0), true);
  assert.equal(canPlace(b, domino, 0, 7), false, 'would spill past the right edge');
  b[3]![3] = { color: 'coral' };
  assert.equal(canPlace(b, domino, 3, 3), false, 'overlaps an occupied cell');
  assert.equal(canPlace(b, domino, 3, 4), true);
});

test('findFullLines: detects full rows and cols', () => {
  const b = emptyBoard();
  fillRow(b, 2);
  fillCol(b, 5);
  const { rows, cols } = findFullLines(b);
  assert.deepEqual(rows, [2]);
  assert.deepEqual(cols, [5]);
});

test('clearLines: clears row+col simultaneously and dedups the intersection', () => {
  const b = emptyBoard();
  fillRow(b, 2);
  fillCol(b, 5);
  const { rows, cols } = findFullLines(b);
  const { board: cleared, cleared: cells } = clearLines(b, rows, cols);

  // Row 2 (8 cells) + col 5 (8 cells) − 1 shared intersection = 15 distinct cleared cells.
  assert.equal(cells.length, 15);
  for (let c = 0; c < 8; c++) assert.equal(cleared[2]![c], null);
  for (let r = 0; r < 8; r++) assert.equal(cleared[r]![5], null);
});

test('hasAnyMove: false only when no unplaced piece fits anywhere', () => {
  const b = emptyBoard();
  // Fill the whole board.
  for (let r = 0; r < 8; r++) fillRow(b, r);
  const tray = [{ cells: [[0, 0]] as [number, number][], placed: false }];
  assert.equal(hasAnyMove(b, tray), false);
  // Open one cell — a dot now fits.
  b[4]![4] = null;
  assert.equal(hasAnyMove(b, tray), true);
  // A placed piece is ignored.
  assert.equal(hasAnyMove(b, [{ cells: [[0, 0]] as [number, number][], placed: true }]), false);
});

test('fillPct: fraction of 64 cells occupied', () => {
  const b = emptyBoard();
  assert.equal(fillPct(b), 0);
  fillRow(b, 0);
  assert.equal(fillPct(b), 8 / 64);
});

test('legalMoves: row-major origins where the piece fits', () => {
  const b = emptyBoard();
  for (let r = 0; r < 8; r++) fillRow(b, r);
  b[0]![0] = null;
  b[0]![1] = null;
  const moves = legalMoves(b, [[0, 0], [0, 1]]);
  assert.deepEqual(moves, [[0, 0]]);
});
