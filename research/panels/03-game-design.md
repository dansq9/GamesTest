# Panel 3 — Game Design & Terminology

> Research panel output (Opus agent, live web research + 4 sub-agent genre deep-dives, July 2026).
> Evidence tags: `[EB:src]` = evidence-backed; `[PU]` = plausible-unverified; `[SPEC]` = speculative judgment.
> Sub-agent deep-dives preserved in `03b-genre-deep-dives.md`.
> Synthesized into `../mobile-games-opportunity-framework.md`.

**EVIDENCE KEY:** `[EB:src]` = evidence-backed (2024–26 source named); `[PU]` = plausible-unverified (industry-consensus / older-source / single-source); `[SPEC]` = speculative judgment. Direct primary-PDF fetching was proxy-blocked (403) across Sensor Tower/AppMagic/GameRefinery/Naavik/PocketGamer this session; figures come via WebSearch aggregation of those same outlets — directionally reliable, exact figures flagged in WEAK SPOTS.

---

# 1. TERMINOLOGY MAP (2025–26)

**Macro frame first.** 2025 mobile revenue grew only slightly YoY; the money is bifurcated. Top grossing genres: Strategy ~$20.2B, Puzzle ~$14.4B `[EB:Sensor Tower State of Mobile Gaming 2025]`. In *casual* specifically (AppMagic H1 2025), three genres = ~80% of revenue: **Puzzle $8.2B (+7.6% YoY, the ONLY top casual genre growing), Casino $6.2B, Simulation $1.9B** `[EB:AppMagic Casual Report H1 2025]`. Worldwide downloads fell −7.2% YoY in 2025, but hypercasual downloads *rose* +2.2% and hypercasual time-spent +29.4% `[EB:mobilegamer.biz Dec-2025 data digest]`. Top grossers 2025: Honor of Kings #1 (~$1.7B), Royal Match top *casual* (~$117M/mo Jun-2025), Monopoly GO #2 (~$103M/mo) `[EB:mobilegamer.biz; Statista]`.

**The casual spectrum (usage has hardened):**
- **Hyper-casual** — one mechanic, one goal, no tutorial, offline; ~97–99% ad-driven; 4–5 month dev; short lifespan `[EB:Udonis; GameDeveloper]`. Not dead — it "evolved," persists in emerging markets and now blurs into hybrid `[EB:PocketGamer.biz; mobilegamer.biz]`.
- **Hybrid-casual** — hyper-casual *core loop* + midcore *meta* (progression/upgrades/collections/LiveOps) + blended IAA+IAP; targets 60–90 day retention; 9–12 month dev `[EB:Liftoff 2025 Casual Report; Sensor Tower SoMG 2025]`. **Taxonomic dispute:** Sensor Tower/AppMagic/Liftoff report it as a bucket; GameRefinery calls it "hybridization" (genre-mashing, not a fixed genre); **Deconstructor of Fun explicitly rejects it as a genre — "a transitional state and a launch strategy… the best games evolve beyond it"** `[EB:DoF "Mobile Gaming in 2025", Jun-5-2025]`. For the founder this matters: "hybrid-casual" is a *build/monetize posture*, not a destination.
- **Midcore** — deeper mechanics, longer sessions, ~90% IAP-concentrated `[EB:AppsFlyer 2026; GameRefinery]`.
- **Casual** — the broad middle (match/puzzle/board/card/sim); most *diversified* monetization: ~47% IAP / 28% IAA / 21% hybrid `[EB:AppsFlyer State of App Monetization 2026]`.

**The two "auto-" genres are NOT a pair — the single most-confused term set:**

| | **Auto-SHOOTER (= survivor-like = "bullet heaven")** | **Auto-BATTLER (= auto chess)** |
|---|---|---|
| Parent | Shoot-'em-up / action-roguelite | **Strategy** |
| Input | Move only; weapons auto-fire; pick level-up upgrades | Draft + position units in a **prep phase**, then units auto-fight with **no further input** |
| Session | Real-time survival vs hordes, one run (~15–30 min) | Round-based 8-player PvP economy |
| Titles | Vampire Survivors, Survivor.io, Archero, Brotato | TFT, Dota Underlords, Hearthstone Battlegrounds |

`[EB:Wikipedia Auto-battler; survivorslikes.com; taxonomy research]`. **Key insight: "auto-shooter" is just a disputed name for the Vampire-Survivors genre, NOT the opposite of auto-battler.** Auto-battler is commercially *small* on mobile — TFT earns ~$1M/mo, Dota Underlords ~$497K *lifetime* `[EB:Gamesforum Jul-2025]`; a hard space for a lean team (needs sync PvP + balance depth).

**Horde-survival / survivor-like / bullet-heaven** — one genre, unsettled name. Origin: *Magic Survival* (Korea, 2018/19 mobile) → *Vampire Survivors* (2022). **Vendors have no formal node yet** — Sensor Tower files it under "Shoot 'Em Up" `[EB:taxonomy research]`. It is **systemic/procedural** content — the key reason it's lean-buildable.

**Roguelite mobile action** — procedural runs + permadeath + *persistent meta-progression* (unlocks carry between runs, so each death advances you); the "one more run" loop is uniquely mobile-fit `[EB:antinomy.me 2025 guide]`. Survivor-likes are a sub-branch of this.

**Simulation — two different things sharing a store shelf:** (a) **"simulator"/hypersim** — a single shallow mechanic dressed as a real job/vehicle sim, ad-monetized (the "…Simulator!" Play-Store titles; PowerWash-style "satisfying" loops) `[EB:HC.games; GamerRant]`; (b) **deep simulation** — real systems, large metagame (Township, Family Island). Google Play's `GAME_SIMULATION` category **conflates both**, so store-category "simulation" is not a depth signal `[EB:taxonomy research]`.

**Multiplayer structures:**
- **Synchronous** — real-time, same session (Clash Royale). **Asynchronous** — own-schedule/turn-based (Words With Friends, Draw Something). Async is strongly favored for lean/low-DAU casual: it fills "multiplayer" without needing concurrent players `[EB:Skillz; GameDeveloper]`.
- **Fake matchmaking / bot-driven competition** — seeding "multiplayer" with disguised bots to cut server cost and guarantee early wins (D1 retention lift), mixing real players in later (PUBG Mobile early lobbies the canonical case) `[PU:trade/opinion sources]`. **A legitimate lean-team tool** — "social" pressure with zero backend.
- **"Social-lite" — NOT a codified industry term** `[EB:taxonomy research]`. Nearest real thing: *async social multiplayer* (leaderboards, guilds, gifting, activity feeds layered on single-player); ~66% of top games use some multiplayer/collaborative element `[EB:MAF 2025]`.

**Board / companion event systems — two meanings:**
- **Modern (dominant): the Coin Master / Monopoly GO board-event loop** — a randomizer (slot spin / dice roll) drives movement around a board, generating currency to build/upgrade, plus **raid/attack** social friction, wrapped in **progressive LiveOps event tracks + sticker-album collections + timed tournaments**. Coin Master (Moon Active) invented it (spin→build→raid); Monopoly GO swapped slot for dice `[EB:DoF; Gamigion; AppMagic]`.
- **Older ("second-screen companion")** — a phone app accompanying a console/board game (map, stats, deck manager). Largely dead as a business; ignore unless attached to external IP.

**Adjacent must-knows:**
- **Meta layer / metagame** — the out-of-core progression/collection/base systems that drive retention & spend ("hook + meta") `[EB:Udonis]`.
- **LiveOps** — running the game as a service via scheduled events/passes/LTOs. **~84% of all mobile IAP comes from games running active LiveOps** `[EB:Adjust Apr-2025; Sensor Tower "Winning with Live Ops" 2025]`. Cadence intensified: avg ~73→89 events/month in 2025; top puzzle titles run 80–100 monthly touchpoints; the **72-hour Fri–Sun weekend event is the "gold standard"** `[EB:AppSamurai LiveOps Playbook Jul-2025; Naavik]`.
- **Merge-2 vs merge-3** — merge-3 combines **3** items, meta *fused into* core, board extends off-screen (Merge Dragons, EverMerge); merge-2 combines **2** items, core & meta on **separate swappable boards**, screen-sized, more casual (Merge Mansion pioneered it; **Gossip Harbor overtook the category late-2024**) `[EB:DoF Aug-2024; GameRefinery; Udonis]`.
- **Idle-arcade (arcade-idle)** — simple arcade core + idle auto-resource meta; explicitly a hybrid-casual subgenre (Rollic/Voodoo/Homa/Lion) `[EB:Udonis; ironSource LevelUp]`.
- **Tycoon** — business/economy sim; on mobile usually *idle* ("watch it grow") `[EB:Wikipedia]`.
- **Appointment mechanics** — designed return-hooks (energy/lives/build timers). **Now considered dated**; modern LiveOps favors "front-loaded generosity" over hard gates — BUT timed limited-events (Monopoly GO Golden Blitz on 24–72h windows) are the *rising* form of appointment `[EB:GameDesignBites; MWGamers]`. Wordle's daily puzzle is the purest benign appointment.
- **Playable-first / creative-first ad design** — leading UA with an interactive mini-game demoing the mechanic. **~56% of top creatives now use playables; playables ~20× more likely to convert than static banners** `[PU:Sett/AppAgent 2025 — vendor-reported]`. Load-bearing for the founder's "honest ad = real gameplay" bias.
- **D1/D7/D30 & sessions** — legacy "good" = D1 40 / D7 20 / D30 10; **2025 reality is far lower**: all-games median D1 ~27%, median D7 ~3.4–3.9%, **75% of projects have D28 < 3%** `[EB:GameAnalytics 2025; Adjust 2026]`. **Puzzle / board / card / casino = best mid/long-term retention; arcade = best D1 but weak long-term** `[EB:GameAnalytics 2025]`. Sessions: hypercasual ~2–3 min (5–10/day), casual ~4 min, midcore ~8 min (6–7/day), strategy 15–30+ min; **median daily playtime ~22 min** `[EB:GameAnalytics; Adjust 2026]`.

**Taxonomy trees (industry disagrees at subgenre level):** **GameRefinery** = 3-tier (Category→Genre→Subgenre), 4 categories (**Casual, Mid-Core, Sports & Racing, Casino**), ~12 genres `[EB:GameRefinery docs]`. **Sensor Tower** = 70+ subgenres over ~20k games + proprietary Setting/Theme/Art-Style/Camera tags `[EB:Sensor Tower Game Taxonomy]`. **AppMagic** = manual classification, ~250k apps `[EB:AppMagic]`. All converge on the Casual/Midcore(+Casino, Sports/Racing) top split; **none has a survivors-like or a settled hybrid-casual node.**

---

# 2. SEGMENT LOOP ANATOMY

Format per segment: loop / content model (→ lean-feasibility) / skill-luck & session / minimum viable meta 2026 / differentiation / small-team truth.

**PUZZLE (match-3, block, screw, sort, merge).**
- *Loop:* moment = place/match/clear; session = clear N levels or beat a score; meta = map progression + collection + events.
- *Content:* **the fork that decides feasibility.** Authored match-3 is a **content treadmill**: Candy Crush ~17,000 levels at **45–60 new/week**; Royal Match >12,400 (~100/2wk); Gardenscapes >18,000 (50/Thu); Homescapes ~19,550 `[EB:Roonby; GameRevolution; Playrix wikis 2025–26]`. That's a permanent live level-design *pipeline* — **not lean.** BUT **endless/procedural puzzle** (Block Blast, Tetris-likes, screw/sort) is **systemic** — one board, infinite generated states, near-zero level authoring. **This is the lean sweet spot.**
- *Skill/luck & session:* skill-forward, short 2–4 min sessions, high fail-frequency → rewarded-ad revive is the native monetization.
- *MVM 2026:* leaderboards, daily challenge, light collection/skins, LTO events, battle pass increasingly expected `[EB:GameRefinery]`.
- *Differentiation:* new *geometry/rule* (Hexa Sort's hexagonal adjacency beat square water-sort `[EB:DoF]`), juice/feel, a fresh meta wrapper.
- *Small-team truth:* **the richest lean vein.** **Block Blast (Hungry Studio, ~5–9 people)** is #1 most-downloaded game worldwide 2024 & 2025, ~$17.5M/mo, **near-pure IAA (lifetime IAP only ~$66K)** `[EB:mobilegamer.biz; Udonis 2026]`. Screw wave from Chinese WeChat mini-games → EOGAMES (~30) + iKame (Screw Out Apr-2024 $14M/20M dl) `[EB:AppMagic; Supersonic]`.

**ARCADE / HYPER-CASUAL / HYBRID-CASUAL.**
- *Loop:* twitch/timing core; meta = upgrades/idle/base.
- *Content:* systemic (procedural spawns) — lean; but **game feel & juice are the hidden difficulty.**
- *Session:* 2–3 min, luck-light, skill-light; IAA-dominant, ARPDAU ~$0.03–0.08 pure HC vs ~$0.15–0.50 hybrid `[PU:MAF/GameGrowthAdvisor]`.
- *MVM 2026:* a meta *must* exist now (progression/collection/idle) — pure HC no longer retains or monetizes.
- *Differentiation:* a novel oddly-satisfying core + a meta hook.
- *Small-team truth:* dominated by publisher factories — Rollic ideates **~1,000 concepts/month** (Color Block Jam >$100M bookings); Voodoo ships ~4 games/yr from ~1,000 prototypes (~0.4% launch), grew hybrid 0→$250M in 3 yrs `[EB:PocketGamer.biz; DoF Jun-2024]`. **A solo dev cannot out-*volume* these; must out-*idea* them.**

**ACTION-LITE / ROGUELITE.**
- *Loop:* run-based combat + build-craft + meta unlocks.
- *Content:* **systemic** (procedural runs) — very lean-friendly; the appeal is emergent combos, not authored levels.
- *Session:* 5–20 min runs, skill+build luck; hybrid monetization.
- *Differentiation:* build/synergy design (this is *systems* work — the founder's strength).
- *Small-team truth:* **Balatro (LocalThunk, solo, Playstack)** — poker roguelike, PC/console Feb-2024, mobile Sept-2024, $1M first week / $9M+ IAP by Jan-2025, TGA Best Mobile Game `[EB:GameDeveloper; Statista]`. **BUT premium/paid, PC-first — a port, not mobile-native F2P.** Systemic design is what made it a *solo* win.

**HORDE-SURVIVAL / SURVIVOR-LIKE.**
- *Loop:* move-only, auto-fire, escalating hordes; level-up picks; meta between runs.
- *Content:* **fully systemic** — spawn tables + weapon-evolution trees, *no authored levels.* **Best content-to-effort ratio of any action genre.**
- *Session:* 15–30 min runs, skill+luck (drafted upgrades); IAP-anchored hybrid on mobile.
- *MVM 2026:* character roster, gear/gacha, season pass, clans, daily/event stages `[EB:Habby model, Naavik]`.
- *Differentiation:* weapon-evolution system, theme, meta-economy.
- *Small-team truth:* mobile leader **Survivor.io (Habby)** $75M in 2 months, $500M+ lifetime, ~$5–6M/mo `[EB:mobilegamer.biz; Gamesforum]` — but Habby is a well-funded publisher (~65% IAP/35% ads). *Origin* Vampire Survivors was **solo, £1,100 budget** `[EB:Wikipedia]`. **Requires Unity-class engine** for hundreds of on-screen entities — the main lean blocker.

**TOWER DEFENSE / DEFENSE-ADJACENT.**
- *Loop:* place/upgrade towers vs waves; meta = tower/hero unlocks + map progression.
- *Content:* **authored-heavy** (hand-designed maps + wave scripting + balance) — **the least lean of the "strategy-casual" set.**
- *Session:* 5–15 min, skill-forward; IAP-anchored.
- *State:* **stagnant/evergreen-locked** — "few new TD titles appearing… fallen out of fashion" `[EB:PocketGamer]`. Bloons TD 6 and Kingdom Rush are entrenched kings; Rush Royale (~$500K/mo) and Random Dice added PvP/gacha `[EB:search]`. Growth only via *hybridization* (TD+roguelite, TD+merge).
- *Small-team truth:* **essentially absent** at the top recently; authored-content burden + entrenched incumbents make it a poor lean bet unless you fuse it with a systemic layer. (See deep-dive: the solo path that DOES exist is premium/light-F2P PvE roguelite-TD, Isle of Arrows / Emberward model — low-to-mid six figures, often Steam-first.)

**SIMULATION.**
- *"Simulator"/hypersim:* single satisfying mechanic, systemic/light content, IAA — **lean-buildable**, but a crowded ad-arbitrage race.
- *Deep sim / tycoon:* large economy metagame; **economy tuning is the hidden difficulty**; retention strong (sim = top-3 casual revenue at $1.9B `[EB:AppMagic H1-2025]`) but content & balance burden is high.
- *MVM:* collections, timed production, events; often idle meta.
- *Small-team truth:* idle/tycoon sims are viable solo *if* scope is tight and economy is systemic, not authored.

**RACING / DRIVING.**
- *Loop:* steer/time; meta = car unlocks/upgrades.
- *Content:* systemic tracks possible but **physics feel + 3D assets = Unity-class + art burden.**
- *State:* niche; sports+racing combined ~$3.4B/yr; Hill Climb Racing the evergreen casual example `[EB:search]`. CSR Racing 2 alone = ~half of genre revenue (extreme concentration).
- *Small-team truth:* **poor lean fit** (asset + physics cost) unless reduced to a 2D one-mechanic hypersim. Legacy solo hits (Traffic Rider) predate today's UA costs; no new 2024–26 solo racing breakout found.

**PARTY / MINIGAME / BOARD-ADJACENT.**
- *Loop:* short competitive minigames in shared lobbies.
- *Content:* **content + sync-multiplayer + UGC treadmill** — the *heaviest* lean burden.
- *State:* Stumble Guys (38M MAU / 3.6M DAU, Scopely-owned), Eggy Party (NetEase, $750M lifetime, 40M DAU in China, **declining** $395M-2023→$158M-2025) `[EB:PocketGamer.biz; mobilegamer.biz]`.
- *Small-team truth:* **NOT solo-buildable** — needs real-time netcode, anti-cheat, and a UGC/content engine. Avoid.

**IDLE / PROGRESSION-LITE.**
- *Loop:* tap/auto-generate → prestige/reset → faster growth; offline earnings.
- *Content:* **systemic (numbers/curves)** — extremely lean; the work is *economy design*, not assets.
- *Session:* 1–5 min check-ins, many/day; luck-light; hybrid (rewarded-ad boosts + IAP skips).
- *MVM 2026:* prestige layers, events, light collection, offline-earnings ad-doubler.
- *Differentiation:* theme + a novel prestige/merge twist (idle-arcade fusion).
- *Small-team truth:* **strong lean fit** — offline-capable, no backend, no level pipeline; risk is a saturated field and thin novelty. (Deep-dive nuance: 2025's chart-topping "idle" titles — Legend of Mushroom, Capybara Go, AFK Journey — are all studio-backed idle-RPG/gacha, NOT lean products; lean idle wins at the sustainable-small-business tier, not the charts.)

**SOCIAL-CASUAL HYBRIDS (board-event / social-casino loop).**
- *Loop:* randomizer → build → raid/steal → collect + LiveOps events.
- *Content:* systemic core BUT **the meta/LiveOps/economy is the product** — a permanent live-content and balancing operation.
- *State:* the richest revenue in casual — Monopoly GO $6B lifetime fastest-ever (1,275 days), ~$200M/mo run-rate; Coin Master $6B lifetime; Dice Dreams $400M+; top-3 hold ~90% of the ~$2.4B coin-looter category `[EB:Sensor Tower; Scopely; AppMagic]`.
- *Small-team truth:* **the loop is clonable; the *operation* is not.** Monopoly GO took 150+ devs and ~$70M/7 years pre-launch + $1B lifetime marketing `[EB:Scopely/PocketGamer.biz]`. A lean team can borrow the *shape* (spin/dice → build → light social) at small scale, but cannot match the LiveOps cadence that monetizes it.

---

# 3. HISTORICAL VS CURRENT VIABILITY

- **2010s premium/simple-casual** — worked historically only. Paid puzzle/arcade is dead as a discovery model on Android; survives only as premium *ports* of proven PC/console IP (Balatro).
- **Match-3 meta arms race (2014–)** — still works, but **only with modern meta-LiveOps + a live level pipeline** (45–100 levels/week). Table stakes now include narrative meta, teams, passes. **UA-broken for newcomers** (Royal Match/Candy Crush spend at a scale indies can't).
- **Hypercasual boom/bust (2017–2022)** — *broken as an arbitrage.* Peaked Q1-2020 (HC = 78% of top new-game downloads in 2019); killed by **Apple ATT/IDFA (Apr-26-2021)** + eCPM collapse (2022) + CPI rise — Voodoo declared "hypercasual is dead" Jan-2023; new HC titles in the US top-1,000 fell **210 (2020) → 97 (2022) → 54 (2023)** `[EB:Sensor Tower; PocketGamer; TechCrunch]`. Pure HC now works *only* with a hybrid meta bolted on.
- **Hybrid-casual & LiveOps era (2022–2026)** — **works as-is and growing:** top-10 hybrid net IAP $87M Q1-2025 (+67% YoY) → $126M Q2-2025 (+100%) `[EB:AppMagic]`. But it's a *publisher-volume* game; the winning move for a solo is a *differentiated single bet*, not a portfolio.
- **2023–26 waves — honest read:**
  - **Screw/sort/block "puzzle takeover":** *live and systemic* — the strongest lean opportunity, but **saturated and fast-cloning** (Water Sort collapsed from 6 of top-10 in 2022 to **zero by 2024**; Block Puzzle now 71% of top-10 puzzle revenue, Screw 20%, Sort 9%) `[EB:AppMagic; DoF]`. Window on any single mechanic is ~12–18 months.
  - **Block-Blast-likes:** *looks easy, is winnable, but is now a red ocean* — Block Blast won on **A/B-tested feel + ad-ops execution**, not novelty `[EB:mobilegamer.biz]`.
  - **Survivor-likes:** *maturing, still works* — systemic, IAP-deepening; needs a Unity-class build + meta-economy.
  - **Suika/physics-merge:** *virality-driven, clone-flooded* — Suika went global Oct-2023, hit 1M eShop in a month via streamers, then clones flooded `[EB:Wikipedia; Automaton]`. Great for a *cheap viral test*, terrible for defensibility.
  - **Monopoly-GO-style event boards:** *works spectacularly but only WITH a heavy LiveOps org* — not lean.
  - **Merge maturity:** *works, treadmill-moderate* — merge-2 momentum (Gossip Harbor), but authored-content and economy depth rising; extreme winner-concentration (top-3 = 90%+ of merge revenue).
  - **AI-assisted content:** *real tailwind for systemic genres*, *not* a fix for authored-treadmill genres (AI can't yet design 15,000 *tuned* match-3 levels).

---

# 4. SCOPE REALITY — solo Kotlin dev + AI assist

**Engine fit by genre:**

| Stack | Genuinely fits | Avoid for |
|---|---|---|
| **Native Kotlin / Jetpack Compose + Canvas** | Board, card, word, trivia, puzzle-lite, idle/tycoon, turn-based/async, text/narrative | Physics-feel arcade, survivor-like, 3D, high-entity counts |
| **Godot 4** | 2D action, roguelite, arcade, survivor-lite (moderate entities), pixel/geometric | Very high entity counts vs Unity; smaller mobile-ads ecosystem |
| **Unity** | Survivor-like (hundreds of entities), physics arcade, 3D sim/driving, anything needing mature ad-mediation | Overkill for board/word/idle; heavier build |
| **Flutter + Flame** | 2D casual, puzzle, card — pragmatic if already Flutter-fluent | Physics-heavy / high-framerate / 3D `[EB:filiph.net benchmark; genieee 2025]` |

**Founder-specific read `[SPEC]`:** the founder is **Kotlin-native**, so **Compose/Canvas is the zero-friction path for board/word/card/puzzle-lite/idle** — Tetris and Sudoku ship in Compose today `[EB:jetpackcompose.app]`; Compose Aug-2025 added rendering/2D-scroll APIs `[EB:Android Developers Blog Aug-2025]`. **But native Android locks you to one platform and hands you no ad-mediation SDK, no physics, no particle/juice tooling.** For anything with *game feel* (arcade, survivor-like), **Godot 4 is the best solo choice** (Buckshot Roulette, an 8M-selling solo hit, was Godot); **Unity only when you need entity-scale or mature ad mediation** (AppLovin MAX / LevelPlay), which is a real monetization advantage for IAA.

**"Simple to understand" ≠ "simple to build" — the hidden-difficulty map:**
- **Game feel / juice** — the actual moat in arcade/puzzle (Block Blast beat clones on feel, not rules). Hard, iterative, not AI-solvable.
- **Physics tuning** — Suika's charm *is* its physics; clones "lack the polished physics". Deceptively deep.
- **Difficulty curves & level design at volume** — the treadmill killer for authored genres; avoid genres needing thousands of tuned levels.
- **Economy tuning** — the make-or-break in idle/tycoon/merge/social-casino; a systems-design skill, not content.
- **LiveOps ops** — the real cost of board-event and match-3 games; a *team* function.

**Art strategy for a non-artist:**
- **Minimal/geometric/flat** styles (Block Blast, screw/sort, hyper-casual) sidestep art entirely — **strongly recommended.**
- **AI-art pipeline:** claimed 60–80% asset-cost reduction; good for *exploration* and isolated items/tiles; **style consistency across a set is the known failure mode** `[EB:apatero; ixiegaming 2025]`.
- **Store-policy caveats:** Google Play's **AI-Generated Content policy (effective Jan-31-2024)** requires in-app reporting for user-facing generative features; **AI-content-violation removals rose ~190% H1-2025 YoY** `[EB:Google Play Console Help; REVERA]`. For *pre-baked* AI art the binding rules are **Deceptive Behavior / Misrepresentation**. **There is no explicit "ads must show real gameplay" clause** — it's enforced via deceptive-ads + metadata rules + **regulators** (UK ASA banned Playrix pin-pull ads 2020; FTC/Tapjoy 2021); 56% of gamers report ads that misrepresent gameplay `[EB:Sherwood/IAB]`. **Implication: an "honest ad = real gameplay" game is both a UA edge (playables convert ~20×) and policy-safe.**

---

# 5. OPPORTUNITY TERRITORIES (category spaces, not final ideas)

Each: fantasy / loop / return driver / monetization / production burden (S/M/L) / risks / structure.

**T1 — Systemic endless block/spatial puzzle (Block-Blast lineage).** *Fantasy:* effortless mastery. *Loop:* place→clear→chase score, endless. *Return:* daily challenge + leaderboard + score chase. *Monetization:* IAA + rewarded revive (proven near-100% ad model). *Burden:* **S** (Compose/Canvas). *Risks:* red-ocean, feel-defined, needs UA scale. *Structure:* solo + async leaderboard. *Fit:* highest for founder's stack; differentiate on a *new spatial rule* + feel.

**T2 — Word/daily-appointment puzzle.** *Fantasy:* "I'm clever, daily." *Loop:* one daily puzzle + endless mode. *Return:* **benign appointment** (Wordle's daily; Wordle 12M DAU, Wordscapes ~10M DAU `[EB:search]`). *Monetization:* IAA + hint IAP + optional subscription (NYT Games has 10M+ subs). *Burden:* **S** (native, text-based, offline). *Risks:* Wordle-clone saturation; needs a novel word *rule*. *Structure:* solo + async streak-sharing.

**T3 — Idle/tycoon with a novel prestige twist.** *Fantasy:* watch an empire compound. *Loop:* generate→upgrade→prestige. *Return:* offline earnings + ad-doubler + events. *Monetization:* hybrid (rewarded boosts + IAP skips). *Burden:* **S–M** (systemic numbers; economy tuning is the work). *Risks:* saturation, thin novelty. *Structure:* solo, offline-capable. *Fit:* excellent lean/offline/native fit.

**T4 — Roguelite deck/build-a-run (Balatro-adjacent, mobile-native F2P).** *Fantasy:* broken combos. *Loop:* draft→synergize→push a run. *Return:* unlock meta + daily seed + leaderboard. *Monetization:* hybrid (cosmetics, run-modifiers, rewarded continues) — *avoid pay-to-win*. *Burden:* **M** (Godot; **systems design = founder's strength**). *Risks:* systemic-balance depth; F2P-ifying a premium-feeling genre. *Structure:* solo + async daily-seed compete. *Fit:* strong; differentiation via a *new draft/economy system*.

**T5 — Systemic satisfying "simulator"/physics-toy (honest-ad native).** *Fantasy:* oddly-satisfying competence (clean/cut/sort/pull). *Loop:* one tactile mechanic, systemic levels. *Return:* light progression + collection. *Monetization:* IAA + rewarded. *Burden:* **S–M** (physics feel is the hidden cost). *Risks:* clone-race, ~12-mo mechanic window. *Structure:* solo. *Fit:* ad *is* the gameplay → UA/playable edge; policy-safe.

**T6 — Survivor-like with a distinct meta-economy.** *Fantasy:* power fantasy from chaos. *Loop:* survive runs→evolve build→meta unlocks. *Return:* roster + gear + season events. *Monetization:* IAP-anchored hybrid. *Burden:* **M–L** (Unity/Godot; entity-scale + meta). *Risks:* maturing/competitive; needs a real economy. *Structure:* solo core + async events. *Fit:* systemic content is lean; engine + economy are the gates.

**T7 — Async social duel on a systemic core (bot-seeded).** *Fantasy:* "I beat someone." *Loop:* short skill round vs an async opponent/**bot** ghost. *Return:* ladder + streaks + light social. *Monetization:* IAA + cosmetics. *Burden:* **S–M** (no real-time netcode; bot-seeded matchmaking = zero backend). *Risks:* thin social feel; fairness perception. *Structure:* async/fake-matchmaking. *Fit:* gets "multiplayer" retention at solo cost — a deliberate lean cheat.

**T8 — Trivia/knowledge with a fresh format.** *Fantasy:* show what you know. *Loop:* quick rounds; daily set. *Return:* daily + async challenges + categories. *Monetization:* IAA-heavy + hint IAP. *Burden:* **S** (native; content = generatable — an AI tailwind). *Risks:* commodity, modest ARPU; content-freshness ops. *Structure:* async social. *Fit:* AI-assisted content production is a genuine edge here.

**T9 — Cozy collect-and-arrange idle (non-competitive).** *Fantasy:* a calm little world that grows. *Loop:* light task→collect→arrange/decorate. *Return:* appointment-lite + new collectibles. *Monetization:* hybrid (rewarded speed-ups, cosmetic IAP). *Burden:* **M** (art-forward — mitigate with tight geometric/AI style). *Risks:* art burden for a non-artist; niche ($487M→$780M NA, 60%+ female `[EB:search]`). *Structure:* solo, offline; optional async gifting. *Fit:* underserved audience; art is the main risk.

**T10 — Suika-style physics-merge (cheap viral probe).** *Fantasy:* "one more drop." *Loop:* drop→physics→same-merge→score. *Return:* score chase + daily. *Monetization:* IAA. *Burden:* **S** (but physics polish is the differentiator). *Risks:* extreme cloning, virality-dependent. *Structure:* solo. *Fit:* best used as a *fast, cheap testable* to learn UA/feel, not a durable bet.

**T11 — Light board-event loop at lean scale (Coin-Master shape, minus the org).** *Fantasy:* build + poke friends. *Loop:* spin/dice→build→light steal→collect. *Return:* daily energy + collection album + small events. *Monetization:* hybrid. *Burden:* **M–L** (economy + *some* LiveOps — the trap). *Risks:* **the loop is easy, the live-ops operation isn't** — do not attempt the $6B version. *Structure:* solo + async social. *Fit:* only viable as a *stripped, honest, offline-tolerant* interpretation; flagged high-risk for a lean team.

**T12 — Merge-2 with a systemic (not authored) content engine.** *Fantasy:* tidy chaos into order. *Loop:* merge pairs→fulfill orders→meta board. *Return:* order chain + events + collection. *Monetization:* hybrid. *Burden:* **M** (economy + order-generation; keep generation *procedural*). *Risks:* Playrix/Microfun incumbents; economy depth. *Structure:* solo. *Fit:* viable if the order/content generation is systemic.

**Portfolio bias for the founder `[SPEC]`:** T1, T2, T3, T4, T8 are the **highest lean/native/offline/IAA-fit** bets (systemic content, Compose/Godot-buildable, honest-ad-friendly). T6/T9/T11/T12 carry engine, art, or LiveOps burden. T5/T10 are **cheap first probes** to learn UA and game-feel before committing.

---

## STRONG CLAIMS (highest confidence)

1. **Systemic-content genres are the only honest lean path; authored-treadmill genres are not solo-viable.** Match-3 ships 45–100 tuned levels *per week* forever; block/screw/sort/idle/survivor/roguelite are systemic. Pick systemic.
2. **Genuine small-team, mobile-native F2P hits are rare — Block Blast is the archetype and near-existence-proof.** ~5–9 people, #1 downloaded worldwide two years running, ~$17.5M/mo on **almost pure IAA**. Most celebrated "solo hits" (Balatro, Vampire Survivors) are **premium PC/console-first ports**, not mobile-native F2P.
3. **"Auto-shooter" = survivor-like; "auto-battler" = auto chess. Unrelated; auto-battler is commercially small on mobile.**
4. **Hyper-casual UA arbitrage is permanently broken; hybrid (IAA+IAP) is the standard.**
5. **A meta layer + LiveOps is now table stakes even in casual** — ~84% of mobile IAP comes from games running active LiveOps. A lean team should choose genres where *systemic* content + *light* events suffice (idle, endless puzzle, roguelite), not board-event/match-3 (heavy live-ops orgs).
6. **The board-event loop (Coin Master→Monopoly GO) is the richest casual money but the least lean** — Monopoly GO: 150+ devs, 7 years, $6B. Clone the *shape* at small scale only; never the operation.
7. **"Honest ad = real gameplay" is simultaneously a UA edge and policy-safe** — playables convert ~20× vs banners; deceptive-ad enforcement punishes the alternative.
8. **For the founder's Kotlin stack: Compose/Canvas fits board/word/card/puzzle-lite/idle; Godot 4 for anything needing game-feel; Unity only for entity-scale or mature ad-mediation.**
9. **Puzzle is the durable lean category** — the only top *casual* genre growing (+7.6% YoY, $8.2B H1-2025) and the home of every recent small-team wave.
10. **Mechanic waves are short (~12–18 months) and clone-flooded** — Water Sort went 6-of-top-10 (2022) to zero (2024). Differentiate on feel/rule/meta and expect a limited window.

## WEAK SPOTS (thin evidence / needs further research)

1. **Primary-source figures are search-aggregated, not directly read** (proxy blocked primary PDFs, 403). Treat *cadences* (levels/week, events/month) as more reliable than *absolute totals*; verify exact revenue/level counts against primaries before any decision.
2. **Block Blast team size (~5–9)** is a ZoomInfo *estimate*; a Bloomberg-reported Tencent stake (Feb-2026) suggests it may be scaling — the "tiny team" framing may already be dated.
3. **Conflicting figures flagged:** hybrid-casual Q2-2025 top-10 IAP ($100M vs $126M); Candy Crush level count (17,000 vs ~22,685); ATT opt-in (~15–25%); the "$4.2B hybrid-casual 2025" number (single weak source — do not cite).
4. **Retention-by-genre tables diverge wildly by population** (all-games median vs top-quartile vs top-25-revenue). Any modeling must state the population.
5. **"Social-lite" and "creative-first" are not codified industry terms**; treated as informal.
6. **TD/party/merge/idle/racing/board deep-dive figures** rest on the dedicated sub-agent reports (see `03b-genre-deep-dives.md`).
7. **AI-art cost-savings (60–80%) and playable-ad performance (20×) are vendor-reported**, not neutral analyst data.
8. **Per-title IAA-vs-IAP splits for screw/sort titles** were not verifiable — the ad-vs-IAP economics of the newest waves are under-documented.
