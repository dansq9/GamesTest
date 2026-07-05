# 14 · UX Reference — Block Blast Patterns & How Rising Tide Applies Them

> **Owner:** Claude Design (UI/UX layer).
> **Scope:** supplementary UX research. Distills the eight UX/UI patterns that make Block Blast work at
> 70M DAU, and maps each to where Rising Tide's spec already implements (or should implement) it.
> **Not engine logic** — this is design-side reference for the E5 UI layer. Read against `06` (persona),
> `12` (ad/feedback), and `13 §3` (Design handoff).
> **Source:** Q99 Studio UX/UI teardown of Block Blast + product-owner UI research images.

---

## 0. Why this doc exists

Block Blast is the genre benchmark. Its success is **not** a deeper feature set — it's disciplined UX:
flow, simplicity, and micro-engagement. Rising Tide's bet is the same UX discipline **plus** a calmer
nautical identity tuned for a 45–65 cozy-casual player. This doc keeps the two aligned: adopt the
proven patterns, diverge only where our audience and theme demand it.

The guiding tension for every row below:
- **Adopt** what makes the loop frictionless (drag-drop, no-timer flow, respectful monetization).
- **Diverge** on register — Block Blast is neon/energetic; Rising Tide is calm/nautical. Same skeleton,
  warmer skin.

---

## 1. The eight patterns → Rising Tide mapping

### 1.1 Clean interfaces win attention

> Block Blast: no unnecessary menus, no over-the-top graphics, instant clarity on the next step.

**Rising Tide already enforces this:**
- Persona review (`06`) makes "calm board, no clutter" a veto-power principle.
- HUD model (`00 §4.3`) is deliberately minimal — an Objective chip + a Constraint chip, nothing more.
- The Constraint chip reads as **calm capacity**, never a red countdown.

**Design action (E5):** Home screen lands on one obvious next action (Continue / Play). No modal stack
on launch. Menus fade to background; the board is the hero.

### 1.2 Easy controls that don't interrupt flow

> Block Blast: drag-and-drop is intuitive, smooth, second-nature. Players never "learn" it.

**Rising Tide already enables this:**
- The engine is a pure state machine — the UI just forwards `placePiece(slot, row, col)` (`02 §2`).
  All validation, solvability, and scoring happen behind the scenes, so the interaction can be as
  frictionless as Block Blast's.
- No-flood guard + `handIsSafe` (`03`) mean the three tray pieces are always placeable — the player
  never fights an impossible hand, which is what *feels* like "smooth controls."

**Design action (E5):** Touch drag with a ghost preview + snap-to-grid. Show valid drop cells softly;
never punish a wrong drop (return the piece, no penalty). Target 60fps drag on mid-tier phones.

### 1.3 Micro-interactions that feel rewarding

> Block Blast: every move triggers a flash, a soft sound, or subtle haptic. Small rewards sustain play.

**Rising Tide already specs this:**
- Feedback hook table (`12 §7`): "Nice!" (1 line) → "Great!" (2) → "Amazing!" (3+), combo milestones,
  star celebrations — each mapped to a **specific engine event** so Design wires directly to triggers.
- Combo-earned specials (`05 §1`) give escalating payoff without added complexity.

**Design action (E5):** The engine owns the *trigger*, Design owns the *feel*. Calibrate haptic
intensity per event tier (subtle → medium → strong). Keep celebrations short so they never delay the
next placement. Nautical skin: ripples/foam on clear, not neon bursts.

### 1.4 Relaxed experience encourages long sessions

> Block Blast: no timers, no lives, no penalties — pure gameplay → flow state → longer sessions.

**Rising Tide makes this non-negotiable:**
- Spine rule #3: **"Never a clock in core play."** No lives, no energy gates, no timers (`README`).
- The Shallows (L1–3) are **un-losable** (`01`, `06`).
- Tide is turn-based pressure, never a stopwatch.

**Design note:** This is where we can *out-calm* Block Blast. Our audience over-indexes on stress
sensitivity — the absence of urgency is a feature, not a gap. Never introduce a countdown skin even
for "juice."

### 1.5 Whitespace is a superpower

> Block Blast: focuses the puzzle board; everything else fades. Whitespace draws concentration.

**Rising Tide already commits to this — with one product-owner caveat:**
- Persona review (`06`) enforces "calm board" as a layout principle.
- Per product-owner direction, a **persistent bottom banner** is part of the layout (`12 §1.3`). The
  reconciliation: the banner sits in a **fixed bottom strip the UI accounts for from the start**; the
  grid, tray, and tide meter lay out *above* it, never clipped. Because it's persistent (never pops
  in/out), it reads as screen furniture, not clutter — the same way Block Blast's banner does.

**Design action (E5):** Reserve the banner strip in the layout grid. Keep the play surface itself
generous and uncluttered — whitespace *above* the banner, not a fight *with* it.

### 1.6 Sound that matches the mood

> Block Blast: soothing background music, balanced SFX — enough feedback, never distracting.

**Rising Tide's theme gives us an edge here:**
- Nautical identity → ambient ocean/tide bed, gentle wooden/water block-placement SFX.
- Emotional register (from `06`): calm, rewarding, never urgent.

**Design action (E5):** Layer an ambient loop (low, seamless) under discrete, soft placement/clear
SFX. Duck music slightly on big clears for a satisfying beat. Everything mixable/mutable in settings —
the 45–65 player often plays muted in public.

### 1.7 Monetization done respectfully

> Block Blast: ads are opt-in/rewarded, never mandatory. "Watch to continue" is a choice, not a wall.

**Rising Tide already specs a respectful stack (`12`):**
- All RV is **opt-in** — "double your pearls," "+5 moves," "continue after loss." Never a gate.
- Interstitials only at **session seams**, never mid-board, frequency-capped, skipped after an RV.
- **First-session immunity:** no ads for the first 3 sessions / 5 levels — fall in love first.
- Remove-ads IAP kills banners + interstitials but **keeps RV offers** (they're a feature).

**Nuance vs the article:** Block Blast still runs a persistent banner (that's the 55% of its revenue),
and per product-owner direction we do too. "Respectful" here means *no forced mid-board interruption
and no pay-to-continue wall* — not zero banners. The banner is passive; the interruptions are the
thing we refuse.

### 1.8 A style that feels familiar yet fresh

> Block Blast: not groundbreaking — it refines familiar blocks, soft colors, smooth motion.

**Rising Tide's positioning:**
- Same grid-puzzle DNA (instant familiarity, no re-learning) with a **nautical calm** reskin —
  rising-tide metaphor, warm ocean palette, foam/ripple motion instead of neon.
- Accessibility of art direction = broad age + geographic reach, which matters for our 45–65 target.

**Design action (E5):** Keep block shapes and grid conventions familiar (don't reinvent the puzzle
grammar). Differentiate through palette, texture, motion, and the tide metaphor — not through novel
mechanics the player has to decode.

---

## 2. Adopt / Diverge summary

| Pattern | Adopt from Block Blast | Diverge for Rising Tide |
|---|---|---|
| Clean interface | Instant clarity, one obvious next step | Calmer chrome, no urgency colors |
| Drag-drop controls | Smooth, no-learn, snap-to-grid | Never penalize a wrong drop |
| Micro-interactions | Per-move flash/sound/haptic | Ripple/foam skin, not neon bursts |
| No timers/lives | Full flow-state loop | Lean into it harder (stress-sensitive audience) |
| Whitespace | Board-first focus | Reserve banner strip cleanly, keep surface generous |
| Sound | Soothing bed + light SFX | Nautical ambient, mixable, mute-friendly |
| Respectful monetization | Opt-in RV, no pay-walls | Keep persistent banner (owner call), first-session immunity |
| Familiar-yet-fresh | Reuse puzzle grammar | Nautical palette/motion/tide metaphor |

---

## 3. UI research images (product-owner supplied)

The product owner shared Block Blast UI-research images covering: UX research notes, style research,
pop-up/modal UI, the color system, typography, a UI kit, and promo materials.

**How Design should use them:**
- **Layout reference, not visual target.** Study grid proportions, tray positioning, score/combo
  placement, and celebration-popup structure — then reskin to the nautical calm identity.
- **Color:** invert the energy. Where Block Blast uses saturated neon, Rising Tide uses ocean tones
  (teals, sand, foam-white, muted coral). Reserve any high-saturation accent for celebration moments
  only.
- **Typography:** the 45–65 audience needs **larger, higher-contrast type** than Block Blast's younger
  skew. Bias one step larger; verify legibility at arm's length in bright light.
- **Pop-ups:** match the *structure* (clear reward, single primary action) but soften the *motion*
  (ease-in, no aggressive bounce/flash).

---

## 4. Handoff note

This doc is **reference, not a spec to implement literally.** The engine spec (`00`–`13`) is the source
of truth for *what the game does*; this doc is the source of truth for *how it should feel* relative to
the genre benchmark. When a UX decision is ambiguous, the resolution order is:
`06` (persona veto) → this doc (genre pattern) → Block Blast images (layout reference).
