# 13 · Implementation Guide — Technology & Build Approach

> **Owner:** Engineering Lead.
> **Scope:** technology stack recommendation, build phases, and what Claude Code sessions need
> to know to implement Rising Tide from this spec package.
> **Audience:** product owner + tool/app development team (not game-engine specialists).

---

## 0. The technology question: Unity, Godot, or web stack?

### What the engine needs

Rising Tide is a **turn-based 2D block puzzle** with no physics, no real-time animation requirements,
and no 3D rendering. The engine is a **pure state machine**: `(state, command) → (state', events[])`.
The rendering layer draws an 8×8 grid, 3 block shapes in a tray, a tide meter, score/combo counters,
and a map screen. This is dramatically simpler than what Unity/Godot are designed for.

### Option comparison

| | **TypeScript + Capacitor** | **Unity (C#)** | **Godot (GDScript/C#)** |
|---|---|---|---|
| **Best for** | Web/app dev teams | Game dev teams | Indie game devs |
| **Learning curve for tool app devs** | Low — same stack they know | High — new paradigm (GameObjects, ECS) | Medium — GDScript is Python-like |
| **Claude Code can build it** | Yes, end-to-end | Partially — can write C# scripts, can't use Unity Editor | Partially — can write scripts, can't use Godot Editor |
| **Ad SDK support** | AdMob via Capacitor plugin | Native Unity Ads + AdMob | Plugins exist, less mature |
| **Cross-platform** | iOS + Android + Web | iOS + Android | iOS + Android |
| **App size** | ~5–15 MB | ~40–80 MB minimum | ~20–40 MB |
| **Iteration speed** | Fast — hot reload, web preview | Slow — editor-dependent | Medium |
| **2D performance** | Excellent for this use case | Overkill | Good |
| **Community/hiring** | Massive (web devs) | Large (game devs) | Growing |

### Recommendation: TypeScript + Canvas + Capacitor

For a team of tool/app developers (not game developers), the recommended stack is:

```
┌─────────────────────────────────────────┐
│  Native Shell (Capacitor)               │
│  ├── iOS (Swift wrapper, auto-generated)│
│  ├── Android (Kotlin wrapper, auto-gen) │
│  └── Plugins: AdMob, IAP, Haptics      │
├─────────────────────────────────────────┤
│  UI Layer (HTML5 Canvas + DOM)          │
│  ├── Game board: Canvas 2D             │
│  ├── Menus/store/map: DOM + CSS        │
│  ├── Animations: CSS + requestAnimFrame│
│  └── Touch handling: pointer events    │
├─────────────────────────────────────────┤
│  Engine (TypeScript, pure logic)        │
│  ├── RisingTideEngine class            │
│  ├── TrayGenerator + solvability       │
│  ├── Scoring, combo, tide, DDA         │
│  └── Fully headless, 100% testable     │
└─────────────────────────────────────────┘
```

**Why this stack:**

1. **Your team already knows it.** Tool/app developers work in TypeScript/JavaScript. No new language, no new IDE, no game-engine paradigm to learn.

2. **Claude Code can build the entire thing.** Every layer — engine logic, Canvas rendering, DOM menus, Capacitor config, ad integration — is TypeScript/JS/HTML/CSS. Claude can write it, test it, debug it, and iterate on it in a single session.

3. **The engine is already prototyped in JS.** The v5 prototype (`Rising Tide Prototype v5.dc.html`) is vanilla JavaScript. The engine rewrite from prototype → clean TypeScript state machine is a straightforward port, not a language translation.

4. **Capacitor gives native mobile** without native code. It wraps your web app in a native shell with plugins for AdMob, in-app purchases, haptics, and local storage. Your developers write zero Swift or Kotlin — Capacitor generates the wrappers.

5. **Ad SDKs work.** `@capacitor-community/admob` gives banner, interstitial, and rewarded video with the same API as native AdMob. Header bidding via Google mediation works through the native layer.

6. **The rendering is trivial.** An 8×8 grid of colored squares, drag-and-drop of 3 block shapes, a tide bar, and some text counters. Canvas 2D handles this at 60fps on any modern phone. You don't need a game engine's scene graph, physics, particle system, or animation timeline for this.

### When you WOULD use Unity/Godot

- If you had **game developers** on your team (not tool/app devs)
- If the game had **physics, particle effects, or complex animations** (it doesn't)
- If you were building **multiple games** and wanted a shared engine (possible future)
- If **3D** was ever on the roadmap (it's not)

For a single 2D block puzzle, Unity/Godot adds complexity, build time, and app size for capabilities
you don't use. The web stack gives you everything you need, with a team that already knows it.

---

## 1. Build phases (from spec to shipped game)

### E0 — Determinism skeleton (can start immediately)

**What to build:**
- `Rng` class (mulberry32, integer-exact, `02 §5`)
- `GameState` type definition (`02 §3`)
- `RisingTideEngine` class with `placePiece()` returning `{state, events}` (`02 §2`)
- Basic board: stamp cells, find full rows/cols, clear simultaneously (`02 §4`)
- Scoring formula: `N*N*cellsCleared*10 + combo*50` (`01 §5`)
- Snapshot/restore: serialize state + rngCalls cursor (`02 §7`)
- **Golden-master test:** seed X → play N moves → assert identical event stream (`03 §1`)

**Ship criterion:** `seed ⇒ byte-identical game` proven by test.

### E1 — Solvability & tray generation

**What to build:**
- `TrayGenerator` with piece library, weight tables, gap-fill (`02 §6`)
- `handIsSafe` 3-piece bounded DFS (`03 §2–3`)
- Draw-order invariant (slots 0→1→2, within slot: gap-fill → piece → fitness → color) (`02 §5`)
- No-flood guard (never 3 ≥4-cell pieces in guided/fair) (`02 §6`)
- Property tests T1–T4 (`03 §7`)

**Ship criterion:** T1 (determinism) + T3 (no guided no-moves deaths over ≥1e6 games) green.

### E2 — Fairness modes & assists

**What to build:**
- Three fairness modes: guided / fair / seeded (`02 §3`)
- Assist-fade curve: gap-fill 0.60→0 by L13, pressure dial per chapter (`01 §3`)
- Guided rescue rule: fill ≥ F_rescue → next hand clears (`03 §4.3`)
- Fill ceiling F_cap (`03 §4.3`)
- Daily seed: `seed = seedFromDate(utcDateStr)` (`03 §1.3`)

**Ship criterion:** T3 + T5 (seeded replay) green. All three modes playable headless.

### E3 — Content & elements

**What to build:**
- 40 `LevelDef[]` entries (`01 §1`)
- Board elements: barnacle, coral2, pearl, anchor, bonus (`04 §1`)
- Tier B elements behind feature flags: current (tray-bias only), storm (tide-bump only) (`04 §1.6–1.7`)
- Goal types: lines, survive, score, multi, combo, collect, barnacle (`00 §4.2`)
- Combo upgrade: one-move grace, combo-earned specials (`05 §1`)
- Two specials: Line-Blaster, Bomb (`05 §2`)
- Milestone definitions (`04 §2.1`)
- Power-up satchel: Undo-Last, +Moves, Tide-Push (`10 §3`)
- DDA system: PlayerProfile + 3 adaptive dials (`11`)

**Ship criterion:** All 40 levels playable headless. T-BAND win-rate bands within tolerance.

### E4 — Economy & monetization hooks

**What to build:**
- Pearl wallet + all earn sources (`10 §1`)
- Star-band resolution (`09 §1`)
- Streak system + freeze tokens (`10 §5`)
- Cosmetics store (data, not UI) (`10 §5`)
- Engine hooks: grantMoves, continueAfterLoss, rerollTray, pushTide (`02 §8`)
- First-Win-of-Day (`10 §1`)
- Economy events (`10 §8`)

**Ship criterion:** Economy events fire correctly. Star bands fitted by sim.

### E5 — UI layer (this is where Claude Design takes over)

**What to build:**
- Canvas 2D game board renderer
- Touch drag-and-drop for piece placement
- Tide meter visualization
- HUD: Objective + Constraint chips (`00 §4.3`)
- Map/chapter progression screen
- Store/cosmetics browser
- Celebration animations, feedback text ("Nice!", "Amazing!")
- Haptic feedback integration

### E6 — Ad integration & native wrapper

**What to build:**
- Capacitor project setup (iOS + Android)
- AdMob plugin: persistent banner, interstitial at seams, rewarded video (`12`)
- IAP plugin: remove-ads, pearl packs, cosmetic packs, token packs
- First-session ad immunity window (`12 §3`)
- Offline play support (ads resume on reconnect)

### E7 — QA simulation & polish

**What to build:**
- CasualBot(0.55) + RandomLegalBot + StrongBot (`07 §1`)
- Full CI gate suite G1–G16 (`07 §4`, `09 §4.3`, `11 §5.2`)
- Star-band fitting from sim data (`09 §4`)
- DDA response curve tuning (`11 §5`)
- Difficulty-scorer calibration loop (`07 §3`)

---

## 2. What Claude Code needs to know (for future sessions)

When starting a new Claude Code session to implement Rising Tide, provide this context:

```
Read the engine spec package at research/engine-spec/README.md — start with 
00-engine-gameplay-spec.md (master synthesis), then the specific doc for whatever 
you're building.

The engine is a pure TypeScript state machine: (state, command) → (state', events[]).
No DOM, no framework, no timers. The UI is a separate thin renderer.

Key files by build phase:
- Determinism: 02 (architecture), 03 (fairness/RNG)
- Tray generation: 02 §6, 03 §2-3
- Level content: 01 (level tables), 04 (elements)
- Combos/specials: 05
- Star bands: 09
- Economy: 10
- DDA: 11
- Ads: 12
- All open decisions: 08

The prototype is at the repo root — use it as behavioral reference, not as code to extend.

Stack: TypeScript engine + Canvas 2D UI + Capacitor for mobile + AdMob plugin for ads.
```

---

## 3. What Claude Design needs to know (UI handoff)

Claude Design receives this spec package and owns the UI/UX layer (E5). The engine spec tells
Design:

- **What to render:** the `GameState` fields and `GameEvent` stream define everything on screen.
  The HUD model (`00 §4.3`) specifies which chips appear on which level types.
- **What NOT to build:** the engine handles all game logic, scoring, solvability, and economy.
  Design never implements game rules — it renders state and forwards user commands.
- **The feedback system:** engine events (`linesCleared`, `comboReward`, `won`) drive celebration
  text, haptics, and animations. Design owns the *feel*, the engine owns the *trigger*.
- **Ad layout:** persistent bottom banner during gameplay (`12 §1.3`), interstitials between levels,
  RV offers at specific moments. Design lays out the game board *above* the banner strip.
- **The persona:** everything is designed for a 45–65 cozy-casual player. No countdowns, no urgency
  colors, no flashing. The Constraint chip (moves remaining) reads as calm capacity, never a red
  countdown. Stars are celebration, never grades. Read `06` for the full persona review.
- **Block Blast reference:** the UI research images show Block Blast's layout, color system, and
  feedback patterns. Rising Tide's visual identity should be *calmer* (nautical, not neon) but can
  learn from their grid layout, piece tray positioning, score presentation, and celebration popups.
