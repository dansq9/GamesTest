/**
 * rng.ts — the ONLY source of randomness in the engine.
 *
 * Determinism contract (spec 03 §1):
 *  - mulberry32 evolves entirely in 32-bit integer arithmetic (Math.imul + bitwise),
 *    so its trajectory and every emitted double are reproducible bit-for-bit across
 *    every JS engine (spec 03 §1.1).
 *  - fnv1a hashes the seed string to the initial 32-bit accumulator (spec 03, `_seedFromDate`).
 *  - `Math.random` is banned everywhere in this package. `newGame` always builds a concrete
 *    Rng — from a caller seed, or from a recorded auto-seed for casual play (spec 03 §1.3).
 *
 * Resume contract (spec 03 §1.4): the ENTIRE internal state is the single 32-bit accumulator.
 * We persist it via `getState()` and rehydrate with `rngFromState()`. This is exact — unlike
 * the prototype's `seed ^ (turns+1)` hack, which starts a fresh stream and desyncs on resume.
 * `calls` is tracked as a human-facing cursor / debug aid only; it is NOT how we resume.
 */

export interface Rng {
  /** Next double in [0, 1). Advances the stream. */
  next(): number;
  /** Number of draws consumed so far (cursor / debug aid; resume uses getState()). */
  readonly calls: number;
  /** Current 32-bit accumulator — the complete state needed to resume exactly. */
  getState(): number;
  /** Independent copy at the same position (for lookahead that must not disturb the live stream). */
  clone(): Rng;
}

/** FNV-1a over a UTF-16 code-unit stream → uint32. Pure 32-bit integer math (spec 03 §1.1). */
export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Build an Rng from a raw 32-bit accumulator state (used by restore + createRng). */
export function rngFromState(state: number, calls = 0): Rng {
  let a = state | 0;
  let n = calls;
  return {
    next(): number {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      n++;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    get calls(): number {
      return n;
    },
    getState(): number {
      return a >>> 0;
    },
    clone(): Rng {
      return rngFromState(a, n);
    },
  };
}

/** Build an Rng from a seed string (the normal entry point). */
export function createRng(seed: string): Rng {
  return rngFromState(fnv1a(seed) | 0, 0);
}

/**
 * A recorded random seed for casual play. Uses Web Crypto (present in Node 22 and browsers) —
 * NOT Math.random, and NOT wall-clock — so it is proper entropy that we then persist in
 * `state.seed`, keeping even casual games snapshot/replay/QA-reproducible (spec 03 §1.3).
 */
export function autoSeed(): string {
  const buf = new Uint32Array(2);
  const g = globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } };
  if (g.crypto?.getRandomValues) {
    g.crypto.getRandomValues(buf);
  } else {
    // Extremely defensive fallback for exotic runtimes without Web Crypto.
    // Never hit in Node 22+/browsers. Still avoids Math.random.
    throw new Error('No crypto.getRandomValues available to mint an auto-seed; pass an explicit seed.');
  }
  return `auto-${(buf[0] ?? 0).toString(36)}${(buf[1] ?? 0).toString(36)}`;
}
