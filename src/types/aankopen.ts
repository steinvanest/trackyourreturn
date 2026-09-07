// Types voor aankopen-data — de individuele aankopen van één gebruiker.
// Elke aankoop verwijst via retailer_id naar retourbeleid.ts / retourbeleid-data.json.

import type { IsoDatum, IsoLandcode } from "./retourbeleid";

// Moet exact overeenkomen met de categorie-waarden in uitzonderingen[] van retourbeleid-data.json,
// anders werkt de koppeling (waarschuwing bij uitzonderingen) niet.
export const PRODUCT_CATEGORIEEN = [
  "kleding_schoenen",
  "verzegelde_hygiëne",
  "maatwerk",
  "software_media",
  "bederfelijk",
  "digitaal",
  "elektronica_klein",
  "elektronica_groot",
  "huishoudelijk_klein",
  "huishoudelijk_groot",
  "accessoires",
  "overig",
] as const;

export type ProductCategorie = (typeof PRODUCT_CATEGORIEEN)[number];

export type AankoopStatus =
  | "actief" // binnen deadline, wordt gevolgd, geen actie ondernomen
  | "retour_aangemeld" // gebruiker heeft retour gestart bij de retailer
  | "retour_voltooid" // retour is verwerkt/terugbetaald
  | "handmatig_verwijderd" // gebruiker heeft zelf besloten niet te retourneren
  | "verlopen"; // deadline gepasseerd zonder actie — systeem zet dit automatisch

export interface Aankoop {
  aankoop_id: string;
  gebruiker_id: string;
  retailer_id: string;
  product_naam: string;
  product_categorie: ProductCategorie | null;
  bedrag: number;
  aankoopdatum: IsoDatum;
  leverdatum: IsoDatum | null;
  land: IsoLandcode;

  status: AankoopStatus;
  verwijderd_op: IsoDatum | null;
  verwijder_reden: string | null;

  // Afgeleide velden — berekend door de deadline-functie, niet handmatig ingevuld.
  berekende_aanmeld_deadline: IsoDatum;
  berekende_verzend_deadline: IsoDatum | null;

  herinneringen_verstuurd: number[]; // bv. [7, 3, 1]
  notities: string | null;
}

// Velden die de gebruiker invult op het "nieuwe aankoop toevoegen"-scherm;
// de rest (id, status, berekende deadlines) vult de app zelf in.
export type NieuweAankoopInput = Pick<
  Aankoop,
  | "retailer_id"
  | "product_naam"
  | "product_categorie"
  | "bedrag"
  | "aankoopdatum"
  | "leverdatum"
  | "land"
> & { notities?: string | null };
