# Panel 6 — Regional Analysis (Pakistan / Android-first / South Asia)

> Research panel output (Opus agent, live web research, July 2026). Evidence tags:
> **[EB]** = evidence-backed (source named) · **[PU]** = plausible-unverified · **[SP]** = speculative.
> Synthesized into `../mobile-games-opportunity-framework.md`.

# SOUTH ASIA / PAKISTAN MOBILE-GAMES MANDATE — Emerging-Markets Analyst Brief (July 2026)

Web tools worked for search; several data-vendor pages (DataReportal, Statcounter, Sensor Tower, Tenjin full report, Tribune) returned 403 on direct fetch, so a few figures rest on search-surfaced summaries rather than the primary dashboard — flagged where it matters.

---

## 1. PAKISTAN MARKET FACTS

**Connections & the feature-phone reality (the single most under-appreciated fact).**
- ~194M cellular connections end-2025; ~117M internet users (45.6% penetration, Oct 2025); ~79.5% of connections are mobile broadband (3G/4G/5G) **[EB: GSMA Intelligence / DataReportal Digital 2026 Pakistan, via search]**.
- GSMA projected ~146M smartphone connections for Pakistan by 2025 **[EB: GSMA via PhoneWorld]**, but the crucial nuance: **only ~48% of active devices on Pakistani networks were smartphones in 2025, down from 59% (2023) and 56% (2022); 2G/feature phones rose to ~52%** **[EB: meatechwatch citing PTA]**. Population-level smartphone *ownership* was cited at ~31% in late 2025 **[PU: single source]**. Interpretation: the addressable *gaming* base is real and large in absolute terms (tens of millions) but is a minority of the SIM base, skews entry-tier, and is still growing off local assembly (Pakistan produced 17.8M handsets in the first 7 months of 2025) **[EB: meatechwatch]**.

**Platform: Android-first to the point of Android-only for a solo dev.**
- Statcounter Pakistan mobile-OS split is ~**81–84% Android / ~15–18% iOS** **[PU: Statcounter Pakistan — page would not load; consistent with prior and with regional peers India 95%, Indonesia 87%]**. For a solo founder, treat iOS as a rounding error domestically; build Android-first, and only add iOS later to reach diaspora/Gulf/T1 wallets.

**Device profile.** Entry band PKR ~14,000–35,000 (~$50–125); best-sellers are Infinix Hot/Smart, Tecno Spark, itel, Vivo Y-series; typical entry spec 4GB RAM / 128GB storage, 5000mAh batteries **[EB: WhatMobile/Priceoye/ProPakistani]**. Design implication: target <200MB install (ideally far less), low-end GPU, offline-tolerant, cheap-Android QA. This is a hard constraint, not a preference.

**Payments — the IAP rails are structurally broken (decisive for monetization choice).**
- Direct carrier billing (DCB) on Google Play exists via Jazz (launched ~2019) **[EB: Jazz/cells.pk — page 403'd but multiple confirmations]**; coverage/stability across Telenor/Zong is inconsistent **[PU]**.
- **Google Play does not officially sell PKR gift cards.** Pakistani buyers use third-party vendors reselling US/UK/**Turkish** region cards, and Play enforces strict region-matching — many users run Turkish-region accounts for cheaper tiers **[EB: ShopOn/Daraz/Gyft listings]**. Easypaisa/JazzCash are used *to buy those third-party cards*, not as native Play payment instruments. Card penetration is low.
- Net: **domestic IAP conversion is throttled by rails, not just willingness-to-pay.** IAA (ads) is the default; IAP is a diaspora/T1 lever, not a Pakistan lever.

**Ad economics — bottom tier.** Pakistan sits in the lowest eCPM band. Reference points: Meta CPM ~$0.80–1.50 **[EB: Adligator]**; rewarded-video eCPM ~$2 for SEA/LatAm and *lower* for Pakistan **[EB: Statista/Appodeal tiering]**; T1 rewarded is $15–30 and global average $8–18 **[EB: Playwire]**. Working assumption for Pakistan: **rewarded ~$1–4, interstitial ~$0.7–2, banner <$0.30** **[PU: inferred from tiering, not a PK-specific print]**. ARPDAU on a domestic-only IAA title is pennies; the model only works on volume + cross-promo.

**What actually tops the charts (2025–26).**
- **Free games:** PUBG Mobile and Free Fire dominate engagement; then Ludo King (~50M PK downloads claimed **[PU: secondary blog]**), Subway Surfers, 8 Ball Pool, Carrom Pool **[EB: DigiIT/Nexon.pk/Similarweb PK, search-surfaced]**. Note a competitive quirk: **Free Fire remained available in Pakistan while it was banned in India (2022)** **[EB]**, so battle-royale attention is even more concentrated in PK.
- **Grossing:** thin and dominated by the same global titles' IAP plus MENA-facing social/casino-style apps; there is no strong domestic grossing story. PUBG was temp-banned by PTA in 2020, restored, and is now thriving; a domestic esports scene exists (a PK PUBGM team placed 7th at EWC) **[EB]**.

**Ramadan/Eid seasonality (documented, exploitable).** Across METAP (Middle East, Turkey, Pakistan), gaming sessions rose ~3% during Ramadan with Pakistan +5%; **METAP gaming sessions were the longest globally at ~35.6 min avg**; regional in-app-purchase revenue climbed ~18% YoY to ~$1.7bn; South-Asia Ramadan spend grew 40%+ (2021) and 10%+ (2022) **[EB: Adjust Ramadan reports; Campaign ME]**. Ramadan is a real live-ops window (evenings post-iftar, Eid gifting), but note ad *spend* skews non-gaming during Ramadan, so UA can get pricier.

---

## 2. LOCAL STUDIO PATTERNS

**The honest revenue distribution (the number the founder most needs).** Tenjin's *State of Mobile Gaming in Pakistan 2025* reports per-game monthly revenue: **~40% of games earn <$1,000/mo, ~40% earn $1k–10k, ~12% earn $10k–50k, ~8% earn $50k+** **[EB: Tenjin — summary via search; full page 403'd]**. This is the ground truth: the median Pakistani game is a sub-$1k/month IAA project. The ecosystem is a long tail of volume plays, not a hit factory.

**Ecosystem scale (treat advocacy figures skeptically).** Industry/government figures cite ~257 companies, ~300 studios, ~8,500 developers, ~$300M sector revenue / ~$158M exports, and "2nd-largest mobile-game developer in the region behind Vietnam" **[PU: govt/industry advocacy sources — likely generous]**. Directionally: a real, deepening talent pool; monetization/IP ownership lags the talent.

**Named studios and what they actually are:**
- **Mindstorm Studios (Lahore, est. 2006):** the flagship — Cricket Revolution, Cricket Power, Whacksy Taxi (a former US App Store #1), War Inc. Reported ~$15.3M annual revenue (2025), ~81 staff **[PU: Tracxn estimate]**. In practice increasingly services/work-for-hire, not a current breakout-hits engine.
- **Caramel Tech (Lahore, est. 2011):** co-development muscle — contributed to Fruit Ninja **[EB]**. Work-for-hire DNA.
- **FRAG Games (est. 2013):** 40+ projects for Netflix, Cartoon Network — outsourcing/co-dev **[EB]**.
- **GenITeam (Lahore):** 100M+ cumulative users, dev+publishing **[EB]**.
- **Gamivision:** a domestic hypercasual *publisher* — Tenjin case study cites ~+2900% paid installs / ~+20% ROI in 9 months **[EB: Tenjin]**. The closest thing to a scaled domestic UA-driven casual publisher.
- **The "simulator" cluster:** e.g., **Chromic Apps** (Pakistan–India Bus Simulator, ~1.8M downloads), **Mir Studio** (Pak Bus Simulator, ~100k+), plus a swarm of keyword-titled entries ("Pakistan Truck Simulator," "Imran Khan Bus Simulator," "Peshawar Zalmi Bus Simulator") **[EB: Google Play listings]**. **Business model = volume IAA at low eCPM + keyword-driven ASO on low-competition localized terms + cross-promo between one studio's own portfolio.** Individual titles cap in the ~100k–2M download range — real installs, tiny revenue, thin retention.

**Regional peers — the models worth copying, with scale:**
- **India — Ludo/board:** Gametion **Ludo King** — 1.25B+ downloads, ~70–80% from India, heavily ad-monetized (ranks only ~top-40 India by revenue despite #1 downloads) **[EB]**. **Gameberry Labs** (Bengaluru) **Ludo STAR / Parchisi STAR** — 125M+ downloads, ~6M DAU, and critically **PK+Bangladesh+MENA ≈ 90% of users while revenue is driven by Saudi Arabia, the US and Spain** — India was never the monetization target **[EB: Gameberry/YourStory]**. Moonfrog **Ludo Club** (India). Takeaway: **the definitive "Pakistani" board-game hits are built in India and monetized in the Gulf/West.**
- **India — cricket:** Nextwave (WCC franchise, now Nazara-owned) ~500M+ downloads; Nautilus (Real Cricket) **[EB]**. Deep, entrenched.
- **Vietnam — the "export factory":** Amanotes (3B+ downloads, ~100M MAU, Magic Tiles 3 >1B, subscription+ads) **[EB]**; OneSoft/Falcon Squad (flight shooters at industrial scale) **[EB]**. Globally-legible mechanics, zero cultural specificity, massive volume.
- **Turkey — hypercasual/hybrid:** Rollic (Zynga bought 80% for ~$168M; 250M+ downloads; **kills 1,000+ prototypes/year, ~40 reach soft-launch**) **[EB]**; **Zuuks** — Bus Simulator: Ultimate ~230M downloads, Truck Simulator: Ultimate ~110M, **650M+ total, built on global routes (US, Germany, Brazil…)** **[EB]**. Turkey proves throughput + globalization, not localism.
- **Indonesia — the deep-dive case (Maleo / Bus Simulator Indonesia):** founded 2016, BUSSID live since 2017 (~9 years of durability), ~3M downloads/month recently, ~15M+ users across its two titles, **IAA-led** **[EB: Sensor Tower/Maleo — download data solid; exact revenue undisclosed]**. The durability engine is the **livery/UGC system**: players design and share custom bus paint-jobs, creating a self-sustaining content loop and community identity. Cultural specificity (Indonesian "telolet" bus culture) drove *installs*; **UGC + free updates drove retention**. This is the reference architecture for "local theme, durable business."

---

## 3. WHY SIMULATION/DRIVING PERFORMS IN SOUTH ASIA — evidence vs folklore

**Demand-side (real):** aspirational vehicle culture (owning/driving a decorated bus or truck is a genuine status fantasy); enormous YouTube sim-content ecosystem feeding install intent; "bus simulator"/"truck simulator" are evergreen, high-volume ASO queries **[PU: reasoned + supported by the volume of ranked localized titles]**.

**Supply-side (real and more important):** low-competition *localized* keywords ("Pak bus," "Pakistan truck," city names) let tiny studios rank without UA spend; Unity Asset Store vehicle/city packs make production cheap; cross-promo networks recycle the same users across a studio's portfolio. This is an **ASO+asset-flip arbitrage**, not game design.

**Globally scalable or ceiling-capped?** Both models exist and the gap is stark:
- **Ceiling-capped (the default PK pattern):** hyper-local sims top out at ~100k–2M downloads, land in Tenjin's <$1k–$10k/month buckets, and decay. Not a business — a volume play.
- **Globally scalable (the exception):** Zuuks (650M+, global routes) and Maleo (durable UGC, 15M+) show the *same genre* becomes a real business when you (a) globalize the setting or make it UGC-agnostic, (b) add a durable content loop (livery/company-management/routes), and (c) keep updating for years. **The genre scales; hyper-local framing does not.**

**Honest LTV at T3 eCPMs.** Rewarded ~$1–4 and banner <$0.30 **[PU]**, against low D7/D30 on thin sims, yields ARPDAU in cents. A domestic-only sim needs multi-million MAU + tight cross-promo just to clear four figures/month. The only ways up: (1) globalize the install base so ad revenue is blended with T1/Gulf eCPMs, (2) add IAP/subscription depth for the diaspora/Gulf minority who *can* pay, (3) build UGC so retention (hence lifetime ad impressions) rises. Without one of these, sim-driving in PK is a hobby-scale cross-promo funnel.

---

## 4. CULTURAL / NOSTALGIA OPPORTUNITY AUDIT (commercial-signal-first)

**Ludo / snakes-&-ladders boards — CLOSED at the top.** Ludo King (1.25B), Ludo STAR (125M), Ludo Club saturate the category; Ludo King already bundles snakes-&-ladders **[EB]**. Nostalgia drives *installs*; **retention comes from real-time multiplayer + social/voice, not nostalgia**. All incumbents are Indian-built and already own the PK/MENA/diaspora audience. **Verdict: closed for a clone; only a sharply differentiated twist has any room — and even then you fight entrenched network effects.**

**Carrom — CLOSED.** Carrom Pool (Miniclip) ~620M downloads, ~5M downloads/month *each* in India and Pakistan, #1 in its category **[EB]**. Do not enter.

**Cricket — crowded core, one narrow gap.** Sim cricket is owned by WCC (Nazara) and Real Cricket **[EB]**. Two sub-signals: (a) **street/gully cricket** as a casual, hyper-accessible, repeat-session loop is *under-served by the majors* — plausible niche **[SP]**; (b) **PSL licensing** — the store is full of *unofficial* PSL-branded apps; an official PCB/PSL license is almost certainly slow and costly for a solo dev **[PU]**. **Verdict: licensed PSL = trap (cost/complexity); unlicensed casual gully-cricket with generic branding = a possible lightweight test, but you compete for attention against battle-royale and real cricket viewing.**

**Kite flying / Basant — thematically fresh, legally charged, small/seasonal.** Punjab passed the **Kite Flying Regulation Bill 2025**, lifting a ~two-decade ban with strict rules (string material/counts, kite dimensions, designated days) and bans on kites bearing religious/political/flag imagery **[EB: Dawn/Arab News/Pakistan Today]**. A *virtual* kite game is legally safe and topical (Basant returning in 2026), and there is no dominant branded incumbent. But it is culturally sensitive, likely seasonal, and monetization is unproven. **Verdict: genuine thematic whitespace, but small-TAM and seasonal — a marketing hook, not a business by itself.**

**Pithu/seven-stones, gilli-danda, kanchay/marbles, stapoo/hopscotch, baraf-pani — TRAP.** Effectively no branded mobile incumbents, negligible search intent, and physical-play mechanics that don't translate to sticky repeat-session mobile loops. **Nostalgia here buys an install spike and no retention.** Verdict: avoid as primary concepts; at most, cosmetic minigames inside a broader product.

**Local card games — crowded-but-fragmented, low ARPU.**
- **Court Piece / Rung (trick-taking):** multiple live apps (OENGINES "Courtpiece Multiplayer," Rung.gg, Card Game Coat, several more) — real cultural base + diaspora, but fragmented with **no dominant branded incumbent** **[EB]**. A polished, voice-chat, social Rung could take share; monetization is IAA + low IAP. **Verdict: real cultural demand, addressable, but low-ARPU and social-network-effect dependent — enter only if you can win the community/voice-chat layer.**
- **Teen Patti (gambling-adjacent):** Google Play excludes India from its real-money-gambling allowlist and **Pakistan is not on the allowlist either** (Islamic jurisdiction); "social casino" chip versions skirt this but carry policy-takedown risk, reputational risk in Pakistan, and possible PTA sensitivity **[EB: Google Play gambling policy; Indian state bans]**. **Verdict: TRAP for this founder — regulatory/reputational downside dwarfs the upside.**

**Diaspora angle — the highest-value cross-cutting signal.** The Gulf games market was ~$2.24bn spend / **ARPU ~$66** in 2023, heading to ~$3.24bn / ARPU ~$83 by 2028, with Saudi+UAE ~80% of spend **[EB: PocketGamer/Niko]**. Pakistani (and Indian) diaspora concentrate in exactly these markets (remittances: Saudi ~24%, UAE ~20% of PK inflows) **[EB: Arab News/IOM]**. **Ludo STAR is the proof of pattern:** a subcontinental board game whose *users* are PK/BD/MENA but whose *revenue* is Saudi/US/Spain **[EB]**. **Verdict: the diaspora + Gulf is the real monetization beachhead for any subcontinental-themed game — build for PK cultural resonance, monetize in the Gulf/West.**

---

## 5. STRATEGY SYNTHESIS — for THIS founder

**Is "local-first" an edge or a trap? Both — and the split is precise.**

*Real edges:* (1) **cultural authenticity** that global studios can't fake (BUSSID livery; a genuinely Pakistani driving/board/card feel); (2) **free local testing/QA** on real low-end devices and cheap local playtesters; (3) **ASO arbitrage** on low-competition localized keywords; (4) **diaspora/Gulf as a higher-ARPU beachhead** reachable *because* the theme is authentic.

*Real traps:* (1) **domestic ARPU/eCPM among the world's lowest**; (2) **broken IAP rails** (no PKR gift cards, low card penetration, patchy DCB) — domestic IAP is not a lever; (3) **low defensibility** (asset-flip clones are trivially copied); (4) **volume ceilings** if the theme never leaves Pakistan.

**Is Pakistan a valid soft-launch / test geo? Partially — and not the way most people assume.** The publisher playbook uses **Philippines** for technical/CPI/bug testing (CPI <$0.50, English), **Nordics** for retention, and **Canada/Australia** for monetization as a US proxy **[EB: Matej Lancaric / GameAnalytics / PocketGamer]**. **Pakistan does not appear in the monetization-testing rotation** because PK spend is not predictive of T1 spend. Correct use of Pakistan: a **cheap install + core-loop + D1/D7 retention lab** (very low CPI, huge Android volume). **PK retention can be directionally useful; PK monetization is not.** Do not read PK ARPDAU as a T1 signal.

**The winning hybrid pattern (what every scaled peer actually did).** Global-scalable mechanic + subcontinental/emerging-market *skin* + T1-viable polish + **dual monetization** (ad-volume in T3 *and* IAP/higher-ARPU in diaspora+Gulf+T1). This is Maleo (Indonesia theme, global players, UGC), Ludo STAR (subcontinent game, Gulf/West money), Amanotes/Zuuks (global-legible mechanics at industrial scale). **The theme is the acquisition hook; the loop and the diaspora/Gulf/T1 wallet are the business.**

**Concrete verdict — exploitable vs distraction:**

| Exploitable | Distraction / Trap |
|---|---|
| Driving/sim with **global routes + UGC (livery-style) hook** and multi-year update commitment | Hyper-local-only sims (volume-capped, cents ARPDAU) |
| **Hybrid-casual** with a universal loop wearing a subcontinental skin, designed for T3 ad-volume *and* diaspora/Gulf IAP | Faithful ports of obscure childhood games (pithu, gilli-danda, marbles) — no demand, no retention |
| A **social/voice Rung (Court Piece)** if you can win the community layer — accept low ARPU | Teen Patti / any real-money-adjacent title — policy + reputational trap |
| **Ramadan/Eid live-ops** as a retention/monetization calendar | Licensed PSL cricket — cost/complexity trap for a solo dev |
| **Kite/Basant** or gully-cricket as a *marketing hook* on a globally-legible loop | Expecting Pakistan domestic IAP or PK monetization data to be meaningful |

**Founder's three direct questions, answered:**
1. **Useful regional signals for PK / Android-first?** Yes: build Android-only + IAA-first + small install for entry-tier devices; assume broken domestic IAP; exploit Ramadan live-ops; and treat the **Gulf diaspora as your paying audience**, not Pakistan. PK is a cheap install/retention lab, not a revenue market.
2. **Local sim/driving — globally scalable or mostly local?** As executed in Pakistan today, **mostly local and ceiling-capped.** The *genre* is globally scalable (Zuuks 650M+, Maleo durable UGC) **only** if you globalize the setting and add a durable content/UGC loop. A Pakistani-branded sim for Pakistanis is a hobby-scale cross-promo funnel.
3. **Nostalgia/childhood/under-ported — worth it commercially?** Selectively. Ludo/carrom/snakes-&-ladders are **closed**; obscure street games are **traps**; Rung is **fragmented-but-low-ARPU**; kite/Basant and gully-cricket are **fresh but small/seasonal**. The commercially correct expression of nostalgia is **a globally-legible mechanic in subcontinental clothing, monetized in the diaspora/Gulf/T1** — not a faithful port of a hyper-local game for the low-ARPU domestic market.

---

## STRONG CLAIMS (highest confidence)

1. **Build Android-first/only and IAA-first.** PK is ~81–84% Android **[PU]** with structurally broken domestic IAP rails **[EB]** and bottom-tier eCPMs **[EB/PU]** — domestic IAP is not a viable lever.
2. **Pakistan's per-game revenue reality is brutal:** ~40% of games earn <$1,000/month and only ~8% clear $50k+ **[EB: Tenjin 2025]**. Plan for volume-and-cross-promo economics, not hit economics.
3. **The definitive "Pakistani" board-game hits are Indian-built and Gulf/West-monetized** (Ludo STAR: PK/BD/MENA ≈90% of users, revenue from Saudi/US/Spain) **[EB]**. The obvious nostalgia categories (Ludo, carrom) are closed.
4. **The diaspora + Gulf is the monetization beachhead**, not Pakistan (Gulf ARPU ~$66 vs PK cents; Saudi+UAE ~80% of Gulf spend; PK diaspora concentrated there) **[EB]**.
5. **Sim/driving scales only when globalized + UGC-driven** (Zuuks 650M+, Maleo/BUSSID durable livery loop since 2017); hyper-local PK sims cap at ~100k–2M downloads **[EB]**.
6. **Pakistan is a valid install/retention test lab but NOT a monetization test geo** — publishers use Philippines/Nordics/Canada for that **[EB]**.
7. **The winning structure is global mechanic + subcontinental skin + T1 polish + dual monetization** — the shared blueprint of Maleo, Ludo STAR, Amanotes, Zuuks **[EB]**.
8. **Ramadan/Eid is a documented live-ops window** (METAP sessions longest globally at ~35.6 min; +5% sessions in PK; regional IAP +18% YoY) **[EB: Adjust]**.
9. **Teen Patti / real-money-adjacent titles are a policy-and-reputation trap** in Pakistan **[EB]**.
10. **Battle royale (PUBGM + Free Fire) dominates attention**, so casual/board/sim titles compete for time against an entrenched BR habit **[EB]**.

## WEAK SPOTS (thin evidence — research further)

1. **Exact PK Android share and current live top-10 charts:** Statcounter/Similarweb/Appfigures PK pages 403'd; figures are search-surfaced. Pull live Statcounter PK OS split and a current AppMagic/Sensor Tower PK free+grossing top-20.
2. **PK-specific eCPM prints:** rewarded ~$1–4 / banner <$0.30 inferred from tiering, not a Pakistan-specific benchmark. Get the Tenjin/CAS or Appodeal PK country breakdown.
3. **BUSSID/Maleo revenue:** downloads solid (~3M/mo; 15M+ users) but *revenue* undisclosed; true LTV of a UGC-driven sim unverified.
4. **Ecosystem size figures ($300M sector / $158M exports; Mindstorm ~$15.3M):** advocacy/estimate sources **[PU]**, likely generous.
5. **Diaspora spend attribution:** inferred from Gulf ARPU + remittance geography + the Ludo STAR pattern, not a direct study.
6. **DCB current coverage** across Jazz/Telenor/Zong and any native Easypaisa/JazzCash Play integration — confirm current status.
7. **Gully-cricket and kite/Basant TAM and retention:** whitespace real but unquantified.
