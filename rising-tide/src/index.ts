/**
 * index.ts — public barrel for @risingtide/engine (spec 02 §1).
 */

export { RisingTideEngine } from './engine.ts';
export { createRng, rngFromState, fnv1a, autoSeed, type Rng } from './rng.ts';
export { PIECES, COLORS, pieceById, pieceSize, type Piece, type ColorId } from './pieces.ts';
export { LEVELS, levelById } from './levels.ts';
export * as board from './board.ts';
export { scorePlacement } from './scoring.ts';
export { applyTide, phaseFor, riseFor, TIDE_CAP } from './tide.ts';
export { generateTray, contextFor, type GenContext } from './generator.ts';
export { handIsSafe, handCanClear, safeFallbackShapes } from './solvability.ts';
export { assistFor, noFloodFor, type Assist } from './assist.ts';
export {
  BOARD_SIZE,
  blankState,
  emptyBoard,
  type Board,
  type Cell,
  type ElementId,
  type ElementSpec,
  type Fairness,
  type GameEvent,
  type GameState,
  type GoalType,
  type LevelDef,
  type LossReason,
  type NewGameConfig,
  type Reward,
  type SerializedGame,
  type Status,
  type Surface,
  type TidePhase,
  type TrayPiece,
} from './state.ts';
