/**
 * daily.ts — Daily Tide seeding (spec 03 §1.3, §5.2).
 *
 * Daily is DATE-BASED ONLY: one board worldwide per UTC date (spec 03 §1.3). The seed string is
 * hashed by createRng (FNV-1a), so the whole world plays byte-identical boards — the definition of
 * fairness in Seeded mode (sameness). Resume stays identical because the RNG is state-rehydrated
 * (spec 03 §1.4), not re-derived from turn count.
 *
 * The deterministic seed-VETTING loop (try salts until the reference bot wins within budget,
 * spec 03 §5.2) needs the CasualBot and belongs to E7; `dailySeed` here is the un-vetted base seed.
 */

/** The UTC date string (YYYY-MM-DD) for a given Date, without wall-clock coupling in the engine. */
export function utcDateString(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** The base daily seed for a UTC date (pre-vetting). Same string ⇒ same board for everyone. */
export function dailySeed(utcDateStr: string): string {
  return `daily:${utcDateStr}`;
}
