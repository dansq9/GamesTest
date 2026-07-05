/**
 * helpers.ts — deterministic auto-player for tests. NOT a test file (not matched by the runner glob).
 *
 * The strategy is a PURE function of visible state (first unplaced piece with a legal move, at its
 * first legal origin in row-major order). Because it reads only the public API, two engines on the
 * same seed make byte-identical choices — exactly what the golden-master needs.
 */

import { RisingTideEngine, type GameEvent, type NewGameConfig } from '../src/index.ts';

export interface Move {
  pieceIdx: number;
  r: number;
  c: number;
}

export function chooseMove(engine: RisingTideEngine): Move | null {
  const s = engine.getState();
  for (let i = 0; i < s.tray.length; i++) {
    if (s.tray[i]!.placed) continue;
    const moves = engine.legalMoves(i);
    if (moves.length > 0) {
      const [r, c] = moves[0]!;
      return { pieceIdx: i, r, c };
    }
  }
  return null;
}

/** Play a full game with the deterministic strategy; return the concatenated event stream. */
export function playGame(config: NewGameConfig, maxTurns = 300): GameEvent[] {
  const engine = new RisingTideEngine();
  const all: GameEvent[] = [];
  all.push(...engine.newGame(config).events);
  for (let t = 0; t < maxTurns; t++) {
    if (engine.getState().status !== 'playing') break;
    const mv = chooseMove(engine);
    if (!mv) break;
    all.push(...engine.placePiece(mv.pieceIdx, mv.r, mv.c).events);
  }
  return all;
}
