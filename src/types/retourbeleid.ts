// Types voor retourbeleid-data.json — het beleid per retailer (geldt voor alle gebruikers).

export type IngangsMoment = "leverdatum" | "besteldatum" | "laatste_deelzending";
export type Kosten = "gratis" | "vast_bedrag" | "variabel";
export type DomeinType = "eigen_voorraad" | "marktplaats" | "hybride";
export type BronType = "publiek_gedocumenteerd" | "branche_inschatting" | "onbevestigd";
export type HerroepingsknopStatus = "geïmplementeerd" | "gedeeltelijk" | "onbekend" | "nvt";
export type Vertrouwen = "hoog" | "middel" | "laag";

// ISO-datum als string, bv. "2026-08-10". null betekent "geen ondergrens/bovengrens" bij geldig_vanaf/geldig_tot.
export type IsoDatum = string;
export type IsoLandcode = string;

export interface Regel {
  land: IsoLandcode;
  geldig_vanaf: IsoDatum | null;
  geldig_tot: IsoDatum | null;
  aanmeldtermijn_dagen: number;
  verzendtermijn_dagen: number | null;
  ingangsmoment: IngangsMoment;
  kosten: Kosten;
  kosten_bedrag: number | null;
  bron_url: string;
  laatst_geverifieerd: IsoDatum;
}

export interface Uitzondering {
  categorie: string;
  beschrijving: string;
  bron_url: string;
}

export interface ReturnlessRefundIndicatie {
  toegepast_bekend: boolean | null;
  prijsdrempel_schatting: number | null;
  categorieën: string[];
  bron_type: BronType;
  notitie: string | null;
}

export interface EuHerroepingsknop {
  status: HerroepingsknopStatus;
  gecontroleerd_op: IsoDatum | null;
  notitie: string | null;
}

export interface Retailer {
  retailer_id: string;
  retailer_naam: string;
  domein_type: DomeinType;
  regels: Regel[];
  notitie_marktplaats: string | null;
  uitzonderingen: Uitzondering[];
  returnless_refund_indicatie: ReturnlessRefundIndicatie;
  eu_herroepingsknop: EuHerroepingsknop;
  vertrouwen: Vertrouwen;
}

export interface RetourbeleidData {
  schema_versie: string;
  laatst_bijgewerkt: IsoDatum;
  retailers: Retailer[];
}
