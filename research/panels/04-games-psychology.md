# Panel 4 — Games Psychology (Behavioral Science)

> Research panel output (Opus agent, live web research, July 2026). Claims tagged
> [evidence-backed] / [plausible-unverified] / [speculative] by the agent.
> Synthesized into `../mobile-games-opportunity-framework.md`.

# BEHAVIORAL SCIENCE BRIEF: Reward, Habit & Retention Mechanisms in Mobile Games
*Panel input — behavioral science seat. Evidence-tagged. July 2026.*

Framing note for this founder: you are ex-productivity/tools with ad-revenue instincts and no LiveOps machine. That is not a weakness here — the single most successful "game-like" retention engine of the last decade (Duolingo) is a productivity app that borrowed game mechanics, and it runs on a *lean, honest, mostly-automatable* subset of what follows. I flag throughout which mechanisms need a live-ops team (skip these for v1) versus which a solo dev can ship.

---

## 1. MECHANISM FOUNDATIONS (correct, then grounded)

**Variable-ratio reinforcement + reward-prediction-error (RPE).** In Schultz's monkey experiments, dopamine neurons fire on *unpredicted* reward, then — as a cue reliably predicts reward — the firing shifts *backward onto the cue*, and predicted reward produces no burst. Dopamine encodes the *error* between expected and received reward, not reward itself [evidence-backed: Schultz et al. 1997, PMC3176615]. This is why *unpredictability* is the active ingredient: a variable-ratio schedule keeps prediction error alive on every pull, so the cue (the spin button, the loot chest) stays motivationally "hot." Fixed, predictable rewards go dopaminergically silent.
→ **Grounded:** Coin Master's slot machine is a literal variable-ratio schedule; "success or failure of the game HUGELY depends on tuning the slot machine itself," and spins/DAU is its north-star metric [evidence-backed: Deconstructor of Fun 2019, secondary]. Gacha pulls (Genshin), Monopoly GO dice rolls, and CSGO/loot boxes are the same schedule.

**Wanting vs liking (Berridge).** Dopamine mediates *"wanting"* (incentive salience — the pull toward a cue), which is **dissociable** from *"liking"* (hedonic pleasure, run by small opioid/endocannabinoid "hedonic hotspots," not dopamine) [evidence-backed: Berridge & Robinson 2016, Am Psychol]. Rats can be made to "want what hurts." **This is the most important correction for your panel:** engagement mechanics manufacture *wanting*, and wanting can run far ahead of — even opposite to — actual enjoyment. A player compulsively opening the app at a notification is exhibiting wanting; whether they *like* it is a separate question. Ethical design keeps wanting and liking aligned; dark patterns pry them apart.
→ **Grounded:** The push-notification-driven return ("you forgot your streak!") is a pure wanting cue. Duolingo's owl-guilt notifications generate return behavior even from users who don't report enjoying that moment.

**Near-miss effect.** Outcomes that fall *just short* of a win recruit the same ventral-striatal/dopaminergic reward circuitry as actual wins, and *increase* motivation to continue — despite being objectively losses [evidence-backed: Clark et al. 2009; Chase & Clark 2010, PMC2929454]. Gambling severity predicts *stronger* midbrain response to near-misses. The brain misreads "almost" as "getting warmer" even in pure-chance contexts.
→ **Grounded:** Candy Crush's "you were 1 move away" is the canonical monetized near-miss — the single most conversion-driving moment in the game, immediately followed by a "+5 moves for $0.99" offer [evidence-backed: game-teardown sources, secondary]. Slot-style spins in Coin Master land symbols "one off" the jackpot visibly.

**Loss aversion + endowment.** Losses loom roughly **2–2.5× larger than equivalent gains** (prospect-theory λ ≈ 2.25); the endowment effect (Kahneman/Knetsch/Thaler mug studies) shows people demand ~2× to give up something they already "own" versus to acquire it [evidence-backed: Kahneman & Tversky 1979; Kahneman/Knetsch/Thaler 1990]. Design implication: giving the player something and then *threatening to take it away* is far more motivating than offering the same thing as a gain.
→ **Grounded:** Duolingo streak freeze (you *own* a 100-day streak; losing it hurts ~2× more than building it felt good). Coin Master piggy bank (you watch coins accumulate as "yours," then pay real money to avoid losing them). Battle-pass tiers that grant reward *on purchase* to create ownership before completion.

**Zeigarnik / incomplete-task tension.** Interrupted or unfinished tasks are held in an active tension state and remembered/returned-to better than completed ones [evidence-backed: Zeigarnik 1927 — *note replication is mixed, see WEAK SPOTS*]. A visible, partially-filled bar is a standing open loop.
→ **Grounded:** Monopoly GO / Panini-style **sticker albums** with 3 of 9 slots filled; near-complete collection sets; "1 sticker to finish this set" is a Zeigarnik + near-miss stack. Progress bars at 80%.

**Sunk-cost / investment escalation.** Prior irrecoverable investment (time, money, effort) irrationally justifies continued investment, to avoid the pain of "wasting" what's already spent — a downstream consequence of loss aversion [evidence-backed: sunk-cost literature; applied documentation in gacha, secondary]. This is what converts early engagement into month-1+ stickiness and, in whales, into runaway spend.
→ **Grounded:** Gacha (Genshin, FGO) pity systems make *accumulated pulls* toward a guaranteed drop feel like a bank you can't abandon; ~1–5% of players ("whales") drive 50–70% of F2P revenue partly via sunk-cost escalation [evidence-backed: industry estimate, commonly cited, imprecise].

**Flow channel (Csikszentmihalyi).** Intrinsic engagement peaks in the diagonal band where **challenge ≈ skill**; above it → anxiety, below → boredom. Sustaining flow requires difficulty that rises *with* the player's growing skill, plus clear goals and immediate feedback [evidence-backed: Csikszentmihalyi 1975/1990; game-design adaptation, Chen thesis].
→ **Grounded:** Dream Games' Royal Match is described as "fanatical optimization of the core puzzle... engineered to maximize player agency and flow"; tight, juicy, immediate feedback on every move [evidence-backed: Naavik, secondary]. Difficulty ramps and periodic "easy" levels reset the skill/challenge ratio to prevent rage-churn.

**Self-determination theory / PENS (Ryan, Rigby, Przybylski).** Games sustain intrinsic motivation by satisfying three basic needs: **competence** (mastery, clear feedback), **autonomy** (meaningful choice, volition — *not* coercion), and **relatedness** (social connection). All three independently predict enjoyment, immersion, and continued-play intention [evidence-backed: Ryan, Rigby & Przybylski 2006; Przybylski, Rigby & Ryan 2010, PENS]. This is your ethical yardstick: mechanics that *add* autonomy/competence/relatedness are legitimate; mechanics that *undermine* them (coercion, manufactured helplessness) are where dark patterns live.

**Habit loops (cue → routine → reward; context-stable cues).** Habits are automatic cue–response links built by *repetition in a consistent context*; automaticity rises on an asymptotic curve, averaging ~**66 days** (range 18–254) in Lally's field study [evidence-backed: Lally et al. 2010; Wood & Neal]. The reliable cue (same time, same context, a notification) is what eventually fires the behavior without deliberation. Nir Eyal's "Hooked" repackages this as Trigger → Action → Variable Reward → Investment for products [evidence-backed: Eyal 2014 — *practitioner framework, not peer-reviewed; Eyal himself adds a "Manipulation Matrix" ethics test*].
→ **Grounded:** Duolingo's entire retention architecture is a habit loop — daily-time notification (cue) → one lesson (routine) → streak increment + XP + variable chest (reward) → streak/investment accrues. Users with **7+ day streaks retain at ~2.4× the rate** of those who never form one [evidence-backed: Duolingo/Lenny's-podcast, secondary].

---

## 2. MECHANISM-BY-MECHANISM PRACTICAL ANALYSIS

Format per mechanism: **(a)** named implementations · **(b)** monetization link · **(c)** failure mode · **(d)** legitimate vs dark pattern.

### Urgency (scarcity / countdown)
**(a)** Candy Crush "lives regenerate in 23:00" timer; Coin Master limited event windows; every "offer expires in 04:59:59" pack. **(b)** Time-scarcity converts fence-sitters — the countdown reframes a discretionary purchase as a closing window; drives impulse IAP and rewarded-ad views to "beat the clock." **(c)** Overdone → chronic pressure reads as manipulation and fatigues players ("feels like work" — the standing Fortnite battle-pass complaint). Manufactured/false countdowns that silently reset are the toxic version. **(d)** *Legitimate:* genuine limited events with honest timers. *Dark:* **temporal dark patterns** (Zagal) — false urgency, countdowns that reset, "grinding gates" that exist only to sell time-skips [evidence-backed: Zagal et al. 2013 taxonomy]. **Skip aggressive urgency in v1**; it needs event infra and burns trust fast.

### Mastery / competence
**(a)** Royal Match's tuned difficulty + "juicy" feedback; any game with a visible skill curve and clean win feedback. **(b)** Indirect but critical — mastery keeps players in flow → sessions continue → more ad impressions/IAP surface exposure. Competence is the *retention floor*: without it no monetization layer holds. **(c)** Difficulty spikes above skill → anxiety → rage-churn (esp. at classic "paywall levels" like Candy Crush 65/70); too easy → boredom-churn. **(d)** Almost purely legitimate and SDT-positive — this is the safest, highest-ROI mechanism for a solo dev to over-invest in. The dark-pattern edge is only if difficulty is *artificially* spiked at a known frustration point *specifically* to sell boosters (Zagal "grinding"/pay-to-skip).

### Repeat-play triggers (cues/notifications/energy)
**(a)** Duolingo scheduled notifications + escalating reminder copy; Candy Crush/Coin Master **energy systems** (5 spins per 50 min; lives regen) that create a natural "come-back-later" cue; daily-bonus reset at 00:00. **(b)** Energy caps session length and creates a repeat-visit rhythm → predictable daily ad inventory; energy refills are a direct IAP/rewarded-ad sink. **(c)** Over-notifying → notification fatigue, OS-level disabling, uninstall. Punitively short energy → resentment. **(d)** *Legitimate:* helpful reminders the user can tune; energy as pacing. *Dark:* guilt/shame notification copy weaponizing relationships, or energy set so tight the game is unplayable without paying (predatory "temporal" pattern). Notifications are external triggers — powerful for *wanting*, so use sparingly and honestly.

### Loss aversion (see foundation)
**(a)** Duolingo streak-freeze; Coin Master piggy bank; battle-pass "you'll lose unclaimed tiers." **(b)** The purest conversion lever in F2P: a $0.99 offer to *prevent a loss* outperforms the same offer framed as a *gain* because losses weigh ~2×. Streak-save and piggy-bank unlocks are top IAP drivers. **(c)** If loss threats are too frequent/severe, players pre-emptively detach ("I'll just lose the streak, whatever") — the defense mechanism that *kills* the whole loop. **(d)** *Legitimate:* forgiveness mechanics (streak freeze) that *reduce* catastrophic loss while preserving stakes. *Dark:* engineering a loss purely to sell its prevention; punishing lapses so harshly that anxiety, not enjoyment, drives return (crosses into the gambling-harm zone flagged by near-miss research).

### Streaks
**(a)** Duolingo streak (the exemplar) + **streak freeze**, **streak repair**, Streak Society; Snapchat streaks; daily-login chains. **(b)** Streak-freeze/repair are direct micro-IAP; streaks massively lift DAU/retention → the base all monetization multiplies against. Duolingo: apps *with* streak-freeze average 17.19 streak-days vs 11.62 without (~48% longer); a single streak *copy change* drove ~10,000 incremental DAU [evidence-backed: Duolingo/Sensor Tower/Lenny's, secondary]. **(c)** A broken long streak can trigger *total* abandonment ("all-or-nothing" cliff) — which is exactly why forgiveness mechanics exist. Over-long streaks also become joyless obligation (wanting without liking). **(d)** *Legitimate:* streak + forgiveness = high-retention, low-harm, and *solo-dev-buildable*. This is arguably your single best v1 mechanic. *Dark edge:* only if repair is priced coercively or lapses are punished punitively.

### Daily habits (daily bonus / quests)
**(a)** Daily login rewards (near-universal); Duolingo daily goal + daily quests; escalating 7-day login calendars (day 7 jackpot). **(b)** Daily actives are the denominator for all ad revenue; escalating calendars create Zeigarnik pull toward day-7 payoff → return rate up. **(c)** Reward inflation (every day is a jackpot) kills RPE — predictable reward goes dopaminergically silent; also "login-only" players who don't actually engage. **(d)** *Legitimate and lean* — daily bonus + daily goal is core to the minimum ethical stack. Keep the day-to-day reward *variable* (see below) so prediction error stays alive. Low dark-pattern risk unless the calendar resets punitively on a single miss.

### Event participation (LiveOps)
**(a)** Monopoly GO Sticker Boom / partner events / tournaments on a tight recurring cadence; Coin Master events; battle-pass seasons. **(b)** Events are the primary revenue *spikes* in modern F2P — Monopoly GO layers casino-style monetization (high revenue-per-download) on cheap board-game CPI via constant event cadence [evidence-backed: DoF/Naavik, secondary]. **(c)** Event treadmill requires a *content/ops team*; for a solo dev, stale or broken events are worse than none. Over-eventing → burnout, "second-job" feeling. **(d)** *Legitimate:* fresh challenges satisfying competence/novelty. *Dark:* FOMO-maximized limited events pushing spend to "not miss out," social-capital pressure to keep pace. **Explicitly out-of-scope for your v1** — this is the heaviest LiveOps mechanism. A *single* short, repeatable, self-resetting event is the most you should attempt (see stack).

### Social pressure / relatedness
**(a)** Coin Master attack/**revenge**/raid loop against friends; leaderboards/leagues (Duolingo Leagues); clans/guilds; invite-a-friend. **(b)** Social loops drive *organic* installs (viral coefficient) and retention via relatedness — "being attacked" pulls players back to retaliate; leagues drive daily competitive return. **(c)** Toxic comparison, harassment, pay-to-compete resentment; leaderboards demotivate the bottom 80%. **(d)** *Legitimate (SDT relatedness):* cooperative play, friendly competition, genuine connection. *Dark:* **social-capital dark patterns** (Zagal) — exploiting friendships to recruit/pressure, guilt spam, "your friend will be disappointed." **Mostly out-of-scope for solo v1** (needs social backend, moderation, network effects). A *lightweight async leaderboard* is the safe minimum if any.

### Progression tension
**(a)** Level maps (Candy Crush saga path), village-building (Coin Master), account level / battle-pass track. Combines Zeigarnik (open loop) + near-miss + sunk-cost. **(b)** Visible "next unlock" drives session continuation; the almost-complete upgrade sells the booster/currency that finishes it. **(c)** Grind walls that exist only to sell time-skips read as exploitative; pacing too slow → boredom-churn, too fast → run out of content. **(d)** *Legitimate:* meaningful, well-paced mastery progression. *Dark:* artificial grind gates (Zagal "grinding"), progression that stalls precisely where a purchase resolves it.

### Variable rewards (the core RPE engine)
**(a)** Coin Master slot; gacha/loot boxes (Genshin, gacha broadly); Monopoly GO dice + random sticker packs; any random-drop chest. **(b)** The highest-monetizing mechanic in mobile — variable reward *is* the slot machine, sold directly (packs/pulls) or via rewarded-ad "free spin." **(c)** This is where design shades into **gambling harm**: variable-ratio + near-miss + sunk-cost is the precise structure regulators are now targeting. Loot boxes are restricted/banned in Belgium & the Netherlands and under active EU/UK scrutiny. **(d)** *Legitimate:* variable *cosmetic/soft* rewards with no real-money random purchase, transparent odds. *Dark/regulated:* paid random boxes with hidden odds, currency obfuscation. **For your IAA-first, ethical v1:** keep variable rewards but make them *earned/rewarded-ad-gated*, not paid random boxes — you get the RPE retention benefit without the gambling-harm and regulatory exposure.

### Collection / completion
**(a)** Monopoly GO / sticker albums (Panini model); gacha character rosters; achievement sets. Zeigarnik (open set) + endowment (partial collection is "yours") + sunk-cost. **(b)** Duplicate-protection, "final sticker" scarcity, and set-completion rewards drive pack purchases; the last 10% of a set is the most monetized. **(c)** Deliberately throttling the "last sticker" to force spend is a known predatory pattern; completion anxiety without payoff → resentment. **(d)** *Legitimate:* collections earned through play, fair drop rates. *Dark:* engineered final-item scarcity + real-money packs = the sticker-album version of gacha, drawing the same regulatory attention to hidden odds/currency.

---

## 3. RETENTION ARC MODEL — D0 → Week-1 → Month-1

Casual retention benchmarks (2025) frame the stakes: casual games run ~**D1 26–28%, D7 ~8–15%, D30 <3–8%**; classic Card/Casino/Puzzle/Board hold longest because familiarity → habitual play [evidence-backed: GameAnalytics/industry 2025-26]. The core dynamic: **D1 = first impressions (novelty/curiosity); D7 = habit formation ("after novelty fades, is there a reason to return?"); D30 = investment/identity/social ties** [evidence-backed: Solsten, industry].

**D0 / first session — the HOOK (novelty, curiosity, competence).** Drivers: immediate *competence* (an early, unambiguous win — clear feedback, controls mastered in seconds), curiosity (a visible next goal — Zeigarnik open loop), and honest match to the ad promise (Section 6). Dopaminergically you want an *unpredicted early reward* (RPE burst) to tag the app as worth returning to. **Do NOT monetize aggressively here** — no launch interstitial (inflates D0 churn), no paywall before the player experiences the core loop. Casual vs midcore: casual needs the win in <60 seconds and near-zero learning cost; midcore tolerates (even wants) a richer onboarding and systems to master.

**Week-1 — HABIT FORMATION (cue-stability, streaks, variable reward).** This is where you win or lose retention. Install the *cue* (daily notification at a self-consistent time), make the *routine* short and repeatable (a single satisfying loop), and keep the *reward variable* to sustain RPE. Begin the streak/daily-goal so loss aversion starts working *for* you by ~day 3–7 (the 7+ day streak → ~2.4× retention inflection at Duolingo). Novelty is decaying here — habit + open loops must replace it. Casual: lean on daily bonus + streak + collection-lite. Midcore: layer light progression systems and first social touch.

**Month-1 — INVESTMENT & IDENTITY (sunk-cost, endowment, relatedness).** Long-term retention is *not* novelty (gone) — it's accumulated **investment** (streak length, collection %, account level = sunk cost you won't abandon), **endowment** (things that are "yours" to lose), **identity** ("I'm someone who does my daily X" — Duolingo's whole brand), and **social ties** (relatedness, hardest for a solo dev). Eyal's "investment" phase: every session the player *puts something in* (progress, customization) that raises switching cost. Casual players anchor on habit + collection; midcore/whales anchor on mastery, status, and sunk investment — and this is where the 1–5% who drive 50–70% of revenue live [evidence-backed: industry estimate]. **Short-term retention is a curiosity problem; long-term retention is an investment-and-identity problem — different mechanisms, sequenced.**

---

## 4. LEAN FIRST-TEST STACK — "Minimum Ethical Habit Stack"

Buildable by one Kotlin dev, no LiveOps team, IAA/hybrid-friendly, SDT-positive. Each element with expected effect + evidence level.

| # | Element | What it does | Expected effect | Evidence |
|---|---------|-------------|-----------------|----------|
| 1 | **Tight core loop in the flow channel** | 30–90s repeatable session, challenge≈skill, *juicy* immediate feedback, early guaranteed win | The retention floor; everything else multiplies against it | [evidence-backed: Csikszentmihalyi; PENS competence] |
| 2 | **Daily bonus + daily goal** | Fixed daily cue + reset; escalating 7-day calendar | Establishes return rhythm; Zeigarnik pull to day-7 | [evidence-backed: habit-loop / Lally] |
| 3 | **Streak WITH forgiveness** | Consecutive-day streak + 1–2 auto/earned "freezes" | The highest-leverage lean mechanic; 7-day streak ≈2.4× retention; freeze +~48% streak length | [evidence-backed: Duolingo, secondary] |
| 4 | **Variable reward, earned not sold** | Randomized daily chest / post-session drop (soft currency, cosmetics) | Keeps RPE alive without gambling-harm or paid loot boxes | [evidence-backed: Schultz RPE; regulatory-safe by design] |
| 5 | **Collection-lite** | One small, earnable set with a visible progress bar | Zeigarnik + endowment open loop; cheap to build | [evidence-backed: Zeigarnik *(mixed)* + endowment] |
| 6 | **One short repeatable event** | A weekly self-resetting challenge (no live ops) | Novelty refresh + competence without an ops team | [plausible-unverified for solo-scale] |
| 7 | **Rewarded ads as positive exchange** | Opt-in "watch for +lives/spin/2× reward" | Monetization framed as *player value*, autonomy-preserving (Section 5) | [evidence-backed: rewarded-ad sentiment data] |
| 8 | **Honest, scheduled notification** | One tunable daily reminder at a stable time | Installs the habit cue (Trigger) | [evidence-backed: habit-loop; but see fatigue caveat] |

Deliberately **excluded from v1** (need LiveOps/social infra or carry harm/regulatory risk): heavy event cadence, paid random loot boxes/gacha, PvP attack loops, social-capital pressure, aggressive false urgency, piggy-bank-style "pay to not lose your savings." Add later, with intent, if the market test justifies it.

---

## 5. AD-MONETIZATION PSYCHOLOGY

**Rewarded video = autonomy-preserving value exchange.** The opt-in nature is the whole point: the player *chooses* to trade attention for value, which satisfies rather than violates autonomy (SDT). Sentiment data is strongly positive: ~**68% of gamers say they like rewarded ads**, ~85% enjoy in-game rewards, ~9 in 10 interact; marketers report rewarded ads make users feel *more in control* (~46%) [evidence-backed: industry surveys — MAF/Applixir, secondary]. Correlational retention signals are large but **selection-biased**: users who watched ≥1 rewarded video in week 1 showed ~53% D30 vs ~12–13% average [evidence-backed: industry, *strongly confounded — engaged users self-select into rewarded ads; do not read as causal*]. Framed correctly ("continue / +reward"), rewarded video reads as the game *giving*, not taking.

**Interstitial resentment = autonomy violation.** Full-screen interstitials arrive unbidden at transitions; because the player has *no choice*, they generate reactance (the same autonomy mechanism, inverted). Data: keeping interstitials **<3/session retains ~27% more users**; a **60–90s first-ad delay** and no launch interstitial protect D0; sub-2-minute spacing "feels relentless" [evidence-backed: AdReact/industry benchmarks, secondary]. Interstitials drive higher churn than rewarded across platforms.

**Aggressiveness × trust × long-term retention.** Monetization pressure trades against trust, and trust *is* long-term retention. The Berridge lens matters: you can juice short-term *wanting* (session extension, ad frequency) while eroding *liking* — the gap shows up as delayed churn and review-score decay. **For your IAA/hybrid first test: lead with rewarded video as the primary revenue, use interstitials sparingly and only at natural breaks (never on launch, never mid-action), and treat every ad placement as a value-exchange the player would consent to if asked.** This is also the most *retention-safe* posture for a game with no IAP whale base to fall back on.

---

## 6. HONESTY CONSTRAINT — Why the hook must match the promise

**The psychology: expectation violation → churn.** The first session is evaluated against the *expectation the ad set*. When the two diverge, you get an expectation-violation/prediction-error in the *negative* direction — the player feels tricked, trust breaks, and they uninstall. This is not soft: ~**56% of mobile gamers report encountering ads that misrepresent gameplay**, and authentic-ad cohorts show **D1 ~32% vs ~14%, D7 ~11% vs ~1.5%, and LTV ~$0.25 vs ~$0.05** versus fake-ad cohorts [evidence-backed: industry data — Segwise/Udonis, secondary; directionally strong, specific figures imprecise]. Fake "pull-the-pin"/mismatched-genre creatives buy a cheap install and *poison the retention economics behind it*: you pay CPI for a user pre-primed to churn on session 1.

**Why it poisons the funnel structurally.** Retention/LTV must *absorb* the acquisition promise. If the ad promises gameplay the product can't deliver, no amount of downstream mechanics recovers the broken first impression — "if a campaign relies on a fake promise, scaling spend becomes harder because the product cannot absorb the expectation." You also risk **store removal** and review-score collapse, both of which raise CPI further. For a solo dev on a tight UA budget, deceptive creatives are economically self-defeating even before the ethics.

**What an "honest hook" means psychologically.** Design the *actual* first 60 seconds to deliver a genuine RPE-positive surprise (an early, unpredicted win / a satisfying core-loop moment) — then advertise *that*. The creative and the D0 experience should trigger the *same* wanting and pay it off with the *same* liking. Honest hook = the promise and the payoff are the same object. This aligns wanting with liking (Berridge), preserves trust (long-term retention substrate), and keeps you clear of the FTC/EU trajectory (FTC's $245M Epic order over dark patterns; EU CPC 21 March 2025 "real-world money value" transparency principles) [evidence-backed: FTC 2022–23; EU CPC 2025].

---

## STRONG CLAIMS (highest confidence)
1. **Dopamine = wanting + reward-prediction-error, NOT pleasure.** Wanting is dissociable from liking; engagement mechanics manufacture wanting, which can run ahead of enjoyment. Get this right on the panel [evidence-backed: Berridge & Robinson 2016; Schultz 1997].
2. **Unpredictability is the active ingredient.** Variable-ratio rewards keep prediction error (and the cue's pull) alive; predictable rewards go dopaminergically silent — so keep daily/loop rewards *variable* [evidence-backed: Schultz].
3. **Loss aversion (~2×) is the strongest lean conversion/retention lever**, and streaks-with-forgiveness are its safest, most solo-buildable expression (Duolingo: 7-day streak ≈2.4× retention; freeze ≈+48% streak length) [evidence-backed: Kahneman/Tversky; Duolingo secondary].
4. **Competence/flow is the retention floor** — a solo dev's highest-ROI, lowest-harm investment; no monetization survives a weak core loop [evidence-backed: PENS; Csikszentmihalyi].
5. **Short-term retention (novelty/curiosity) and long-term retention (habit → investment → identity → social) are different problems requiring different, sequenced mechanisms** across D0/week-1/month-1 [evidence-backed: retention-driver analyses].
6. **Rewarded video is a player-positive, autonomy-preserving exchange; interstitials generate reactance** — lead with rewarded, minimize/delay interstitials, never launch-interstitial [evidence-backed: sentiment + frequency data].
7. **Deceptive creatives poison retention economics** via expectation violation; honest hook (advertise the real first-60s payoff) is both ethical and economically superior for a UA-budget-constrained solo dev [evidence-backed: fake-ad retention/LTV data + FTC/EU posture].
8. **Autonomy (SDT) is the clean ethical line**: mechanics that add competence/autonomy/relatedness are legitimate; those that coerce or manufacture helplessness are the dark patterns regulators now pursue (FTC $245M Epic; EU CPC 2025; Zagal taxonomy).

## WEAK SPOTS (thin evidence / needs further research)
1. **Industry retention/LTV figures are mostly vendor blogs, correlational, and selection-biased** — especially "rewarded-ad users retain 4×" and fake-vs-authentic LTV splits. Directionally credible; treat specific multipliers as illustrative, not causal. Prioritize your *own* A/B data.
2. **Zeigarnik effect has a shaky replication record** — the "open loop" intuition is design-useful but the underlying lab effect is contested; lean on it lightly.
3. **Loss aversion's universality is debated** (Gal & Rucker and others question the ~2× as a general law vs context-dependent). The *direction* is robust for game design; the exact coefficient isn't load-bearing.
4. **Duolingo-specific numbers** (2.4×, +0.38%, 17.19 vs 11.62 days, 10k DAU) come from talks/secondary write-ups, not peer review — credible but not independently audited.
5. **"Whales = 1–5% drive 50–70% revenue"** is a widely repeated industry heuristic with imprecise, dated sourcing — less relevant to your IAA-first model regardless.
6. **"Flow" in games is loosely operationalized** — the challenge/skill balance is sound guidance; rigorous per-session flow measurement is hard and I'd not over-claim it.
7. **Solo-scale event mechanics** (stack item 6) — no strong evidence on whether a *single automatable* event meaningfully lifts retention absent a LiveOps cadence; test cheaply before investing.
8. **Regulatory trajectory is moving fast** (EU CPC principles non-binding as of 2025; EU Digital Fairness Act pending; UK CMA active) — verify current status before launch since your game targets global/EU users.
