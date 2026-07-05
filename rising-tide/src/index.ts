/**
 * index.ts — public barrel for @risingtide/engine (spec 02 §1).
 */

export { RisingTideEngine } from './engine.ts';
export { createRng, rngFromState, fnv1a, autoSeed, type Rng } from './rng.ts';
export { PIECES, COLORS, pieceById, pieceSize, type Piece, type ColorId } from './pieces.ts';
export { LEVELS, levelById, levelByNumber } from './levels.ts';
export { seedElements, resolveClears, resolveClearedCells, BONUS_MULT, type ClearResolution } from './elements.ts';
export * as board from './board.ts';
export { scorePlacement } from './scoring.ts';
export { applyTide, phaseFor, riseFor, TIDE_CAP } from './tide.ts';
export { generateTray, contextFor, type GenContext } from './generator.ts';
export { handIsSafe, handCanClear, minEndFill, safeFallbackShapes } from './solvability.ts';
export { assistFor, noFloodFor, pGap, pressureForChapter, type Assist, type AssistInput } from './assist.ts';
export { dailySeed, utcDateString } from './daily.ts';
export {
  computeDDA,
  applyDda,
  updateProfile,
  startSession,
  chapterWinRateTarget,
  NEUTRAL_PROFILE,
  NEUTRAL_DDA,
  type PlayerProfile,
  type DdaDeltas,
} from './dda.ts';
export {
  BOARD_SIZE,
  blankState,
  emptyBoard,
  emptyElements,
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
  type PowerUpId,
  type Reward,
  type SerializedGame,
  type SpecialId,
  type Status,
  type Surface,
  type TidePhase,
  type TrayPiece,
} from './state.ts';
