/**
 * state.ts — shapes + defaults only, no logic (spec 02 §1, §3).
 * GameState is the complete, serializable state of one game.
 */

import type { ColorId } from './pieces.ts';

export type { ColorId };

export type ElementId = 'barnacle' | 'coral2' | 'pearl' | 'anchor' | 'current' | 'bonus' | 'storm';

/** Play surface (spec 02 §3 two-axis split, decision B1). */
export type Surface = 'zen' | 'tide' | 'blitz' | 'voyage';
/** Fairness posture, named by a voyage level (spec 02 §3). */
export type Fairness = 'guided' | 'fair' | 'seeded';

export type GoalType = 'lines' | 'multi' | 'combo' | 'survive' | 'score' | 'collect' | 'barnacle';
export type Status = 'playing' | 'won' | 'lost';
export type TidePhase = 'calm' | 'rising' | 'critical' | 'drowning';
export type LossReason = 'no-moves' | 'drowned' | 'out-of-moves';

export interface Cell {
  color: ColorId | ElementId;
  element?: ElementId;
  /** coral2 durability, etc. (element data; unused until E3). */
  hits?: number;
}

/** 8×8, row-major. null = empty. */
export type Board = (Cell | null)[][];

export interface TrayPiece {
  pieceId: string;
  cells: [number, number][]; // denormalized offsets, for host convenience
  color: ColorId;
  placed: boolean;
}

export interface ElementSpec {
  kind: ElementId;
  count: number;
  params?: Record<string, number>;
}

export interface LevelDef {
  id: string;
  name: string;
  nextName?: string;
  n?: number; // level ordinal 1..40 — the assist-fade curve keys on this (spec 01 §3)
  chapter: string; // 'shallows' | 'reef' | 'deep' | 'openwater' | 'endless'
  goal: GoalType;
  target: number;
  moveLimit?: number; // 0/undefined = unlimited
  fairness: Fairness; // the level's fairness dial (spec 02 §3: LevelDef.mode is fairness)
  tideRate?: number; // per-level tide multiplier (spec 01 §5); default 1.0
  elements?: ElementSpec[];
  milestone?: boolean;
  teachAssist?: boolean; // +teachBonus to gap-fill where the assist IS the lesson (spec 01 §3a)
  seedPolicy?: 'none' | 'date' | 'attempt';
}

export interface Reward {
  kind: 'pearls' | 'palette' | 'backdrop' | 'title' | 'chapterUnlock';
  amount?: number;
  id?: string;
}

export type GameEvent =
  | { type: 'placed'; pieceIdx: number; color: ColorId; cells: [number, number][] }
  | { type: 'linesCleared'; rows: number[]; cols: number[]; cells: [number, number][]; points: number }
  | { type: 'combo'; value: number }
  | { type: 'comboBroken'; was: number }
  | { type: 'tideRise'; tide: number; phase: TidePhase; rises: number }
  | { type: 'pearlCollected'; cells: [number, number][]; count: number; total: number }
  | { type: 'barnacleRemoved'; cells: [number, number][]; count: number; total: number }
  | { type: 'coralHit'; cells: [number, number][]; remaining: number }
  | { type: 'elementEvent'; element: ElementId; detail: Record<string, unknown> }
  | { type: 'goalProgress'; goal: GoalType; progress: number; target: number }
  | { type: 'trayRefilled'; tray: TrayPiece[]; deterministic: boolean }
  | { type: 'narrowMiss'; goal: GoalType; progress: number; target: number }
  | { type: 'movesGranted'; added: number; movesUsed: number; moveLimit: number }
  | { type: 'continued'; tideAfter?: number; reason: 'drowned' | 'no-moves' }
  | { type: 'trayRerolled'; tray: TrayPiece[]; deterministic: boolean }
  | { type: 'tidePushed'; amount: number; newTide: number }
  | { type: 'won'; stars: number; rewards: Reward[]; nextName?: string }
  | { type: 'lost'; reason: LossReason };

export interface GameState {
  // identity / determinism
  surface: Surface;
  fairness: Fairness;
  seed: string;
  gamesPlayed: number;
  rngCalls: number; // draw cursor (debug aid; resume uses rngState in SerializedGame)

  // board & hand
  board: Board;
  tray: TrayPiece[]; // exactly 3
  turns: number; // +1 per PLACEMENT
  hands: number; // +1 per full tray refill

  // scoring
  score: number;
  combo: number; // consecutive clearing placements
  totalLines: number;

  // tide
  tide: number;
  tidePhase: TidePhase;
  tideRises: number; // integer upward crossings; never decreases
  prevTideFloor: number; // internal accrual cursor

  // level / goal
  level?: LevelDef;
  goal?: GoalType;
  goalProgress: number;
  goalTarget: number;
  movesUsed: number;
  moveLimit: number; // 0 = unlimited

  // elements / collection
  elements: (ElementId | null)[][]; // parallel modifier layer
  pearlsCollected: number;
  barnaclesRemoved: number;

  // outcome
  status: Status;
  lossReason?: LossReason;
  stars?: number;
  continues: number;
  rerolls: number;
  grantedMoves: number;
  deterministic: boolean;
}

export interface SerializedGame {
  version: number;
  seed: string;
  rngState: number; // the 32-bit accumulator — exact resume (spec 03 §1.4)
  rngCalls: number;
  levelId?: string;
  state: Omit<GameState, 'level'> & { levelId?: string };
}

export interface NewGameConfig {
  surface: Surface;
  level?: LevelDef; // required for surface 'voyage'
  seed?: string; // omitted → engine mints + records an auto-seed
  gamesPlayed?: number;
}

export const BOARD_SIZE = 8;

export function emptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));
}

export function emptyElements(): (ElementId | null)[][] {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));
}

/** Fresh zeroed state. The engine fills board/tray/level in newGame. */
export function blankState(surface: Surface, fairness: Fairness, seed: string, gamesPlayed: number): GameState {
  return {
    surface,
    fairness,
    seed,
    gamesPlayed,
    rngCalls: 0,
    board: emptyBoard(),
    tray: [],
    turns: 0,
    hands: 0,
    score: 0,
    combo: 0,
    totalLines: 0,
    tide: 0,
    tidePhase: 'calm',
    tideRises: 0,
    prevTideFloor: 0,
    goalProgress: 0,
    goalTarget: 0,
    movesUsed: 0,
    moveLimit: 0,
    elements: emptyElements(),
    pearlsCollected: 0,
    barnaclesRemoved: 0,
    status: 'playing',
    continues: 0,
    rerolls: 0,
    grantedMoves: 0,
    deterministic: true,
  };
}
