# 12 · Ad & Monetization UX Strategy

> **Owner:** Live-Ops / Monetization Designer.
> **Scope:** ad placement strategy, format mix, and UX guidelines for the 45–65 cozy-casual audience.
> **Not engine logic** — this is a design-side doc that tells the host layer where and how to surface
> ads alongside the engine hooks from `02 §8` and the economy from `10`.
> **Governing principle:** ads should feel like a natural seam in the experience, never an interruption
> of the calm board. Opt-in > interstitial > banner. Never mid-board.
> **Reads against:** `10 §8` (RV + IAP → shared hooks), `04 §5` (no interstitials mid-play, RV ≤3/day),
> `06` (persona: no ambush ads, no urgency).

---

## 0. The audience difference

Block Blast (70M DAU, skewing younger) runs ~55% banner / ~35% interstitial / ~10% RV. That mix
works at massive scale with an ad-tolerant audience. **Rising Tide's 45–65 cozy audience is
fundamentally different:**
- More ad-sensitive (cluttered screens feel cheap)
- Higher IAP propensity per user
- Longer session tolerance if the experience stays calm
- Churn-triggers: mid-play interruptions, countdown timers, "buy coins to continue" walls

**Our mix inverts Block Blast's:** RV-heavy (~45–50%), interstitials at session seams only (~30–35%),
banners on menus only (~15–20%). Higher CPM per impression, lower impression volume, zero mid-board
disruption.

---

## 1. Ad placements — by format, by moment

### 1.1 Rewarded Video (RV) — the cozy-safe, high-CPM spine

All RV is **opt-in only**, hard-capped at **≤3/day** (`04 §5.2`). Each resolves to an existing engine
hook or wallet mutation — the ad is just the trigger.

| Placement | Moment | Engine hook | Why it's cozy-safe |
|---|---|---|---|
| **Continue after loss** | Game-over screen (tide-drown or no-moves) | `continueAfterLoss` | Peak motivation; player *chose* to keep going |
| **+N Moves** | Out-of-moves on a move-limited level | `grantMoves(5)` | Rescue, not a gate — she could also retry for free |
| **Double star pearls** | Level-win celebration screen | `pearlsGranted(starPearls)` | Positive moment; the ad is a bonus, not a gate |
| **Tide-Push** (survive only) | In-play satchel, when tide is ≥5 | `pushTide(2)` | Proactive helper, optional |

**Double star pearls** is new (`10` doesn't cover it). On level win: "Watch a short video to double
your pearl reward!" A 2★ win paying 20 pearls becomes 40. Cozy-safe because it's celebratory (you
just won), opt-in, and never gates progression. **[OPEN — product owner: approve double-pearls RV?]**

### 1.2 Interstitials — at session seams, never mid-board

| Placement | When | Frequency cap | Skip rule |
|---|---|---|---|
| **Between levels** | Level-complete → map-return transition | **Every 3rd level completion** [OPEN] | Skip if player just watched an RV (no double-tap) |
| **After Endless game-over** | Endless/Blitz session end | **1 per Endless session** | Skip if RV was watched in same session |
| **After Daily Tide** | Daily Tide completion → map return | **1 per daily session** | Same skip rule |

**Rules:**
- **NEVER during board play.** The ad appears on a transition screen, not over the grid.
- **Frequency-capped** so a 4-level play session sees at most 1 interstitial.
- **Skip after RV** — if the player opted into a rewarded ad, don't follow up with a forced one.
  Respect the value exchange.
- **First-session immunity:** no interstitials in the **first 3 sessions or first 5 levels** (whichever
  comes later). Let her fall in love with the calm board before any monetization friction.

### 1.3 Native banner — menus and lobbies only

| Screen | Banner position | Notes |
|---|---|---|
| Chapter map | Bottom of screen | Standard 320×50 or adaptive |
| Pearl store | Bottom of screen | She's already in a commercial context |
| Cosmetics browser | Bottom of screen | Same |
| Daily Tide lobby | Bottom of screen | Before she enters the board |
| Settings / profile | Bottom of screen | Low-traffic but always-on |

**NEVER on the gameplay board.** The 8×8 grid, the tray, the tide meter, the score — no banner
touches any of these. The board is sacred calm space.

**NEVER on the level-win celebration.** That moment belongs to her; an ad there undercuts the dopamine.

---

## 2. The "Remove Ads" IAP

- **Removes:** all interstitials and all banners. Zero forced ads.
- **Keeps:** RV *offers* (they're opt-in rewards, not interruptions). She can still choose to watch
  a video for double pearls or a continue. This is the Block Blast model, and it's correct —
  opt-in rewards are a feature, not an ad.
- **Pricing:** **[OPEN — product owner]** — recommend $4.99–$9.99 (one-time). The 45–65 demo
  over-indexes on "just make the ads go away" IAP. This should be the #1 recommended IAP by
  prominence.

---

## 3. First-session ad policy

**No ads of any kind in the first 3 sessions or first 5 levels** (whichever comes later).

Rationale: Block Blast can show ads from minute one because its loop is immediately addictive.
Rising Tide's retention bet is the un-losable Shallows (L1–3) and the gentle onboarding ramp.
The player needs to feel the calm, win several times, and build the habit before any monetization
friction. A banner on L1 says "you're a product." Silence on L1 says "this is your space."

After the immunity window, ramp gently:
- Sessions 4–6: banners on menus only, no interstitials.
- Sessions 7+: full ad mix (banners on menus, interstitials at seams, RV offers).

---

## 4. Ad network & mediation

**[OPEN — product owner / engineering lead]:** Network selection is a business decision, not an engine
spec item. Recommendations for the 45–65 audience:

- **Mediation layer:** AdMob mediation or AppLovin MAX — header bidding maximizes CPM.
- **Preferred networks:** AdMob (reach), Meta Audience Network (45–65 targeting), Unity Ads (if
  Endless/Blitz drives gaming-adjacent installs).
- **Ad quality filters:** enable "maximum ad filtering" — no crypto, no gambling, no flashing/seizure
  content. This audience is more brand-sensitive than younger cohorts.

---

## 5. Offline play

The engine is fully offline-capable (deterministic, no server dependency). **Offline play shows zero
ads** — this is a retention driver, not a monetization leak:

- Players who play offline still build streaks, earn stars, progress through levels.
- When they reconnect, the ad stack resumes normally.
- Offline sessions generate no revenue but generate retention, which generates future revenue.
- **Do NOT gate offline play behind IAP or penalize it.** The 45–65 audience plays on planes, in
  waiting rooms, in areas with spotty connectivity. Offline support is an install driver.

---

## 6. Revenue mix projection (directional)

| Format | Est. share | CPM range | Notes |
|---|---|---|---|
| Rewarded Video | **~45–50%** | $15–$40 | Highest CPM; opt-in, high intent |
| Interstitial | **~30–35%** | $8–$20 | At session seams only |
| Native banner | **~15–20%** | $1–$5 | Always-on, menus only |
| **IAP** | varies | n/a | Remove-ads, pearl packs, cosmetic packs, move/continue tokens |

**ARPDAU projection [OPEN]:** with the conservative ad mix (fewer impressions, higher CPM), estimate
**$0.04–$0.08 ARPDAU** from ads alone. IAP adds **$0.02–$0.06** for a blended **$0.06–$0.14 ARPDAU**.
Significantly higher per-user than Block Blast's $0.008, but on a smaller DAU base. The 45–65 demo
monetizes per-user better than mass-market.

---

## 7. Feedback system hooks (dopamine layer)

Not an ad strategy item, but directly relevant to session length (which drives impressions):

| Trigger | Feedback | Engine event |
|---|---|---|
| Single line clear | "Nice!" + subtle haptic | `linesCleared { n:1 }` |
| 2-line clear | "Great!" + medium haptic | `linesCleared { n:2 }` |
| 3+ line clear | "Amazing!" + strong haptic | `linesCleared { n:3+ }` |
| Combo ×3 | "Combo!" + Line-Blaster grant | `comboReward { milestone:3 }` |
| Combo ×6 | "Incredible!" + Bomb grant | `comboReward { milestone:6 }` |
| Level win 3★ | "Perfect!" + star celebration | `won { stars:3 }` |
| Level win 2★ | "Well done!" + star celebration | `won { stars:2 }` |
| Milestone win | Extended celebration + rewards | `won { milestone:true }` |

These are UI-layer concerns, not engine, but they matter for monetization because **longer sessions =
more ad impressions = more revenue.** The engine emits the events; the host renders the feedback.

---

## 8. Open decisions

| ID | Question | Recommendation |
|---|---|---|
| AD1 $ | Double-star-pearls RV placement — approve? | YES (celebratory, cozy-safe) |
| AD2 $ | Interstitial frequency cap (every Nth level) | Every 3rd level completion |
| AD3 $ | First-session ad immunity window | 3 sessions or 5 levels, whichever later |
| AD4 $ | Remove-ads IAP price | $4.99–$9.99 one-time |
| AD5 $ | Ad network selection | AdMob mediation + quality filters |
| AD6 $ | Banner on gameplay board? | **NO — non-negotiable** |
| AD7 $ | Feedback text/haptic calibration | UI-layer; calibrate in playtest |
