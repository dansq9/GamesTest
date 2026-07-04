# Panel 5 — Technical / Multiplayer Architecture

> Research panel output (Opus agent, live web research, July 2026). Claims tagged
> [evidence-backed] / [plausible-unverified] / [speculative] by the agent.
> Synthesized into `../mobile-games-opportunity-framework.md`.

# BACKEND / MULTIPLAYER ARCHITECTURE — TECHNICAL DIRECTOR ANALYSIS
*Solo Android/Kotlin founder, first game test, Pakistan-based, Android-first→global, AI-assisted dev, July 2026*

## Framing thesis
This founder's structural advantage is native Android/Kotlin fluency and comfort with lightweight backends. Every backend dollar and every server-authoritative subsystem is a tax on shots-on-goal. Most first games die; the correct optimization target is **cheapest credible shot-on-goal that still feels alive**, not a scalable multiplayer platform. Multiplayer is a cost center that only converts to a benefit *after* you have a population and retention signal. The panel-level recommendation is to manufacture "multiplayer feel" with near-zero infra and defer every real networked subsystem behind explicit metric gates.

A load-bearing fact for this founder specifically: **Google Play Games Services (PGS) provides leaderboards, achievements, and Saved Games (cloud save) for free, server-hosted by Google, with zero backend to run** — but its real-time and turn-based multiplayer APIs were deprecated in 2019 and shut off in 2020 [evidence-backed: developers.google.com/games/services deprecated list; support.google.com/googleplay 2990418]. That single fact reshapes the whole cost table below.

---

## 1. STRUCTURE-BY-STRUCTURE ANALYSIS

Cost model basis: casual-game DAU→ops assumptions are modeled, not measured — tagged [plausible-unverified: modeled]. Underlying unit prices are [evidence-backed]. Real-time costs use the industry rule that **peak CCU ≈ 10% of DAU steady-state (3–5% average), spiking 20–30% at launch** [evidence-backed: PlayFab "The Metric That Really Matters"].

### (a) Pure single-player offline
- **Tech complexity:** Lowest. No network layer, no auth, no server. Client-only.
- **Backend & cost @1k/100k/1M DAU:** $0 / $0 / $0. Analytics + crash + ads only (all free tiers).
- **Anti-cheat surface:** None that matters (local saves can be edited; irrelevant with no shared state or money).
- **Moderation/regulatory:** Minimal. Still must file Play **Data Safety form** and, if you add accounts, honor **account-deletion** policy — but offline-only with no account avoids most of it [evidence-backed: support.google.com 13327111]. No chat = no DSA/COPPA moderation duty.
- **LiveOps:** Remote-config balancing + events only. Trivial.
- **Monetization upside:** Ads + IAP work fine; ceiling is lower engagement without social hooks.
- **Retention upside:** Weakest structurally, but content/meta-progression can carry it (idle, puzzle, roguelite).
- **First-test verdict:** ✅ **Default-acceptable.** The safest lean test. Only reject if the genre's whole promise is social.

### (b) Single-player + social overlay (leaderboards, ghosts, share, cloud save)
- **Tech complexity:** Low. Read/write a scoreboard and a save blob; share via OS intent. No realtime.
- **Backend options:** **(i) PGS leaderboards + Saved Games — $0, no backend, native Android** [evidence-backed]; (ii) Firebase (Firestore/RTDB) if you need custom UI or cross-platform; (iii) a $5–20/mo VPS + Postgres for a denormalized board at scale.
- **Cost @1k/100k/1M DAU:**
  - PGS path: **$0 / $0 / $0** (Google eats it). This is the winner for native Android.
  - Firebase path: 1k → **$0** (Spark: Firestore 50k reads/20k writes/day free; 1 GB) [evidence-backed: firebase.google.com/pricing]. 100k → **~$100–500/mo** [plausible-unverified: modeled at $0.18/100k reads, $0.18/100k writes]. 1M → **~$1.5k–5k/mo** naive, cut sharply with sharded/aggregated boards + client caching [plausible-unverified: modeled].
- **Anti-cheat surface:** Leaderboards are the #1 cheat magnet. Client-submitted scores are trivially spoofed. **Minimum mitigations:** server-side plausibility caps (max score/time), rate-limiting, statistical outlier flagging, segmented boards (friends/country/weekly reset) that dilute the incentive. Full server replay-validation is overkill for a first test. Keep money out and cheating is a cosmetic annoyance, not an existential threat.
- **Moderation/regulatory:** Cloud save/accounts trigger the **account-deletion requirement (in-app + web link)** [evidence-backed]. Ghosts/scores are not free-text → **no moderation duty**. Avoid usernames-as-free-text (use PGS gamer handles or canned names) to stay out of UGC/DSA scope.
- **LiveOps:** Weekly board resets, seasonal events via Remote Config. Light.
- **Monetization/retention upside:** Meaningful retention lift — leaderboards/competition are repeatedly cited retention drivers [plausible-unverified: adriancrook.com; a University of Colorado 2021 gamification figure of "up to 50%" retention lift circulates but is a soft, non-game-specific claim — treat as directional only].
- **First-test verdict:** ✅✅ **Strongly recommended.** Best feel-per-dollar. On native Android, PGS makes it literally free and server-hosted.

### (c) Async multiplayer (turn-based, raid/visit, ghost racing)
- **Tech complexity:** Low–moderate. No persistent connection; store-and-forward game state + FCM push. Ghost racing is essentially (b) with a replay blob. Turn-based (Words-with-Friends style) is a state document + notification.
- **Backend options:** Firestore/Supabase realtime/RTDB; Nakama if you want batteries-included; FCM for pushes (**free, unlimited** [evidence-backed]).
- **Cost @1k/100k/1M DAU:** 1k → **$0** (Spark; or Supabase free: 500 MB DB, 200 concurrent realtime conns, 2M msgs/mo, but **pauses after 7 days idle** [evidence-backed: supabase.com/pricing]). 100k → **~$200–800/mo** [plausible-unverified: modeled]. 1M → **~$2k–8k/mo**, or migrate to self-hosted Postgres + small app server (~$100–500/mo infra + your time) [plausible-unverified: modeled].
- **Anti-cheat surface:** Much gentler than real-time — you can validate moves **at leisure, server-side**, because there's no latency budget. For casual/no-stakes, client-trust + spot validation is fine.
- **Moderation/regulatory:** Safe **only if you avoid free-text**. Any player-authored messages/team names → UGC → **DSA obligations** (reporting mechanism, ~72h moderation queue, human contact point, penalties up to 6% global turnover) [evidence-backed: promise.legal DSA guide]. Use emotes/canned messages.
- **LiveOps:** Moderate (matchmaking pools, event cadence).
- **Monetization/retention upside:** Good. Async competition creates re-engagement loops (your turn!) without realtime cost. Ghost racing gives "compete against humans" feel with zero concurrency.
- **First-test verdict:** ✅ **Acceptable, ghost/turn-based flavor preferred.** This is the highest-value *real* multiplayer tier for a solo dev because it sidesteps latency, concurrency, and realtime anti-cheat. Keep it text-free.

### (d) Bot-supported "fake" competition
- **Tech complexity:** Lowest of any "multiplayer" — **bots run client-side, no netcode, no rooms, no server**.
- **Backend & cost @1k/100k/1M DAU:** **$0 / $0 / $0** for the bot layer. Optional name/avatar pools + fake activity feed served from Remote Config (free).
- **Anti-cheat surface:** None (no real opponents to defraud).
- **Moderation/regulatory:** None (no real UGC), *provided* you don't misrepresent in store copy (see §2 ethics).
- **LiveOps:** Bot difficulty tuning via Remote Config. Light.
- **Monetization/retention upside:** Solves the **cold-start / empty-lobby death spiral** that kills genuine multiplayer in low-population launches, and works **offline** (critical for T3 India/Pakistan connectivity). Retention claims of "30–40% higher with well-designed AI opponents" exist but come from vendor blogs — [plausible-unverified: vocal.media/SDLC Corp].
- **First-test verdict:** ✅✅ **The cheapest "feels multiplayer."** Correct first-test choice for board/card/arcade/.io genres. Caveats in §2.

### (e) Real-time synchronous multiplayer (2–8 player rooms)
- **Tech complexity:** High. Authoritative simulation or relay, tick sync, interpolation/rollback, matchmaking, region selection, reconnection. This is a different discipline from app dev.
- **Backend options:** **Photon Fusion/Quantum** (pragmatic managed path), Nakama self-host/Heroic Cloud, PlayFab Multiplayer Servers. Note **Hathora shut down May 5, 2026** (acquired by Fireworks AI) — a live warning that game-infra vendors evaporate and lock-in is real [evidence-backed: hathora blog / gameye].
- **Cost @1k/100k/1M DAU** (via CCU≈10% DAU):
  - 1k DAU → ~100 peak CCU → **fits Photon's FREE 100 CCU tier (~40k MAU)** [evidence-backed: photonengine blog], but **launch spikes of 20–30% (200–300 CCU) blow past free** — you'll pay unexpectedly. 200 CCU bundle = $95/yr; 500 CCU = $125/mo [evidence-backed].
  - 100k DAU → ~10,000 peak CCU → 2,000 CCU = $500/mo, so **~$2,000–3,000/mo** extrapolated (volume discounts apply) [plausible-unverified: modeled from $500/2000 CCU].
  - 1M DAU → ~100,000 peak CCU → **~$10k–25k/mo+** on list rates, or comparable self-hosted infra + heavy DevOps [plausible-unverified: modeled].
- **Anti-cheat surface:** **Maximal.** Speedhacks, packet manipulation, state tampering. Relay netcode (default PUN) is *not* authoritative — competitive/monetized realtime PvP is unshippable without **server-authoritative simulation** (Fusion host mode / Quantum / dedicated). That is expensive in both money and skill.
- **Moderation/regulatory:** Lobbies invite chat → full **DSA/COPPA** exposure [evidence-backed]. CS burden (griefing reports, disconnects/refunds) is continuous.
- **LiveOps:** Heavy — matchmaking tuning, region ops, netcode debugging, cheat response.
- **Monetization/retention upside:** Potentially high *if* it's the core loop and it works — but the failure modes (empty lobbies, lag, cheaters) destroy retention faster than social features build it.
- **First-test verdict:** ❌ **Refuse for a first test** unless the game is *definitionally* impossible without it (e.g., a realtime .io arena as the entire pitch) — and even then, prototype the feel with bots (d) first.

### (f) Co-op / guild / team systems
- **Tech complexity:** High. Persistent social graph, shared mutable state, roles/permissions, guild chat, activity feeds, seasonal events.
- **Backend options:** Nakama (built-in groups/parties/chat), Firestore/Supabase, Heroic Cloud (managed Nakama, **lowest tier ~$600/mo as of Aug 2025**) [plausible-unverified: crux.supercraft.host, single secondary source].
- **Cost @1k/100k/1M DAU:** 1k → **$0** (Spark/self-host). 100k → **~$500–2k/mo** (chat + feeds dominate) or Nakama self-host ~$100–500/mo + DevOps [plausible-unverified: modeled; self-host-for-$10/mo is possible for tiny scale per Snopek Games]. 1M → **$2k–10k/mo+**.
- **Anti-cheat surface:** Shared economies invite exploit; guild-state races need server authority.
- **Moderation/regulatory:** **The killer is chat = UGC = DSA 72h queue + human contact + COPPA "high-risk feature" flag** [evidence-backed: modulate.ai, promise.legal]. COPPA 2025 final rule treats chat as high-risk and pushes toward predefined/heavily-moderated messaging or none [evidence-backed: promise.legal COPPA 2025]. Plus heavy CS (guild disputes).
- **LiveOps:** Highest ongoing burden (guild events, seasons, balance).
- **Retention upside:** **Highest of all** (social lock-in) — but only *after* you have a population. A guild system with no players is dead weight, and empty guilds actively signal failure.
- **First-test verdict:** ❌❌ **Hard refuse.** This is a scale-up retention feature for a *proven* game, never a first test.

### Structure summary table
| Structure | Tech load | $/mo @100k DAU | Anti-cheat | Moderation/regulatory | First-test |
|---|---|---|---|---|---|
| (a) Offline SP | Minimal | $0 | none | none | ✅ default |
| (b) Social overlay | Low | $0 (PGS) – $500 | soft leaderboard | account-delete only | ✅✅ best value |
| (c) Async MP | Low-mod | $200–800 | lazy server-side | avoid free-text | ✅ ghost/turn |
| (d) Bots | Minimal | $0 | none | none* | ✅✅ cheapest "MP feel" |
| (e) Realtime MP | High | $2k–3k | maximal | chat = DSA/COPPA | ❌ refuse |
| (f) Guilds/co-op | High | $500–2k+ | high | chat = DSA/COPPA + CS | ❌❌ hard refuse |

---

## 2. FAKE MATCHMAKING DEEP-DIVE

**How Ludo/carrom/racing/.io games actually do it:**
- **Bots are client-side heuristics, not ML.** Ludo = probability-weighted move selection with deliberate occasional suboptimal moves; racing = rubber-banding pace-setters; .io = wander→seek→flee state machines with injected reaction delay. Real intelligence isn't needed; *believable imperfection* is.
- **Difficulty curve = manufactured early competence.** The dominant pattern (openly documented for **PUBG Mobile**): early matches are heavily bot-seeded and easy, the bot ratio decreasing as the player levels up — this manufactures early wins → competence illusion → attachment/retention [evidence-backed: malwarebytes 2026; pcgamer]. Ludo apps use bots explicitly to "fill the table" and "eliminate downtime" [evidence-backed: vocal.media].
- **Name/avatar generation:** pools of realistic handles (adjective+noun+digits, localized name lists weighted to the player's region), avatar pools.
- **"Searching for players…" theater:** an artificial 2–8s search timer with incrementing "player found" animations, countdown lobbies that "fill" as the timer expires — while bots were seeded instantly. **Latency-hiding inverts here:** because bots are local, latency is *zero*, so developers *add* fake network delay / typing indicators to preserve the illusion.
- **Offline-capable benefit:** bots need no connection → the game is playable on a subway or a rural cell edge (decisive for T3 India/Pakistan), with **no matchmaking wait and no empty-lobby death spiral** — the cold-start problem that kills genuine multiplayer in low-population launches.

**Disclosure ethics & store-policy reality:**
- **Undisclosed bot-matchmaking is effectively unpoliced.** Neither Google Play nor Apple meaningfully enforces disclosure; **PUBG Mobile, Fortnite, and Marvel Rivals run undisclosed named bots at massive scale without penalty** [evidence-backed: pcgamer; malwarebytes]. There is no specific store rule found that prohibits it (absence-of-evidence — tagged as such).
- **But players discover fakeness** — identical behaviors, repeated names, robotic timing, "winning while my Wi-Fi is off" — and the backlash is real ("fake multiplayer epidemic" discourse) [evidence-backed: linkedin/pcgamer]. It's most toxic in **real-money/wager Ludo**, where suspected bots read as rigged gambling.
- **When bots are the right first-test choice:** casual/board/card/arcade/.io where opponent *humanity* isn't the core promise; when you must solve cold-start; when offline play matters for your market. This is the founder's sweet spot.
- **When bots poison the well:** when you *market* "play real people" and don't; real-money stakes; competitive integrity is the selling point; persistent identities where players expect to re-encounter humans.
- **Best-practice compromise (recommended):** don't lie in store copy; label the mode "Practice"/"Quick Match," not "Online PvP"; run a **hybrid** — seed bots to fill instantly but genuinely swap in real players when available. The honest end of the spectrum (labeled bots: R6, Halo, CS2, CoD) coexists with silent bots (Epic/NetEase) — sit near the honest end to avoid review-tanking.

---

## 3. ENGINE/STACK MATRIX FOR THIS FOUNDER

### Native Android (Kotlin + Compose/Canvas/View, or lightweight GL)
- **Genres that genuinely fit:** board (chess, ludo, carrom, checkers), card (solitaire, rummy, poker UIs), word (Wordle-likes, crosswords, anagrams), puzzle-lite (2048, sudoku, nonograms, light match-3), idle/incremental, quiz/trivia, simple 2D arcade (tap/timing, endless runners with modest motion), turn-based strategy-lite.
- **Ceiling:** No built-in physics, scene graph, tween/animation system, particle system, or asset pipeline — you build or import all of it. Compose Canvas / `View` Canvas comfortably handles *tens* of moving objects, not hundreds; not for particle-heavy action or 3D.
- **Advantages for THIS founder — decisive:** (1) **zero learning curve** (home turf → fastest shot-on-goal); (2) **smallest binary** — native games ship in single-digit MB vs Unity 15–30 MB and Godot 100 MB+; (3) **best low-end performance and startup** on 2–4 GB devices; (4) direct access to Play Billing, PGS, AdMob, FCM; (5) **best AI-assisted-coding fit** — Kotlin/Android is among the most heavily represented stacks in LLM training data [speculative but well-grounded]; (6) trivially **offline-first**.
- **Verdict:** **This is his structural edge — lean into it.** For board/card/word/puzzle/idle/arcade-lite, native Kotlin beats every engine on speed-to-test, size, and AI-assist leverage.

### Unity
- **When required:** physics-feel arcade (PhysX/Box2D), survivor-likes/hordes (hundreds of entities), 3D sim/driving, particle-heavy "juice," or when the Asset Store shortcuts content you can't build solo.
- **Learning curve from Kotlin:** C# is easy for a Kotlin dev; the **engine workflow** (scenes/prefabs/components, editor wiring, asset pipeline, coroutines) is the real multi-week-to-month curve. AI-assist helps with C# scripts but **less** with the editor-driven, inspector-wired parts (a lot of Unity work isn't code).
- **Build size:** empty IL2CPP APK **~9.5–14 MB**, ARM64 adds ~5 MB; realistic small game 30–60 MB [evidence-backed: Unity discussions].
- **Ads/mediation:** best-in-class — **LevelPlay/ironSource (Unity-owned), AppLovin MAX, AdMob** all first-class. Most mature ecosystem.
- **Pricing:** **Runtime fee cancelled Sept 12, 2024** [evidence-backed: unity.com]. **Personal is free up to $200k revenue/funding** [evidence-backed] — a first test is comfortably free. Pro $2,200/yr/seat (only past the threshold); +5% Jan 2026 [evidence-backed].
- **Verdict:** Justified **only** if the genre needs physics/3D/hordes. Overkill and slower-to-test for board/card/word/puzzle.

### Godot 4 (2026)
- **Mobile maturity:** Real 2D games ship; GDScript/C#; solid 2D.
- **Decisive caveat for THIS founder — binary size:** empty Android export **~105 MB AAB / ~114 MB APK with all architectures** [evidence-backed: godot GitHub #104137, forum 4.5.1]. Trimming to arm64-only helps but still won't match native's few-MB footprint. Given the app-size→install-conversion penalty in his exact markets, this is a **genuine strike against Godot for Android-first emerging-market**.
- **AdMob/mediation:** community plugins (Poing Studios / **godot-sdk-integrations** org, consolidated Apr 2025; official plugin needs Godot 4.7+; mediation to 15+ networks) — functional and actively maintained but **second-class vs Unity's native ad stack**, with version-coupling risk and community-maintainer dependency [evidence-backed: GitHub repos].
- **AI-assist fit:** GDScript is **less represented** in training data than Kotlin/C#, and Godot 4's fast-moving API means LLM knowledge can be stale [speculative but grounded].
- **Verdict:** Attractive on license (free, open, **no revenue share**), but APK-size + ad-ecosystem maturity + AI-assist friction all cut against this founder's profile. Second choice to native for 2D casual.

### Flutter / Flame
- **Viability:** Legit for 2D **casual/hyper-casual/puzzle/board/card/educational**; real solo shipments (e.g., a 50k+-download puzzle title) [evidence-backed: genieee/dev.to]. **2D only; not for physics-heavy or high-FPS** [evidence-backed: flame-engine].
- **Fit for this founder:** Only compelling **if he already knows Flutter** (he's Kotlin/Compose-native, so likely not). Its one real draw is **near-free iOS from one codebase** (see §5).
- **Verdict:** Choose only if day-one iOS parity matters more than fastest Android test. Otherwise native Kotlin dominates for his skillset.

### Low-end Android & size constraints (Android-first / T3)
- Target-market reality: **India is 92.4% Android; the $100–200 low-end segment is ~30.5% of the market; 2–3 GB RAM devices persist at entry level; 4–8 GB is the largest band at 42.3%** [evidence-backed: imarcgroup 2025]. Pakistan skews *lower* than India. Design for 2–4 GB RAM, thermal/GPU limits, and intermittent connectivity → favors native + offline-first + small binaries.
- **App-size → install-conversion (Google's own study):** **each 10 MB reduction ≈ +2.5% install-conversion in emerging markets; a ~10 MB app has ~30% higher download completion than a ~100 MB app; the effect is larger in India/Brazil than DE/US/JP** [evidence-backed: Sam Tolomei, Google Play, "Shrinking APKs, Growing Installs"]. **Direct argument for native/Unity over Godot** for his markets, and for aggressive size discipline regardless.
- **Target API:** new apps/updates must **target API 35 (Android 15)** since Aug 31, 2025; existing apps API 34+ [evidence-backed: developer.android.com/google/play/requirements].

---

## 4. MINIMUM VIABLE LIVEOPS STACK — ~$0/month

Concrete, all-free, native-Android-first stack:

| Function | Pick | Cost | Key limit |
|---|---|---|---|
| Social overlay (LB/achievements/cloud save) | **Google Play Games Services** | $0 | Android-only; no realtime/turn MP (deprecated 2020) [evidence-backed] |
| Analytics (game KPIs) | **GameAnalytics** (DAU/retention/ARPDAU + benchmarks, games-native) | $0 | less flexible than warehouse [evidence-backed] |
| Analytics (funnels/raw) | **Firebase Analytics (GA4)** + BigQuery export | $0 | 500 distinct events; sampling at huge scale [evidence-backed] |
| Crash reporting | **Firebase Crashlytics** | $0 | sampling at very high volume [evidence-backed] |
| Remote config / flags / A/B | **Firebase Remote Config + A/B Testing** | $0 | 300 experiments, 24 concurrent, 3000 params [evidence-backed] |
| Push | **Firebase Cloud Messaging** | $0 | unlimited [evidence-backed] |
| Ad mediation | **AdMob** baseline (add AppLovin MAX later) | $0 upfront | AdMob $100 payout min; MAX $20 min [evidence-backed] |
| (If custom data) DB | Firebase Spark **or** Supabase free | $0 | Firestore 50k reads/20k writes/day; RTDB 100 concurrent conns (hard cap); Supabase 500 MB + 7-day idle pause [evidence-backed] |

**Total: $0/month** until you exceed Spark daily quotas or need >100 concurrent RTDB connections. **Stack ceiling/limits:** no SLA; Firestore's 50k-read/day free cap is the first wall (~a few thousand DAU depending on design); RTDB's **100-simultaneous-connection cap cannot be raised on free** — so *do not* attempt realtime on the free tier; Supabase free projects **pause after 7 days idle** (bad for a slow-burn test). Mediation "free" = revenue share, not upfront cost; AdMob's strict account policies can suspend indie accounts, so keep policy compliance tight.

---

## 5. iOS LATER — PORTING COST BY STACK

| Stack | iOS port cost | Notes |
|---|---|---|
| **Native Kotlin/Compose** | **Highest** | Full second codebase (Swift/SwiftUI) or Kotlin Multiplatform (shares logic, **not** UI/rendering). PGS is Android-only → re-do social layer on Game Center. This is the tax for choosing native. |
| **Unity** | **Near-free** | Recompile + iOS config, ad-SDK/IAP setup. Ads/mediation already cross-platform. |
| **Godot 4** | **Near-free** | Export template + iOS ad plugin + IAP; some plugin friction. |
| **Flutter/Flame** | **Near-free** | One codebase; platform config + StoreKit. |

**Strategic tension stated plainly:** native Kotlin is the **cheapest, fastest, leanest** path for the Android-first *test* but the **most expensive to port**. Cross-platform engines front-load a learning tax to make iOS ~free later. **For a lean first test where most games die, optimize for cheapest shot-on-goal (native Kotlin) and pay the iOS tax only on a proven winner.** Do not front-load a Unity/Flutter learning curve to protect a port you may never need. The exception: if the founder is confident in the genre and wants iOS day-one, Flutter/Flame (2D casual) or Unity (physics/3D) amortizes the port.

---

## 6. VERDICT

**Recommended first-test structure(s):** a **native-Kotlin single-player game with a free social overlay (b) via Play Games Services, plus bot-driven "fake" competition (d) where the genre wants an opponent, and — if the loop benefits — text-free async ghost/turn-based (c).** This trio delivers "feels multiplayer and alive" at **$0–low-double-digit $/month backend** through 100k+ DAU, with **no realtime infra, no chat, no server-authoritative economy, no moderation obligation.**

**The specific backend-shaped traps to refuse until metrics justify them:**
1. **Real-time synchronous infra (e)** — refuse unless the game is definitionally impossible without it; prototype the *feel* with bots first. Photon's free 100 CCU tempts, but launch spikes (20–30% of DAU) blow past it and realtime anti-cheat needs server authority you can't solo-maintain. Hathora's 2026 shutdown proves infra lock-in is a live risk.
2. **Chat / any free-text UGC** — refuse; it converts a hobby project into a **DSA-regulated (72h moderation, human contact, up to 6% turnover penalty) and COPPA-high-risk** compliance operation. Use emotes/canned messages only.
3. **Guilds/co-op (f) and server-authoritative economies** — refuse for a first test; these are *post-product-market-fit* retention machinery that are dead weight (and failure-signaling) without an existing population.
4. **Realtime on Firebase free tier** — the 100-concurrent-connection RTDB cap makes it a trap; don't design toward it.

**Cheapest credible path to "feels multiplayer" without multiplayer costs:**
> Native Kotlin + **PGS leaderboards/achievements/cloud save ($0, Google-hosted)** + **client-side bots with "searching for players…" theater, offline-capable, difficulty-curved for early wins** + optional **text-free ghost racing / async turns on Firebase Spark**. Label bot modes honestly ("Practice"/"Quick Match"), never market "real players" you don't deliver. Gate any real networking behind explicit metrics (e.g., only build true realtime once D1 retention > ~35% and DAU sustains a population that won't produce empty lobbies).

---

## STRONG CLAIMS (highest confidence)
1. **Play Games Services gives free, Google-hosted leaderboards/achievements/cloud-save**, making a social overlay effectively $0 with no backend on native Android — while its realtime/turn-based MP APIs are dead (deprecated 2019, off 2020) [evidence-backed].
2. **Bots are the cheapest, lowest-risk "multiplayer feel"** — $0 backend, offline-capable, no anti-cheat, no moderation — and undisclosed bots are effectively unpoliced by stores (PUBG Mobile/Fortnite do it at scale) [evidence-backed].
3. **Real-time synchronous MP and guilds/chat are the two traps to refuse** for a first test — server-authority anti-cheat, DSA/COPPA moderation duty, and CS burden a solo dev cannot sustain, for retention upside that only exists after a population does [evidence-backed on regulatory/pricing facts; verdict is reasoned].
4. **Native Kotlin is this founder's dominant first-test engine** for board/card/word/puzzle/idle/arcade-lite: zero learning curve, smallest binary, best low-end perf, best AI-assist leverage [size/perf evidence-backed; AI-assist grounded-speculative].
5. **App size materially drives install conversion in his exact markets** (~+2.5% per 10 MB removed in emerging markets; ~30% completion gap 10 MB vs 100 MB) — a direct argument against Godot's ~100 MB minimum export [evidence-backed: Google Play study].
6. **Firebase Spark free tier is real but shallow** (Firestore 50k reads/20k writes/day; RTDB 100 concurrent conns) — enough for a test; RTDB is a trap for realtime [evidence-backed].
7. **Unity's runtime fee is dead and Personal is free to $200k** — cost is *not* the reason to avoid Unity; learning-curve and over-engineering for casual genres are [evidence-backed].
8. **Realtime cost scales with peak CCU ≈ 10% of DAU** — realtime is a four-figure monthly line item well before you're profitable [CCU ratio + unit price evidence-backed; total modeled].
9. **Any free-text chat triggers DSA (72h queue, human contact, ≤6% turnover penalty) and COPPA high-risk treatment** — avoid UGC entirely in a first test [evidence-backed].
10. **$0/month LiveOps is achievable**: PGS + GameAnalytics + Firebase (Analytics/Crashlytics/Remote Config/A-B/FCM) + AdMob [evidence-backed].

## WEAK SPOTS (thin evidence — needs further research)
- **Cost estimates at 100k/1M DAU are modeled, not measured.** Real Firestore bills swing 5–10× with denormalization choices. Validate with a load-model spreadsheet.
- **Retention-lift magnitudes are soft.** "Leaderboards/social boost retention" direction is well-supported; specific numbers ("up to 50%," "30–40% with bot AI") are vendor-blog/non-game figures — directional only.
- **Heroic Cloud "~$600/mo lowest tier"** — single secondary source (Aug 2025); verify at heroiclabs.com/pricing.
- **Photon cost extrapolation to 10k/100k CCU** assumes linear scaling; enterprise pricing is negotiated — order-of-magnitude only.
- **"Undisclosed bots are unpoliced"** is absence-of-evidence; a store could still act on "misrepresentation" grounds if fake modes are marketed as real.
- **AI-assist effectiveness by stack** (Kotlin > C# > GDScript) is reasoned from training-data representation, not measured.
- **Pakistan-specific device/RAM/connectivity data** proxied from India; worth a dedicated pull.
- **Godot arm64-only export size** not precisely quantified; ~100 MB figure is all-architectures.
