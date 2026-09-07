// "Waarschijnlijk niet retourneren"-inschatting.
//
// Volgorde (zie returnless-refund-regels.md):
// 1. Retailer-specifiek + publiek_gedocumenteerd  → "vrij_zeker"
// 2. Retailer-specifiek + branche_inschatting      → "inschatting"
// 3. Geen van beide → algemene regelset (categorie + max_bedrag)  → "indicatief"
// 4. Niets van toepassing → geen resultaat (null)
//
// Ontwerpprincipe uit het bronbestand: dit is ALTIJD een inschatting, nooit een garantie.
// Toon dit dus nooit als "je hoeft niet te retourneren" — alleen als voorzichtige indicatie.

import type { Retailer } from "../types/retourbeleid";
import type { ProductCategorie } from "../types/aankopen";
import type { ReturnlessRefundRegels, ReturnlessRefundResultaat } from "../types/returnlessRefund";
import returnlessRefundRegels from "../data/returnless-refund-regels.json";

const regelset = returnlessRefundRegels as ReturnlessRefundRegels;

export function schatReturnlessRefundIn(
  retailer: Retailer,
  categorie: ProductCategorie | null,
  bedrag: number
): ReturnlessRefundResultaat | null {
  const indicatie = retailer.returnless_refund_indicatie;

  if (indicatie.toegepast_bekend === true && indicatie.bron_type === "publiek_gedocumenteerd") {
    return {
      niveau: "vrij_zeker",
      waarschijnlijkheid: "hoog",
      toelichting: indicatie.notitie ?? `${retailer.retailer_naam} past dit naar verwachting toe.`,
    };
  }

  if (indicatie.toegepast_bekend === true && indicatie.bron_type === "branche_inschatting") {
    return {
      niveau: "inschatting",
      waarschijnlijkheid: "middel",
      toelichting:
        indicatie.notitie ?? `Bij ${retailer.retailer_naam} komt dit mogelijk voor, nog niet volledig bevestigd.`,
    };
  }

  if (!categorie) return null;

  // Val terug op de algemene regelset. Pak de regel met de laagste max_bedrag-drempel
  // die nog past (= de meest specifieke match), zodat een €10-item niet per ongeluk
  // de bredere/onzekerdere €35-regel krijgt in plaats van de gerichtere €15-regel.
  const passendeRegels = regelset.algemene_regels
    .filter((regel) => regel.categorieën.includes(categorie))
    .filter((regel) => regel.max_bedrag === null || bedrag <= regel.max_bedrag)
    .sort((a, b) => (a.max_bedrag ?? Infinity) - (b.max_bedrag ?? Infinity));

  const beste = passendeRegels[0];
  if (!beste) return null;

  return {
    niveau: "indicatief",
    waarschijnlijkheid: beste.waarschijnlijkheid,
    toelichting: beste.toelichting,
  };
}
