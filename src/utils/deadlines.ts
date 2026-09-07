// Berekent de retourdeadlines voor een aankoop, rekening houdend met:
// - land-varianten (dezelfde retailer kan per land een andere regel hebben)
// - historische beleidswijzigingen (geldig_vanaf/geldig_tot: welke regelversie gold op de leverdatum)
// - de aparte aanmeld- vs. verzenddeadline (zie aankopen-datamodel.md)

import type { Regel, Retailer } from "../types/retourbeleid";
import type { Aankoop, NieuweAankoopInput } from "../types/aankopen";

export class GeenGeldigeRegelError extends Error {
  constructor(retailerId: string, land: string, datum: string) {
    super(
      `Geen retourregel gevonden voor retailer "${retailerId}", land "${land}" op datum ${datum}.`
    );
    this.name = "GeenGeldigeRegelError";
  }
}

/** Simpele datum-rekenhulp: telt dagen op bij een ISO-datum ("2026-08-10") en geeft weer een ISO-datum terug. */
export function addDagen(isoDatum: string, dagen: number): string {
  const datum = new Date(isoDatum + "T00:00:00Z");
  datum.setUTCDate(datum.getUTCDate() + dagen);
  return datum.toISOString().slice(0, 10);
}

/**
 * Zoekt de regel die gold voor een retailer/land op een specifieke datum.
 * Dit is de kern van "historische beleidswijzigingen": een retailer kan meerdere
 * regels voor hetzelfde land hebben, elk geldig in een ander tijdvak
 * (bv. Zalando NL: 100 dagen tot 2026-01-07, daarna 30 dagen).
 *
 * geldig_vanaf === null  → geen ondergrens (regel gold altijd al)
 * geldig_tot === null    → geen bovengrens (regel is nog steeds actueel)
 * geldig_tot is exclusief: op de dag van geldig_tot zelf geldt al de nieuwe regel.
 */
export function vindGeldigeRegel(
  retailer: Retailer,
  land: string,
  peildatum: string
): Regel | null {
  const kandidaten = retailer.regels.filter((regel) => regel.land === land);

  const passendeRegel = kandidaten.find((regel) => {
    const naGeldigVanaf = regel.geldig_vanaf === null || peildatum >= regel.geldig_vanaf;
    const voorGeldigTot = regel.geldig_tot === null || peildatum < regel.geldig_tot;
    return naGeldigVanaf && voorGeldigTot;
  });

  return passendeRegel ?? null;
}

export interface BerekendeDeadlines {
  aanmeld_deadline: string;
  verzend_deadline: string | null;
  gebruikte_regel: Regel;
}

/**
 * Berekent de aanmeld- en verzenddeadline voor een aankoop.
 *
 * Uitgangspunt (ingangsmoment): meestal de leverdatum, soms de besteldatum.
 * We gebruiken diezelfde datum ook om te bepalen welke regelversie gold
 * (geldig_vanaf/geldig_tot) — het beleid dat gold toen het pakket aankwam,
 * is het beleid dat voor deze aankoop telt.
 *
 * De verzenddeadline (indien van toepassing) wordt behandelaad als
 * aanmeld_deadline + verzendtermijn_dagen: dit is de uiterste datum, uitgaande
 * van aanmelden op de laatste mogelijke dag. Zo reken je nooit een te ruime
 * termijn voor, ook als de gebruiker pas op de valreep aanmeldt.
 */
export function berekenDeadlines(
  aankoop: Pick<NieuweAankoopInput, "leverdatum" | "aankoopdatum" | "land">,
  retailer: Retailer
): BerekendeDeadlines {
  const ingangsdatum = aankoop.leverdatum ?? aankoop.aankoopdatum;
  const regel = vindGeldigeRegel(retailer, aankoop.land, ingangsdatum);

  if (!regel) {
    throw new GeenGeldigeRegelError(retailer.retailer_id, aankoop.land, ingangsdatum);
  }

  // ingangsmoment bepaalt vanaf welke datum de aanmeldtermijn gaat lopen.
  const startdatum =
    regel.ingangsmoment === "besteldatum" ? aankoop.aankoopdatum : ingangsdatum;

  const aanmeld_deadline = addDagen(startdatum, regel.aanmeldtermijn_dagen);
  const verzend_deadline =
    regel.verzendtermijn_dagen === null
      ? null
      : addDagen(aanmeld_deadline, regel.verzendtermijn_dagen);

  return { aanmeld_deadline, verzend_deadline, gebruikte_regel: regel };
}

export type DeadlineUrgentie = "verlopen" | "rood" | "oranje" | "groen";

/** Aantal hele dagen tot een ISO-datum (negatief = al verstreken). Gebruikt UTC om tijdzone-gedoe te vermijden. */
export function dagenTotDeadline(deadline: string, vandaag: string = vandaagIso()): number {
  const msPerDag = 24 * 60 * 60 * 1000;
  const deadlineMs = new Date(deadline + "T00:00:00Z").getTime();
  const vandaagMs = new Date(vandaag + "T00:00:00Z").getTime();
  return Math.round((deadlineMs - vandaagMs) / msPerDag);
}

export function vandaagIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Bepaalt de kleurcode voor de deadline-badge:
 * rood < 3 dagen, oranje < 7 dagen, groen daarna (of al verlopen = apart).
 */
export function bepaalUrgentie(dagenOver: number): DeadlineUrgentie {
  if (dagenOver < 0) return "verlopen";
  if (dagenOver < 3) return "rood";
  if (dagenOver < 7) return "oranje";
  return "groen";
}

/** Welke deadline (aanmelden of versturen) is voor deze aankoop nu het eerstvolgende relevante moment? */
export function relevanteDeadline(aankoop: Aankoop): { deadline: string; type: "aanmelden" | "versturen" } {
  if (aankoop.status === "retour_aangemeld" && aankoop.berekende_verzend_deadline) {
    return { deadline: aankoop.berekende_verzend_deadline, type: "versturen" };
  }
  return { deadline: aankoop.berekende_aanmeld_deadline, type: "aanmelden" };
}
