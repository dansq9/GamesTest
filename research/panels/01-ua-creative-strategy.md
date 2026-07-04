# Panel 1 — UA & Creative Strategist

> Research panel output (Opus agent, live web research, July 2026). Claims tagged
> [evidence-backed] / [plausible-unverified] / [speculative] by the agent.
> Synthesized into `../mobile-games-opportunity-framework.md`.

# UA & CREATIVE-MARKETABILITY OPPORTUNITY MAP — Mobile Games, July 2026
*Lens: paid UA feasibility, ad-creative marketability, and cheap pre-build testability for a solo Android-first / IAA-first developer. Web tools worked; a handful of premium domains blocked direct fetch (noted in WEAK SPOTS), but their figures were recoverable via indexed snippets.*

## 0. Framing for this specific founder
A solo Kotlin-native Android dev in Pakistan, IAA-monetized, ships fast/simple, cannot outspend anyone on UA — this profile collapses the opportunity space hard. The decisive filters are: **(1) can the creative be shot from real gameplay and hit >4% CTR without deception; (2) is the mechanic ASO-discoverable and organic-capable so $0–low UA can seed it; (3) does it monetize on IAA at low DAU; (4) can one person build a testable slice in 1–3 weeks with AI assistance.** Most "big" opportunities (merge, 4X, survivor-at-scale, sim) fail filter (1)–(3) even when they top revenue charts, because their download volume is *bought*, not earned. That distinction is the spine of this entire report.

---

## 1. SEGMENT MARKETABILITY MATRIX

CPI bands below anchor to the **Liftoff 2025 Casual Gaming Apps Report** (casual blended iOS **$1.41** / Android **$0.14**; puzzle iOS **$2.32** / Android **$0.69**; casino iOS **$21.03**) [evidence-backed: Liftoff 2025 via liftoff.ai + gamedevreports snippets], plus **Statista/FoxData/AppBrain** geo data (Tier-1 runs up to **10×** Tier-3; India/Indonesia/SEA Android often **sub-$0.50**) [evidence-backed: Statista/FoxData/Mapendo snippets]. Treat single-genre CPIs as directional — they blend geos and are 12-month trailing.

| Segment | 5-sec / 1-screenshot? | Native creative hooks | CPI band (T1 iOS / T1 Android / T3 Android) | Saturation & who owns it | Organic/ASO realistic? | Solo can buy/earn installs? |
|---|---|---|---|---|---|---|
| **Puzzle — block-fit/sort/screw** | Yes, instantly | Satisfying/ASMR, progress-bait, "1% can solve", failure-bait | ~$1.5–3 / $0.30–0.90 / <$0.30 | Very high. Hungry (Block Blast), Rollic, iKame, Peoplefun, Playgendary | **Yes** — puzzle leads downloads in every country | Earn: partly. Buy: only if IAA funds it |
| **Puzzle — match/merge-meta** | Yes | Renovation/story fake-ads, pin-pull | ~$2–4 / $0.60–1.2 / $0.30–0.6 | Extreme. Playrix, King, Dream/Toon (Peak/Zynga), Microfun | ASO ok, but meta needs whales | **No** — UA-and-liveops arms race |
| **Arcade / action-lite** | Yes | Failure-bait, "only 1%", oddly-satisfying, speedrun | ~$0.8–2 / $0.20–0.6 / <$0.25 | High but churny. Voodoo, Supersonic, Homa, Kwalee | Some (TikTok clips) | Earn: yes at small scale; low ARPU |
| **Horde-survival / survivor-like** | Mostly (power-fantasy screenshot) | Power-creep/progress-bait, "screen-melt", horde-clear | ~$1.5–3.5 / $0.40–1.0 / $0.30–0.6 | High & maturing. Habby (Survivor.io/Archero), Century, HK teams | ASO moderate | Buy: hard (IAP-depth needed); earn: niche |
| **Tower defense / defense-adjacent** | Mostly | Wave-defense, "base almost falls" failure-bait | ~$1.5–3 / $0.40–0.9 / $0.30–0.5 | Moderate, niche-loyal. My.Games (Rush Royale), Ironhide, Space Ape | ASO yes (evergreen keyword) | Earn: possible, small; build cost rises |
| **Simulation** | Sometimes | ASMR/oddly-satisfying, transformation, "what happens next" | ~$1–2.5 / $0.20–0.7 / <$0.30 | High downloads, low ARPU. Many | **Yes** on downloads | Earn: yes; **monetize: weak** |
| **Racing / driving** | Yes | Speed/crash spectacle, drift-satisfying, "pick the right lane" | ~$1.5–3 / $0.40–1.0 / $0.30–0.6 | High production bar. Gameloft (Asphalt), CarX, EA (Real Racing), Hutch | ASO ok | **No** for 3D; maybe arcade-lite 2.5D |
| **Party / minigame / board-adjacent** | Yes (chaos screenshot) | UGC-style, "watch this fail", social-embarrassment | ~$1–2.5 / $0.30–0.8 / $0.25–0.5 | Winner-take-most. Scopely (Stumble Guys), Voodoo (Party), Garena | TikTok-native strong | Earn: yes if viral; multiplayer = build-heavy |
| **Idle / progression-lite (idle-arcade)** | Yes | Stacking/number-go-up, satisfying automation, "empire grows" | ~$1–2.5 / $0.25–0.7 / <$0.30 | Moderate-high. Kolibri, Green Panda, Supercent, Homa | ASO moderate | Earn: yes; **strong IAA fit** |
| **Social-casual hybrids** | No | Meta/collection, drama fake-ads | ~$2–5 / $0.60–1.5 / $0.40–0.8 | Very high, whale-driven | ASO poor without brand | **No** — capital & liveops game |

**Per-segment nuance (load-bearing):**

- **Puzzle block-fit/sort/screw is the founder's natural home.** Puzzle dominated 2025 downloads in *every country* and grew IAP +14% to **$14.4B** while download volume dipped 3% — i.e., the audience is enormous and monetizing better [evidence-backed: Sensor Tower State of Mobile Gaming 2025 via snippets]. The core loop is a single-screenshot ("drop blocks, clear lines"). This is the only segment that clears all four founder-filters simultaneously.
- **Arcade is losing volume**: installs **9.6B, −12.5% YoY** — the churniest, lowest-ARPU segment, but the cheapest to test and the most creative-generative [evidence-backed: Sensor Tower via snippets]. Good as a *testing ground*, weak as a *destination* on IAA alone.
- **Simulators** had the *most* installs (**9.8B, +0.4%**) yet notoriously low ARPU; the genre grew to ~**$4.8B** in 2025 mostly via App Store/sandbox, not via the kind of lightweight sim a solo dev ships [evidence-backed: Sensor Tower / monetization snippets].
- **Party/social-casual** are winner-take-most and multiplayer-heavy — Stumble Guys hit **600M downloads** but peaked at **~$70M revenue in 2022 and has declined since**, and it took Scopely's marketing muscle to scale it [evidence-backed: Udonis/MAF snippets]. Not a solo entry point.

---

## 2. THE 2021→2026 SHIFT (why UA looks the way it does for a tiny studio)

**ATT broke the hypercasual engine (2021–22).** Post-iOS 14.5, iOS CPI rose ~20% "overnight" and reached **$3.80 by Q4 2022, up 88% from Q1 2021**; **64% of app devs reported ATT hurt UA** [evidence-backed: AppsFlyer/Adjust/Konvoy snippets]. Gaming opt-in settled around **~36%** (better than the 25–30% cross-app average) but still blinded iOS targeting [evidence-backed: AppsFlyer]. The hypercasual model — buy an install for $0.20, earn $0.25 in ads, repeat — died because **CPI scaled faster than eCPM**, and in 2024 publisher-side eCPMs fell **20–30%** on low-retention inventory even as networks posted record profit [evidence-backed: multiple monetization-report snippets].

**Consequence: the industry moved to hybrid-casual.** Hybrid-casual IAP grew **+67% YoY in Q1 2025, ~100% in Q2**, with top-10 hybrid titles alone doing **$126M in a quarter** and >**$345M in H1 2025**; ARPDAU runs **$0.15–0.50 blended vs $0.03–0.08 for pure hypercasual** [evidence-backed: AppMagic Q1/Q3 2025 hybridcasual reports via snippets]. Translation for the founder: **pure-IAA still works, but only where retention is real** — the arbitrage of buying junk traffic is gone.

**The AXON era concentrates power.** AppLovin's AXON (2.0 in 2023) runs **~2M auctions/sec** on data from **>1B devices**; in 2025 its **Revenue-Per-Install rose ~75%** while total installs barely grew [evidence-backed: AdExchanger/investor snippets]. This is a **closed ML flywheel** — more spend → more data → better prediction → more spend. For a solo dev the implication is double-edged: **you cannot out-target AXON, but you can rent it.** A tiny studio with a genuinely marketable creative can plug into AppLovin/Meta/TikTok auto-optimized campaigns and let the algorithm find installs — the *creative* is now the only lever you control, because targeting is automated away.

**Is $0-UA / organic-only viable, and for what?** Partially, and only for specific shapes:
- **ASO-evergreen puzzle/word/board** with high generic search intent ("block puzzle", "solitaire", "sudoku", "sort") — puzzle's download dominance is substantially organic-search-fed [evidence-backed: Sensor Tower + ASO-report snippets].
- **TikTok-native mechanics** with inherent "clip-ability" (fails, oddly-satisfying, "1% can do this"). But note: **TikTok's free organic reach for games contracted in 2025** and now behaves more like a paid channel; creators expect payment [evidence-backed: Cloutboost/Accio snippets].
- **The cautionary truth**: even Block Blast, the poster child, is **not organic** — it's "a paid machine, not word of mouth… one of the most aggressive paid UA operations in casual gaming," recycling organic TikTok creator videos *as paid creative*, plus CTV and OEM pre-installs [evidence-backed: Udonis Block Blast statistics 2026]. **$0-UA can seed a hit; it cannot scale one.**

**The publisher marketability-testing playbook (and a solo budget version).** Publishers screen concepts *before building the full game*, in this order [evidence-backed: Supersonic marketability guides, Homa "IPM"/"To Kill a Game", GameAnalytics/Coda, Matej Lančarič, all via snippets]:

1. **CTR test (cheapest, no app needed).** Run a 15–30s gameplay-style video or even a fake concept video on Meta/TikTok. **Bar: CTR > 4%** signals real pull; top-quartile creatives hit **2–3× median CTR**. Spend: **~$50–200** gets a directional read.
2. **CPI test (needs a store-listing + thin build).** Build a 2–3 minute, ~5-level slice (publishers budget a **5–10 day dev cycle**). **Bars: hypercasual CPI < $0.30 (good), < $0.40 (target ceiling on iOS); $0.35–0.45 = "marketability in question," fix CPI before building further."** IPM targets: **hypercasual 25–40, casual puzzle ~8–15, midcore 2–5** (AppLovin 2025 creative benchmarks; global median IPM **4.27**, NA **6.23**, MENA **11.56**) [evidence-backed: AppLovin/adjoe/segwise snippets]. Spend: **$200–500** on Android in cheap geos (India/Indonesia/Brazil, sub-$0.50 CPI) yields a few hundred installs — enough to read CPI and D1.
3. **Retention/ROAS gate.** Voodoo's stated greenlight is a path to **ROAS ≥ 150%**; hypercasual needs **D1 ≥ 40–45%** to be interesting [evidence-backed: Voodoo/Supersonic snippets].

**Solo budget version:** ~**$300–600 total** across 3–5 concepts. Ship a 200×200 icon + 3 screenshots + one honest 20s gameplay clip to a Play Store *internal/unlisted* listing; run **Android-only** UA in Pakistan/India/Indonesia to read CTR and CPI at Tier-3 prices; kill anything under 4% CTR or over ~$0.40 CPI before writing another line of Kotlin. This is the single highest-ROI discipline available to this founder and it directly matches his "ship fast, test cheap" instincts.

---

## 3. "REAL GAME FROM THE ADS" — the fake-ad ecosystem and its honest inverse

**History & mechanics.** The archetype is **Playrix (Gardenscapes/Homescapes)**: match-3 games advertised almost entirely via **pin-pull rescue puzzles** ("save the dog/man/damsel," pull-the-wrong-pin failure-bait). The UK **ASA banned Playrix ads as misleading in 2020** — of 4,000+ Homescapes levels, ~**10** featured pin-pulling, and Playrix later admitted only ~**0.03%** of players ever reached them [evidence-backed: ASA / OMR / Udonis snippets]. The same DNA runs through **Hero Wars** ("puzzle" ads for an RPG), **Royal Match** ("King's Nightmare"/"someone playing wrong" outrage-bait), and countless "save-the-dog" clones.

**Why they work economically:** failure-bait and rescue-narrative creatives generate **outrage/completion-instinct clicks** that no honest match-3 screenshot can match, driving CTR/IPM up and blended CPI down — Last War: Survival runs a **math/gate shooter minigame in >50% of its UA impressions** for a 4X game, precisely because the honest 4X creative converts worse [evidence-backed: Naavik/Medium Last War analyses]. Deception is a *CPI-arbitrage* play: pay less per install, eat the retention hit.

**But the retention hit is real and now measurable:** honest-gameplay ads retain ~**32% D1** vs ~**14% D1** for fake-gameplay ads [evidence-backed: Udonis/Segwise-cited stat — treat as directional, single-lineage source]. For an **IAA-first** dev this is disqualifying: IAA revenue is *retention × sessions × eCPM*, so deceptive installs poison the exact metric you monetize.

**Regulator/platform status (2024–26):** enforcement is real but narrow and slow. The **FTC banned specific Homescapes/Gardenscapes ads**; the **ASA upheld 2024 complaints** against EA (Golf Clash), Jagex (RuneScape), Miniclip (8 Ball Pool) — but mostly over **undisclosed IAP/loot boxes**, not gameplay misrepresentation broadly [evidence-backed: FTC / Mishcon / ASA snippets]. Apple/Google policies technically prohibit misrepresentation but enforce inconsistently. Net: fake ads remain *widespread and largely unpunished*, but they are a legal/brand liability and a bad fit for a lean IAA studio.

**The key deliverable — HONEST mechanic families that natively produce high-CTR creatives (no deception):** these are mechanics where *the real game IS the satisfying clip*.

1. **Sort / unscrew / declutter waves** (Screw Out, Nuts & Bolts Sort, Goods Sort, Water Sort). Creative hook: **oddly-satisfying + "almost stuck" tension**. iKame's **Screw Out earned ~$14M / ~20M downloads** from an April 2024 launch — but note it was their **9th** screw title [evidence-backed: gamedevreports/AppMagic snippets]. The clip is 100% real gameplay.
2. **Block-fit / line-clear** (Block Blast, Woodoku, Blockudoku, Tetris-likes). Hook: **satisfying combo-clear + "beat my score."** Honest, ASO-evergreen, IAA-native. Highest-fit family for this founder.
3. **Zombie/horde clear (survivor-lite)** (Survivor.io, Archero-likes). Hook: **screen-melting power-fantasy** — the real gameplay *is* the spectacle. Honest by construction, though monetization needs depth (see §4).
4. **Upgrade-run / idle-arcade** (Idle-arcade stackers, "run and grow" merge-runners, Kolibri/Supercent-style). Hook: **number-go-up + physical stacking of resources** ("stacking is very satisfying and looks cool, which makes it marketable") [evidence-backed: Supersonic/Udonis idle-arcade snippets]. Strong IAA fit.
5. **Physics/crowd/collision spectacle** (Crowd City, Count Masters, Join Clash). Hook: **crowd-growth failure-bait** — you genuinely can win or lose big on screen. Honest.
6. **Draw/route/"pull the pin"-DONE-HONESTLY** — if you actually build a pin-pull *game* (Save the Doge, Hero Rescue clones), the ad is truthful. The mechanic itself is legit; only Playrix's *misattribution* to a match-3 was deceptive.
7. **Tower/wave defense** (Rush Royale-lite): "base almost falls" is real tension from real gameplay.

**The convergent trend:** fake-ad minigames are becoming **real in-game modes** — Playrix's "Minigames mechanism" bolted pin-pull levels into Gardenscapes/Homescapes; Royal Match built "King's Nightmare"; Last War is literally a shooter-minigame-wrapped-4X [evidence-backed: AppGrowing/Playrix/Naavik snippets]. **The honest 2026 move is to skip the bait-and-switch and ship the minigame as the whole game** — which is exactly what block-fit and sort studios do.

---

## 4. FALSE POSITIVES — traps that *look* UA-easy

**A. "Be the next Block Blast" (organic + IAA at scale).** This is the biggest trap. Block Blast does **~$17.5M/month in ads, 70M DAU, ~793M downloads** — but that scale is **bought**: aggressive multi-network paid UA, tens of thousands of A/B tests on ad frequency/retention, CTV, and OEM pre-installs, funded by IAA cash flow [evidence-backed: Udonis/mobilegamer.biz/Morningstar snippets]. **Lesson: the block-puzzle *mechanic* is honest, cheap-to-build, and ASO-friendly — but the *flywheel* is a capital game a solo dev cannot enter.** Correct read: build in the family, expect a **modest organic + micro-UA outcome ($X0–X00/day IAA)**, not a top-grossing chart run. Anyone modeling "if I just get Block-Blast-style organic downloads" has mis-attributed a paid machine as word-of-mouth.

**B. Screw/sort-clone economics.** Looks like free money (Screw Out $14M). Reality: **iKame shipped ~9 screw titles for one breakout; Rollic put 4 titles in the Q3 2025 hybrid top-10; the subgenre is flooded with clones and margins are compressing** [evidence-backed: AppMagic Q3 2025 / gamedevreports snippets]. You are competing against studios running hundreds of tests and buying installs. The mechanic is sound; the *late-clone* window is punishing. **Differentiation (fresh theme, a novel twist, a 3D vs 2D jump) is now mandatory, not optional** — the 2D→3D screw shift was itself the last big innovation unlock.

**C. Is the survivor-like window closed?** For a *breakout*, largely yes. The genre follows the classic **hit-genre cycle**: the definer (Vampire Survivors → Survivor.io/Archero) captures the bulk; later entrants "usually don't reach the success of the original" and survive only by finding a niche twist [evidence-backed: HowToMarketAGame "cycle of a hit genre" + Naavik snippets]. The genre is *still large and growing* (survival market ~$5.6B 2024, ~14% CAGR) but **increasingly saturated and IAP-depth-dependent** — Survivor.io's longevity came from relentless meta iteration, not the base loop [evidence-backed: PocketGamer/AppQuantum]. Verdict: **survivor-lite is fine as a testable, honestly-marketable mechanic at modest scale, but not a realistic first-shot at a breakout, and its monetization skews IAP (bad IAA fit).**

**D. Does simulation/driving download volume translate to viable UA economics?** **No — this is the classic volume-without-value trap.** Simulation has the *most* installs (9.8B) but **structurally low ARPU**; the money in the "$4.8B simulation" line is concentrated in sandbox/App-Store titles, not lightweight sims [evidence-backed: Sensor Tower / monetization snippets]. Racing/driving carries a **high 3D production bar** and is owned by franchises (Asphalt, CarX, Real Racing, Hot Wheels); CPI is mid-high and LTV can't outbid on installs. **High downloads ≠ profitable UA when LTV is low**: you can't pay $0.50 for an install that returns $0.20 of IAA. For an IAA-first solo dev, sim/driving are download-vanity traps.

**E. Merge looks winnable because clones are easy — it isn't.** Merge is "the new match-3," but it's **UA-and-liveops-driven**: Gossip Harbor hit **~$115M/month (Dec 2025) with ~78% of downloads paid**, and Chinese studios win via data-driven iteration and deep IAP metas [evidence-backed: Naavik/Mobidictum/AppMagic snippets]. Deep meta = whale monetization = paid-UA arms race. Wrong shape for IAA and for a solo builder.

**F. Party/multiplayer looks viral but is build-heavy + winner-take-most.** Real-time multiplayer is a server/netcode burden a solo Kotlin dev shouldn't take on turn one, and the category consolidates around one winner (Stumble Guys) per cycle.

---

## 5. TESTABILITY BENCHMARKS (2025–26 bars)

**Pre-build (cheapest signals):**
- **CTR test:** **> 4%** = promising; top-quartile = **2–3× median**. Casual creative CTR baselines run **~9.4% Android / 8.8% iOS** (format-dependent; video/playable higher than static) [evidence-backed: Liftoff/Admiral snippets].
- **IPM:** **hypercasual 25–40; casual puzzle ~8–15; midcore 2–5**; sub-2 IPM = weak marketability [evidence-backed: AppLovin 2025].
- **CPI test:** **< $0.30 (good) / < $0.40 (ceiling)** for hyper/hybrid-casual on iOS; **Android Tier-3 you're reading sub-$0.30–0.50** [evidence-backed: Supersonic/Statista/FoxData].

**Post-build (retention/economics gates — note the bar has *fallen* industry-wide):**
- **D1:** hypercasual/arcade want **≥ 40–45%**; **top-quartile D1 ~31–33% iOS / 25–27% Android** across *all* genres (arcade leads D1) [evidence-backed: GameAnalytics 2025 Mobile Gaming Benchmarks].
- **D7:** **median only 3.4–3.9%, top-25% 7–8%** — *down* from 2023's 4–5% median (retention is getting harder, a key 2025–26 signal) [evidence-backed: GameAnalytics 2025].
- **D30 ROAS (casual):** **~47% iOS / ~15% Android** — i.e., you need meta/monetization depth to break even on paid UA, which is why IAA-only + organic is the safer solo path [evidence-backed: Liftoff 2025].
- **Playtime/sessions:** publishers screen for **≥ 3–4 sessions/day** and rising session length as the marketability→retention bridge; idle/puzzle over-index here [plausible-unverified: composite of Supersonic/Homa/GameAnalytics guidance].
- **IAA monetization sanity:** at **US Android rewarded eCPM ~$16.5 / interstitial ~$14** and **Android now ~57% of ad-revenue share** (2026), an IAA game becomes viable at low DAU *only* if sessions and ad-impressions/DAU are high — puzzle/idle/arcade are the IAA-friendly shapes; sim/racing are not [evidence-backed: Tenjin/Appodeal 2026 eCPM snippets].

---

## STRONG CLAIMS (highest-confidence, decision-relevant)

1. **Puzzle (block-fit + sort/screw) is the only segment that clears all four solo-founder filters at once** — cheap to build, honestly marketable (>4% CTR from real gameplay), ASO-discoverable (puzzle leads downloads in every country), and IAA-native. It should be the first market test. [evidence-backed: Sensor Tower 2025, Liftoff 2025]
2. **"Organic-only at scale" is a myth; even Block Blast is a bought machine** (~$17.5M/mo IAA funding aggressive multi-network paid UA + CTV + OEM). $0-UA can *seed* a hit but cannot *scale* one — model modest outcomes, not chart-toppers. [evidence-backed: Udonis/mobilegamer.biz 2026]
3. **The creative is now the only real lever for a tiny studio** — AXON/Meta automate targeting (AXON RPI +75% in 2025 on a closed ML flywheel), so marketability testing (CTR→CPI→D1) is the highest-ROI discipline available, runnable for ~$300–600 across 3–5 concepts on Android in Tier-3 geos. [evidence-backed: AdExchanger, Supersonic/Homa]
4. **Deception is disqualifying for an IAA-first dev** — fake-ad installs retain ~14% D1 vs ~32% honest, and IAA revenue *is* retention×sessions×eCPM. Ship honest, self-demonstrating mechanics (sort, block-fit, idle-stack, horde-clear). [evidence-backed: Udonis/Segwise; ASA/FTC enforcement]
5. **Simulation and racing/driving are volume-without-value traps** — huge downloads, structurally low ARPU or high 3D build cost; LTV can't outbid installs on IAA. Avoid despite chart-topping download counts. [evidence-backed: Sensor Tower 2025]
6. **Merge, 4X-survival, and party are capital/liveops/netcode games, not solo IAA plays** — Gossip Harbor ~$115M/mo at ~78% paid UA; these win on spend and whale metas. [evidence-backed: Naavik/AppMagic 2025]
7. **Retention bars have fallen (median D7 3.4–3.9%, down from 4–5% in 2023)** — the market is harder, favoring *cheap-to-test, high-session, ASO-fed* concepts over retention-heavy metas. [evidence-backed: GameAnalytics 2025]
8. **Concrete solo greenlight gates: kill anything under 4% CTR or over ~$0.40 CPI before building further; require D1 ≥ 40% for an arcade/puzzle IAA title.** [evidence-backed: Supersonic/Voodoo/GameAnalytics]
9. **The honest inverse of the fake-ad economy is a real business** — fake-ad minigames keep becoming real modes (Playrix, Royal Match, Last War); shipping the satisfying minigame *as the whole game* is the legitimate, defensible strategy. [evidence-backed: AppGrowing/Naavik]
10. **Late-clone windows punish; differentiation is mandatory** — screw-sort took iKame 9 titles for one hit and is now flooded; enter a proven mechanic only with a fresh theme/twist or a production-quality jump. [evidence-backed: AppMagic/gamedevreports 2025]

## WEAK SPOTS (thin evidence — research further)

- **Direct fetch was blocked (HTTP 403) on Deconstructor of Fun, Supersonic's testing guide, AppMagic blog, mobilegamer.biz, gamedevreports Substack, Admiral Media, and howtomarketagame.** All figures from those sources here came via search-result snippets, not primary reads — the *CPI/CTR thresholds, hybrid-casual quarterly revenue, and Block Blast UA specifics should be re-verified against the primary PDFs/posts* before betting on exact numbers.
- **Single-lineage stats to double-check:** the "14% vs 32% D1 retention for fake vs honest ads" figure traces to Udonis/Segwise and I could not confirm the original study; treat as directional. Same for the "$17.5M/month Block Blast ad revenue" (analyst estimate, not disclosed).
- **Per-segment CPI bands are interpolated** for arcade, action-lite, survivor, TD, party, idle, and social-casual — Liftoff gives blended-casual and puzzle cleanly, but genre-level iOS/Android/geo splits for the other seven segments are estimated from adjacent data and labeled directionally. A paid Sensor Tower/AppMagic/Liftoff genre pull would tighten these.
- **Pakistan-origin dev specifics untested:** whether being India-adjacent helps Tier-3 UA cost/creative-cultural-fit, and any Play Console/payment/tax friction for a Pakistan-based publisher, was out of scope and unverified.
- **IAA ARPDAU by exact subgenre at low DAU** (the number that decides whether a solo IAA game clears rent) is fuzzy — I have eCPM by format/geo and blended hybrid ARPDAU ($0.15–0.50), but not clean block-puzzle-vs-idle-vs-arcade IAA-only ARPDAU. Worth a targeted GameAnalytics/Tenjin pull.
- **TikTok organic reach for games in 2026** is described as "contracting" across secondary sources but I found no hard reach/decay numbers — the viability of organic TikTok seeding for this founder is plausible-unverified.
