# Panel 2 — Monetization & CRO Expert

> Research panel output (Opus agent, live web research, July 2026). Claims tagged
> [evidence-backed] / [plausible-unverified] / [speculative] by the agent.
> Synthesized into `../mobile-games-opportunity-framework.md`.

# 1. MONETIZATION-FIRST DESIGN: WHAT IT ACTUALLY MEANS

"Monetization-first" is not "monetize aggressively." It means **the economy and the placement map are designed at the same time as the core loop, not bolted on after soft launch.** In practice this is three concrete disciplines:

**(a) Design the currency loop before the fun loop is locked.** You decide your currency sources (level-clear rewards, offline earnings, rewarded-ad grants, IAP) and your sinks (upgrades, unlocks, revives, speed-ups, energy) on day one, and you deliberately engineer *sink pressure* — a gap between what the loop gives and what the player wants — because that gap is where both rewarded-video watches and IAP conversions live. Bolting monetization on later fails because the reward economy is already tuned to feel "complete" without spending, leaving no natural demand for either an ad-grant or a purchase; you then have to nerf the free economy post-launch, which reads as a betrayal to your existing base and craters retention. [plausible-unverified — this is consensus practitioner logic across the hybrid-casual sources, not a single measured stat]

**(b) Segment payers vs ad-watchers from the start.** ~95% of F2P users never pay [evidence-backed: multiple, "only ~5% of players make purchases" / "target 2–5% payer rates," MAF/Unity]. Monetization-first design means you build *two overlapping economies*: an ad-funded track (rewarded video, interstitials) that monetizes the 95%, and an IAP track (packs, passes, convenience) that monetizes the 2–5%. The mistake juniors make is designing one economy and hoping it serves both.

**(c) D0 monetization with a first-session grace period.** The 2025 hybrid-casual playbook explicitly starts monetizing on day 0 — top studios test monetization "from prototype to soft launch," pushing users through ~12–15 interstitials/day across 18–25 playable minutes over ~5 sessions [evidence-backed: Airflux "8 Monetization Trends" 2025]. But this is reconciled with retention by a **grace period**: "forcing ads before gameplay begins kills first-session retention… start with fewer ads, then slightly increase frequency" [evidence-backed: MAF retention guide; AdReact]. The resolution: **rewarded video can run from minute one (opt-in, non-damaging); forced interstitials should be suppressed or heavily throttled in the first session/first few levels, then ramped.** Hybrid designs deliver ~28% higher ARPU than ad-only setups [evidence-backed: Airflux/GameAnalytics-cited], which is the whole reason to do this work upfront rather than shipping pure-IAA and "adding IAP later."

**Founder-specific translation:** Because you're IAA-first by background, the discipline you're missing is the *IAP economy skeleton*. Even if v1 ships ad-only, design the currency and sink structure now so a starter pack, a remove-ads SKU, and a rewarded-doubler slot in *without re-tuning the economy* later.

---

# 2. PLACEMENT & SYSTEM INVENTORY (with loop entry points + genre fit)

## Rewarded video (RV) — the safe, high-eCPM workhorse

RV is opt-in, so it's the one format that *correlates with higher* retention, not lower [evidence-backed: MAF/Deloitte-AdMob; "users who watch ≥1 RV in week 1 hit 53.2% D30 vs 12–13% avg" — though this is correlation/self-selection, not proven causation]. Ranked by conversion and value:

| Placement | Loop entry point | Performance | Best genres |
|---|---|---|---|
| **Revive / continue** | The fail moment | **Single highest-converting placement** [evidence-backed: Udonis/AdReact] | Arcade, survivor, action-lite, TD, racing |
| **2x / 3x reward multiplier** | End-of-run reward screen | Conversion often **>70%** [evidence-backed: Udonis/MAF] | All run-based genres, idle, puzzle |
| **Offline-earnings multiplier** | Return-to-app | High-frequency, drives D1 return | Idle, simulation, TD-meta |
| **Free chest / key / spin** | Meta screen | Strong; ties to collection loops | Puzzle, merge, social-casual |
| **Skip / hint / extra move** | Difficulty spike | Converts on frustration; careful with pay-to-win feel | Puzzle, board |
| **Reroll / booster pre-run** | Pre-run loadout | Good in build-a-run metas | Survivor, TD, roguelite |

Engagement benchmarks: **opt-in rate should not drop below ~30%**; healthy **impressions/DAU is ~2–6**; completion **>95%**; ~9 in 10 players interact with RV at least once [evidence-backed: MAF/Udonis 2025]. RV-heavy metas go much higher — **Merge-3 serves ~101.5 RV/user and Idle ~73.2 RV/user** on average [evidence-backed: genre report cited in juegostudio/AppsFlyer]. Casual best-practice ceiling is **6–10 RV views/session, daily cap 15–20** [evidence-backed: MAF]. **Design rule: tie every RV reward to the player's *current* pain point** — the closer the reward is to what they need right now, the higher the opt-in [evidence-backed: Udonis].

## Interstitials — the retention hazard

The format most likely to "destroy retention overnight" [evidence-backed: AdReact]. Cadence norms and hard rules:

- **Google Play "Better Ads Experiences" policy (binding):** no more than **1 interstitial per 2 user actions**; interstitials that **aren't closeable after 15s are prohibited**; **no ads at level start, during gameplay, or before the splash screen** [evidence-backed: Google Play Console Help, Better Ads policy].
- **Practical cadence:** 1 interstitial per **3–5 minutes**, triggered **only at transition screens (level end, run end)**; start at ~1/session and ramp to ~2 [evidence-backed: MAF/AdReact]. Google's general reference is ~1 ad/hour capping.
- **Documented retention damage:** games running **<3 interstitials/session retain ~27% more users**; if DAU drops **>10% after a frequency increase, you've hit fatigue** [evidence-backed: AdReact].

## Banner / MREC / native / app-open

- **Banners:** near-worthless eCPM (US Android ~$0.68, US iOS ~$0.45 [evidence-backed: Appodeal Q4'24]) but *cheap in attention* if anchored to a persistent non-gameplay surface (menu, map). Toxic overlaid on active gameplay. Fine on meta/menu screens; never during a puzzle board or a run.
- **App-open ads:** meaningfully higher than banners (US ~$10.51 eCPM [evidence-backed: MonetizeMore 2025]) and only cover ~80% of screen (policy-friendlier than a splash interstitial), but they hit the player at the *worst* psychological moment (app launch). Use sparingly, never on first session, and expect retention sensitivity. [plausible-unverified on the retention-cost magnitude]
- **MREC/native:** niche for casual games; more relevant to utility apps (your background). Skip for a first game test.

## Remove-ads offers

- Payer rate for *any* IAP in F2P is ~2–5% [evidence-backed]. Remove-ads is often the **highest-attach single SKU** in ad-heavy casual games because it's a pure convenience purchase, but I could not find a clean, citable attach-rate benchmark — **[weak spot]**. Typical price band **$1.99–$4.99** [plausible-unverified].
- **Modern hybrid design: "remove ads" removes *forced* interstitials/banners but KEEPS rewarded video** (often re-granting the RV reward automatically or offering a toggle). This preserves the RV revenue stream — your highest eCPM — while selling the annoyance-removal. This is now standard and is the correct design for you. [plausible-unverified as "standard," strongly supported by practitioner consensus]

## IAP systems (the payer track)

- **Starter pack:** one-time, heavily-discounted, time-boxed first-purchase converter. Highest-converting IAP in most casual games. Anchor ~$4.99–$6.99 (cf. Pokémon Champions starter at $6.99 [evidence-backed: Gamigion]).
- **Piggy bank / vault:** accumulates a currency stash as the player earns; player pays a fixed price to "break" it. Excellent because it *rewards free play then charges to unlock it* — high perceived value. Well-established mechanic now migrating into battle passes as "stashable rewards." [evidence-backed: Gamigion battle-pass evolution]
- **Battle/season pass:** free + premium track (~$9.99/season is the anchor [evidence-backed: Gamigion/Pokémon Champions]). Now appearing even in casual/hybrid titles. Best deferred to *after* you have proven D7/D30 retention — a pass with no retained players earns nothing.
- **Consumables/boosters, convenience (energy refills, speed-ups):** the core midcore IAP; energy/refill moments are "natural purchase moments" [evidence-backed: midcore benchmark summaries].
- **Gacha / randomized rewards:** highest revenue-per-payer but now a **compliance minefield** (see §4). For a solo dev's first global test, **avoid true paid loot boxes.**

---

# 3. BENCHMARKS

## eCPM by geo × format (Appodeal Q4 2024, US = premium anchor)

| Format | US iOS | US Android | Tier-3 (India/Pakistan proxy) |
|---|---|---|---|
| **Rewarded** | **$19.63** | **$16.49** | ~$1.5–4 [plausible-unverified] |
| **Interstitial** | **$14.32** | **$14.08** | ~$1–3 [plausible-unverified] |
| **Banner** | $0.45 | $0.68 | <$0.20 [plausible-unverified] |
| **App-open** | ~$10.51 (blended US) | | Vietnam ~$2.34 [evidence-backed: MonetizeMore] |

[evidence-backed for US: Appodeal Q4'24 via BusinessofApps/Statista/MAF] Tier-1 rewarded broadly **$15–30**; global average **$8–18** [evidence-backed: BusinessofApps]. Q1 2025 rewarded held **$15–25** in the US [evidence-backed: MAF]. Offerwalls are an outlier premium tier (~$400–530 eCPM) but require integration and audience scale [evidence-backed: MAF/Sonamine] — not a first-test priority.

**⚠️ Founder-critical geo reality:** eCPM is set by *where your players are, not where you are.* Pakistan/India/Bangladesh rewarded eCPM is roughly **one-tenth** of US. An IAA-first game that acquires organically in South Asia earns a *fraction* of the ARPDAU bands below. IAA-first economics only work with (a) a meaningful Tier-1 install share, or (b) very large DAU at T3 eCPMs. **This single fact should shape the entire go-to-market.**

## ARPDAU bands by genre (blended)

| Genre tier | Blended ARPDAU | Notes |
|---|---|---|
| Hypercasual | **$0.03–0.08** (AppsFlyer '25 forecast ~$0.05) | Almost pure IAA |
| Hybrid-casual | **$0.15–0.50** (4–7× hypercasual) | Non-payers $0.08–0.15 via RV + payers +$0.30 IAP |
| Casual puzzle | ARPDAU ~$0.08; lifetime **ad ARPU $2.99 (Match), $14.83 (Merge-3)** | Distinguish daily ARPDAU vs lifetime ARPU |
| Midcore/RPG | **$0.30–1.00+** (IAP-driven) | Largest global IAP segment |
| Party | Highest ad ARPU (~$4.90 lifetime) | RV-friendly |

[evidence-backed: GameAnalytics 2025, AppsFlyer 2025 forecasts, juegostudio/genre reports] **Metric caution:** sources mix daily ARPDAU with lifetime ad-ARPU; $14.83 for Merge-3 is *lifetime ad ARPU*, not daily. Treat cross-genre comparisons as directional.

## IAA:IAP revenue splits in hybrid hits (anchors)

- **Mob Control: ~85% ads / 15% IAP** — the IAA-heavy archetype [evidence-backed: MAF Mob Control analysis].
- **My Perfect Hotel: ~57% IAA / 43% IAP** (~$4M IAA, $3M IAP last-30) [evidence-backed: Gamigion].
- **Survivor!.io: ~42% IAA / 58% IAP** — IAP-led, crossed $500M lifetime IAP [evidence-backed: WN Hub/Gamesforum].

The gradient (85/15 → 57/43 → 42/58) maps to **session depth and progression complexity**: the shallower/more arcade the loop, the more IAA-dominant; the deeper the build/meta, the more IAP-dominant. **Mob Control is your closest monetization template** as an IAA-first solo dev.

## Retention (GameAnalytics 2025)

Overall median **D1 ~22%, D7 ~4%, D30 ~0.7%**; top-quartile **D1 26–28% (iOS 31–33%)**; top performers **D1 up to 40%** [evidence-backed: GameAnalytics 2025]. Casual "good" targets often quoted higher (D1 45%, D7 20%, D30 10%) are *aspirational/best-in-class*, not medians [evidence-backed: MAF]. Avg daily playtime **~22 min**; healthy session **8–12 min**, weak **<4 min** [evidence-backed: GameAnalytics 2025].

## Mediation stack norms

**MAX >50% market share; MAX + LevelPlay + AdMob together >90%** [evidence-backed: GameBiz/Gamesforum 2025]. Trade-offs: **MAX** = best Tier-1 full-screen eCPM + best UA demand (AppLovin restricts ROAS/AppDiscovery campaigns to MAX users), **but no COPPA support**; **LevelPlay** = ~99% fill, best ad-quality/latency metrics, losing share; **AdMob** = easiest onboarding, best banners, most stable **Tier-2/3 fill**, less product love for small devs [evidence-backed: GameBiz/Bidlogic/Loomit 2025].

**Solo-dev pick:** Start on **AdMob mediation** (lowest friction, no MMP minimums, strong T2/3 fill that matches a South-Asia-heavy early audience, one SDK). **Graduate to AppLovin MAX** the moment you (a) see Tier-1 traffic worth optimizing or (b) start paid UA and want AppLovin's demand. Do **not** run a full MMP/mediation matrix at test stage — overkill.

---

# 4. SAFE vs DAMAGING — where monetization enters safely, and the red lines

**Natural (safe) entry points by loop:** the **fail/game-over** moment (revive), the **reward screen** (2x), the **return-to-app** moment (offline multiplier), the **difficulty spike** (hint/skip), and **level/run transitions** (the *only* safe interstitial slot). Safe formats, ranked: **RV (opt-in) > app-open (throttled) > interstitial at transitions > banner on menus**. Damaging: interstitials mid-gameplay or at level *start*, banners over active play, app-open on first session, any forced ad before the first "win."

**Signals monetization is too aggressive** (watch these in your test):
- D1 retention below ~25% with otherwise-fine gameplay ⇒ onboarding/ad-load problem [evidence-backed: GameAnalytics].
- DAU or session length drops >10% after an ad-frequency increase ⇒ fatigue [evidence-backed: AdReact].
- RV opt-in <30% ⇒ your rewards aren't matched to player need [evidence-backed].
- Rising 1-star reviews citing "too many ads" (your ASO rating gap widens).

**Store-policy red lines (both stores):**
- **Google Better Ads / disruptive-ads policy:** ≤1 interstitial per 2 actions; closeable after 15s; no full-screen ads at level start/during play/before splash. Violations get apps **suspended** [evidence-backed: Google Play policy].
- **Misleading ads:** ad creative must represent actual gameplay (enforced by both stores).
- **Ad content rating** must match app rating; mismatch risks removal.

**Kids / Families (critical constraint):** If your content or store listing targets or appeals to children, you enter **Google Play Families** / Apple Kids rules and **COPPA/GDPR-K**. Consequences: **AppLovin MAX has no COPPA support** (disqualifies MAX for child-directed apps) [evidence-backed: GameBiz]; the **Google Play Families Self-Certified Ads SDK program is not accepting new applicants** [evidence-backed: Google Play Console Help]; ad targeting must be non-personalized. **Recommendation: rate your first game Teen/12+ and steer content/creative away from child appeal** to avoid the Families ad-monetization straitjacket entirely.

**Randomized-rewards / loot-box status (2026):**
- **Google Play & Apple both require odds disclosure** before purchase (Google since 2019, Apple since 2017) — established, still in force [evidence-backed: GameDeveloper/Fenwick]. **South Korea** has a mandatory disclosure law with active enforcement [evidence-backed: ScienceDirect 2025].
- **Belgium:** paid loot boxes = **illegal gambling**, criminal fines up to **€800k**; a **Jan 2025 Antwerp ruling (LS v. Apple)** extended potential liability to the **distributor/store**, not just the developer [evidence-backed: Taylor Wessing]. Practically: **geo-exclude paid randomized rewards from Belgium** or don't ship them.
- **Netherlands:** currently legal post-Council-of-State, but under active ban pressure; government is deferring to the EU DFA [evidence-backed: Franssen Tolboom].
- **EU Digital Fairness Act:** IMCO committee (late 2025) recommended **banning loot boxes in games accessible to under-18s** + mandatory exact-odds disclosure; Commission draft **Q3 2026**, adoption **~late 2027–2028**, application **no earlier than 2029** [evidence-backed: EU Perspectives/Osborne Clarke]. So it's a *design-forward* constraint, not an immediate blocker.

**Net for a solo dev:** ship **transparent, non-random** monetization (direct-buy packs, RV, passes). If you ever add gacha, disclose odds, geo-exclude Belgium, and keep it out of anything child-appealing. This is the low-risk path and also the higher-trust path.

---

# 5. GENRE-BY-GENRE VERDICT (10 segments)

Lean = ARPDAU realism at *T1-blended* rates; expect ~⅕–⅒ of these if your DAU is South-Asia-dominant. Recommended stack = ship these 3–5 placements first.

**1. Puzzle (match/merge/block).** **Hybrid, IAP-leaning.** Highest RV-per-user genre (Merge-3 ~101 RV/user). ARPDAU $0.10–0.30 blended; strong lifetime ad ARPU. Stack: **RV (extra moves, free chest, 2x), interstitial at level-fail transition, starter pack, remove-ads-keep-RV.** A/B first: interstitial cadence vs D1. *High lean-build fit; slower to build good level content.*

**2. Arcade.** **IAA-first (Mob Control template).** ARPDAU $0.05–0.20 blended. Stack: **RV revive + 2x, interstitial every 2–3 runs, banner on menu, remove-ads.** A/B first: revive reward size + interstitial cadence. *Best cheap-test fit for you.*

**3. Action-lite.** **IAA-first / hybrid.** Similar to arcade with a light upgrade meta enabling a starter pack. Stack: **RV revive/2x/booster, interstitial at run-end, starter pack.**

**4. Horde-survival / survivor-like.** **Hybrid, can go IAP-heavy (Survivor.io) or IAA (lite clones).** Rich RV surface (reroll, revive, pre-run booster, chest). ARPDAU $0.15–0.50+ if meta is deep. Stack: **RV (revive, reroll, 2x gold, chest), interstitial at death screen, starter pack, later a pass.** A/B first: RV booster attach + starter-pack price. *Strong repeat-session generator; build cost moderate.*

**5. Tower defense / defense-adjacent.** **Hybrid.** Natural RV (skip wave, instant-troops, 2x reward, revive base). ARPDAU $0.10–0.35. Stack: **RV (2x wave reward, revive, booster), interstitial at level end, starter pack, hero/tower packs.** *Good monetization surface; content-heavy to build well.*

**6. Simulation.** **Hybrid, RV-rich.** Biggest recent IAA growth (+41% [evidence-backed: monetization trends]). Offline-earnings multiplier + speed-up RV are core. ARPDAU $0.10–0.40. Stack: **RV (offline 2x, speed-up, currency), interstitial sparingly, piggy bank, starter pack.** *Strong D1-return via offline loop; watch build scope.*

**7. Racing / driving.** **IAA-first / hybrid.** RV revive/continue, 2x prize, unlock-car spin. ARPDAU $0.08–0.25. Note racing has the **highest store CVR (~20.6%)** [evidence-backed: apptweak] — cheap installs. Stack: **RV (continue, 2x, free-car spin), interstitial at race-end, remove-ads, car packs.** *Good CVR economics; asset-heavy.*

**8. Party / minigame / board-adjacent.** **IAA-first (highest ad ARPU ~$4.90) but board subgenre converts poorly on store (CVR ~1.2%).** ARPDAU $0.10–0.30. Stack: **RV (2x, continue, unlock-minigame), interstitial between minigames, remove-ads.** *Great ad ARPU, but board-style store pages convert weakly — screenshot/creative work matters more here.*

**9. Idle / progression-lite.** **IAA-first, RV-maximal.** ~73 RV/user; offline-earnings multiplier is the killer placement. ARPDAU $0.10–0.40. Stack: **RV (offline 2x, speed-up, free-gem), interstitial at prestige/reset, piggy bank, remove-ads-keep-RV.** *Excellent lean-build + repeat-session + IAA fit; arguably your single best first-test genre for monetization mechanics.*

**10. Social-casual hybrids.** **Hybrid, IAP-leaning at scale.** Highest ceiling but heaviest build (social features, live-ops). ARPDAU $0.20–0.60+. Stack: **RV (chest, 2x, energy), starter pack, pass, events.** *Do not pick for a first cheap test — build cost and live-ops burden are too high for solo.*

**Consolidated first-test recommendation:** For a solo, IAA-first, AI-assisted, Android-first dev wanting cheap + repeat-session + lean-build, the sweet spot is **arcade, idle, or survivor-lite.** Ship this **5-placement starter stack** on **AdMob mediation**:
1. **RV revive/continue** (fail moment)
2. **RV 2x reward** (reward screen)
3. **RV offline/booster multiplier** (return moment — if idle/survivor)
4. **Interstitial at run/level transition only**, capped 1 per 3–5 min, suppressed in session 1
5. **Remove-ads SKU ($1.99–2.99) that kills interstitials but keeps RV** + a **$4.99 starter pack** stub in the economy

**A/B priority order:** (1) interstitial cadence × D1 retention; (2) RV reward magnitude × opt-in rate; (3) starter-pack price/contents × conversion; (4) remove-ads price. Test cadence *before* you test IAP — ad-load is where you'll break or make retention.

---

# 6. CRO

**Store-page conversion (2025):** App Store avg CVR **8.56%**, Google Play **16.15%** [evidence-backed: apptweak]; Android converts higher, iOS retains/spends higher. Games realistic band **3–5%**, but subgenre variance is huge — **racing ~20.6%, board ~1.2%** [evidence-backed: apptweak/adapty]. Android-first is the right call for you both on CVR and on your existing platform expertise.

**Highest-leverage store levers (ranked):**
- **Icon:** switching a game icon from character-portrait to *gameplay action* typically lifts CVR **10–15%** [evidence-backed: strataigize/MAF]. Test this first — it's the cheapest lever.
- **Screenshots:** **first 3 carry ~80% of the decision**; median user spends **~7s and views ~2.4 screenshots** before deciding; **benefit captions beat bare UI mockups by 17–30%**, captions ≤8 words [evidence-backed]. Put the hook + a benefit caption in screenshots 1–3.
- **Custom Product Pages (iOS):** up to **+8.6%** CVR by matching creative to ad concept [evidence-backed]. Relevant only once running paid UA.
- **Preview video:** table-stakes for games; show core loop in first 3s.

**Onboarding funnel:** the **first 5–15 minutes decide retention** [evidence-backed]. D1 <25% with good gameplay ⇒ onboarding friction (tutorial too long, first reward too late, permission walls, load time). Deliver the **first meaningful reward inside session 1**, keep the tutorial <60s / near-zero forced steps ("hook understood in 10s, no tutorial friction" is the hybrid-casual design rule [evidence-backed: gamegrowthadvisor]).

**Offer timing / pricing:** anchor prices **$0.99 / $4.99 / $9.99 / $19.99 / $49.99**, with **$4.99 as the volume sweet spot** [evidence-backed]. Fire the **starter pack after the first "aha"/first loss**, not at install. Piggy-bank fills as the player earns, "break" prompt at a milestone.

**Price localization (high-value for your markets):** cut IAP prices **30–50% in Tier-3** (India/Pakistan/Brazil); localization lifts emerging-market conversion **~40%** and total revenue **20–40%** without cannibalizing T1 [evidence-backed: SuperScale/wappier/mirava]. Concrete proof points: **PUBG India's $0.11 "daily IAP" became a top SKU; Free Fire cut IAP >50% in Brazil/India** [evidence-backed]. **Add sub-$1 micro-SKUs for South Asia** — your home-market intuition is an edge here.

**DMA / external purchase links / web shops:** **Not worth it at test scale — verified.** US allows external-payment links with **no Apple commission** post-*Epic v. Apple* (2025), and web-shop processing (5–10%) beats store fees (15–30%) [evidence-backed: Xsolla/Naavik/funnelfox], **but** conversion drops when users leave the native flow, EU terms add 5–13% "Store Services" fees, and compliance/CS overhead is real. Web shops pay off only at **meaningful IAP volume with a whale base** — the opposite of a lean IAA-first first test. **Skip until you have a proven, IAP-heavy title.**

---

# STRONG CLAIMS (highest-confidence, decision-relevant)

1. **eCPM follows the player's geography, not the developer's — and this dominates IAA economics.** US rewarded ~$16–20 vs South-Asia ~$1.5–4 (≈10× gap). An IAA-first game with organic South-Asia DAU earns a *fraction* of published ARPDAU bands. Plan for either Tier-1 install share or very large DAU. [evidence-backed: Appodeal/BusinessofApps]
2. **Rewarded video is the safe money; interstitials are the retention hazard.** RV is opt-in, ~95% completion, correlates with *higher* retention; ship it from minute one. Interstitials cost ~27% retention when overused and are policy-capped at 1 per 2 actions. [evidence-backed: MAF/AdReact/Google]
3. **Revive/continue and 2x-reward are the two highest-converting placements (2x often >70% opt-in).** Ship both first, tie every RV reward to the player's current pain point. [evidence-backed: Udonis/MAF]
4. **Mob Control (85/15 IAA:IAP) is your monetization template; Survivor.io (42/58) is the IAP-heavy end.** IAA-dominance tracks with shallower loops; pick an arcade/idle/survivor-lite loop and stay IAA-led for the first test. [evidence-backed: MAF/Gamigion/WN Hub]
5. **Solo-dev stack: AdMob mediation first (low friction, best T2/3 fill), graduate to AppLovin MAX at scale/paid-UA.** MAX has no COPPA support — a real constraint if you go kid-adjacent. [evidence-backed: GameBiz 2025]
6. **Monetization-first = design the currency sources/sinks and an IAP skeleton on day one, with a first-session ad grace period.** Bolting IAP on later forces economy nerfs that break trust. Hybrid earns ~28% more ARPU than ad-only. [evidence-backed: Airflux/GameAnalytics; mechanism plausible-unverified]
7. **Remove-ads should kill interstitials but keep rewarded video** — preserves your highest-eCPM stream while selling annoyance-removal. [plausible-unverified as "standard," strong consensus]
8. **Avoid paid randomized rewards for a first global test.** Odds-disclosure is mandatory (Google/Apple/Korea), Belgium treats paid loot boxes as criminal gambling (with 2025 distributor-liability precedent), and the EU DFA is trending toward an under-18 ban. Ship transparent direct-buy monetization. [evidence-backed]
9. **Price-localize aggressively for T3 (30–50% cuts, sub-$1 SKUs).** Lifts emerging-market conversion ~40% and revenue 20–40%; your home-market knowledge is a genuine edge. [evidence-backed: SuperScale/wappier]
10. **CRO order of operations: icon (10–15% lift) → first-3 screenshots with benefit captions (17–30%) → onboarding first-5-minutes.** Store CVR for games is realistically 3–5%; Android-first is correct. [evidence-backed: apptweak/strataigize]

# WEAK SPOTS (thin evidence — research further)

- **Remove-ads attach/conversion rate:** no clean citable benchmark found; only inferred it's a high-attach SKU. Needs a primary source (a specific case study or a MAF/GameAnalytics figure).
- **Pakistan-specific eCPMs:** used India/Vietnam as proxies; no direct Pakistan rewarded/interstitial eCPM found. The $1.5–4 rewarded / $1–3 interstitial T3 band is **[plausible-unverified]**.
- **Primary reports blocked to direct fetch (403):** Tenjin, Naavik, GameAnalytics PDF, MAF, gamegrowthadvisor. All numbers here come from their search-snippet summaries and secondary aggregators — directionally reliable but not read line-by-line. Verify the exact ARPDAU-by-genre table against the primary GameAnalytics 2025 PDF and Tenjin 2026 report before quoting to the founder as hard targets.
- **ARPU vs ARPDAU conflation in sources:** several genre figures (e.g., Merge-3 $14.83) are lifetime ad-ARPU, not daily ARPDAU; cross-genre comparisons are directional, not apples-to-apples.
- **Causation vs correlation on RV→retention:** the "RV watchers retain 4× better" stat is almost certainly self-selection (engaged players both watch RV and retain), not proof RV *causes* retention. Don't over-rely on it as a retention lever.
- **Interstitial retention-damage magnitude ("27% more users," ">10% DAU drop = fatigue"):** single-source (AdReact); would want corroboration from a second measurement house (GameAnalytics/Adjust) before treating as a hard threshold.
- **D0-monetization "12–15 interstitials/day" figure:** from one hyper-casual-leaning source (Airflux); represents aggressive HC studios, likely too hot for a hybrid/casual first test — treat as an upper bound, not a target.
