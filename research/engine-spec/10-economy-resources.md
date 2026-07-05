# 10 · Economy & Resources Catalog

> **Owner:** Live-Ops / Economy Designer.
> **Scope:** economy · resources · consumables · collectibles · monetization hooks — **logic & design ONLY. No UI, no rendering.**
> **Governing principle:** this 45–65 cozy-casual audience wants **simplicity and generosity, not systems to manage.** They dislike energy/lives gates, second currencies, gacha, and FOMO. **Restraint and clarity are the deliverable.**
> **Consolidates & does not contradict:** `04` (§4 renewable economy, §5 monetization), `05` (§1.4 combo grants, §2 specials, §3 satchel + §3.3 determinism), `02` (§8 hooks), `06` (§4 complexity ceiling, §5.7 satchel trim — **respected**).
> **Persona review applied:** streak-freeze cap raised to 3–4 per persona reviewer; free daily Undo allowance added; streak-break window extended to 3 missed days.
> **Convention:** every invented number is tagged **[OPEN — product owner]** with a recommendation.

---

## 0. The whole economy in one breath

- **ONE soft currency: pearls.** No second currency, no hard currency.
- **NO energy / lives / stamina gate.** Play as long as you like.
- **Consumables are all optional, player-triggered, and either earned or RV/IAP-bought** — none is ever forced, timed, or reflex-based.
- **Two acquisition rails only:** *earn by playing* (stars, collectibles, combos, streaks, chests, waves) and *opt-in spend* (pearls, rewarded video ≤3/day, IAP). No gacha.
- **Cosmetics are the primary sink;** power-ups are a soft, optional secondary sink (lean RV-earned, pearls as fallback).
- **Every monetization path resolves to the same engine hooks** (`grantMoves`, `continueAfterLoss`, `rerollTray`, `pushTide`) + wallet/cosmetic mutations (`02 §8`).

---

## 1. CURRENCY — Pearls

### CARD — Pearls (the single soft currency)
- **What it is:** The one and only soft currency — a persistent **wallet** balance (`state.pearls: number`).
- **How you get it:**
  1. **Stars on level win** — 30 / 20 / 10 pearls for 3★ / 2★ / 1★ (`09 §3`).
  2. **Collectible pearls in-level** — each `pearl` element collected pays **+1 wallet pearl** [OPEN].
  3. **Milestone flat bonuses** — L10/20/30/40 pay **30 / 40 / 50 / 75** on top of stars (`04 §2.1`).
  4. **Streak chests** — day 3/7/14/30 → **75 / 150 / 300 / 600** (`04 §4.1`).
  5. **Bonus Wave (endless)** — every 10th organic clear (per-endless-run counter) pays **+3 pearls** (`05 §5.2`) [OPEN].
  6. **Weekly challenge** — a small pearl + a weekly cosmetic (`04 §4.3`) [OPEN].
  7. **First-Win-of-Day** — first level won each UTC day pays **+10 pearls** [OPEN — recommend YES]. Rewards *playing*, not *logging in*. State: `state.lastFirstWinDate: string | null`.
- **What it does:** Spent on **cosmetics** (primary chase) and, optionally, on **power-ups** (secondary, lean RV-earned). Pearls buy nothing that gates play.
- **Cost / cap:** No wallet cap. No spend is mandatory.
- **Determinism rule:** Wallet mutations draw **zero RNG** → deterministic, Seeded/ranked safe.
- **Monetization tie:** Earn-only by default, with an **IAP pearl pack** top-up.

**Wallet reconciliation (resolves `04 §5.1` ambiguity):**
- `pearlsCollected: number` — per-level goal counter for `collect` goal. **Resets each level.**
- `pearls: number` — persistent wallet. **Never resets.**
- Bridge: on each pearl collected, `pearlsCollected++` AND `pearls += 1`. The collectible is both goal progress and a tiny wallet drip [OPEN — recommend ON].

---

## 2. TIDE HELPERS

### CARD — Tide-Push (in-play helper · satchel item, survive-only)
- **What it is:** Proactive in-play consumable that pushes tide back down before danger.
- **How you get it:** **RV** (primary, opt-in) or **15 pearls** (fallback) [OPEN]; milestone bundle.
- **What it does:** `pushTide(p)`: `tide = max(0, tide - 2)`, recompute phase. Never touches `tideRises`.
- **Cost / cap:** 15 pearls or 1 RV. Hold cap ~5 [OPEN].
- **Determinism:** Zero RNG → deterministic. Leaderboard-eligible as proactive helper.
- **State:** `state.powerUps.tidePush: number` (inventory count).

### CARD — Continue-after-loss (revive)
- **What it is:** One-tap revive offered at moment of loss.
- **How you get it:** **RV** or **IAP continue-token** (`state.continueTokens: number`).
- **What it does:** `continueAfterLoss()`: tide-drown → `tide = max(0, tide-3)`, `continues++`; no-moves → regenerate safe tray (draws RNG).
- **Cost / cap:** 1 RV or 1 token. **≤2 continues per game** [OPEN].
- **Determinism:** Tide-drown = deterministic. No-moves draws RNG → sets `deterministic=false`. **Any continue DISQUALIFIES leaderboard, KEEPS streak.**
- **State:** `state.continueTokens: number`, `state.continues: number` (per-game).

---

## 3. POWER-UP SATCHEL (post-persona trim)

Per `06 §4/§5.7`: **2 core + 1 survive-only + 1 held/cut.** Items unlock **one at a time**.

### CARD — Undo-Last (core)
- **What it is:** "Take back my last placement." Mistake forgiveness.
- **How you get it:** **1–2 free per day** (daily allowance, resets on UTC day change — per persona reviewer); then **RV** (opt-in) or **10 pearls** (fallback) [OPEN].
- **What it does:** Reverts last placement via `snapshot()/restore()`, rewinds `rngCalls` cursor.
- **Cost / cap:** Free allowance first, then 10 pearls or RV. Hold cap ~5 [OPEN].
- **Determinism:** Casual OK; **FORBIDDEN in Seeded/Daily/ranked** (rewinds let player retry for better tray).
- **State:** `state.powerUps.undo: number` (inventory), `state.freeUndosToday: number`, `state.lastUndoDate: string | null`.

### CARD — +Moves (core)
- **What it is:** Adds moves to a move-limited level.
- **How you get it:** **RV** (primary) or **20 pearls** (fallback) or **IAP move-token** (`state.moveTokens: number`); milestone bundle.
- **What it does:** `grantMoves(5)`: `moveLimit += 5`, `grantedMoves += 5`.
- **Cost / cap:** 20 pearls or 1 RV or 1 token. Hold cap ~5 [OPEN].
- **Determinism:** Always deterministic (pure counter). Leaderboard-eligible unless used as revive.
- **State:** `state.powerUps.moves: number` (inventory), `state.moveTokens: number`.

### CARD — Reroll-Tray (HELD / recommend CUT)
- **What it is:** Replace unplaced tray with a fresh safe hand.
- **How you get it (if shipped):** 25 pearls or RV.
- **What it does:** `rerollTray()` — regenerates tray, draws RNG.
- **Determinism:** Draws RNG → casual-only; Seeded: FORBIDDEN or sets `deterministic=false`.
- **RECOMMENDATION: HOLD, lean CUT.** Ship behind `FEATURES.rerollTray` flag, default OFF.
- **State:** `state.powerUps.reroll: number` (if shipped).

---

## 4. SPECIAL BLOCKS (earned tray pieces)

Two specials, both pure-clear. Economy view (full mechanics in `05 §2`).

### CARD — Line-Blaster
- **What it is:** 1×1 piece that clears row + column (a cross) on placement.
- **How you get it:** **Combo ×3** grants 1 (debut L17/L15). Endless store: ~15–20 pearls or RV [OPEN].
- **Scoring:** N=2 lines. Counts as clearing placement → combo +1.
- **Determinism:** Trailing RNG draw in Casual (deterministic-from-seed). **Combo-grant DISABLED in Seeded.**
- **State:** `state.satchel.lineBlaster: number`.

### CARD — Bomb
- **What it is:** 1×1 piece that clears 3×3 area on placement.
- **How you get it:** **Combo ×6** grants 1; ×10 re-grants Line-Blaster. Endless store: ~25–30 pearls [OPEN].
- **Scoring:** Flat `cellsCleared × 10` unless lines complete (then N² applies).
- **Determinism:** Same as Line-Blaster. **Combo-grant DISABLED in Seeded.**
- **State:** `state.satchel.bomb: number`.

---

## 5. RETENTION RESOURCES

### CARD — Streak (Daily Tide)
- **What it is:** Consecutive UTC days player completes scored Daily. Not spendable.
- **How it grows:** +1 per day Daily is completed.
- **What it does:** Drives streak chests + nudge on break.
- **Break rule:** Breaks on **3 consecutive missed days** (extended from 2 per persona reviewer) with no freeze. [OPEN — product owner: confirm 3-day window].
- **State:** `state.streakCount: number`, `state.lastDailyDate: string`.

### CARD — Streak-Freeze Token
- **What it is:** "One forgiven missed day." The same emotional promise as combo grace, one layer up.
- **How you get it:** Earn 1 free every ~7-day streak milestone; buy for ~50 pearls; optional RV. NOT IAP-exclusive.
- **What it does:** When streak would break from a missed day, consumes 1 token, streak held.
- **Hold cap:** **3–4** [OPEN — raised from 2 per persona reviewer; covers a short trip].
- **State:** `state.freezeTokens: number`.

### CARD — Streak Chest
- **What it is:** Milestone reward at streak days 3/7/14/30.
- **Pays:** 75 / 150 / 300 / 600 pearls. One-time per tier.
- **Past day 30 [OPEN]:** repeating 30-day loop at 600, or add 60/90/365 tiers.
- **State:** `state.streakChestsEarned: Set<number>`.

### CARD — Cosmetics (palettes · backdrops · titles)
- **What it is:** Purely visual collectibles. Zero gameplay effect.
- **How you get it:** Milestone grants (fixed); pearl store (rotating); weekly challenge (unique weekly).
- **Cost:** 100–400 pearls per cosmetic by tier [OPEN].
- **Split:** ~80% pearl-earnable / ~20% IAP-premium [OPEN].
- **Rotation:** [OPEN — cadence, slot count, and refresh algorithm need definition].
- **State:** `state.ownedCosmetics: Set<string>`, `state.activeCosmetic: Record<'palette'|'backdrop'|'title', string>`.

---

## 6. EARN → SINK BALANCE SKETCH [OPEN]

**Inflow:**

| Source | ~Pearls/day (engaged) |
|---|---|
| Level stars (3–4 wins) | ~60–90 |
| Collectible pearls | ~5–10 |
| Daily Tide stars | ~20 |
| First-Win-of-Day | +10 |
| Bonus Wave (endless) | ~5–15 |
| Streak chest (amortized) | ~20–40 |
| Weekly (amortized) | ~7 |
| **Total** | **~90–140** |

**Outflow:**

| Sink | Price [OPEN] |
|---|---|
| Undo-Last | 10 (after free daily allowance) |
| Tide-Push | 15 |
| +Moves | 20 |
| Streak-Freeze | ~50 |
| Cosmetic (common) | ~100–150 |
| Cosmetic (rare) | ~250–400 |

**Balance target:** A common cosmetic should be ~1–2 days of engaged play. A rare cosmetic is a ~3–5 day goal.

**The #1 balance question [OPEN]:** power-ups should **lean RV-earned (free, opt-in)** with pearls as fallback, so the pearl economy's center of gravity stays on the cosmetic chase. Undo's daily free allowance (1–2/day) keeps the coziest helper ungated.

---

## 7. "DELIBERATELY NOT INCLUDED" LIST

| Not included | Why |
|---|---|
| Energy / lives / stamina gate | Stops play. Non-negotiable. |
| Second / hard / premium currency | Two currencies = distrust. |
| Gacha / loot boxes | Randomized purchase = gambling feel. |
| Timed FOMO sales | Countdowns = anxiety. |
| Interstitial ads mid-board | Kills the calm (`04 §5`). Interstitials at session seams only. |
| Piece rotation / timed power-ups | Out of core play. |
| PvP / real-time competition | Leaderboards are async only. |
| 3rd special / 5th satchel item | Complexity ceiling (`06 §4`). |
| Trading / social gifting | Social obligation. |
| Battle pass / paid tiered track | FOMO + expiring obligation. |

---

## 8. ECONOMY EVENT CATALOG

All economy mutations emit events via the standard `{state, events}` return:

| Event | Emitted when | Payload |
|---|---|---|
| `pearlsGranted` | Star payout, collectible bridge, milestone, chest, first-win, bonus wave | `{ amount, source: 'stars'|'collectible'|'milestone'|'chest'|'firstWin'|'bonusWave'|'weekly'|'iap' }` |
| `pearlsSpent` | Pearl purchase (cosmetic, power-up, freeze) | `{ amount, item: string }` |
| `purchaseCosmetic` | Cosmetic bought from store | `{ cosmeticId, pricePearls }` |
| `cosmeticUnlocked` | Cosmetic granted (milestone, weekly, IAP) | `{ cosmeticId, via: 'milestone'|'weekly'|'iap'|'purchase' }` |
| `setActiveCosmetic` | Player equips cosmetic | `{ kind: 'palette'|'backdrop'|'title', cosmeticId }` |
| `streakChestEarned` | Streak milestone reached | `{ day: 3|7|14|30, pearls: number }` |
| `freezeConsumed` | Streak-freeze used | `{ streakPreserved: number }` |
| `firstWinBonus` | First-Win-of-Day triggered | `{ pearls: 10 }` |
| `powerUpUsed` | Satchel item consumed | `{ item: 'undo'|'moves'|'tidePush'|'reroll', source: 'free'|'pearl'|'rv'|'token' }` |

---

## 9. MASTER TABLE

| Resource | Type | Sources | Sink/Effect | Cost/Cap [OPEN] | Determinism | Monetization |
|---|---|---|---|---|---|---|
| **Pearls** | currency | stars · collectible · milestones · chests · bonus wave · weekly · first-win | cosmetics · (opt.) power-ups | no cap | det. both | earn + IAP pack |
| **Tide-Push** | consumable (survive) | 15 pearls · RV · bundle | `tide -= 2` | ~5 hold | det. both; LB-eligible | pearl or RV |
| **Continue** | consumable | RV · IAP token | revive on loss | ≤2/game | drown=det.; no-moves=non-det. → **LB disqualified** | RV or IAP |
| **+Moves** | satchel (core) | 20 pearls · RV · IAP token · bundle | `moveLimit += 5` | ~5 hold | always det. | pearl/RV/IAP |
| **Undo-Last** | satchel (core) | 1–2 free/day · 10 pearls · RV | revert placement | ~5 hold | Casual OK; **Seeded FORBIDDEN** | free + pearl/RV |
| **Reroll** | satchel (HELD) | 25 pearls · RV | regen tray | OFF | draws RNG → casual-only | pearl/RV |
| **Line-Blaster** | special | combo ×3 · store/RV | clear row+col | earned; ~15-20 endless | trailing draw; **Seeded OFF** | earn + RV/pearl |
| **Bomb** | special | combo ×6 · store/RV | clear 3×3 | earned; ~25-30 endless | same | earn + RV/pearl |
| **Streak** | status | complete Daily | drives chests | breaks on 3 missed days | date seed | earn-only |
| **Streak-Freeze** | token | 7-day milestone · 50 pearls · RV | forgive 1 missed day | hold cap 3–4 | det. | earn/pearl |
| **Streak Chest** | reward | streak d3/7/14/30 | 75/150/300/600 pearls | once/tier | det. | earn-only |
| **First-Win** | reward | first win each UTC day | +10 pearls | 1/day | det. | earn-only |
| **Bonus Wave** | reward | every 10th clear (per-endless-run) | +3 pearls | endless only | det. | earn-only |
| **Cosmetics** | collectible | milestones · store · weekly | visual only | 100–400 pearls | det. | ~80% pearl / ~20% IAP |
| **noAds** | IAP flag | remove-ads IAP | suppress forced ads | one-time | det. | IAP |

---

## 10. Open economy decisions (rolled up)

1. **#1 balance:** power-ups lean RV-earned, pearls as fallback (§6).
2. **Collectible→wallet bridge:** +1 each (recommend ON) (§1).
3. **Milestone bonuses** 30/40/50/75 and **streak ladder past day 30** (§1/§5).
4. **Freeze-token economy** — earn cadence, ~50-pearl price, hold cap 3–4 (§5).
5. **Reroll-Tray:** default OFF (§3).
6. **Cosmetic pearl↔IAP split** (~80/20), prices, rotation cadence (§5).
7. **First-Win-of-Day** (+10) — approve? NO bare daily-login reward (§1).
8. **RV grant sizes** (+5 moves, −2 tide-push, −3 revive) and ≤2 continues/game (§2).
9. **Free daily Undo allowance** — 1 or 2 per day? (§3).
10. **Streak-break window** — 3 missed days (§5).
