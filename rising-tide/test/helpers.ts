/**
 * helpers.ts — deterministic auto-player for tests. NOT a test file (not matched by the runner glob).
 *
 * The strategy is a PURE function of visible state (first unplaced piece with a legal move, at its
 * first legal origin in row-major order). Because it reads only the public API, two engines on the
 * same seed make byte-identical choices — exactly what the golden-master needs.
 */

import {
  RisingTideEngine,
  board as boardOps,
  handIsSafe,
  pieceById,
  resolveClears,
  type GameEvent,
  type NewGameConfig,
} from '../src/index.ts';

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

/**
 * A goal-seeking + never-dead-end bot: among safety-preserving moves, maximize progress toward the
 * active goal (collectibles for collect/barnacle, lines-in-one for multi, else lines then low fill).
 * A reasonable-player proxy for winnability/feasibility checks (the tuned CasualBot is E7).
 */
export function goalSeekingMove(engine: RisingTideEngine): Move | null {
  const s = engine.getState();
  const goal = s.goal;
  const unplaced = s.tray.map((p, i) => ({ p, i })).filter((x) => !x.p.placed);

  type Cand = Move & { rank: number; fill: number };
  let best: Cand | null = null;
  let anyLegal: Move | null = null;

  for (const { p, i } of unplaced) {
    for (const [r, c] of engine.legalMoves(i)) {
      if (!anyLegal) anyLegal = { pieceIdx: i, r, c };
      const stamped = boardOps.placeCells(s.board, p.cells, r, c, 'teal');
      const { rows, cols } = boardOps.findFullLines(stamped);
      const N = rows.length + cols.length;
      const resolved = resolveClears(stamped, s.elements, rows, cols);
      const remaining = unplaced.filter((x) => x.i !== i).map((x) => pieceById(x.p.pieceId));
      if (!handIsSafe(resolved.board, remaining)) continue; // never dead-end a safe hand
      const collectibles = resolved.pearls.length + resolved.barnacles.length + resolved.corals.length;
      const clearScore = goal === 'collect' || goal === 'barnacle' ? collectibles : N;
      const fill = boardOps.fillPct(resolved.board);
      // Clears dominate; among non-clears, keep the board open (lowest fill).
      if (best === null || clearScore > best.rank || (clearScore === best.rank && fill < best.fill)) {
        best = { pieceIdx: i, r, c, rank: clearScore, fill };
      }
    }
  }
  return best ? { pieceIdx: best.pieceIdx, r: best.r, c: best.c } : anyLegal;
}

/** Play a config to a terminal state; return whether the goal was won. */
export function playToWin(config: NewGameConfig, maxTurns = 400): boolean {
  const engine = new RisingTideEngine();
  engine.newGame(config);
  for (let t = 0; t < maxTurns; t++) {
    if (engine.getState().status !== 'playing') break;
    const mv = goalSeekingMove(engine);
    if (!mv) break;
    engine.placePiece(mv.pieceIdx, mv.r, mv.c);
  }
  return engine.getState().status === 'won';
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
