# Mobile Games Opportunity Map & Decision Framework

**Prepared:** July 2026 · **For:** solo Android/Kotlin founder, ex-tools/productivity, ad-revenue background, Pakistan-based, targeting global, AI-assisted development
**Method:** 7-specialist research panel (UA/creative, monetization/CRO, game design, games psychology, technical architecture, regional/Pakistan, simulated player panel) + 4 genre deep-dives (coin-looter boards, tower defense, idle/racing, party/merge), all run with live 2024–26 web research. Raw panel reports with full citations: [`panels/`](panels/).
**Evidence discipline:** claims tagged **[EB]** evidence-backed · **[PU]** plausible-unverified · **[SPEC]** speculative. A recurring caveat: many primary analyst pages (Sensor Tower, AppMagic, Naavik, DoF, PocketGamer.biz) blocked direct fetch; figures came via indexed search snippets of those same outlets — **directionally reliable, exact numbers should be re-verified against primary reports before being treated as hard targets.**

**Existing asset noted:** this repo already contains a working Compose games hub with 12 pure-Kotlin puzzle engines (Sudoku, Queens/Stars, Tango/Eclipse, Zip/Trail, colored-nonogram, 2048, plus Wordle/Connections/Spelling-Bee/Strands/mini-crossword/domino-logic engines), deterministic daily seeding, and streak persistence with zero backend. That is a proven execution path and a material head start on one of the opportunity territories below (T2).

---

## Table of contents
1. [Terminology map](#1-terminology-map)
2. [Market landscape](#2-market-landscape)
3. [Segment-by-segment evaluation](#3-segment-by-segment-evaluation)
4. [What works now vs what looks tempting but is misleading](#4-what-works-now-vs-what-looks-tempting-but-is-misleading)
5. [Monetization architecture patterns](#5-monetization-architecture-patterns)
6. [Retention architecture patterns](#6-retention-architecture-patterns)
7. [Technical scope matrix](#7-technical-scope-matrix)
8. [Regional angle](#8-regional-angle-pakistan--android-first)
9. [Opportunity territories](#9-opportunity-territories)
10. [Decision rubric](#10-decision-rubric)
11. [Final synthesis](#11-final-synthesis)

---

# 1. Terminology map

Modern (2025–26) meanings, with drift from older usage flagged. Fuller version: [`panels/03-game-design.md`](panels/03-game-design.md).

| Term | Modern market meaning | What changed / common confusion |
|---|---|---|
| **Casual** | The broad middle (match, puzzle, board, card, light sim). Most *diversified* monetization: ~47% IAP / 28% IAA / 21% hybrid **[EB: AppsFlyer 2026]** | No longer means "simple/cheap" — top casual games are LiveOps machines |
| **Hyper-casual** | One mechanic, no tutorial, offline, ~97–99% IAA, 4–5-month dev, short life | The 2017–21 *arbitrage* (CPI < eCPM) is dead; the *format* persists in emerging markets and as the core of hybrid-casual **[EB]** |
| **Hybrid-casual** | Hyper-casual core loop + midcore meta (progression/collection/LiveOps) + blended IAA+IAP; 60–90-day retention target | Contested as a "genre" — DoF calls it "a transitional state and a launch strategy." Treat it as a **build/monetization posture**, not a destination **[EB: DoF Jun 2025]** |
| **Midcore** | Deeper systems, longer sessions, ~90% IAP-concentrated | — |
| **Tower defense** | Evergreen-locked niche: authored PvE (BTD6, Kingdom Rush) + PvP/randomized tier (Rush Royale $500M lifetime). New energy is all TD-*hybrids* (TD+roguelite: Habby's Wittle Defender; TD as 4X onboarding: Kingshot) **[EB]** | "TD is easy indie territory" is outdated — top tier needs studios; the real solo path is premium/light-F2P roguelite-TD at six-figure scale |
| **Horde survival / survivor-like / auto-shooter / bullet heaven** | One genre, unsettled name: move-only, auto-fire, escalating hordes, draft-on-level-up, meta between runs (Vampire Survivors → Survivor.io/Archero). Fully **systemic content** | **"Auto-shooter" ≠ "auto-battler."** Auto-battler = auto chess (TFT), a *strategy* genre, commercially small on mobile (~$1M/mo TFT) **[EB]** |
| **Roguelite mobile action** | Procedural runs + permadeath + *persistent* meta-progression ("one more run") | Survivor-likes are a sub-branch; the systemic content model is why lean teams can build here |
| **Party-game mobile** | Sync-multiplayer minigame collections (Stumble Guys, Eggy Party) | Winner-take-most, AAA-parented (Scopely/NetEase/Epic), netcode + content treadmill — not a lean category |
| **Board/companion event systems** | Dominant meaning now: the **Coin Master → Monopoly GO "coin-looter" loop** — randomizer (spin/dice) → build → raid/steal → collect, wrapped in dense LiveOps event tracks + sticker albums | The older "second-screen companion app" meaning is commercially dead. Coin looters = ~5% of ALL mobile IAP, top-3 hold ~90% of the category **[EB]** |
| **Simulation** | Two unrelated things sharing a store shelf: (a) **"simulator"/hypersim** — one shallow satisfying mechanic, IAA (the Play-Store "…Simulator" flood); (b) **deep sim/tycoon** — real economy metagame (Township) | Google Play's category conflates both; "simulation is big" statistics usually describe (a)'s downloads and (b)'s revenue — different businesses |
| **Social-lite multiplayer** | Not a codified industry term. Nearest real practice: async social overlays — leaderboards, ghosts, gifting, teams — on a single-player core (~66% of top games have some such element **[EB: MAF]**) | Use "async social overlay" when talking to the industry |
| **Fake matchmaking / bot competition** | Client-side bots dressed as opponents ("searching for players…" theater), difficulty-curved for early wins; PUBG Mobile early lobbies are the canonical case | Effectively unpoliced by stores **[EB]**; legitimate lean tool if not marketed as "real players" |
| **Async multiplayer** | Turn-based / raid-visit / ghost-race — no concurrent players needed | The right "multiplayer" for low-DAU launches; sidesteps latency, concurrency, and most anti-cheat |
| **Synchronous multiplayer** | Real-time shared session (2–8+ players) | A different engineering discipline; four-figure monthly infra before profitability (see §7) |
| **Meta layer** | Out-of-core progression/collection/base systems driving retention & spend | Now table stakes even in casual |
| **LiveOps** | Running the game as a service: scheduled events, passes, offers. ~84% of mobile IAP comes from actively LiveOps'd games **[EB: Adjust 2025]**; top puzzle titles run 80–100 monthly event touchpoints | The real moat of modern casual — and the thing a solo dev must *design around*, not imitate |
| **Merge-2 vs merge-3** | Merge-2: pairs, screen-sized board, casual (Merge Mansion, Gossip Harbor). Merge-3: triples, sprawling board (Merge Dragons) | Merge-2 owns the momentum; Microfun holds 2 of top 3 |
| **Idle-arcade** | Simple arcade core + idle resource meta — a hybrid-casual subgenre (SayGames, Supercent, Kolibri) | — |
| **Appointment mechanics** | Designed return hooks (energy, timers, daily resets) | Hard gates are considered dated; the modern forms are **daily rituals** (Wordle) and **timed events** (Golden Blitz windows) |
| **Creative-first / playable-first design** | Testing ad creatives (CTR/CPI) *before* building the game; playables ~56% of top creatives **[PU: vendor]** | The core discipline this founder must adopt (see §5, §10) |
| **D1/D7/D30** | Retention benchmarks. 2025 reality: all-games median D1 ~22–27%, D7 ~3.4–3.9%, 75% of games D28 < 3% **[EB: GameAnalytics 2025]** | The folk "good = 40/20/10" is now *top-decile*, not baseline. Puzzle/board/card hold longest; arcade wins D1 but decays |

---

# 2. Market landscape

**The macro shape (2025–26).** Total mobile game revenue is roughly flat (+0.2% YoY in 2025); downloads fell ~7% **[EB: AppMagic/PocketGamer.biz]**. Money concentrates in Strategy (~$20.2B, driven by 4X-survival) and Puzzle (~$14.4B, +14% — **the only large casual genre still growing**) **[EB: Sensor Tower SoMG 2025/2026]**. Within casual, three genres take ~80% of revenue: Puzzle $8.2B, Casino $6.2B, Simulation $1.9B (H1 2025) **[EB: AppMagic]**.

**The structural story you must internalize** (this is the "historical vs current" answer in one paragraph): pre-2021, hyper-casual worked as *ad arbitrage* — buy an install for $0.20, earn $0.25 of ads. Apple's ATT (April 2021) blinded targeting, CPIs rose (iOS +88% to $3.80 by Q4 2022), eCPMs on shallow inventory fell 20–30%, and the arbitrage died — new hyper-casual titles in the US top-1,000 fell from 210 (2020) to 54 (2023) **[EB]**. The industry's answer was **hybrid-casual** (snackable core + retention meta + IAA-and-IAP) and **LiveOps density** (events, passes, albums). Meanwhile UA targeting was automated away by ML networks — AppLovin's AXON runs a closed data flywheel (revenue-per-install +75% in 2025) **[EB: AdExchanger]** — leaving **the creative as the only lever a small studio controls**. Retention bars simultaneously *fell* market-wide (median D7 now 3.4–3.9%, down from 4–5% in 2023) because supply keeps growing against fixed attention **[EB: GameAnalytics]**.

**Four commercial logics now coexist**, and every segment belongs mostly to one:

1. **IAA volume plays** (block puzzles, hypersims, arcade): shallow-but-honest loops, revenue = retention × sessions × eCPM. Winner-take-most on *execution* (feel + ad-ops + UA capital) — Block Blast is the archetype and is a *bought* machine, not an organic fairy tale (~$17.5M/mo ads, aggressive multi-network UA, OEM pre-installs) **[EB: Udonis/mobilegamer.biz]**.
2. **Hybrid-casual** (idle-arcade, survivor-lite, sort/screw with meta): the growth posture — top-10 hybrid IAP +67–100% YoY through 2025 **[EB: AppMagic]**. Run by publisher prototype factories (Rollic ~1,000 concepts/month; Voodoo ~0.4% of prototypes launch) **[EB]**.
3. **IAP meta games** (match-3-with-meta, merge, survivor at scale, idle-RPG): deep economies, whale monetization, permanent level/LiveOps pipelines, paid-UA arms races (Gossip Harbor ~$62M/mo with ~78% paid downloads) **[EB]**.
4. **LiveOps event machines** (Monopoly GO, Coin Master, Royal Match): the richest casual revenue on earth ($6B lifetime each for Monopoly GO / Coin Master) built on 40 concurrent event slots, 150+ person teams, and $1B+ marketing budgets **[EB: Scopely/Sensor Tower]**. Structurally closed to lean teams.

**Where a solo founder can actually stand:** logic 1 at modest scale, logic 2 as posture (one differentiated bet, not a portfolio), logic 3 and 4 never as a first move. The founder's specific stack (Kotlin-native, ad-monetization experience, AI-assisted, T3-based with T1 targets) further biases toward **systemic-content, offline-capable, honest-creative, IAA-first-with-hybrid-skeleton** designs.

---

# 3. Segment-by-segment evaluation

Scale: ●●● strong / ●● moderate / ● weak. "Execution burden" includes content treadmill. Full loop anatomy per segment: [`panels/03-game-design.md`](panels/03-game-design.md); marketability data: [`panels/01-ua-creative-strategy.md`](panels/01-ua-creative-strategy.md).

| Segment | Accessibility (5-sec hook) | Retention potential | Monetization fit (for IAA-first solo) | Execution burden | Differentiation potential | LiveOps dependency | Multiplayer dependency | First-test verdict |
|---|---|---|---|---|---|---|---|---|
| **Puzzle — endless/systemic (block-fit, sort, screw)** | ●●● | ●●● (best long-term class) | ●●● IAA-native + rewarded | **Low** (systemic) | ●● (rule/feel/meta twist required — red ocean) | Low–med | None | ✅ **Prime candidate** |
| **Puzzle — match-3/merge-meta** | ●●● | ●●● | ● (IAP/whale game) | **Very high** (45–100 authored levels/week forever) | ● | Very high | None | ❌ Closed to lean teams |
| **Arcade / action-lite** | ●●● | ● long-term (best D1, worst decay) | ●● IAA | Low–med (feel is the hidden cost) | ●● | Low | None | ⚠️ Good cheap *probe*, weak destination |
| **Horde-survival / survivor-like** | ●●● (power fantasy demos itself) | ●● (meta-dependent) | ●● hybrid, skews IAP with depth | Medium–large (**engine gate: Unity/Godot**, entity scale, meta-economy) | ●● (build/evolution systems) | Medium | None | ⚠️ Viable at modest scale; breakout window closed |
| **Tower defense** | ●● | ●● (loyal niche) | ●● hybrid | High (authored maps/waves/balance) | ●● (only via hybridization) | Medium | None (PvP tier needs it) | ⚠️ Only as roguelite-TD hybrid; niche outcome |
| **Simulation — hypersim/satisfying** | ●● | ● | ●● IAA | Low–med (physics feel) | ●● | Low | None | ⚠️ Honest-ad edge, clone-race, low LTV |
| **Simulation — deep/tycoon** | ● | ●●● | ●● hybrid | High (economy + content) | ●● | High | None | ❌ Not first test |
| **Racing / driving** | ●●● | ● (casual tier) | ● | High (3D/physics/assets); 2D hypersim variant Low | ● | Low–med | None | ❌ Volume-without-value trap (see §4, §8) |
| **Party / minigame** | ●●● | ●● (social-dependent) | ● | **Very high** (realtime netcode + content/UGC treadmill) | ● | High | **Hard requirement** | ❌ Hard no for solo |
| **Idle / progression-lite** | ●● | ●●● (habit-native) | ●●● IAA-maximal (RV ~73/user; offline-2x placement) | **Low** (economy design, no assets/levels) | ●● (theme + prestige twist) | Low–med | None | ✅ **Prime candidate** |
| **Social-casual hybrid (board-event/coin-looter)** | ●●● | ●●● | ● (needs whale economy) | **Extreme** (LiveOps org is the product) | ● | **Extreme** (40 concurrent events at the top) | Social required | ❌ Closed; borrow *elements* only |
| **Word/daily-logic appointment** *(added — the founder's existing asset)* | ●●● | ●●● (ritual + streak; best-retaining class with card/board) | ●● IAA + hints + remove-ads (+ subscription at maturity) | **Low** (engines exist in-repo; content generatable) | ●● (novel rule + suite packaging) | Low (self-resetting daily) | None | ✅ **Prime candidate** |

Three cross-cutting reads:

- **The feasibility fork is content model, not genre label.** Systemic content (generated boards, spawn tables, economy curves, daily seeds) is lean-viable; authored content (thousands of tuned levels, event calendars, minigame libraries) is not. This single test reclassifies the whole market **[EB across panels]**.
- **Retention class matters more than download class.** Puzzle/board/card/word retain longest; arcade spikes D1 and dies; simulation gets installs without LTV. For an IAA business, *lifetime sessions* are the revenue, so the retention class is the monetization class.
- **The player panel's variance warning:** puzzle has the highest cross-archetype mean appeal but is bimodal (beloved by the least ad-monetizable personas); idle/progression-lite has the *flattest* appeal with no hard rejections and fits every constraint (offline, small, rewarded-native, no social cold-start). Survivor-like polarizes (young male, ad-tolerant — highest ad-ARPU ceiling, narrowest audience). [`panels/07-player-panel.md`](panels/07-player-panel.md)

---

# 4. What works now vs what looks tempting but is misleading

## Still works as-is (for a lean team)
- **Systemic endless puzzle** (block-fit lineage): honest creatives, ASO-evergreen ("block puzzle" search), IAA-native, buildable in Compose. Expect a *modest-scale* outcome unless UA capital appears.
- **Idle/progression-lite**: habit-native, offline, rewarded-video-maximal, zero content treadmill. The charts are studio-owned, but the *sustainable-small-business tier* is real.
- **Daily-ritual word/logic** (Wordle model): benign appointment + streak psychology; near-zero ops; the founder already owns working engines here.
- **Run-based roguelite/build-craft**: systemic depth from combinatorics, not content volume. Balatro proves solo-scale systems design wins — but note it's premium PC-first; the mobile-native F2P version of this is *under-explored space*.
- **Honest "the-ad-is-the-game" mechanics**: sort/unscrew, block-fit, horde-clear, idle-stack, crowd/physics spectacle — mechanic families whose real gameplay natively produces high-CTR creative **[EB: panel 1 §3]**.

## Works only WITH modern meta/LiveOps attached (flagged per your instruction)
- **Survivor-like beyond novelty scale** — needs roster/gear/season meta (Survivor.io's longevity is meta iteration, not the base loop).
- **Sort/screw at commercial scale** — the mechanic is honest and systemic, but the winners run event layers + battle passes + UA machines (Rollic held 4 of top-10 hybrid slots Q3 2025).
- **Any arcade loop** — pure HC retention no longer monetizes; a light meta is mandatory.
- **Merge-2** — buildable solo, but competing requires an events arms race (Gossip Harbor scaled ~20 → ~100 events/month) **[EB]**.

## False positives — looks easy, is misleading (explicit, per your instruction)

1. **"Be the next Block Blast."** The mechanic is simple; the outcome was purchased. ~$17.5M/mo IAA funds one of casual's most aggressive UA operations (multi-network, CTV, OEM pre-installs, tens of thousands of A/B tests). Modeling its organic curve as reproducible is the #1 analytical error available to you **[EB: Udonis/mobilegamer.biz]**.
2. **Screw/sort late-cloning.** iKame shipped ~9 screw titles before one hit ($14M). The subgenre is flooded; any single mechanic's window is ~12–18 months (Water Sort: 6 of top-10 in 2022 → zero by 2024). Enter only with a genuine rule/dimension twist **[EB: AppMagic/DoF]**.
3. **Survivor-like as a breakout.** Genre cycle has matured; later entrants niche-survive at best, and monetization skews IAP-deep (wrong shape for IAA-first). Fine as a *modest* bet; wrong as a moonshot **[EB]**.
4. **Simulation/driving download charts.** Most-downloaded genre (9.8B installs), structurally lowest ARPU; the revenue in "simulation" belongs to deep-meta titles. High downloads ≠ viable UA: you can't pay $0.50 for an install that returns $0.20. The Pakistani local-sim cluster is the extreme case: 100k–2M installs, sub-$1k–10k months **[EB: Sensor Tower; Tenjin PK]**.
5. **The Monopoly GO shape.** The loop is public and clonable; the business is 150+ staff, 40 concurrent event slots, $1B+ marketing, and top-3 category lock (~90% share). Also >90% of Board-category revenue sits in titles older than 2 years. Borrow the *psychology* (collections, dice-as-energy, event rhythm); never compete on the *operation* **[EB: deep-dive A]**.
6. **Match-3/merge-meta.** A permanent 45–100 levels/week authoring pipeline plus whale-economy LiveOps. Content team required; not a solo genre **[EB]**.
7. **Party/minigame royale.** Kitka's 8–9-person origin story is a trap disguised as hope: every winner was absorbed by an AAA parent because sync netcode + anti-cheat + content treadmill demand one **[EB: deep-dive D]**.
8. **Ludo/carrom/Teen Patti nostalgia.** Ludo King (1.25B downloads), Ludo STAR, Carrom Pool (~620M) closed the obvious subcontinental boards years ago; Teen Patti is a policy/reputation trap in Pakistan. Nostalgia buys installs, not retention; obscure street games (pithu, gilli-danda) buy neither **[EB: panel 6]**.
9. **Fake-ad UA.** Economically self-defeating for an IAA business: fake-ad cohorts retain ~14% D1 vs ~32% honest, LTV ~$0.05 vs ~$0.25 **[EB directional: Udonis/Segwise]** — and your revenue *is* retention. The market's own evolution agrees: fake-ad minigames keep becoming real games. **Ship the satisfying minigame as the whole game.**
10. **"Organic-only" TikTok dreams.** Organic can seed; it cannot scale — and TikTok's free reach for games contracted through 2025 **[PU]**. Plan a small paid-testing budget from day one.

---

# 5. Monetization architecture patterns

Full detail and benchmarks: [`panels/02-monetization-cro.md`](panels/02-monetization-cro.md).

## The philosophy, made concrete
**Monetization-first ≠ aggressive.** It means the currency system, sink pressure, and placement map are designed *with* the core loop: decide day-one what players will want more of (the sink), so that rewarded video and IAP have natural demand. Bolting IAP onto a "complete-feeling" free economy later forces nerfs that read as betrayal **[PU: practitioner consensus]**. Even an ad-only v1 should ship with an **IAP skeleton** (currency + starter-pack slot + remove-ads SKU) already in the economy. Hybrid setups earn ~28% more ARPU than ad-only **[EB: Airflux/GameAnalytics-cited]**.

## Placement inventory, mapped to the loop
Safe entry points are the loop's **natural punctuation marks**:

| Moment in loop | Placement | Note |
|---|---|---|
| Fail / game-over | **RV revive/continue** | Single highest-converting placement **[EB]** |
| Reward screen | **RV 2×/3× multiplier** | Opt-in often >70% **[EB]** |
| Return-to-app | **RV offline-earnings doubler** | Idle/sim's D1-return engine |
| Difficulty spike | RV hint/skip/extra-move | Watch pay-to-win perception |
| Pre-run loadout | RV booster/reroll | Survivor/TD/roguelite |
| Level/run transition **only** | Interstitial | The one safe interstitial slot |
| Menu/meta screens only | Banner | Never over gameplay |

**Interstitials are the retention hazard**: Google Play policy caps at 1 per 2 user actions, none at level start/mid-play/pre-splash **[EB: Play policy]**; <3/session retains ~27% more users; a >10% DAU drop after a frequency change = fatigue signal **[EB: AdReact, single-source]**. Player-panel confirmation: one disruptive placement ≈ +6–7% churn, tripling on reward screens **[EB: Deloitte/AdMob]**. **Suppress interstitials in session 1 entirely.**

**Rewarded video is the safe money**: opt-in (autonomy-preserving — the psychology panel's SDT frame), ~68% of players *like* it, engagement benchmarks ~30%+ opt-in / 2–6 impressions/DAU; idle serves ~73 RV/user, merge ~101 **[EB]**. The RV-watchers-retain-4× stat is self-selection — don't read it causally **[EB caveat]**.

## Benchmarks that shape strategy
- **eCPM follows the player's geography**: US rewarded ~$16–20 vs South Asia ~$1.5–4 (≈10× gap); banners near-worthless everywhere ($0.45–0.68 US) **[EB: Appodeal Q4'24; PK band PU]**. → An IAA game with South-Asia-only DAU earns pennies; T1/Gulf install share is the business.
- **ARPDAU bands**: pure HC $0.03–0.08; hybrid-casual $0.15–0.50; casual puzzle ~$0.08 daily (lifetime ad-ARPU higher); midcore $0.30–1.00+ **[EB, ARPU/ARPDAU conflation flagged]**.
- **IAA:IAP gradient tracks loop depth**: Mob Control ~85/15 (your template) → My Perfect Hotel ~57/43 → Survivor.io ~42/58 **[EB]**.
- **Retention gates** (see rubric): 2025 medians D1 ~22–27% / D7 ~3.4–3.9%; a fundable casual test wants D1 ≥ 35–40%, D7 ≥ 10–15% **[EB]**.

## The recommended first-test stack (solo, Android-first)
1. RV revive/continue (fail moment)
2. RV 2× reward (reward screen)
3. RV offline/booster doubler (return moment, if idle-shaped)
4. Interstitial at run/level transitions only — capped ~1 per 3–5 min, **absent from session 1**, frequency via Remote Config
5. **Remove-ads SKU $1.99–2.99 that kills interstitials but KEEPS rewarded video** (+ auto-grant its rewards or leave RV opt-in) + a $4.99 starter-pack stub
- Mediation: **AdMob first** (lowest friction, best T2/T3 fill) → graduate to AppLovin MAX when T1 traffic or paid UA justifies it. MAX has no COPPA support — one more reason to avoid child-directed positioning **[EB: GameBiz]**.
- A/B priority: interstitial cadence × D1 → RV reward size × opt-in → starter pack → remove-ads price.

## Boundaries (policy + ethics)
- **No paid randomized rewards in v1**: odds disclosure mandatory (Google/Apple/Korea); Belgium treats paid loot boxes as criminal gambling (2025 ruling extends liability toward distributors); EU Digital Fairness Act trending toward an under-18 ban (draft Q3 2026). Earned/RV-gated variable rewards give you the psychology without the exposure **[EB]**.
- **Rate Teen/12+ and avoid child-appealing art/creative** — Google Play Families rules would strangle the ad stack (self-certified ads SDK program closed to new applicants) **[EB]**.
- **Creative must show real gameplay** — enforced via deceptive-behavior policy and regulators (ASA banned Playrix's pin-pull ads; FTC actions) **[EB]**.
- **Price-localize IAP hard for T2/T3** (30–50% cuts, sub-$1 SKUs): emerging-market conversion +~40% without T1 cannibalization **[EB: SuperScale/wappier]** — a genuine home-turf edge.
- "Too aggressive" tripwires: D1 < 25% with fine gameplay; DAU/session −10% after an ad change; RV opt-in < 30%; "too many ads" review velocity.

---

# 6. Retention architecture patterns

Full mechanism-by-mechanism analysis with named implementations: [`panels/04-games-psychology.md`](panels/04-games-psychology.md).

## The science, correctly stated (one paragraph)
Dopamine encodes **reward-prediction error** — anticipation and surprise, not pleasure. **Wanting** (the pull toward the app) is dissociable from **liking** (enjoyment); dark patterns pry them apart, honest design keeps them aligned **[EB: Schultz; Berridge]**. Variable rewards work because unpredictability keeps prediction error alive — perfectly predictable rewards go motivationally silent. Losses weigh ~2× gains (streaks, piggy banks, expiring passes all monetize this). Competence/flow (challenge ≈ skill, juicy feedback) is the *retention floor* — nothing else holds without it. Habits form via stable cue → short routine → variable reward over weeks (~66-day average to automaticity), which is why **daily ritual + streak** is the strongest lean mechanism in existence (Duolingo: 7-day-streak users retain ~2.4×; streak *freeze* extends streaks ~48% — forgiveness is load-bearing) **[EB: Duolingo secondary]**.

## The retention arc (design different mechanisms per stage)
- **D0 — hook**: instant competence (win < 60s for casual), one unpredicted early reward (RPE burst), a visible next goal, and **the experience matching the ad's promise**. No interstitials, no forced login (account walls cost ~23% of installs) **[EB: Corbado]**.
- **Week 1 — habit**: install the cue (one tunable daily notification), short repeatable loop, variable daily reward, streak starts working by day 3–7.
- **Month 1 — investment/identity**: accumulated collection/progression ("mine to lose" — endowment), account-level sunk value, identity ("I do my daily puzzle"). Social ties are the strongest month-1 force and the one a solo dev should *defer*.

## The minimum ethical habit stack (lean, solo-buildable, no LiveOps team)
1. Tight core loop in the flow channel (30–90s repeatable unit, juicy feedback)
2. Daily bonus + daily goal (escalating 7-day calendar)
3. **Streak with forgiveness** (1–2 earned/auto freezes)
4. **Variable reward, earned/RV-gated — never paid-random** (daily chest, post-session drop)
5. Collection-lite (one visible, completable set at a time)
6. One self-resetting weekly event (leaderboard reset / weekly challenge — no ops)
7. Rewarded ads as positive exchange (the monetization *is* a retention mechanic when opt-in)
8. One honest, user-tunable daily notification

**Deliberately excluded from v1** (LiveOps/social infra or harm/regulatory exposure): heavy event cadence, paid gacha, PvP attack loops, guilt-based social pressure, false urgency, coercive piggy banks.

## Where retention meets monetization
Every retention mechanism has a monetization twin: streak → streak-repair micro-IAP; collection → chest/RV key; energy pacing → refill offers; progression tension → boosters; daily ritual → the DAU base all ad revenue multiplies against. Design them as one system. The trust boundary: mechanics that *add* competence/autonomy/relatedness are legitimate; mechanics that manufacture helplessness or engineer a loss to sell its prevention are the dark patterns regulators now pursue (FTC/Epic $245M; EU CPC 2025) **[EB]**.

---

# 7. Technical scope matrix

Full analysis with costs and policy detail: [`panels/05-tech-multiplayer.md`](panels/05-tech-multiplayer.md).

## Structure comparison (first-test lens)

| Structure | Tech load | Backend $/mo @100k DAU | Anti-cheat | Moderation/regulatory | Retention upside | First-test verdict |
|---|---|---|---|---|---|---|
| Pure single-player offline | Minimal | $0 | none | Data-safety form only | Content-dependent | ✅ default |
| **SP + social overlay** (leaderboards/cloud save via **Play Games Services — free, Google-hosted**) | Low | **$0 (PGS)** – $500 (custom) | soft (score sanity caps, segmented boards) | account-deletion rule only; no free-text = no UGC duty | Meaningful | ✅✅ **best feel-per-dollar** |
| **Async MP** (turn/ghost/raid, text-free) | Low–med | $200–800 [PU: modeled] | lazy server-side validation | safe **only** if no free-text | Good ("your turn" re-engagement) | ✅ ghost/turn flavor |
| **Bot competition** (client-side, offline-capable) | Minimal | **$0** | none | none if store copy honest | Solves cold-start/empty-lobby death | ✅✅ cheapest "feels multiplayer" |
| Real-time sync (2–8 rooms) | High | ~$2–3k [PU: modeled; CCU≈10% DAU] | maximal (server-authoritative required) | chat → DSA/COPPA | High *if* populated; catastrophic if not | ❌ refuse |
| Co-op/guilds | High | $500–2k+ | high | **chat = DSA 72h queue + COPPA high-risk** | Highest — but only post-population | ❌❌ hard refuse |

**The recommended first-test architecture:** native single-player core + PGS leaderboards/achievements/cloud-save ($0) + client-side bots with honest labeling ("Quick Match", not "Online PvP") + optional text-free async ghosts/turns on Firebase Spark. This delivers "alive and competitive" at ~$0/month through 100k+ DAU. Gate real networking behind metrics (e.g., D1 > 35% and a population that won't produce empty lobbies).

**Refuse until metrics demand them:** real-time infra; any free-text chat/UGC (instant DSA/COPPA compliance operation); guilds; server-authoritative economies; realtime on Firebase's free tier (100-connection hard cap).

## Engine matrix for this founder

| Stack | Fits | Ceiling / caveat |
|---|---|---|
| **Kotlin/Compose/Canvas (native)** | board, card, word, trivia, puzzle-lite, idle, turn-based, simple 2D | No physics/particles/ad-mediation tooling; tens (not hundreds) of moving objects; single-platform. **Smallest binaries (single-digit MB), best low-end perf, zero learning curve, best AI-assist leverage — the structural edge. Already proven by this repo.** |
| **Godot 4** | 2D game-feel: arcade, roguelite, survivor-lite | ~100MB+ default Android export (all-arch) is a real strike for T3 install conversion; ad plugins community-grade; GDScript weaker for AI-assist |
| **Unity** | entity-scale (survivor hordes), physics arcade, 3D sim/driving; best ad-mediation ecosystem | Runtime fee cancelled; free < $200k revenue. Cost is learning curve + build weight, not license |
| **Flutter/Flame** | 2D casual if already Flutter-fluent | Only compelling for day-one iOS parity |

**Size discipline is revenue**: every −10MB ≈ +2.5% install conversion in emerging markets; 10MB vs 100MB ≈ ~30% completion gap **[EB: Google Play study]**. Target ≤25–30MB initial install, offline-first, 2–4GB-RAM-friendly.

**$0/month LiveOps stack:** PGS + Firebase (Analytics/Crashlytics/Remote Config/A-B/FCM) + GameAnalytics + AdMob. Remote Config carries event flags, ad-cadence tuning, and bot difficulty — your entire "LiveOps" for v1.

**iOS later:** native Kotlin is cheapest-to-test, most expensive to port (full second client; PGS→Game Center). Correct call anyway: optimize for cheapest shot-on-goal; pay the port tax only on a proven winner. KMP can carry the pure-Kotlin engines (this repo's engines are already engine/UI-separated — port-friendly by design).

---

# 8. Regional angle (Pakistan / Android-first)

Full brief: [`panels/06-regional-pakistan.md`](panels/06-regional-pakistan.md).

**Market reality:** ~81–84% Android **[PU]**; entry devices 4GB RAM ($50–125 band); only ~48% of active network devices are smartphones (the addressable base is tens of millions but entry-tier) **[EB: PTA via meatechwatch]**. **Domestic IAP rails are structurally broken** — no official PKR Play gift cards (users resell TR/US cards), low card penetration, patchy carrier billing **[EB]** — so domestic monetization is IAA at bottom-tier eCPMs (rewarded ~$1–4 **[PU]**). Tenjin's Pakistan report: ~40% of PK-made games earn <$1k/month; only ~8% clear $50k **[EB]**.

**The local studio pattern, decoded:** the bus/truck/taxi simulator cluster (Chromic Apps, Mir Studio, et al.) is an **ASO/asset-flip arbitrage** — low-competition localized keywords + asset-store content + cross-promo — capping at 100k–2M installs and hobby-scale revenue. The genre only becomes a business when **globalized + UGC-anchored**: Zuuks (Turkey) 650M+ downloads on global routes; Maleo's Bus Simulator Indonesia durable for ~9 years on its livery-sharing UGC loop. **The pattern scales; hyper-local framing does not.**

**The decisive regional insight — the Ludo STAR pattern:** the definitive "Pakistani" games are Indian-built and **Gulf/West-monetized** (Ludo STAR: ~90% of users in PK/BD/MENA; revenue led by Saudi/US/Spain). Gulf ARPU ~$66 vs PK cents; Saudi+UAE ≈ 80% of Gulf spend; the PK diaspora concentrates exactly there **[EB]**. → **Build for subcontinental cultural resonance if you want the acquisition hook; monetize in the diaspora/Gulf/T1.**

**Nostalgia audit verdicts:** Ludo/carrom/snakes-&-ladders **closed** (billion-download incumbents). Teen Patti **trap** (gambling policy + reputation). Pithu/gilli-danda/marbles **trap** (installs without retention, or neither). Rung/Court Piece **fragmented-but-real** — no dominant brand; winnable only by winning the social layer; low ARPU. Kite/Basant and gully-cricket **fresh but small/seasonal** — marketing hooks on a global loop, not businesses. Ramadan/Eid is a **documented engagement window** (METAP sessions longest globally; PK sessions +5%) worth one scheduled seasonal event **[EB: Adjust]**.

**How to actually use Pakistan:** as a **cheap install/retention/QA lab** (very low CPI, honest low-end device testing, local playtesters) — *not* as a monetization signal (publishers test spend in PH/Nordics/Canada; PK spend doesn't predict T1). And as creative-cultural fuel where it fits the global loop, not as the market.

---

# 9. Opportunity territories

Curated from the design panel's 12 candidates, cross-checked against all other panels. **These are concept spaces, not final ideas.** Ordered by panel-consensus fit for THIS founder's first test.

### OT-1 · Daily logic/word ritual suite *(the incumbent option — you already have the engines)*
- **Core fantasy:** "I'm sharp, and I proved it today" — the two-minute daily mental ritual.
- **Loop:** 1–3 curated daily puzzles (deterministic seed) + endless practice; streaks + shareable result.
- **Why players return:** benign appointment + streak loss-aversion + identity ("my daily puzzle") — the best-retaining casual class (word/board/card) **[EB]**.
- **Monetization fit:** IAA (interstitial between puzzles, RV hints/extra-daily) + remove-ads; subscription only at maturity (NYT model). Modest ARPDAU, excellent longevity.
- **Production burden:** **S — engines already exist in this repo**; content is generated/seeded; art minimal.
- **Key risks:** crowded (Wordle-clone fatigue); discovery is the whole game — needs a novel *rule* or a suite/packaging hook; modest revenue ceiling.
- **Structure:** solo + async streak/leaderboard overlay (PGS). No multiplayer.

### OT-2 · Systemic spatial puzzle with one novel rule (Block-Blast lineage)
- **Fantasy:** effortless mastery; tidy destruction.
- **Loop:** place → clear → cascade → chase score; endless, generated.
- **Returns via:** score chase + daily challenge + short-session fit; puzzle's category-best long-term retention.
- **Monetization:** IAA-native (RV revive + 2×; interstitials at round ends) + remove-ads. The Mob-Control-style 85/15 profile.
- **Burden:** **S** (Compose/Canvas) — but **feel/juice is the actual product**; budget real iteration time.
- **Risks:** red ocean; differentiation must be a *rule/geometry* innovation, not a reskin; scale requires UA capital you won't have — target the sustainable tier.
- **Structure:** solo + async leaderboards + optional bot "duel" dressing.

### OT-3 · Offline-first idle/tycoon with a novel prestige twist
- **Fantasy:** my little engine compounds while I live my life.
- **Loop:** collect → upgrade → automate → prestige; offline accrual drives the return moment.
- **Returns via:** offline-earnings check-in ritual (the psychology panel's habit loop, mechanized) + RV doubler.
- **Monetization:** the IAA-maximal genre (~73 RV/user) + natural hybrid (starter pack, remove-ads, skips). Player-panel's flattest-appeal pick.
- **Burden:** **S–M** — no assets/levels; the real work is **economy/curve tuning** (systems skill, AI-assist-friendly).
- **Risks:** saturated theme space; thin-novelty clones die; chart tier is studio-owned (aim for durable niche).
- **Structure:** solo, fully offline; PGS leaderboard.

### OT-4 · Run-based build-craft roguelite (draft/synergy engine, mobile-native F2P)
- **Fantasy:** discovering broken combos; "one more run."
- **Loop:** draft → synergize → push run → die → permanent unlock → retry (daily seed variant for ritual).
- **Returns via:** unlock meta + daily seed + combinatorial curiosity — systemic depth without content volume.
- **Monetization:** hybrid (RV continue/reroll, cosmetic/unlock IAP, battle-pass-lite later); avoid pay-to-win.
- **Burden:** **M** — Godot (or native if kept discrete/turn-based, e.g., card/dice-based — which suits Kotlin); balance design is the moat and the founder's systems strength.
- **Risks:** F2P-ifying a premium-feeling genre gracefully; balance depth takes iterations; mobile-native F2P versions of Balatro-class design are unproven (which is also the opportunity) **[SPEC]**.
- **Structure:** solo + async daily-seed leaderboard.

### OT-5 · Honest "satisfying-physics" probe family (the ad IS the game)
- **Fantasy:** oddly-satisfying competence (sort/unscrew/slice/stack/declutter).
- **Loop:** one tactile mechanic, generated levels, escalating tangles.
- **Returns via:** flow + short-session snacking + light collection.
- **Monetization:** IAA + RV; the mechanic self-produces high-CTR creative — the cheapest CTR/CPI *test vehicle* available.
- **Burden:** **S–M** (physics feel = hidden cost; Godot/Unity for physics variants).
- **Risks:** ~12–18-month mechanic windows, clone floods, low defensibility. **Use as market-test probes and creative-testing infrastructure, not as the flagship bet.**
- **Structure:** solo.

### OT-6 · Survivor-lite with a distinct meta-economy (conditional bet)
- **Fantasy:** screen-melting power from chaos.
- **Loop:** move-survive-evolve runs; meta roster/gear between runs.
- **Returns via:** build variety + meta progression + daily/event stages.
- **Monetization:** hybrid skewing IAP with depth (Survivor.io 42/58); rich RV surface (revive/reroll/2×/chest).
- **Burden:** **M–L** — engine gate (Unity/Godot for entity scale), meta-economy design, more art. The heaviest of the recommended set.
- **Risks:** matured genre; polarized audience (young/male); success requires the meta, not just the loop. Only pick this if the creative tests scream.
- **Structure:** solo core + async events/leaderboards.

### OT-7 · Bot-seeded async duel layer *(an overlay, not a game — attach to OT-1/2/4)*
- **Fantasy:** "I beat someone" without waiting for anyone.
- **Loop:** short skill round vs ghost/bot opponent; ladder + revenge-rematch.
- **Returns via:** ladder standing + streaks + manufactured-but-honest rivalry (label it "Quick Match").
- **Monetization:** IAA + cosmetics.
- **Burden:** **S–M** on top of a working core (client bots + PGS/Firebase ghosts; no netcode).
- **Risks:** fairness perception; thin social feel if bots read robotic.
- **Structure:** async/bot by design — the panel's cheapest path to competitive retention.

### OT-8 · Global loop in subcontinental clothing (diaspora play)
- **Fantasy:** "this game is *ours*" — cultural texture (chai dhaba tycoon, decorated-truck livery, gully cricket timing-duel, kite duel at Basant) on a proven global mechanic (idle/tycoon, arcade duel, or spatial puzzle).
- **Loop:** whichever host loop (OT-2/3/4) it dresses.
- **Returns via:** the host loop's retention + cultural identity + Ramadan/Eid seasonal events.
- **Monetization:** T3 ad volume + **Gulf/diaspora IAP** (price-localized), following the Ludo STAR revenue geography.
- **Burden:** M (host loop + authentic art direction — the art is the risk for a non-artist).
- **Risks:** cultural theming can cap global appeal if it obscures the mechanic; the theme must be paint, not architecture **[SPEC]**; UGC (the Maleo lesson) is what makes local themes durable but adds moderation scope — defer.
- **Structure:** solo/social-lite; bots for any duel format.

### Explicitly parked (evaluated, rejected for a first test)
- **Board-event/coin-looter lite** — the psychology is world-class, the operation is the product; revisit *elements* (albums, dice-energy) inside other territories.
- **Merge-2 systemic** — buildable but a LiveOps arms race to compete; revisit if a genuinely systemic order-generation angle appears.
- **TD-roguelite** — legitimate niche (Isle-of-Arrows model) but six-figure-ceiling, Steam-leaning; inferior to OT-4 for this founder.

---

# 10. Decision rubric

Score each candidate concept 1–5 per criterion; multiply by weight; sum to 100-point scale. Built for *first-test* selection — weights deliberately favor testability and lean fit over ceiling.

**Hard gates first (any "no" = kill, regardless of score):**
- G1. Can a 15–30s clip of REAL gameplay plausibly hit ≥4% CTR? (honest-creative viability)
- G2. Content is systemic/generated (no authored-level pipeline > ~2 person-days/week)?
- G3. No real-time multiplayer, no free-text chat/UGC in v1?
- G4. Playable offline; initial install ≤ ~30MB; runs on 4GB-RAM Android?
- G5. Testable slice buildable by one person + AI in ≤ 6–8 weeks?
- G6. Not child-directed (Teen/12+ positioning viable)?
- G7. No paid randomized rewards in v1?

**Weighted criteria:**

| # | Criterion | Weight | 5 looks like | 1 looks like |
|---|---|---|---|---|
| 1 | Clarity of hook | 12 | Understood from one screenshot; "5-second explainable" | Needs a paragraph |
| 2 | Replayability (systemic depth) | 10 | Combinatorial/generated variety; sessions self-renew | Content exhausts in days |
| 3 | Retention potential | 15 | Natural daily ritual + streak/collection fit; genre retains (word/board/puzzle/idle class) | Novelty-only; D7 class < 5% |
| 4 | Monetization compatibility | 12 | ≥3 natural RV moments + clean interstitial slots + remove-ads logic; hybrid skeleton fits | Monetization fights the loop |
| 5 | UA/creative potential | 12 | The loop *produces* satisfying/failure-bait/progress clips; ASO-evergreen keywords exist | Unfilmable; no search terms |
| 6 | Technical simplicity | 8 | Native Kotlin/Compose; no engine learning; no backend | New engine + backend + physics |
| 7 | Content-production lightness | 10 | Generated/seeded content; art minimal-geometric | Level/art/narrative treadmill |
| 8 | LiveOps lightness | 6 | Self-resetting daily/weekly systems only | Needs an event calendar to function |
| 9 | Originality within familiar patterns | 8 | A real rule/feel/meta twist on a proven pattern | Pure reskin (clone-war economics) |
| 10 | First-launch-test suitability | 7 | Clean kill/scale metrics readable in 2–4 weeks at <$500 spend | Needs scale/network effects to evaluate |
| | **Total** | **100** | | |

**Interpretation bands [SPEC — calibrate with use]:** ≥80 exceptional, build now · 65–79 strong, refine weak criteria first · 50–64 needs a differentiator before committing · <50 pass.

**Post-build kill/scale gates (from the UA panel, 2025–26 bars):** creative CTR ≥ 4%; CPI ≤ ~$0.40 (T3 Android test); D1 ≥ 35–40%, D7 ≥ 10–15%, ≥3 sessions/day for casual-arcade shapes (word/logic ritual formats may trade D1 for stronger D30 — judge on W1 ritual formation); RV opt-in ≥ 30%. Kill anything below bar before writing more code — the $300–600 marketability-test playbook (unlisted Play listing + 3–5 concepts + T3 Android traffic) is the highest-ROI discipline available **[EB: Supersonic/Voodoo/Homa-style funnels]**.

---

# 11. Final synthesis

## Most promising opportunity *types* (not yet concepts)
1. **The daily ritual suite (OT-1)** — highest evidence-density path: best-retaining genre class, psychology-panel's strongest lean mechanisms (streak+forgiveness, daily variable reward), near-zero ops, and **you already own the engines**. Ceiling is modest; probability-weighted value is the portfolio's best.
2. **Systemic puzzle with one new rule (OT-2)** and **offline idle with a novel prestige twist (OT-3)** — the two segments every panel independently converged on (UA: only segment clearing all four solo filters / player panel: flattest appeal; monetization: IAA-maximal).
3. **Draft/synergy roguelite, mobile-native F2P (OT-4)** — the differentiation play: systemic depth as moat, underexplored on mobile F2P, plays to systems-engineering strength.
4. **Probe-class satisfying mechanics (OT-5)** as cheap creative/UA tests feeding the above — build the *testing muscle*, not just a game.
5. **Subcontinental skin on a global loop (OT-8)** as a *theming and seasonal-events strategy* over any of the above, monetized toward diaspora/Gulf.

## The most dangerous traps (ranked by how tempting they'll look)
1. Modeling Block Blast's outcome as organic and reproducible.
2. The Monopoly GO shape without the Monopoly GO organization.
3. Real-time multiplayer / chat / guilds in v1 (infra + DSA/COPPA + empty-lobby death).
4. Match-3/merge-meta (the authored-content treadmill).
5. Local-only simulation/driving and nostalgia ports (installs without LTV; Ludo/carrom closed).
6. Fake-ad UA (poisons the exact metric an IAA business monetizes).
7. Late-cloning a mechanic wave in month 14 of its ~18-month window.
8. Interstitial-first monetization (the one lever that reliably destroys D1).
9. Building for the domestic PK wallet (broken rails, bottom-tier eCPM) instead of using PK as a lab.
10. Confusing "simple to understand" with "simple to build" — feel/juice/economy tuning are the hidden 60%.

## What must be validated BEFORE concept selection
1. **Marketability pre-test** (per shortlisted territory): 2–3 honest fake-creative CTR tests, ~$50–200 each. Kill < 4% CTR.
2. **Your own eCPM/geography assumption**: run a tiny AdMob test app or use existing tools-app data to print actual PK/IN vs T1 rewarded eCPMs against the ~10× gap this framework assumes.
3. **Session-context fit**: 10–15 cheap user interviews (PK + diaspora + 1 T1 channel) on when/where the daily-ritual vs idle-checkin vs run-based session shapes fit real routines.
4. **Existing-asset audit**: instrument the current GamesTest hub (D1/D7, streak adoption, puzzle completion) with Firebase + GameAnalytics — you may already own a live retention signal.
5. **Feel bar**: one-week juice spike on the leading loop (Compose Canvas particle/haptics/animation test) to confirm native can hit the required game-feel; if not, the Godot gate opens.

## Where evidence is weak (carry these flags into concept scoring)
- Exact CPI/ARPDAU/retention figures are search-aggregated from blocked primary reports — re-verify the load-bearing numbers (GameAnalytics 2025 PDF, Liftoff 2025, AppMagic hybrid reports) before betting on precise thresholds.
- Pakistan-specific eCPM prints don't exist in this research (India/Vietnam proxies used).
- Remove-ads attach rates lack a citable benchmark.
- IAA-only ARPDAU by exact subgenre at low DAU (the number that decides whether a solo IAA game clears rent) is fuzzy — worth a targeted GameAnalytics/Tenjin pull.
- Solo-scale weekly events' retention lift is unproven; treat stack item 6 as a hypothesis to A/B.
- The player panel is a grounded simulation, not fielded research — trust its rank order and dealbreakers, not its point scores.
- Fast-moving regulation (EU DFA, UK CMA) needs a re-check at launch.

## The one-sentence version
**Pick a systemic-content, offline-capable, honestly-advertisable loop that a Kotlin-native solo dev can carry to a testable slice in six weeks; wire the minimum ethical habit stack and the five-placement monetization skeleton into it from day one; test creative before code and kill without sentiment at the CTR/CPI/D1 gates; use Pakistan as your lab and the diaspora/Gulf/T1 as your market — and treat everything that requires a LiveOps organization, a level pipeline, or a realtime server as a phase-2 decision that today's test must earn.**
